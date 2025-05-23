/**
 * LoRA Manager Component
 * Handles LoRA management functionality for the LoveAIArt application
 */

export class LoraManager {
  constructor() {
    // Built-in LoRA definitions with trigger words
    this.builtInLoras = {
      "civitai:652699@993999": { name: "Realism", triggerWords: "" },
      "civitai:682349@763724": { name: "360degree", triggerWords: "" },
      "civitai:757432@846937": { name: "LogoMaker", triggerWords: "" },
      "civitai:669582@749547": { name: "TextLogo", triggerWords: "" },
      "rundiffusion:500@100": { name: "Photo", triggerWords: "" },
      "civitai:1260139@1420893": {
        name: "Medieval",
        triggerWords: "Illuminated manuscript illustration of",
      },
    };
  }

  /**
   * Handle LoRA compatibility with different models
   * @param {string} model - The current model
   * @param {Object} modelDefaults - Model defaults object
   */
  handleLoRACompatibility(model, modelDefaults = {}) {
    const loraSelect = document.getElementById("loraSelect");
    const loraSection = loraSelect.closest(".setting-section");

    if (model === "runware:97@1") {
      // Dream model
      // Disable LoRA controls
      loraSelect.disabled = true;
      loraSelect.value = "";

      // Add visual indication
      loraSection.style.opacity = "0.5";
      loraSection.title = "LoRA not compatible with Dream model";

      console.log("LoRA disabled for Dream model");
      return { lora: "" };
    } else {
      // Enable LoRA controls
      loraSelect.disabled = false;

      // Remove visual indication
      loraSection.style.opacity = "1";
      loraSection.title = "";

      console.log("LoRA enabled for", modelDefaults[model]?.name || model);
      return null;
    }
  }

  /**
   * Add a new personal LoRA
   * @param {Array} personalLoras - Current personal LoRAs array
   * @param {Object} validationManager - Validation manager instance
   * @param {Function} showStatus - Status display function
   * @param {Function} updateHiddenInput - Function to update hidden inputs
   * @param {Function} saveToStorage - Function to save data
   * @returns {Object} - Result with updated personal LoRAs or error
   */
  addPersonalLora(
    personalLoras,
    validationManager,
    showStatus,
    updateHiddenInput,
    saveToStorage
  ) {
    const nameInput = document.getElementById("personalLoraName");
    const idInput = document.getElementById("personalLoraId");
    const triggerInput = document.getElementById("personalLoraTrigger");

    const name = nameInput.value.trim();
    const airId = idInput.value.trim();
    const triggerWords = triggerInput.value.trim();

    // Validate input
    const validation = validationManager.validatePersonalLora(name, airId);
    if (!validation.isValid) {
      showStatus(validation.errors[0], 3000);
      return { success: false, error: validation.errors[0] };
    }

    // Check if already exists
    if (personalLoras.some((lora) => lora.id === airId)) {
      showStatus("This LoRA already exists", 3000);
      return { success: false, error: "LoRA already exists" };
    }

    // Add to personal LoRAs
    const newLora = {
      name: name,
      id: airId,
      triggerWords: triggerWords,
      timestamp: Date.now(),
    };

    const updatedLoras = [...personalLoras, newLora];

    // Clear inputs
    nameInput.value = "";
    idInput.value = "";
    triggerInput.value = "";

    // Update UI
    this.updateLoraDropdown(updatedLoras);
    this.renderPersonalLoras(updatedLoras);

    showStatus(`Added "${name}" to personal LoRAs`, 2000);
    console.log("Added personal LoRA:", newLora);

    return { success: true, personalLoras: updatedLoras };
  }

  /**
   * Remove a personal LoRA
   * @param {Array} personalLoras - Current personal LoRAs array
   * @param {string} airId - AIR ID of LoRA to remove
   * @param {Object} settings - Current settings object
   * @param {Function} showStatus - Status display function
   * @param {Function} updateHiddenInput - Function to update hidden inputs
   * @returns {Object} - Result with updated data
   */
  removePersonalLora(
    personalLoras,
    airId,
    settings,
    showStatus,
    updateHiddenInput
  ) {
    const updatedLoras = personalLoras.filter((lora) => lora.id !== airId);
    let updatedSettings = { ...settings };

    // If currently selected LoRA is being removed, clear selection
    if (settings.lora === airId) {
      updatedSettings.lora = "";
      document.getElementById("loraSelect").value = "";
      updateHiddenInput("lora", "");
    }

    this.updateLoraDropdown(updatedLoras);
    this.renderPersonalLoras(updatedLoras);

    showStatus("Personal LoRA removed", 2000);

    return {
      success: true,
      personalLoras: updatedLoras,
      settings: updatedSettings,
    };
  }

