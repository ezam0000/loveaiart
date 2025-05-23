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
      const formData = this.collectFormData(settings);
      // Override the prompt with trigger words added
      formData.positivePrompt = finalPrompt;

      const response = await fetch("/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

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
        "An error occurred while generating the image. Please try again.",
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
   * @returns {Object} - Form data for API call
   */
  collectFormData(settings) {
    // Check if current model supports LoRA
    const isDreamModel = settings.model === "runware:97@1";

    console.log("collectFormData - Model:", settings.model);
    console.log("collectFormData - isDreamModel:", isDreamModel);
    console.log("collectFormData - settings.lora:", settings.lora);

    const formData = {
      positivePrompt: document.getElementById("positivePrompt").value,
      negativePrompt: settings.negativePrompt,
      width: settings.width,
      height: settings.height,
      model: settings.model,
      lora: isDreamModel ? "" : settings.lora, // Clear LoRA for Dream model
      lora2: isDreamModel ? "" : settings.lora2 || "", // Clear secondary LoRA for Dream model
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

    console.log("collectFormData - Final lora value:", formData.lora);
    return formData;
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
}
