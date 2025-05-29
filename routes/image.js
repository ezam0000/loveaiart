/**
 * Image Generation Routes
 * Handles all image generation endpoints
 */

const express = require("express");
const axios = require("axios");
const runwareService = require("../services/runware");

const router = express.Router();

// Route to generate images using Runware API (main endpoint)
router.post("/generate", async (req, res) => {
  try {
    let result;

    // Check for feature-specific properties and route accordingly
    if (req.body.puLID) {
      // Route to PuLID generation
      console.log("Detected puLID object, routing to PuLID generation");
      result = await runwareService.generatePuLID(req.body);
    } else if (req.body.layerDiffuse) {
      // Route to LayerDiffuse generation
      console.log(
        "Detected layerDiffuse flag, routing to LayerDiffuse generation"
      );
      result = await runwareService.generateLayerDiffuse(req.body);
    } else if (
      req.body.acceleratorOptions ||
      req.body.teaCache ||
      req.body.deepCache
    ) {
      // Route to accelerated generation
      console.log(
        "Detected accelerator options, routing to accelerated generation"
      );
      result = await runwareService.generateWithAccelerators(req.body);
    } else {
      // Standard image generation
      result = await runwareService.generateImages(req.body);
    }

    res.json(result);
  } catch (error) {
    console.error("Error:", error);
    res
      .status(500)
      .json({ error: "An error occurred while generating the image" });
  }
});

// Route to generate images using Runware API (legacy endpoint)
router.post("/generate-image", async (req, res) => {
  try {
    const images = await runwareService.generateImagesLegacy(req.body);
    res.json(images);
  } catch (error) {
    console.error("Error:", error);
    res
      .status(500)
      .json({ error: "An error occurred while generating the image" });
  }
});

