/**
 * Chat Routes
 * Handles chat functionality endpoints
 */

const express = require("express");
const openaiService = require("../services/openai");

const router = express.Router();

// Route to handle chat requests using OpenAI
router.post("/chat", async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    const assistantMessage = await openaiService.sendChatMessage(
      message,
      history
    );
    res.json({ response: assistantMessage });
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({
      error: error.message || "An error occurred while processing your message",
    });
  }
});

module.exports = router;
