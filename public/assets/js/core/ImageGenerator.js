/**
 * Image Generator Core Module
 * Handles image generation functionality for the LoveAIArt application
 */

export class ImageGenerator {
  constructor() {
    this.isGenerating = false;
    this.randomPrompts = [];
  }

  /**
   * Validate and fix dimensions to ensure Kontext compatibility
   * @param {Object} settings - Current settings
   * @returns {Object} - Corrected settings
   */
  validateAndFixDimensions(settings) {
    const kontextCompatibleDimensions = [
      "1568x672",
      "1392x752",
      "1184x880",
      "1248x832",
      "1024x1024",
      "832x1248",
      "880x1184",
      "752x1392",
      "672x1568",
    ];

    const currentDimension = `${settings.width}x${settings.height}`;
    if (!kontextCompatibleDimensions.includes(currentDimension)) {
      console.log(
        `⚠️ FIXING: Incompatible dimensions ${currentDimension} -> 1024x1024`
      );
      settings.width = 1024;
      settings.height = 1024;

      // Update hidden inputs immediately
      const widthInput = document.getElementById("width");
      const heightInput = document.getElementById("height");
      if (widthInput) widthInput.value = 1024;
      if (heightInput) heightInput.value = 1024;
    }

    return settings;
  }

  /**
   * Generate an image with the current settings
   * @param {Object} params - Generation parameters
   * @returns {Promise<Object>} - Generation result
   */
  async generateImage({
    settings,
    validationManager,
    loraManager,
    personalLoras,
    addToRecentPrompts,
    addMessage,
    showStatus,
    autoResizeTextarea,
    currentMode = "image",
  }) {
    if (this.isGenerating)
      return { success: false, reason: "Already generating" };

    // FORCE dimension validation before any generation
    settings = this.validateAndFixDimensions(settings);

    const prompt = document.getElementById("positivePrompt").value.trim();
    if (!prompt) {
      showStatus("Please enter a prompt", 3000);
      return { success: false, reason: "No prompt provided" };
    }

    // Content filtering check
    const filterResult = validationManager.checkContentFilter(prompt);
    if (!filterResult.allowed) {
      showStatus(
        `Content not allowed. Please remove: "${filterResult.foundWord}"`,
        4000
      );
      console.log(
        `Blocked prompt due to disallowed word: ${filterResult.foundWord}`
      );
      return {
        success: false,
        reason: "Content filtered",
        foundWord: filterResult.foundWord,
      };
    }

    // Add to recent prompts
    addToRecentPrompts(prompt);

    // Get trigger words for selected LoRA and prepend if needed
    let finalPrompt = loraManager.addLoRATriggerWords(
      prompt,
      settings.lora,
      personalLoras
    );

    this.isGenerating = true;
    this.updateGenerateButton(true);

    // Add user message (show original prompt to user)
    addMessage(prompt, true);

    // Add loading message
    const loadingMessage = addMessage("Generating image...", false);

    try {
      const formData = this.collectFormData(settings, currentMode);
      // Override the prompt with trigger words added
      formData.positivePrompt = finalPrompt;

      // Determine the correct API endpoint based on mode
      let endpoint = "/accelerated"; // Default to accelerated endpoint for cost savings

      // Add feature-specific properties and set endpoint
      if (currentMode === "pulid") {
        const pulidImages = this.collectPulidImages();

        if (pulidImages.length === 0) {
          throw new Error(
            "Please upload at least one reference image for PuLID"
          );
        }

        // Build PuLID object with only the parameters that are set
        const pulidConfig = {
          inputImages: pulidImages,
          idWeight: parseInt(document.getElementById("idWeight")?.value || "1"),
        };

        // Only add trueCFGScale if it's different from default
        const trueCFGScale = parseFloat(
          document.getElementById("trueCFGScale")?.value || "1.5"
        );
        if (trueCFGScale !== 1.5) {
          pulidConfig.trueCFGScale = trueCFGScale;
        }
        // Note: We don't set CFGStartStep to avoid conflicts with trueCFGScale

        formData.puLID = pulidConfig;
        endpoint = "/pulid-async"; // Use async endpoint for Heroku timeout handling
        console.log("Using PuLID async endpoint to handle timeouts");
        console.log("PuLID formData:", JSON.stringify(formData, null, 2));
      } else if (currentMode === "layerdiffuse") {
        // LayerDiffuse only works with FLUX Schnell - validate and switch if needed
        if (settings.model !== "runware:100@1") {
          const oldModel = settings.model;
          formData.model = "runware:100@1"; // Always use FLUX Schnell for LayerDiffuse
          console.log(
            `LayerDiffuse mode: Auto-switched model from ${oldModel} to FLUX Schnell (LayerDiffuse only supports FLUX Schnell)`
          );
        }

        // Force PNG format for transparency support
        formData.outputFormat = "PNG";
        formData.layerDiffuse = true;
        endpoint = "/layer-diffuse-async"; // Use async endpoint for Heroku timeout handling
        console.log("Using LayerDiffuse async endpoint to handle timeouts");
        console.log(
          "LayerDiffuse formData:",
          JSON.stringify(formData, null, 2)
        );
      } else if (currentMode === "kontext") {
        const kontextImages = this.collectKontextImages();

        if (kontextImages.length === 0) {
          throw new Error("Please upload a base image to edit with Kontext");
        }

        // Ensure we're using a Kontext model, auto-switch if needed
        if (settings.model !== "bfl:3@1" && settings.model !== "bfl:4@1") {
          const oldModel = settings.model;
          formData.model = "bfl:3@1"; // Default to Kontext Pro
          console.log(
            `Kontext mode: Auto-switched model from ${oldModel} to FLUX.1 Kontext Pro (${formData.model})`
          );
        }

        formData.inputImages = kontextImages;
        endpoint = "/kontext-async"; // Use async endpoint for Heroku timeout handling
        console.log("Using Kontext async endpoint to handle timeouts");
        console.log("Kontext formData:", JSON.stringify(formData, null, 2));
      } else {
        // For all other modes (including "image" and "accelerated"), use accelerated by default
        formData.teaCache = true;
        formData.deepCache = true;
        endpoint = "/accelerated";
        console.log("Using Accelerated endpoint with data:", formData);
      }

      console.log("Making request to:", endpoint);
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();

      // Handle async job response (for PuLID timeout handling)
      if (data.jobId) {
        loadingMessage.textContent = "Starting generation job...";
        return await this.pollJobStatus(
          data.jobId,
          loadingMessage,
          addMessage,
          showStatus
        );
      }

      // Handle regular response
      // Remove loading message
      loadingMessage.remove();

      if (data.images && data.images.length > 0) {
        addMessage("Here's your generated image:", false, data.images);
        showStatus("Image generated successfully!", 3000);
        return { success: true, images: data.images };
      } else {
        addMessage(
          "Sorry, I couldn't generate an image. Please try again.",
          false
        );
        showStatus("Generation failed", 3000);
        return { success: false, reason: "No images returned" };
      }
    } catch (error) {
      console.error("Generation error:", error);
      loadingMessage.remove();
      addMessage(
        `An error occurred: ${error.message}. Please try again.`,
        false
      );
      showStatus("Generation failed", 3000);
      return { success: false, reason: "API error", error: error.message };
    } finally {
      this.isGenerating = false;
      this.updateGenerateButton(false);
      // Clear input after generation (consistent with chat mode)
      document.getElementById("positivePrompt").value = "";
      autoResizeTextarea(document.getElementById("positivePrompt"));
    }
  }

