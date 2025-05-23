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
    const result = await runwareService.generateImages(req.body);
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

module.exports = router;
