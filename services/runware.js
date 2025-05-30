/**
 * Runware Service
 * Handles all interactions with the Runware API
 */

const { RunwareServer } = require("@runware/sdk-js");
const { v4: uuidv4 } = require("uuid");

class RunwareService {
  constructor() {
    this.runware = new RunwareServer({ apiKey: process.env.RUNWARE_API_KEY });
    // In-memory job store (in production, use Redis or database)
    this.jobs = new Map();
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
    const { positivePrompt, width, height, model, puLID, lora, loraWeight } =
      params;

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
    let pulidModel = "runware:101@1"; // FLUX Dev for better identity preservation
    if (model === "runware:100@1" || model === "runware:101@1") {
      pulidModel = model;
    }

    console.log(`Using PuLID with model: ${pulidModel}`);

    // Build the EXACT payload from documentation - minimal parameters only
    const requestPayload = [
      {
        taskType: "imageInference",
        taskUUID: uuidv4(),
        positivePrompt,
        height: parseInt(height) || 1024,
        width: parseInt(width) || 1024,
        model: pulidModel,
        puLID: {
          inputImages: [referenceImageUUID], // Use UUID instead of base64
          idWeight: parseInt(idWeight) || 1,
        },
        // Add accelerator options for cost savings
        acceleratorOptions: {
          teaCache: true,
        },
      },
    ];

    // Note: LoRA cannot be used with PuLID according to Runware API limitations
    if (lora && lora.trim()) {
      console.log(
        `Warning: LoRA (${lora}) cannot be used with PuLID. Skipping LoRA.`
      );
    }

    // Add either trueCFGScale OR CFGStartStep, not both (they are mutually exclusive)
    if (CFGStartStep !== undefined && CFGStartStep !== null) {
      requestPayload[0].puLID.CFGStartStep = parseInt(CFGStartStep);
    } else if (trueCFGScale !== undefined && trueCFGScale !== null) {
      requestPayload[0].puLID.trueCFGScale = parseFloat(trueCFGScale);
    }

    console.log(
      "Generating PuLID image with EXACT payload from docs:",
      JSON.stringify(requestPayload, null, 2)
    );

    try {
      // Use direct HTTP request to ensure proper handling of puLID
      const response = await fetch("https://api.runware.ai/v1", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.RUNWARE_API_KEY}`,
        },
        body: JSON.stringify(requestPayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `HTTP ${response.status}: ${JSON.stringify(errorData)}`
        );
      }

      const result = await response.json();
      console.log("PuLID API response:", JSON.stringify(result, null, 2));

      // Handle the response format
      let images = [];
      if (result && result.data && result.data.length > 0) {
        images = result.data;
      } else {
        throw new Error("No images returned from PuLID API");
      }

      console.log("PuLID generation successful:", {
        imageCount: images.length,
        cost: images.reduce((total, img) => total + (img.cost || 0), 0),
        firstImageUrl: images[0]?.imageURL,
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
    const { positivePrompt, width, height, model, numberResults } = params;

    // LayerDiffuse only works with FLUX Schnell - force switch if needed
    let layerDiffuseModel = "runware:100@1"; // Always use FLUX Schnell for LayerDiffuse
    if (model !== "runware:100@1") {
      console.log(
        `LayerDiffuse: Auto-switched model from ${model} to FLUX Schnell (LayerDiffuse only supports FLUX Schnell)`
      );
    }

    // Build the EXACT payload structure as specified
    const requestPayload = [
      {
        taskType: "imageInference",
        taskUUID: uuidv4(),
        positivePrompt,
        width: parseInt(width) || 1024,
        height: parseInt(height) || 1024,
        model: layerDiffuseModel,
        steps: 30,
        outputFormat: "WEBP",
        advancedFeatures: {
          layerDiffuse: true,
        },
      },
    ];

    console.log(
      "Generating LayerDiffuse image with EXACT payload structure:",
      JSON.stringify(requestPayload, null, 2)
    );

    try {
      // Use direct HTTP request to ensure proper handling of advancedFeatures
      const response = await fetch("https://api.runware.ai/v1", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.RUNWARE_API_KEY}`,
        },
        body: JSON.stringify(requestPayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `HTTP ${response.status}: ${JSON.stringify(errorData)}`
        );
      }

      const result = await response.json();
      console.log(
        "LayerDiffuse API response:",
        JSON.stringify(result, null, 2)
      );

      // Handle the response format
      let images = [];
      if (result && result.data && result.data.length > 0) {
        images = result.data;
      } else {
        throw new Error("No images returned from LayerDiffuse API");
      }