  /**
   * Update the LoRA dropdown with built-in and personal LoRAs
   * @param {Array} personalLoras - Personal LoRAs array
   */
  updateLoraDropdown(personalLoras = []) {
    const loraSelect = document.getElementById("loraSelect");

    // Store current selection
    const currentValue = loraSelect.value;

    // Clear existing options except built-in ones
    loraSelect.innerHTML = `
      <option value="">None</option>
      <option value="civitai:652699@993999">Realism</option>
      <option value="civitai:682349@763724">360degree</option>
      <option value="civitai:757432@846937">LogoMaker</option>
      <option value="civitai:669582@749547">TextLogo</option>
      <option value="rundiffusion:500@100">Photo</option>
      <option value="civitai:1260139@1420893">Medieval</option>
    `;

    // Add personal LoRAs
    if (personalLoras.length > 0) {
      const separator = document.createElement("option");
      separator.disabled = true;
      separator.textContent = "── Personal LoRAs ──";
      loraSelect.appendChild(separator);

      personalLoras.forEach((lora) => {
        const option = document.createElement("option");
        option.value = lora.id;
        option.textContent = lora.name;
        loraSelect.appendChild(option);
      });
    }

    // Restore selection if it still exists
    if (currentValue) {
      loraSelect.value = currentValue;
    }
  }

  /**
   * Render personal LoRAs list in the UI
   * @param {Array} personalLoras - Personal LoRAs array
   * @param {Function} removeCallback - Callback function for removing LoRAs
   */
  renderPersonalLoras(personalLoras = [], removeCallback = null) {
    const container = document.getElementById("personalLorasList");

    if (personalLoras.length === 0) {
      container.innerHTML =
        '<p style="color: var(--text-muted); font-size: 13px; text-align: center; padding: 16px;">No personal LoRAs added yet</p>';
      return;
    }

    container.innerHTML = personalLoras
      .map(
        (lora) => `
      <div class="personal-lora-item">
        <div class="personal-lora-info">
          <div class="personal-lora-name">${lora.name}</div>
          <div class="personal-lora-id">${lora.id}</div>
          ${
            lora.triggerWords
              ? `<div class="personal-lora-trigger">Trigger: ${lora.triggerWords}</div>`
              : ""
          }
        </div>
        <button class="remove-lora-btn" data-lora-id="${lora.id}">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    `
      )
      .join("");

    // Add event listeners to remove buttons if callback provided
    if (removeCallback) {
      container.querySelectorAll(".remove-lora-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          const loraId = e.currentTarget.dataset.loraId;
          removeCallback(loraId);
        });
      });
    }
  }

  /**
   * Add LoRA trigger words to a prompt
   * @param {string} prompt - Original prompt
   * @param {string} selectedLora - Selected LoRA ID
   * @param {Array} personalLoras - Personal LoRAs array
   * @returns {string} - Prompt with trigger words added
   */
  addLoRATriggerWords(prompt, selectedLora, personalLoras = []) {
    if (!selectedLora) return prompt;

    let triggerWords = "";

    // Check built-in LoRAs
    if (this.builtInLoras[selectedLora]) {
      triggerWords = this.builtInLoras[selectedLora].triggerWords;
    } else {
      // Check personal LoRAs
      const personalLora = personalLoras.find(
        (lora) => lora.id === selectedLora
      );
      if (personalLora && personalLora.triggerWords) {
        triggerWords = personalLora.triggerWords;
      }
    }

    if (triggerWords && triggerWords.trim()) {
      // Don't add trigger words if they're already in the prompt
      const lowerPrompt = prompt.toLowerCase();
      const lowerTrigger = triggerWords.toLowerCase();
      if (!lowerPrompt.includes(lowerTrigger)) {
        return `${triggerWords} ${prompt}`;
      }
    }

    return prompt;
  }

  /**
   * Get LoRA name by ID
   * @param {string} loraId - LoRA ID
   * @param {Array} personalLoras - Personal LoRAs array
   * @returns {string} - LoRA name or ID if not found
   */
  getLoraName(loraId, personalLoras = []) {
    // Check built-in LoRAs
    if (this.builtInLoras[loraId]) {
      return this.builtInLoras[loraId].name;
    }

    // Check personal LoRAs
    const personalLora = personalLoras.find((lora) => lora.id === loraId);
    if (personalLora) {
      return personalLora.name;
    }

    return loraId;
  }
}