  /**
   * Collect form data for image generation
   * @param {Object} settings - Current settings object
   * @param {string} currentMode - Current generation mode
   * @returns {Object} - Form data for API call
   */
  collectFormData(settings, currentMode = "image") {
    // For PuLID mode, use minimal structure matching documentation but exclude LoRA
    if (currentMode === "pulid") {
      const formData = {
        positivePrompt: document.getElementById("positivePrompt").value,
        height: settings.height,
        width: settings.width,
        model:
          settings.model === "runware:100@1" ||
          settings.model === "runware:101@1"
            ? settings.model
            : "runware:101@1", // Auto-switch to FLUX Dev for PuLID compatibility
      };

      // Note: LoRA cannot be used with PuLID according to Runware API limitations
      // LoRA is intentionally excluded from PuLID requests

      return formData;
    }

    // For Kontext mode, use minimal structure for instruction-based editing
    if (currentMode === "kontext") {
      const formData = {
        positivePrompt: document.getElementById("positivePrompt").value, // This should be edit instruction
        height: settings.height, // Now using compatible dimensions from settings
        width: settings.width, // Now using compatible dimensions from settings
        model:
          settings.model === "bfl:3@1" || settings.model === "bfl:4@1"
            ? settings.model
            : "bfl:3@1", // Auto-switch to Kontext Pro if not already Kontext
      };

      // Note: LoRA support with Kontext is unknown, excluding for safety
      // LoRA is intentionally excluded from Kontext requests

      return formData;
    }

    // For all other modes, use the full structure
    const isDreamModel = settings.model === "runware:97@1";

    console.log("collectFormData - Mode:", currentMode);
    console.log("collectFormData - Original Model:", settings.model);
    console.log("collectFormData - isDreamModel:", isDreamModel);
    console.log("collectFormData - settings.lora:", settings.lora);

    const formData = {
      positivePrompt: document.getElementById("positivePrompt").value,
      negativePrompt: settings.negativePrompt,
      width: settings.width,
      height: settings.height,
      model: settings.model,
      lora: isDreamModel ? "" : settings.lora,
      lora2: isDreamModel ? "" : settings.lora2 || "",
      loraWeight: document.getElementById("loraWeight")
        ? parseFloat(document.getElementById("loraWeight").value)
        : 1.0,
      steps: settings.steps,
      CFGScale: settings.CFGScale,
      scheduler: settings.scheduler,
      seed: settings.seed,
      enhancePrompt: settings.enhancePrompt,
      outputFormat: settings.outputFormat,
      numberResults: settings.numberResults,
    };

    console.log("collectFormData - Final formData:", formData);
    return formData;
  }

