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
        if (settings.model !== "runware:101@1") {
          const oldModel = settings.model;
          formData.model = "runware:101@1"; // Always use FLUX Schnell for LayerDiffuse
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
    // For PuLID mode, use minimal structure matching documentation
    if (currentMode === "pulid") {
      return {
        positivePrompt: document.getElementById("positivePrompt").value,
        height: settings.height,
        width: settings.width,
        model:
          settings.model === "runware:100@1" ||
          settings.model === "runware:101@1"
            ? settings.model
            : "runware:100@1", // Auto-switch to FLUX Dev if not already FLUX
      };
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
    const previewContainer = document.getElementById("pulidImagePreview");

    if (previewContainer) {
      const imageElements = previewContainer.querySelectorAll("img");

      imageElements.forEach((img) => {
        if (img.src && img.src.startsWith("data:")) {
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
  downloadImage(imageUrl) {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `realengine-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