      console.log("LayerDiffuse generation successful:", {
        imageCount: images.length,
        cost: images.reduce((total, img) => total + (img.cost || 0), 0),
        firstImageUrl: images[0]?.imageURL,
      });

      // Format response to match frontend expectations
      return {
        images: images.map((img) => img.imageURL || img.image || img),
        cost: images.reduce((total, img) => total + (img.cost || 0), 0),
      };
    } catch (error) {
      console.error("LayerDiffuse generation failed:", error);
      throw error;
    }
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

  /**
   * Start a PuLID generation job in the background
   * @param {Object} params - PuLID generation parameters
   * @returns {Promise<string>} - Job ID
   */
  async startPuLIDJob(params) {
    const jobId = uuidv4();

    // Initialize job status
    this.jobs.set(jobId, {
      status: "started",
      createdAt: new Date(),
      progress: "Initializing PuLID generation...",
    });

    // Start background processing (don't await)
    this.processPuLIDJob(jobId, params).catch((error) => {
      console.error(`Job ${jobId} failed:`, error);
      this.jobs.set(jobId, {
        status: "failed",
        error: error.message,
        finishedAt: new Date(),
      });
    });

    return jobId;
  }

  /**
   * Process PuLID generation job in the background
   * @param {string} jobId - Job ID
   * @param {Object} params - PuLID generation parameters
   */
  async processPuLIDJob(jobId, params) {
    try {
      // Update status to processing
      this.jobs.set(jobId, {
        ...this.jobs.get(jobId),
        status: "processing",
        progress: "Generating PuLID image...",
      });

      // Generate the image using existing PuLID method
      const result = await this.generatePuLID(params);

      // Update status to completed
      this.jobs.set(jobId, {
        status: "completed",
        result: result,
        finishedAt: new Date(),
        progress: "Generation completed successfully!",
      });

      console.log(`Job ${jobId} completed successfully`);
    } catch (error) {
      console.error(`Job ${jobId} processing failed:`, error);
      this.jobs.set(jobId, {
        status: "failed",
        error: error.message,
        finishedAt: new Date(),
        progress: "Generation failed",
      });
    }
  }

  /**
   * Start a LayerDiffuse generation job in the background
   * @param {Object} params - LayerDiffuse generation parameters
   * @returns {Promise<string>} - Job ID
   */
  async startLayerDiffuseJob(params) {
    const jobId = uuidv4();

    // Initialize job status
    this.jobs.set(jobId, {
      status: "started",
      createdAt: new Date(),
      progress: "Initializing LayerDiffuse generation...",
    });

    // Start background processing (don't await)
    this.processLayerDiffuseJob(jobId, params).catch((error) => {
      console.error(`Job ${jobId} failed:`, error);
      this.jobs.set(jobId, {
        status: "failed",
        error: error.message,
        finishedAt: new Date(),
      });
    });

    return jobId;
  }

  /**
   * Process LayerDiffuse generation job in the background
   * @param {string} jobId - Job ID
   * @param {Object} params - LayerDiffuse generation parameters
   */
  async processLayerDiffuseJob(jobId, params) {
    try {
      // Update status to processing
      this.jobs.set(jobId, {
        ...this.jobs.get(jobId),
        status: "processing",
        progress: "Generating LayerDiffuse image...",
      });

      // Generate the image using existing LayerDiffuse method
      const result = await this.generateLayerDiffuse(params);

      // Update status to completed
      this.jobs.set(jobId, {
        status: "completed",
        result: result,
        finishedAt: new Date(),
        progress: "Generation completed successfully!",
      });

      console.log(`Job ${jobId} completed successfully`);
    } catch (error) {
      console.error(`Job ${jobId} processing failed:`, error);
      this.jobs.set(jobId, {
        status: "failed",
        error: error.message,
        finishedAt: new Date(),
        progress: "Generation failed",
      });
    }
  }

  /**
   * Get job status and result
   * @param {string} jobId - Job ID
   * @returns {Object} - Job status and result
   */
  async getJobStatus(jobId) {
    const job = this.jobs.get(jobId);

    if (!job) {
      throw new Error("Job not found");
    }

    // Clean up completed/failed jobs after 1 hour
    if (job.finishedAt && new Date() - job.finishedAt > 3600000) {
      this.jobs.delete(jobId);
      throw new Error("Job expired");
    }

    return {
      jobId,
      status: job.status,
      progress: job.progress,
      result: job.result || null,
      error: job.error || null,
      createdAt: job.createdAt,
      finishedAt: job.finishedAt || null,
    };
  }
}

module.exports = new RunwareService();
