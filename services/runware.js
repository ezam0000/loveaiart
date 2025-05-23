/**
 * Runware Service
 * Handles all interactions with the Runware API
 */

const { RunwareServer } = require("@runware/sdk-js");
const { v4: uuidv4 } = require("uuid");

class RunwareService {
  constructor() {
    this.runware = new RunwareServer({ apiKey: process.env.RUNWARE_API_KEY });
  }

  /**
   * Generate images using Runware API
   * @param {Object} params - Image generation parameters
   * @returns {Promise<Array>} - Array of generated images
   */
  async generateImages(params) {
    const {
      positivePrompt,
      negativePrompt,
      width,
      height,
      model,
      numberResults,
      outputFormat,
      scheduler,
      steps,
      CFGScale,
      seed,
      lora,
      lora2,
      loraWeight,
      enhancePrompt,
    } = params;

    // Build the request payload
    const requestPayload = {
      positivePrompt,
      negativePrompt: negativePrompt || "blurry, ugly",
      width: parseInt(width),
      height: parseInt(height),
      model,
      numberResults: parseInt(numberResults) || 1,
      outputType: "URL",
      outputFormat: outputFormat || "JPEG",
      scheduler: scheduler || "Default",
      steps: parseInt(steps) || 28,
      CFGScale: parseFloat(CFGScale) || 3.5,
      seed: seed ? parseInt(seed) : undefined,
      checkNSFW: false,
      includeCost: false,
    };

    // Add prompt enhancement if enabled
    if (enhancePrompt === true || enhancePrompt === "true") {
      requestPayload.enhancePrompt = true;
      console.log("Prompt enhancement enabled");
    }

    // Add LoRA if specified
    if (lora && lora.trim() !== "") {
      console.log(
        "Adding LoRA:",
        lora,
        "with weight:",
        parseFloat(loraWeight) || 1.0
      );
      requestPayload.lora = [
        {
          model: lora,
          weight: parseFloat(loraWeight) || 1.0,
        },
      ];
    }

    console.log("Generating image with payload:", requestPayload);

    const images = await this.runware.requestImages(requestPayload);

    // Format response to match frontend expectations
    return {
      images: images.map((img) => img.imageURL || img.image || img),
    };
  }

  /**
   * Generate images using legacy format
   * @param {Object} params - Legacy image generation parameters
   * @returns {Promise<Array>} - Array of generated images
   */
  async generateImagesLegacy(params) {
    const {
      positivePrompt,
      negativePrompt,
      width,
      height,
      model,
      numberResults,
      outputFormat,
      scheduler,
      steps,
      CFGScale,
      seed,
      lora,
      strength,
      promptWeighting,
    } = params;

    const images = await this.runware.requestImages({
      positivePrompt,
      negativePrompt,
      width: parseInt(width),
      height: parseInt(height),
      model,
      numberResults: parseInt(numberResults) || 1,
      outputType: "URL",
      outputFormat,
      scheduler,
      steps: parseInt(steps),
      CFGScale: parseFloat(CFGScale),
      seed: seed ? parseInt(seed) : undefined,
      checkNSFW: false,
      includeCost: false,
      lora,
      strength: parseFloat(strength),
      promptWeighting,
    });

    return images;
  }

  /**
   * Generate images using PhotoMaker API
   * @param {Object} params - PhotoMaker parameters
   * @returns {Promise<Array>} - Array of generated images
   */
  async generatePhotoMaker(params) {
    const {
      positivePrompt,
      style,
      model,
      strength,
      width,
      height,
      inputImages,
      scheduler,
      steps,
      CFGScale,
      outputFormat,
      includeCost,
      numberResults,
    } = params;

    const images = await this.runware.requestImages({
      taskType: "photoMaker",
      taskUUID: uuidv4(),
      inputImages,
      style,
      model,
      strength: parseFloat(strength),
      positivePrompt,
      height: parseInt(height),
      width: parseInt(width),
      scheduler,
      steps: parseInt(steps),
      CFGScale: parseFloat(CFGScale),
      outputFormat,
      includeCost,
      numberResults: parseInt(numberResults),
      checkNSFW: false,
      clipSkip: 2,
    });

    return images;
  }

  /**
   * Enhance prompt using Runware API
   * @param {string} prompt - Prompt to enhance
   * @returns {Promise<Object>} - Enhanced prompt response
   */
  async enhancePrompt(prompt) {
    if (!prompt || prompt.length < 4) {
      throw new Error("Prompt is too short or missing");
    }

    return await this.runware.enhancePrompt({ prompt });
  }
}

module.exports = new RunwareService();
