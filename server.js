require("dotenv").config();
const express = require("express");
const path = require("path");
const http = require("http");
const { RunwareServer } = require("@runware/sdk-js");
const { v4: uuidv4 } = require("uuid");
const axios = require("axios");

function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const app = express();
const port = process.env.PORT || 3000;

// Initialize Runware with your API key
const runware = new RunwareServer({ apiKey: process.env.RUNWARE_API_KEY });

// Middleware for parsing JSON and serving static files
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(express.static("public"));

// Middleware to redirect www.loveaiart.com to loveaiart.com
app.use((req, res, next) => {
  if (req.headers.host === "www.loveaiart.com") {
    return res.redirect(301, `https://loveaiart.com${req.url}`);
  }
  next();
});

// Route to handle logout
app.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.session.destroy(() => {
      console.log("User logged out, session destroyed");
      res.clearCookie("connect.sid", { path: "/" }); // Clear the session cookie
      res.redirect("/");
    });
  });
});

// Home route, displays different content based on authentication status
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Separate login route
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

// Route to generate images using Runware API (new endpoint for ChatGPT-style interface)
app.post("/generate", async (req, res) => {
  try {
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
    } = req.body;

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

    // Add LoRA if specified - try simple string format first
    if (lora && lora.trim() !== "") {
      console.log(
        "Adding LoRA:",
        lora,
        "with weight:",
        parseFloat(loraWeight) || 1.0
      );
      // Use the correct array format as per Runware API documentation
      requestPayload.lora = [
        {
          model: lora,
          weight: parseFloat(loraWeight) || 1.0,
        },
      ];
    }

    console.log("Generating image with payload:", requestPayload);
    console.log(
      "enhancePrompt received:",
      enhancePrompt,
      "type:",
      typeof enhancePrompt
    );

    const images = await runware.requestImages(requestPayload);

    // Format response to match frontend expectations
    res.json({
      images: images.map((img) => img.imageURL || img.image || img),
    });
  } catch (error) {
    console.error("Error:", error);
    res
      .status(500)
      .json({ error: "An error occurred while generating the image" });
  }
});

// Route to get random prompts
app.get("/random-prompt", (req, res) => {
  const randomPrompts = [
    "A majestic dragon soaring through a stormy sky with lightning bolts",
    "A cozy cabin in a snow-covered forest with warm light glowing from windows",
    "A futuristic cityscape with flying cars and neon lights reflecting on wet streets",
    "A serene lake surrounded by autumn trees with golden reflections",
    "A magical garden with glowing flowers and fairy lights at twilight",
    "A vintage steam train crossing a stone bridge over a misty valley",
    "A cyberpunk street market with holographic signs and diverse characters",
    "A peaceful beach at sunset with palm trees silhouetted against orange sky",
    "A medieval castle on a cliff overlooking a turbulent ocean",
    "A space station orbiting a colorful nebula with distant stars",
    "A steampunk workshop filled with intricate brass machinery and gears",
    "A mystical forest path with ancient trees and dappled sunlight",
    "A bustling Tokyo street at night with colorful neon reflections",
    "A desert oasis with crystal clear water and date palms",
    "A floating island in the clouds with waterfalls cascading down",
    "A cozy bookshop with towering shelves and warm reading nooks",
    "A Viking longship sailing through icy fjords under aurora borealis",
    "A tropical underwater coral reef teeming with colorful fish",
    "A mountain summit at dawn with clouds below and peaks in distance",
    "A lavender field in Provence with an old stone farmhouse",
  ];

  res.json({
    prompts: randomPrompts,
  });
});

// Route to generate images using Runware API (original endpoint)
app.post("/generate-image", async (req, res) => {
  try {
    // Destructure variables from req.body
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
    } = req.body;

    // Proceed with generating images
    const images = await runware.requestImages({
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
      lora, // Include LoRA
      strength: parseFloat(strength),
      promptWeighting,
    });

    res.json(images);
  } catch (error) {
    console.error("Error:", error);
    res
      .status(500)
      .json({ error: "An error occurred while generating the image" });
  }
});

