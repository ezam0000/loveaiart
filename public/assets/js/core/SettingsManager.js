/**
 * Settings Manager Core Module
 * Handles settings panel functionality for the LoveAIArt application
 */

export class SettingsManager {
  constructor() {
    this.modelDefaults = {
      "runware:97@1": {
        name: "Dream",
        steps: 28,
        CFGScale: 3.5,
      },
      "rundiffusion:130@100": {
        name: "J-Pro",
        steps: 33,
        CFGScale: 3,
        scheduler: "Euler Beta",
      },
      "rundiffusion:110@101": {
        name: "J-Pro Lighting",
        steps: 4,
        CFGScale: 1,
        scheduler: "Euler Beta",
      },
      "runware:101@1": {
        name: "RealEngine v1",
        steps: 25,
        CFGScale: 7.0,
      },
      "runware:120@4": {
        name: "Layerz",
        steps: 30,
        CFGScale: 7.5,
      },
      "bfl:3@1": {
        name: "FLUX.1 Kontext Pro",
        steps: 28,
        CFGScale: 3.5,
      },
    };
  }

  /**
   * Bind all settings events
   * @param {Object} settings - Settings object reference
   * @param {Function} updateHiddenInput - Function to update hidden inputs
   * @param {Function} saveToStorage - Function to save data
   * @param {Function} handleLoRACompatibility - Function to handle LoRA compatibility
   * @param {Function} showStatus - Status display function
   */
  bindSettingsEvents(
    settings,
    updateHiddenInput,
    saveToStorage,
    handleLoRACompatibility,
    showStatus
  ) {
    // Aspect ratio buttons
    document.querySelectorAll(".aspect-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        this.setAspectRatio(btn, settings, updateHiddenInput, saveToStorage);
      });
    });

    // Model selection
    document.getElementById("modelSelect").addEventListener("change", (e) => {
      settings.model = e.target.value;
      updateHiddenInput("model", e.target.value);
      this.applyModelDefaults(settings, updateHiddenInput);
      this.updateModelIndicator();
      handleLoRACompatibility(e.target.value);
      saveToStorage();
    });

    // LoRA selection
    document.getElementById("loraSelect").addEventListener("change", (e) => {
      // Don't allow LoRA selection for Dream model
      const isDreamModel = settings.model === "runware:97@1";

      if (isDreamModel) {
        // Reset to "None" if Dream model is selected
        e.target.value = "";
        settings.lora = "";
        updateHiddenInput("lora", "");
        showStatus("LoRA not compatible with Dream model", 3000);
      } else {
        settings.lora = e.target.value;
        updateHiddenInput("lora", e.target.value);
      }

      saveToStorage();
    });

    // LoRA weight slider
    const loraWeight = document.getElementById("loraWeight");
    if (loraWeight) {
      loraWeight.addEventListener("input", (e) => {
        const value = parseFloat(e.target.value).toFixed(2);
        const valueDisplay = document.getElementById("loraWeightValue");
        if (valueDisplay) {
          valueDisplay.textContent = value;
        }
      });
    }

    // CFG Scale slider
    const cfgScale = document.getElementById("cfgScaleSlider");
    cfgScale.addEventListener("input", (e) => {
      settings.CFGScale = parseFloat(e.target.value);
      document.getElementById("cfgScaleValue").textContent = parseFloat(
        e.target.value
      ).toFixed(2);
      updateHiddenInput("CFGScale", e.target.value);
    });

    // Steps slider
    const steps = document.getElementById("stepsSlider");
    steps.addEventListener("input", (e) => {
      settings.steps = parseInt(e.target.value);
      document.getElementById("stepsValue").textContent = parseInt(
        e.target.value
      ).toFixed(2);
      updateHiddenInput("steps", e.target.value);
    });

    // Negative prompt
    document
      .getElementById("negativePromptInput")
      .addEventListener("input", (e) => {
        settings.negativePrompt = e.target.value;
        updateHiddenInput("negativePrompt", e.target.value);
      });

    // Enhance prompt toggle
    document
      .getElementById("enhancePromptToggle")
      .addEventListener("change", (e) => {
        settings.enhancePrompt = e.target.checked;
        updateHiddenInput("enhanceToggle", e.target.checked);

        // Sync with main enhancer toggle
        const enhancerBtn = document.getElementById("enhancerToggleBtn");
        if (e.target.checked) {
          enhancerBtn.classList.add("active");
        } else {
          enhancerBtn.classList.remove("active");
        }
      });

    // Scheduler selection
    document
      .getElementById("schedulerSelect")
      .addEventListener("change", (e) => {
        settings.scheduler = e.target.value;
        updateHiddenInput("scheduler", e.target.value);
      });

    // Seed input
    document.getElementById("seedInput").addEventListener("input", (e) => {
      settings.seed = e.target.value;
      updateHiddenInput("seed", e.target.value);
    });
  }

  /**
   * Set aspect ratio
   * @param {HTMLElement} selectedBtn - Selected aspect ratio button
   * @param {Object} settings - Settings object reference
   * @param {Function} updateHiddenInput - Function to update hidden inputs
   * @param {Function} saveToStorage - Function to save data
   */
  setAspectRatio(selectedBtn, settings, updateHiddenInput, saveToStorage) {
    // Remove active class from all buttons
    document.querySelectorAll(".aspect-btn").forEach((btn) => {
      btn.classList.remove("active");
    });

    // Add active class to selected button
    selectedBtn.classList.add("active");

    // Update settings
    settings.width = parseInt(selectedBtn.dataset.width);
    settings.height = parseInt(selectedBtn.dataset.height);

    // Update hidden inputs
    updateHiddenInput("width", settings.width);
    updateHiddenInput("height", settings.height);

    // Save to storage
    saveToStorage();
  }

  /**
   * Update model indicator display
   */
  updateModelIndicator() {
    const modelSelect = document.getElementById("modelSelect");
    const indicator = document.getElementById("modelIndicator");
    const selectedOption = modelSelect.selectedOptions[0];
    if (selectedOption && indicator) {
      indicator.textContent = selectedOption.textContent;
    }
  }

  /**
   * Initialize settings panel with current values
   * @param {Object} settings - Current settings object
   * @param {Function} updateHiddenInput - Function to update hidden inputs
   * @param {Function} handleLoRACompatibility - Function to handle LoRA compatibility
   * @param {Function} updateLoraDropdown - Function to update LoRA dropdown
   * @param {Function} renderPersonalLoras - Function to render personal LoRAs
   */
  initSettingsPanel(
    settings,
    updateHiddenInput,
    handleLoRACompatibility,
    updateLoraDropdown,
    renderPersonalLoras
  ) {
    // Set initial values from settings
    document.getElementById("modelSelect").value = settings.model;
    document.getElementById("loraSelect").value = settings.lora;
    document.getElementById("cfgScaleSlider").value = settings.CFGScale;
    document.getElementById("stepsSlider").value = settings.steps;
    document.getElementById("negativePromptInput").value =
      settings.negativePrompt;
    document.getElementById("enhancePromptToggle").checked =
      settings.enhancePrompt;
    document.getElementById("schedulerSelect").value = settings.scheduler;
    document.getElementById("seedInput").value = settings.seed;

    // Update display values
    document.getElementById("cfgScaleValue").textContent =
      settings.CFGScale.toFixed(2);
    document.getElementById("stepsValue").textContent =
      settings.steps.toFixed(0);

    const loraWeightValue = document.getElementById("loraWeightValue");
    if (loraWeightValue) {
      loraWeightValue.textContent = "1.00";
    }

    // Set Square as active aspect ratio (matches iOS default)
    const squareBtn = document.querySelector(
      '.aspect-btn[data-width="1024"][data-height="1024"]'
    );
    if (squareBtn) {
      squareBtn.classList.add("active");
    }

    // Update hidden inputs
    Object.keys(settings).forEach((key) => {
      updateHiddenInput(key, settings[key]);
    });

    // Apply initial model defaults
    this.applyModelDefaults(settings, updateHiddenInput);

    // Handle LoRA compatibility
    handleLoRACompatibility(settings.model);

    // Initialize enhancer toggle state
    const enhancerBtn = document.getElementById("enhancerToggleBtn");
    if (settings.enhancePrompt) {
      enhancerBtn?.classList.add("active");
    }

    // Initialize personal LoRAs display
    updateLoraDropdown();
    renderPersonalLoras();
  }

  /**
   * Apply model defaults to settings
   * @param {Object} settings - Settings object reference
   * @param {Function} updateHiddenInput - Function to update hidden inputs
   */
  applyModelDefaults(settings, updateHiddenInput) {
    const model = settings.model;
    if (this.modelDefaults[model]) {
      settings.steps = this.modelDefaults[model].steps;
      settings.CFGScale = this.modelDefaults[model].CFGScale;

      // Apply scheduler if specified in model defaults
      if (this.modelDefaults[model].scheduler) {
        settings.scheduler = this.modelDefaults[model].scheduler;
      }

      // Update UI sliders and displays
      const stepsSlider = document.getElementById("stepsSlider");
      const cfgScaleSlider = document.getElementById("cfgScaleSlider");
      const schedulerSelect = document.getElementById("schedulerSelect");
      const stepsValue = document.getElementById("stepsValue");
      const cfgScaleValue = document.getElementById("cfgScaleValue");

      if (stepsSlider) {
        stepsSlider.value = settings.steps;
      }
      if (cfgScaleSlider) {
        cfgScaleSlider.value = settings.CFGScale;
      }
      if (schedulerSelect && this.modelDefaults[model].scheduler) {
        schedulerSelect.value = settings.scheduler;
      }
      if (stepsValue) {
        stepsValue.textContent = settings.steps.toFixed(0);
      }
      if (cfgScaleValue) {
        cfgScaleValue.textContent = settings.CFGScale.toFixed(2);
      }

      // Update hidden inputs
      updateHiddenInput("steps", settings.steps);
      updateHiddenInput("CFGScale", settings.CFGScale);
      if (this.modelDefaults[model].scheduler) {
        updateHiddenInput("scheduler", settings.scheduler);
      }

      console.log(
        `Applied ${this.modelDefaults[model].name} defaults: Steps=${
          settings.steps
        }, CFG=${settings.CFGScale}${
          this.modelDefaults[model].scheduler
            ? `, Scheduler=${settings.scheduler}`
            : ""
        }`
      );
    }
  }

  /**
   * Open settings panel
   */
  openSettings() {
    const panel = document.getElementById("settingsPanel");
    const overlay = document.getElementById("settingsOverlay");
    panel?.classList.add("open");
    overlay?.classList.add("visible");
    document.body.style.overflow = "hidden";
  }

  /**
   * Close settings panel
   */
  closeSettings() {
    const panel = document.getElementById("settingsPanel");
    const overlay = document.getElementById("settingsOverlay");
    panel?.classList.remove("open");
    overlay?.classList.remove("visible");
    document.body.style.overflow = "";
  }

  /**
   * Switch application mode (image/chat)
   * @param {string} mode - Mode to switch to ('image' or 'chat')
   * @param {Function} updateWelcomeMessage - Function to update welcome message
   * @param {Function} saveToStorage - Function to save data
   * @param {boolean} isInitialized - Whether app is initialized
   */
  switchMode(mode, updateWelcomeMessage, saveToStorage, isInitialized) {
    // Update mode button states
    document
      .querySelectorAll(".mode-btn")
      .forEach((btn) => btn.classList.remove("active"));

    const modeBtn = document.getElementById(mode + "ModeBtn");
    if (modeBtn) {
      modeBtn.classList.add("active");
    }

    // Show/hide enhancer toggle based on mode
    const enhancerContainer = document.getElementById(
      "enhancerToggleContainer"
    );
    if (enhancerContainer) {
      if (mode === "image") {
        enhancerContainer.classList.remove("hidden");
      } else {
        enhancerContainer.classList.add("hidden");
      }
    }

    // Update input placeholder
    const textarea = document.getElementById("positivePrompt");
    if (textarea) {
      if (mode === "image") {
        textarea.placeholder = "Describe the image you want to generate...";
        textarea.required = true;
      } else {
        textarea.placeholder =
          "Ask me anything about image generation, get prompt suggestions, or chat...";
        textarea.required = false;
      }
    }

    // Update welcome message if showing
    updateWelcomeMessage();

    // Save to storage (but don't save on initial load)
    if (isInitialized) {
      saveToStorage();
    }

    console.log(`Switched to ${mode} mode`);
  }

  /**
   * Get model defaults
   * @returns {Object} - Model defaults object
   */
  getModelDefaults() {
    return this.modelDefaults;
  }

  /**
   * Check if model supports LoRA
   * @param {string} model - Model identifier
   * @returns {boolean} - Whether model supports LoRA
   */
  supportsLoRA(model) {
    return model !== "runware:97@1"; // Dream model doesn't support LoRA
  }
}