// Route to generate images using PhotoMaker API
router.post("/photomaker", async (req, res) => {
  try {
    const requestBody = req.body[0];

    // Validate input
    if (
      !requestBody.positivePrompt ||
      !requestBody.inputImages ||
      requestBody.inputImages.length === 0
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    console.log("Received photomaker request:", requestBody);

    const images = await runwareService.generatePhotoMaker(requestBody);

    console.log("Received response from Runware API:", images);
    res.json(images);
  } catch (error) {
    console.error("Error in /photomaker:", error);
    if (error.response && error.response.data) {
      console.error("Runware API Error Response:", error.response.data);
    }
    res
      .status(500)
      .json({ error: "An error occurred while generating the image" });
  }
});

// Route to generate avatars using Runware PhotoMaker API
router.post("/generate-avatar", async (req, res) => {
  try {
    // Extract task payload from the request body (handle array payloads)
    const task = Array.isArray(req.body) ? req.body[0] : req.body;
    console.log("Received avatar generation request:", task);

    // POST the task directly to the Runware PhotoMaker endpoint
    const response = await axios.post(
      "https://api.runware.ai/photomaker",
      task,
      {
        headers: {
          Authorization: `Bearer ${process.env.RUNWARE_API_KEY}`,
          "Content-Type": "application/json",
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        timeout: 60000,
      }
    );
    const images = response.data;

    console.log(
      "Avatar generation - received response from Runware API:",
      images
    );
    res.json(images);
  } catch (error) {
    console.error("Error in /generate-avatar:", error.message);
    if (error.response && error.response.data) {
      console.error("Runware API Error Response:", error.response.data);
    }
    res
      .status(500)
      .json({ error: "An error occurred while generating the avatar" });
  }
});

// Route to enhance prompts using Runware API
router.post("/enhance-prompt", async (req, res) => {
  try {
    const { prompt } = req.body;
    const enhancedPromptResponse = await runwareService.enhancePrompt(prompt);
    res.json(enhancedPromptResponse);
  } catch (error) {
    console.error("Error enhancing prompt:", error);
    res.status(500).json({
      error: error.message || "An error occurred while enhancing the prompt",
    });
  }
});

// Route to generate images using PuLID for identity consistency
router.post("/pulid", async (req, res) => {
  try {
    console.log("Received PuLID request:", req.body);

    // Validate required fields
    if (!req.body.positivePrompt) {
      return res.status(400).json({
        error: "Missing required field: positivePrompt is required",
      });
    }

    // Check for inputImages in the puLID object
    if (
      !req.body.puLID ||
      !req.body.puLID.inputImages ||
      req.body.puLID.inputImages.length === 0
    ) {
      return res.status(400).json({
        error:
          "Missing required fields: puLID.inputImages is required and must contain at least one image",
      });
    }

    const result = await runwareService.generatePuLID(req.body);
    console.log("PuLID generation successful:", result);
    res.json(result);
  } catch (error) {
    console.error("Error in /pulid:", error);
    res.status(500).json({
      error: "An error occurred while generating PuLID image",
      details: error.message,
    });
  }
});

// Route to start PuLID generation as background job (for Heroku timeout handling)
router.post("/pulid-async", async (req, res) => {
  try {
    console.log("Received async PuLID request");

    // Validate required fields
    if (!req.body.positivePrompt) {
      return res.status(400).json({
        error: "Missing required field: positivePrompt is required",
      });
    }

    // Check for inputImages in the puLID object
    if (
      !req.body.puLID ||
      !req.body.puLID.inputImages ||
      req.body.puLID.inputImages.length === 0
    ) {
      return res.status(400).json({
        error:
          "Missing required fields: puLID.inputImages is required and must contain at least one image",
      });
    }

    // Generate job ID and start background processing
    const jobId = await runwareService.startPuLIDJob(req.body);

    console.log("PuLID job started with ID:", jobId);
    res.json({
      success: true,
      jobId: jobId,
      message: "PuLID generation started. Use the job ID to check status.",
    });
  } catch (error) {
    console.error("Error starting PuLID job:", error);
    res.status(500).json({
      error: "An error occurred while starting PuLID generation",
      details: error.message,
    });
  }
});

// Route to check job status and get results
router.get("/job-status/:jobId", async (req, res) => {
  try {
    const { jobId } = req.params;
    const jobStatus = await runwareService.getJobStatus(jobId);

    res.json(jobStatus);
  } catch (error) {
    console.error("Error checking job status:", error);
    res.status(500).json({
      error: "An error occurred while checking job status",
      details: error.message,
    });
  }
});

// Route to generate images with transparent backgrounds using LayerDiffuse
router.post("/layer-diffuse", async (req, res) => {
  try {
    console.log("Received LayerDiffuse request:", req.body);

    // Validate required fields
    if (!req.body.positivePrompt) {
      return res.status(400).json({
        error: "Missing required field: positivePrompt is required",
      });
    }

    const result = await runwareService.generateLayerDiffuse(req.body);
    console.log("LayerDiffuse generation successful:", result);
    res.json(result);
  } catch (error) {
    console.error("Error in /layer-diffuse:", error);
    res.status(500).json({
      error: "An error occurred while generating LayerDiffuse image",
      details: error.message,
    });
  }
});

// Route to start LayerDiffuse generation as background job (for Heroku timeout handling)
router.post("/layer-diffuse-async", async (req, res) => {
  try {
    console.log("Received async LayerDiffuse request");

    // Validate required fields
    if (!req.body.positivePrompt) {
      return res.status(400).json({
        error: "Missing required field: positivePrompt is required",
      });
    }

    // Generate job ID and start background processing
    const jobId = await runwareService.startLayerDiffuseJob(req.body);

    console.log("LayerDiffuse job started with ID:", jobId);
    res.json({
      success: true,
      jobId: jobId,
      message:
        "LayerDiffuse generation started. Use the job ID to check status.",
    });
  } catch (error) {
    console.error("Error starting LayerDiffuse job:", error);
    res.status(500).json({
      error: "An error occurred while starting LayerDiffuse generation",
      details: error.message,
    });
  }
});

// Route to generate images with accelerator methods (TeaCache/DeepCache)
router.post("/accelerated", async (req, res) => {
  try {
    console.log("Received accelerated request:", req.body);

    // Validate required fields
    if (!req.body.positivePrompt) {
      return res.status(400).json({
        error: "Missing required field: positivePrompt is required",
      });
    }

    // Validate accelerator options
    const { teaCache, deepCache } = req.body;
    if (!teaCache && !deepCache) {
      return res.status(400).json({
        error:
          "At least one accelerator option (teaCache or deepCache) must be enabled",
      });
    }

    const result = await runwareService.generateWithAccelerators(req.body);
    console.log("Accelerated generation successful:", result);
    res.json(result);
  } catch (error) {
    console.error("Error in /accelerated:", error);
    res.status(500).json({
      error: "An error occurred while generating accelerated image",
      details: error.message,
    });
  }
});

module.exports = router;
