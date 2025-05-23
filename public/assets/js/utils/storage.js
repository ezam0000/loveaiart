/**
 * Storage Utility Module
 * Handles all localStorage operations for the LoveAIArt application
 */

export class StorageManager {
  constructor(storageKey = "realengine_data") {
    this.storageKey = storageKey;
  }

  /**
   * Save data to localStorage
   * @param {Object} data - Data object to save
   */
  saveToStorage(data) {
    const dataToSave = {
      settings: data.settings,
      currentMode: data.currentMode,
      recentPrompts: data.recentPrompts?.slice(-20), // Keep last 20 prompts
      chatHistory: data.chatHistory?.slice(-50), // Keep last 50 chat messages
      personalLoras: data.personalLoras, // Save personal LoRAs
      timestamp: Date.now(),
    };

    try {
      localStorage.setItem(this.storageKey, JSON.stringify(dataToSave));
      console.log("Data saved to localStorage");
      return true;
    } catch (error) {
      console.error("Failed to save to localStorage:", error);
      return false;
    }
  }

  /**
   * Load data from localStorage
   * @returns {Object|null} - Loaded data or null if error
   */
  loadFromStorage() {
    try {
      const savedData = localStorage.getItem(this.storageKey);
      if (savedData) {
        const data = JSON.parse(savedData);
        console.log("Data loaded from localStorage");
        return data;
      }
      return null;
    } catch (error) {
      console.error("Failed to load from localStorage:", error);
      return null;
    }
  }

  /**
   * Clear all stored data
   */
  clearStorage() {
    try {
      localStorage.removeItem(this.storageKey);
      console.log("Storage cleared");
      return true;
    } catch (error) {
      console.error("Failed to clear storage:", error);
      return false;
    }
  }

  /**
   * Add prompt to recent prompts list
   * @param {Array} recentPrompts - Current recent prompts array
   * @param {string} prompt - New prompt to add
   * @returns {Array} - Updated recent prompts array
   */
  addToRecentPrompts(recentPrompts, prompt) {
    if (!prompt || !prompt.trim()) {
      return recentPrompts;
    }

    // Make a copy to avoid mutations
    let updatedPrompts = [...recentPrompts];

    // Remove if already exists to avoid duplicates
    updatedPrompts = updatedPrompts.filter((p) => p !== prompt.trim());

    // Add to beginning
    updatedPrompts.unshift(prompt.trim());

    // Keep only last 20
    return updatedPrompts.slice(0, 20);
  }

  /**
   * Copy text to clipboard
   * @param {string} text - Text to copy
   * @returns {boolean} - Success status
   */
  copyToClipboard(text) {
    try {
      const tempInput = document.createElement("input");
      tempInput.value = text;
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand("copy");
      document.body.removeChild(tempInput);
      return true;
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
      return false;
    }
  }
}