  /**
   * Collect PuLID reference images from the UI
   * @returns {Array} - Array of base64 encoded images
   */
  collectPulidImages() {
    const images = [];

    // Check mini preview container (existing functionality)
    const previewContainer = document.getElementById("pulidImagePreview");
    if (previewContainer) {
      const imageElements = previewContainer.querySelectorAll("img");
      imageElements.forEach((img) => {
        if (img.src && img.src.startsWith("data:")) {
          images.push(img.src);
        }
      });
    }

    // Also check upload previews container (new functionality)
    const uploadPreviewsContainer = document.getElementById(
      "uploadPreviewsContainer"
    );
    if (uploadPreviewsContainer && images.length === 0) {
      const uploadImages = uploadPreviewsContainer.querySelectorAll("img");
      uploadImages.forEach((img) => {
        if (img.src) {
          // For external URLs, we'll need to convert them to base64
          // For now, we'll pass the URL and handle conversion server-side if needed
          images.push(img.src);
        }
      });
    }

    return images;
  }

  /**
   * Collect Kontext reference images from the UI
   * @returns {Array} - Array of base64 encoded images
   */
  collectKontextImages() {
    const images = [];

    // Check mini preview container (existing functionality)
    const previewContainer = document.getElementById("kontextImagePreview");
    if (previewContainer) {
      const imageElements = previewContainer.querySelectorAll("img");
      imageElements.forEach((img) => {
        if (img.src && img.src.startsWith("data:")) {
          images.push(img.src);
        }
      });
    }

    // Also check upload previews container (new functionality)
    const uploadPreviewsContainer = document.getElementById(
      "uploadPreviewsContainer"
    );
    if (uploadPreviewsContainer && images.length === 0) {
      const uploadImages = uploadPreviewsContainer.querySelectorAll("img");
      uploadImages.forEach((img) => {
        if (img.src) {
          // For external URLs, we'll need to convert them to base64
          // For now, we'll pass the URL and handle conversion server-side if needed
          images.push(img.src);
        }
      });
    }

    return images;
  }

  /**
   * Update generate button state
   * @param {boolean} isLoading - Whether generation is in progress
   */
  updateGenerateButton(isLoading) {
    const sendBtn = document.getElementById("sendBtn");
    if (!sendBtn) return;

    sendBtn.disabled = isLoading;

    if (isLoading) {
      sendBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 6v6l4 2"/>
        </svg>
      `;
    } else {
      sendBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="22" y1="2" x2="11" y2="13"/>
          <polygon points="22,2 15,22 11,13 2,9 22,2"/>
        </svg>
      `;
    }
  }

  /**
   * Load random prompts from server
   */
  async loadRandomPrompts() {
    try {
      const response = await fetch("/random-prompt");
      const data = await response.json();
      this.randomPrompts = data.prompts || [];
    } catch (error) {
      console.error("Failed to load random prompts:", error);
      this.randomPrompts = [
        "A serene landscape with mountains and a lake",
        "A futuristic city with flying cars",
        "A magical forest with glowing mushrooms",
        "A vintage car on a desert highway",
        "A cozy coffee shop in the rain",
      ];
    }
  }

