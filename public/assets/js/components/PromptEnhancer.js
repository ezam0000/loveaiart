/**
 * Prompt Enhancer Component
 * Handles prompt enhancement functionality for the LoveAIArt application
 */

export class PromptEnhancer {
  constructor() {
    this.isEnabled = false;
  }

  /**
   * Toggle prompt enhancement on/off
   * @param {Object} settings - Current settings object
   * @param {Function} updateHiddenInput - Function to update hidden inputs
   * @param {Function} showStatus - Status display function
   * @param {Function} saveToStorage - Function to save data
   * @returns {Object} - Updated settings object
   */
  toggleEnhancement(settings, updateHiddenInput, showStatus, saveToStorage) {
    const newSettings = { ...settings };
    newSettings.enhancePrompt = !newSettings.enhancePrompt;
    this.isEnabled = newSettings.enhancePrompt;

    // Update the toggle button appearance
    const enhancerBtn = document.getElementById("enhancerToggleBtn");
    if (newSettings.enhancePrompt) {
      enhancerBtn.classList.add("active");
    } else {
      enhancerBtn.classList.remove("active");
    }

    // Sync with settings panel toggle
    const settingsToggle = document.getElementById("enhancePromptToggle");
    if (settingsToggle) {
      settingsToggle.checked = newSettings.enhancePrompt;
    }

    // Update hidden input
    updateHiddenInput("enhanceToggle", newSettings.enhancePrompt);

    // Show status
    showStatus(
      `Prompt enhancement ${
        newSettings.enhancePrompt ? "enabled" : "disabled"
      }`,
      2000
    );

    // Save to storage
    if (saveToStorage) {
      saveToStorage();
    }

    console.log(
      `Prompt enhancement ${newSettings.enhancePrompt ? "enabled" : "disabled"}`
    );

    return newSettings;
  }

  /**
   * Set up prompt help request in textarea
   * @param {Function} autoResizeTextarea - Function to resize textarea
   */
  askForPromptHelp(autoResizeTextarea) {
    const textarea = document.getElementById("positivePrompt");
    textarea.value =
      "Can you help me create a detailed prompt for generating a stunning AI image?";

    if (autoResizeTextarea) {
      autoResizeTextarea(textarea);
    }

    textarea.focus();
  }

  /**
   * Initialize enhancer state from settings
   * @param {boolean} enhancePrompt - Initial enhancement state
   */
  initializeState(enhancePrompt) {
    this.isEnabled = enhancePrompt;

    // Update UI to match state
    const enhancerBtn = document.getElementById("enhancerToggleBtn");
    const settingsToggle = document.getElementById("enhancePromptToggle");

    if (enhancePrompt) {
      enhancerBtn?.classList.add("active");
      if (settingsToggle) settingsToggle.checked = true;
    } else {
      enhancerBtn?.classList.remove("active");
      if (settingsToggle) settingsToggle.checked = false;
    }
  }

  /**
   * Get current enhancement state
   * @returns {boolean} - Whether enhancement is enabled
   */
  getState() {
    return this.isEnabled;
  }

  /**
   * Set enhancement state programmatically
   * @param {boolean} enabled - Whether to enable enhancement
   * @param {Function} updateHiddenInput - Function to update hidden inputs
   */
  setState(enabled, updateHiddenInput) {
    this.isEnabled = enabled;

    // Update UI
    const enhancerBtn = document.getElementById("enhancerToggleBtn");
    const settingsToggle = document.getElementById("enhancePromptToggle");

    if (enabled) {
      enhancerBtn?.classList.add("active");
      if (settingsToggle) settingsToggle.checked = true;
    } else {
      enhancerBtn?.classList.remove("active");
      if (settingsToggle) settingsToggle.checked = false;
    }

    // Update hidden input
    if (updateHiddenInput) {
      updateHiddenInput("enhanceToggle", enabled);
    }
  }
}
