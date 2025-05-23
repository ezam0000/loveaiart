/**
 * OpenAI Service
 * Handles chat functionality using OpenAI API
 */

class OpenAIService {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY;
    this.baseURL = "https://api.openai.com/v1/chat/completions";
  }

  /**
   * Check if OpenAI API is configured
   * @returns {boolean} - Whether API key is configured
   */
  isConfigured() {
    return !!(this.apiKey && this.apiKey !== "your_openai_api_key_here");
  }

  /**
   * Send chat message to OpenAI
   * @param {string} message - User message
   * @param {Array} history - Chat history
   * @returns {Promise<string>} - Assistant response
   */
  async sendChatMessage(message, history = []) {
    if (!this.isConfigured()) {
      throw new Error(
        "OpenAI API key not configured. Please add OPENAI_API_KEY to environment variables."
      );
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

    const response = await fetch(this.baseURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: messages,
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenAI API Error:", errorData);
      throw new Error(
        "Failed to get response from OpenAI: " +
          (errorData.error?.message || "Unknown error")
      );
    }

    const data = await response.json();
    const assistantMessage = data.choices[0]?.message?.content;

    if (!assistantMessage) {
      throw new Error("No response from OpenAI");
    }

    return assistantMessage;
  }
}

module.exports = new OpenAIService();