  /**
   * Get a random prompt and set it in the input
   * @param {Function} autoResizeTextarea - Function to resize textarea
   */
  getRandomPrompt(autoResizeTextarea) {
    if (!this.randomPrompts || this.randomPrompts.length === 0) {
      this.loadRandomPrompts();
      return;
    }

    const randomPrompt =
      this.randomPrompts[Math.floor(Math.random() * this.randomPrompts.length)];
    const promptInput = document.getElementById("positivePrompt");
    promptInput.value = randomPrompt;
    autoResizeTextarea(promptInput);
    promptInput.focus();
  }

  /**
   * Download an image from URL
   * @param {string} imageUrl - URL of the image to download
   */
  async downloadImage(imageUrl) {
    try {
      // Fetch the image as a blob to ensure proper download
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error("Failed to fetch image");
      }

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      // Create download link
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `realengine-${Date.now()}.jpg`;
      link.style.display = "none";

      // Add to document, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the blob URL
      URL.revokeObjectURL(blobUrl);

      console.log("Image download initiated");
    } catch (error) {
      console.error("Download failed:", error);

      // Fallback to the original method
      const link = document.createElement("a");
      link.href = imageUrl;
      link.download = `realengine-${Date.now()}.jpg`;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  /**
   * Create variation of an image (placeholder)
   * @param {string} imageUrl - URL of the source image
   * @param {Function} showStatus - Status display function
   */
  createVariation(imageUrl, showStatus) {
    // TODO: Implement image-to-image variation
    showStatus("Variation feature coming soon!", 3000);
  }

  /**
   * Check if generation is in progress
   * @returns {boolean} - Whether generation is active
   */
  isCurrentlyGenerating() {
    return this.isGenerating;
  }

  /**
   * Get available random prompts
   * @returns {Array} - Array of random prompts
   */
  getRandomPrompts() {
    return this.randomPrompts;
  }

  /**
   * Poll job status until completion
   * @param {string} jobId - Job ID to poll
   * @param {HTMLElement} loadingMessage - Loading message element
   * @param {Function} addMessage - Function to add messages
   * @param {Function} showStatus - Function to show status
   * @returns {Promise<Object>} - Generation result
   */
  async pollJobStatus(jobId, loadingMessage, addMessage, showStatus) {
    const maxAttempts = 60; // 60 attempts * 3 seconds = 3 minutes max
    let attempts = 0;

    while (attempts < maxAttempts) {
      try {
        await new Promise((resolve) => setTimeout(resolve, 3000)); // Wait 3 seconds

        const response = await fetch(`/job-status/${jobId}`);
        if (!response.ok) {
          throw new Error(`Failed to check job status: ${response.status}`);
        }

        const jobStatus = await response.json();

        // Update loading message with progress
        loadingMessage.textContent = jobStatus.progress || "Processing...";

        if (jobStatus.status === "completed") {
          // Remove loading message
          loadingMessage.remove();

          if (
            jobStatus.result &&
            jobStatus.result.images &&
            jobStatus.result.images.length > 0
          ) {
            addMessage(
              "Here's your generated image:",
              false,
              jobStatus.result.images
            );
            showStatus("Image generated successfully!", 3000);
            return { success: true, images: jobStatus.result.images };
          } else {
            addMessage(
              "Sorry, I couldn't generate an image. Please try again.",
              false
            );
            showStatus("Generation failed", 3000);
            return { success: false, reason: "No images returned" };
          }
        } else if (jobStatus.status === "failed") {
          // Remove loading message
          loadingMessage.remove();

          const errorMsg = jobStatus.error || "Generation failed";
          addMessage(
            `An error occurred: ${errorMsg}. Please try again.`,
            false
          );
          showStatus("Generation failed", 3000);
          return { success: false, reason: "Job failed", error: errorMsg };
        }

        // Continue polling if still processing
        attempts++;
      } catch (error) {
        console.error("Error polling job status:", error);
        attempts++;

        if (attempts >= maxAttempts) {
          loadingMessage.remove();
          addMessage("Generation timed out. Please try again.", false);
          showStatus("Generation timed out", 3000);
          return { success: false, reason: "Polling timeout" };
        }
      }
    }

    // Max attempts reached
    loadingMessage.remove();
    addMessage("Generation timed out. Please try again.", false);
    showStatus("Generation timed out", 3000);
    return { success: false, reason: "Polling timeout" };
  }
}
