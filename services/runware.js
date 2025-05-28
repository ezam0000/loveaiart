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

  /**
   * Generate images using PuLID for identity consistency
   * @param {Object} params - PuLID generation parameters
   * @returns {Promise<Array>} - Array of generated images
   */
  async generatePuLID(params) {
    const { positivePrompt, width, height, model, puLID } = params;

    // Extract PuLID-specific parameters from the puLID object
    const { inputImages, idWeight, trueCFGScale, CFGStartStep } = puLID || {};

    // PuLID requires exactly 1 reference image according to Runware docs
    if (!inputImages || inputImages.length === 0) {
      throw new Error("PuLID requires exactly one reference image");
    }

    // Use only the first image as PuLID supports exactly 1 image
    const referenceImageData = inputImages[0];

    // Upload the reference image and get UUID
    console.log("Uploading PuLID reference image...");
    const referenceImageUUID = await this.uploadImage(referenceImageData);
    console.log(
      "PuLID reference image uploaded successfully, UUID:",
      referenceImageUUID
    );

    // PuLID works specifically with FLUX models - use FLUX Dev as default for better quality
    let pulidModel = "runware:100@1"; // FLUX Dev for better identity preservation
    if (model === "runware:100@1" || model === "runware:101@1") {
      pulidModel = model;
    }

    console.log(`Using PuLID with model: ${pulidModel}`);

    // Build the request payload for PuLID according to Runware docs with proven working defaults
    const requestPayload = {
      taskType: "imageInference",
      taskUUID: uuidv4(),
      positivePrompt,
      height: parseInt(height) || 1024,
      width: parseInt(width) || 1024,
      model: pulidModel,
      // PuLID specific parameters with aggressive settings for maximum identity preservation
      puLID: {
        inputImages: [referenceImageUUID], // Use UUID instead of base64
        idWeight: parseInt(idWeight) || 1, // Use the user's setting
        trueCFGScale: parseFloat(trueCFGScale) || 10.0, // Reduced from 15.0 for better balance
        CFGStartStep: parseInt(CFGStartStep) || 0, // Start from step 0 for maximum influence
      },
    };

    console.log(
      "Generating PuLID image with optimized parameters:",
      JSON.stringify(requestPayload, null, 2)
    );

    try {
      const images = await this.runware.requestImages(requestPayload);

      console.log("PuLID generation successful:", {
        imageCount: images.length,
        cost: images.reduce((total, img) => total + (img.cost || 0), 0),
        firstImageUrl: images[0]?.imageURL || images[0]?.image || images[0],
      });

      // Format response to match frontend expectations
      return {
        images: images.map((img) => img.imageURL || img.image || img),
        cost: images.reduce((total, img) => total + (img.cost || 0), 0),
      };
    } catch (error) {
      console.error("PuLID generation failed:", error);
      throw error;
    }
  }

  /**
   * Generate images with transparent backgrounds using LayerDiffuse
   * @param {Object} params - LayerDiffuse generation parameters
   * @returns {Promise<Array>} - Array of generated images with transparency
   */
  async generateLayerDiffuse(params) {
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
    } = params;

    // LayerDiffuse requires FLUX models - force switch if needed
    let layerDiffuseModel = model;
    if (model !== "runware:100@1" && model !== "runware:101@1") {
      layerDiffuseModel = "runware:101@1"; // Default to FLUX Schnell
      console.log(
        `LayerDiffuse: Auto-switched model from ${model} to ${layerDiffuseModel}`
      );
    }

    // Build the request payload for LayerDiffuse
    const requestPayload = {
      taskType: "imageInference",
      taskUUID: uuidv4(),
      positivePrompt,
      negativePrompt: negativePrompt || "blurry, ugly, low quality",
      width: parseInt(width) || 1024,
      height: parseInt(height) || 1024,
      model: layerDiffuseModel,
      numberResults: parseInt(numberResults) || 1,
      outputType: "URL",
      outputFormat: "PNG", // Force PNG for transparency
      scheduler: scheduler || "Default",
      steps: parseInt(steps) || 28,
      CFGScale: parseFloat(CFGScale) || 3.5,
      seed: seed ? parseInt(seed) : undefined,
      checkNSFW: false,
      includeCost: true,
      // LayerDiffuse automatically applies the required LoRA and VAE
      advancedFeatures: {
        layerDiffuse: true, // This automatically applies runware:120@2 LoRA and runware:120@4 VAE
      },
    };

    console.log("Generating LayerDiffuse image with payload:", requestPayload);

    const images = await this.runware.requestImages(requestPayload);

    // Format response to match frontend expectations
    return {
      images: images.map((img) => img.imageURL || img.image || img),
      cost: images.reduce((total, img) => total + (img.cost || 0), 0),
    };
  }

  /**
   * Generate images with accelerator methods (TeaCache/DeepCache)
   * @param {Object} params - Accelerated generation parameters
   * @returns {Promise<Array>} - Array of generated images with cost savings
   */
  async generateWithAccelerators(params) {
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
      loraWeight,
      controlNet,
      // Accelerator options
      teaCache,
      teaCacheDistance,
      deepCache,
      deepCacheInterval,
      deepCacheBranchId,
    } = params;

    // Build the request payload with accelerator options
    const requestPayload = {
      taskType: "imageInference",
      taskUUID: uuidv4(),
      positivePrompt,
      negativePrompt: negativePrompt || "blurry, ugly, low quality",
      width: parseInt(width) || 1024,
      height: parseInt(height) || 1024,
      model: model || "runware:100@1",
      numberResults: parseInt(numberResults) || 1,
      outputType: "URL",
      outputFormat: outputFormat || "JPEG",
      scheduler: scheduler || "Default",
      steps: parseInt(steps) || 28,
      CFGScale: parseFloat(CFGScale) || 3.5,
      seed: seed ? parseInt(seed) : undefined,
      checkNSFW: false,
      includeCost: true,
    };

    // Add LoRA if specified
    if (lora && lora.trim() !== "") {
      requestPayload.lora = [
        {
          model: lora,
          weight: parseFloat(loraWeight) || 1.0,
        },
      ];
    }

    // Add ControlNet if specified
    if (controlNet && controlNet.length > 0) {
      requestPayload.controlNet = controlNet;
    }

    // Add accelerator options
    const acceleratorOptions = {};

    if (teaCache === true || teaCache === "true") {
      acceleratorOptions.teaCache = true;
      if (teaCacheDistance) {
        acceleratorOptions.teaCacheDistance = parseFloat(teaCacheDistance);
      }
    }

    if (deepCache === true || deepCache === "true") {
      acceleratorOptions.deepCache = true;
      if (deepCacheInterval) {
        acceleratorOptions.deepCacheInterval = parseInt(deepCacheInterval);
      }
      if (deepCacheBranchId) {
        acceleratorOptions.deepCacheBranchId = deepCacheBranchId;
      }
    }

    if (Object.keys(acceleratorOptions).length > 0) {
      requestPayload.acceleratorOptions = acceleratorOptions;
    }

    console.log("Generating accelerated image with payload:", requestPayload);

    const images = await this.runware.requestImages(requestPayload);

    // Calculate cost savings information
    const totalCost = images.reduce((total, img) => total + (img.cost || 0), 0);

    // Format response to match frontend expectations
    return {
      images: images.map((img) => img.imageURL || img.image || img),
      cost: totalCost,
      acceleratorOptions: acceleratorOptions,
      savings:
        acceleratorOptions.teaCache || acceleratorOptions.deepCache
          ? "Estimated 30-70% cost savings applied"
          : null,
    };
  }

  /**
   * Upload an image to Runware and get UUID
   * @param {string} imageData - Base64 image data
   * @returns {Promise<string>} - Image UUID
   */
  async uploadImage(imageData) {
    try {
      const uploadPayload = [
        {
          taskType: "imageUpload",
          taskUUID: uuidv4(),
          image: imageData,
        },
      ];

      console.log("Uploading image to Runware via direct HTTP...");

      // Use direct HTTP request instead of SDK to avoid unwanted parameters
      const response = await fetch("https://api.runware.ai/v1", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.RUNWARE_API_KEY}`,
        },
        body: JSON.stringify(uploadPayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `HTTP ${response.status}: ${JSON.stringify(errorData)}`
        );
      }

      const result = await response.json();
      console.log(
        "Upload response structure:",
        JSON.stringify(result, null, 2)
      );

      // Handle different response formats
      let imageUUID = null;

      if (result && result.data && result.data.length > 0) {
        // Standard format: result.data[0].imageUUID
        imageUUID = result.data[0].imageUUID;
      } else if (result && result.length > 0) {
        // Alternative format: result[0].imageUUID
        imageUUID = result[0].imageUUID;
      } else if (result && result.imageUUID) {
        // Direct format: result.imageUUID
        imageUUID = result.imageUUID;
      }

      if (imageUUID) {
        console.log("Image uploaded successfully, UUID:", imageUUID);
        return imageUUID;
      } else {
        console.error("Upload response:", result);
        throw new Error("Failed to get image UUID from upload response");
      }
    } catch (error) {
      console.error("Image upload error:", error);
      throw new Error(`Image upload failed: ${error.message}`);
    }
  }
}

module.exports = new RunwareService();