// Route to generate images using PhotoMaker API
app.post("/photomaker", async (req, res) => {
  try {
    const requestBody = req.body[0];

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
    } = requestBody;

    // Validate input
    if (!positivePrompt || !inputImages || inputImages.length === 0) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    console.log("Received photomaker request:", requestBody);

    const images = await runware.requestImages({
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

// Force logout route for testing
app.get("/force-logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.session.destroy(() => {
      console.log("Force logout, session destroyed");
      res.redirect("/");
    });
  });
});

// Route to enhance prompts using Runware API
app.post("/enhance-prompt", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt || prompt.length < 4) {
      return res.status(400).json({ error: "Prompt is too short or missing" });
    }

    const enhancedPromptResponse = await runware.enhancePrompt({
      prompt,
    });

    res.json(enhancedPromptResponse);
  } catch (error) {
    console.error("Error enhancing prompt:", error);
    res
      .status(500)
      .json({ error: "An error occurred while enhancing the prompt" });
  }
});

// Route to generate avatars using Runware PhotoMaker API
app.post("/generate-avatar", async (req, res) => {
  try {
    // Extract task payload from the request body (handle array payloads)
    const task = Array.isArray(req.body) ? req.body[0] : req.body;
    console.log("Received avatar generation request:", task);

    // POST the task directly to the Runware PhotoMaker endpoint,
    // including configuration to handle large payloads and a longer timeout.
    const response = await axios.post(
      "https://api.runware.ai/photomaker",
      task,
      {
        headers: {
          Authorization: `Bearer ${process.env.RUNWARE_API_KEY}`,
          "Content-Type": "application/json",
        },
        maxContentLength: Infinity, // Allow large response content
        maxBodyLength: Infinity, // Allow large request body
        timeout: 60000, // Increase timeout to 60 seconds
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

// Route to handle chat requests using OpenAI
app.post("/chat", async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (
      !process.env.OPENAI_API_KEY ||
      process.env.OPENAI_API_KEY === "your_openai_api_key_here"
    ) {
      return res.status(500).json({
        error:
          "OpenAI API key not configured. Please add OPENAI_API_KEY to environment variables.",
      });
    }

    // Prepare messages for OpenAI API
    const messages = [
      {
        role: "system",
        content:
          "You are RealEngine AI, a helpful assistant specialized in AI image generation. You can help users improve their prompts, suggest creative ideas, answer questions about image generation, and provide general assistance. Keep responses concise and helpful.",
      },
    ];

    // Add conversation history
    history.forEach((item) => {
      if (item.type === "user") {
        messages.push({ role: "user", content: item.content });
      } else if (item.type === "assistant") {
        messages.push({ role: "assistant", content: item.content });
      }
    });

    // Add current message
    messages.push({ role: "user", content: message });

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // Using available model
        messages: messages,
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenAI API Error:", errorData);
      return res.status(500).json({
        error:
          "Failed to get response from OpenAI: " +
          (errorData.error?.message || "Unknown error"),
      });
    }

    const data = await response.json();
    const assistantMessage = data.choices[0]?.message?.content;

    if (!assistantMessage) {
      return res.status(500).json({ error: "No response from OpenAI" });
    }

    res.json({ response: assistantMessage });
  } catch (error) {
    console.error("Chat error:", error);
    res
      .status(500)
      .json({ error: "An error occurred while processing your message" });
  }
});

// Start the server
const server = app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

// Keep-alive pings to maintain server connection
const keepAliveInterval = 25 * 60 * 1000; // 25 minutes in milliseconds
setInterval(() => {
  const pingUrl = `http://localhost:${port}`;
  console.log("Sending keep-alive ping to server...");
  http
    .get(pingUrl, (res) => {
      console.log(`Keep-alive response status: ${res.statusCode}`);
    })
    .on("error", (err) => {
      console.error("Error with keep-alive ping:", err.message);
    });
}, keepAliveInterval);
