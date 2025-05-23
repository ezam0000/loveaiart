/**
 * Chat Manager Core Module
 * Handles chat functionality for the LoveAIArt application
 */

export class ChatManager {
  constructor() {
    this.chatHistory = [];
    this.isProcessing = false;
  }

  /**
   * Send a chat message to the AI
   * @param {Object} params - Chat parameters
   * @returns {Promise<Object>} - Chat result
   */
  async sendChatMessage({
    addMessage,
    showStatus,
    updateGenerateButton,
    autoResizeTextarea,
  }) {
    if (this.isProcessing)
      return { success: false, reason: "Already processing" };

    const message = document.getElementById("positivePrompt").value.trim();
    if (!message) {
      showStatus("Please enter a message", 3000);
      return { success: false, reason: "No message provided" };
    }

    this.isProcessing = true;
    updateGenerateButton(true);

    // Add user message
    addMessage(message, true);

    // Add loading message
    const loadingMessage = addMessage("Thinking...", false);

    try {
      // Prepare chat history for API
      const history = this.chatHistory.map((msg) => ({
        type: msg.isUser ? "user" : "assistant",
        content: msg.content,
      }));

      const response = await fetch("/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: message,
          history: history,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Remove loading message
      loadingMessage.remove();

      if (data.response) {
        addMessage(data.response, false);
        showStatus("Response received!", 2000);
        return { success: true, response: data.response };
      } else {
        addMessage(
          "Sorry, I couldn't process your message. Please try again.",
          false
        );
        showStatus("Chat failed", 3000);
        return { success: false, reason: "No response received" };
      }
    } catch (error) {
      console.error("Chat error:", error);
      loadingMessage.remove();
      addMessage(
        "An error occurred while processing your message. Please try again.",
        false
      );
      showStatus("Chat failed", 3000);
      return { success: false, reason: "API error", error: error.message };
    } finally {
      this.isProcessing = false;
      updateGenerateButton(false);
      // Clear input
      document.getElementById("positivePrompt").value = "";
      autoResizeTextarea(document.getElementById("positivePrompt"));
    }
  }

  /**
   * Clear chat history with confirmation
   * @param {Function} showWelcomeMessage - Function to show welcome message
   * @param {Function} showStatus - Status display function
   * @param {Function} saveToStorage - Function to save data
   * @returns {boolean} - Whether history was cleared
   */
  clearHistory(showWelcomeMessage, showStatus, saveToStorage) {
    if (
      confirm(
        "Are you sure you want to clear all chat history? This action cannot be undone."
      )
    ) {
      // Clear chat history
      this.chatHistory = [];

      // Clear visual messages from current chat
      const chatContainer = document.getElementById("chatContainer");
      const messages = chatContainer.querySelectorAll(".message");
      messages.forEach((message) => message.remove());

      // Show welcome message again
      showWelcomeMessage();

      showStatus("Chat history cleared", 3000);
      if (saveToStorage) {
        saveToStorage();
      }
      console.log("Chat history cleared");
      return true;
    }
    return false;
  }

  /**
   * Add message to chat history
   * @param {string} content - Message content
   * @param {boolean} isUser - Whether message is from user
   */
  addToChatHistory(content, isUser) {
    this.chatHistory.push({
      content: content,
      isUser: isUser,
      timestamp: Date.now(),
    });

    // Keep only last 20 messages to prevent context from getting too long
    if (this.chatHistory.length > 20) {
      this.chatHistory = this.chatHistory.slice(-20);
    }
  }

  /**
   * Get chat history
   * @returns {Array} - Array of chat messages
   */
  getChatHistory() {
    return this.chatHistory;
  }

  /**
   * Set chat history (for loading from storage)
   * @param {Array} history - Chat history array
   */
  setChatHistory(history) {
    this.chatHistory = Array.isArray(history) ? history : [];
  }

  /**
   * Get chat history formatted for API
   * @returns {Array} - Formatted chat history
   */
  getFormattedHistory() {
    return this.chatHistory.map((msg) => ({
      type: msg.isUser ? "user" : "assistant",
      content: msg.content,
    }));
  }

  /**
   * Check if chat is currently processing
   * @returns {boolean} - Whether chat is processing
   */
  isCurrentlyProcessing() {
    return this.isProcessing;
  }

  /**
   * Reset chat state
   */
  reset() {
    this.chatHistory = [];
    this.isProcessing = false;
  }

  /**
   * Get chat history for storage (keeping last 50 messages)
   * @returns {Array} - Chat history for storage
   */
  getHistoryForStorage() {
    return this.chatHistory.slice(-50);
  }
}
