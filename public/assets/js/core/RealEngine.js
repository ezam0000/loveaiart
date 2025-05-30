/**
 * RealEngine - Main Orchestrator
 * Coordinates all modular components for the LoveAIArt application
 */

import { ModuleLoader } from "./ModuleLoader.js";

export class RealEngine {
  constructor() {
    this.currentChat = null;
    this.currentMode = "image"; // "image" or "chat"
    this.lastPrompt = ""; // Store the last used prompt
    this.settings = {
      width: 1024,
      height: 1024,
      model: "rundiffusion:110@101", // J-Pro Lighting as default (faster)
      lora: "",
      lora2: "",
      steps: 4, // J-Pro Lighting optimal steps
      CFGScale: 1, // J-Pro Lighting optimal CFG
      negativePrompt: "worst quality, low quality, blurry",
      scheduler: "Euler Beta",
      seed: "",
      enhancePrompt: false,
      outputFormat: "JPG",
      numberResults: 1,
    };
    this.recentPrompts = [];
    this.personalLoras = [];
    this.storageKey = "realengine_data";
    this.isInitialized = false;

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

    // Initialize modules
    this.moduleLoader = new ModuleLoader();
    this.modules = this.moduleLoader.getAllModules();

    this.init();
  }

  /**
   * Initialize the application
   */
  init() {
    this.loadFromStorage();
    this.bindEvents();
    this.initSettingsPanel();
    this.modules.imageGenerator.loadRandomPrompts();
    this.updateModelIndicator();
    this.showWelcomeMessage();
    this.updateRecycleButtonState();
    this.isInitialized = true;

    // Check for existing Kontext authentication
    this.checkKontextAuthentication();
  }

  /**
   * Check and restore Kontext authentication state
   */
  checkKontextAuthentication() {
    const isAuthenticated =
      sessionStorage.getItem("kontextAuthenticated") === "true";

    if (isAuthenticated) {
      const kontextBtn = document.getElementById("kontextModeBtn");
      if (kontextBtn) {
        kontextBtn.style.borderLeft = "3px solid #4ade80";
        kontextBtn.title = "Edit Mode (Unlocked - $0.04 per generation)";
        kontextBtn.innerHTML = "🔓 Edit";
      }
    }
  }

  /**
   * Bind all event listeners
   */
  bindEvents() {
    // Form submission
    document.getElementById("imageForm").addEventListener("submit", (e) => {
      e.preventDefault();
      if (this.currentMode === "chat") {
        this.sendChatMessage();
      } else {
        // All other modes are image generation modes
        this.generateImage();
      }
    });

    // Mode toggle buttons
    document.getElementById("imageModeBtn").addEventListener("click", () => {
      this.switchMode("image");
    });

    document.getElementById("pulidModeBtn").addEventListener("click", () => {
      this.switchMode("pulid");
    });

    document
      .getElementById("layerDiffuseModeBtn")
      .addEventListener("click", () => {
        this.switchMode("layerdiffuse");
      });

    document
      .getElementById("kontextModeBtn")
      .addEventListener("click", () => this.handleKontextModeClick());

    document.getElementById("chatModeBtn").addEventListener("click", () => {
      this.switchMode("chat");
    });

    // Sidebar and settings
    document.getElementById("menuBtn").addEventListener("click", () => {
      this.toggleSidebar();
    });

    document.getElementById("settingsBtn").addEventListener("click", () => {
      this.modules.settingsManager.openSettings();
    });

    document
      .getElementById("closeSettingsBtn")
      .addEventListener("click", () => {
        this.modules.settingsManager.closeSettings();
      });

    document.getElementById("settingsOverlay").addEventListener("click", () => {
      this.modules.settingsManager.closeSettings();
    });

    // Enhancer toggle
    document
      .getElementById("enhancerToggleBtn")
      .addEventListener("click", () => {
        this.toggleEnhancer();
      });

    // Random prompt button
    document.getElementById("randomPromptBtn").addEventListener("click", () => {
      this.getRandomPrompt();
    });

    // Recycle button
    document.getElementById("recycleBtn").addEventListener("click", () => {
      this.recycleLastPrompt();
    });

    // New chat button
    document.getElementById("newChatBtn").addEventListener("click", () => {
      this.newChat();
    });

    // Clear history button
    document.getElementById("clearHistoryBtn").addEventListener("click", () => {
      this.clearHistory();
    });

    // Auto-resize textarea
    document.getElementById("positivePrompt").addEventListener("input", (e) => {
      this.autoResizeTextarea(e.target);
    });

    // Handle Enter key in textarea for form submission
    document
      .getElementById("positivePrompt")
      .addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          // Trigger form submission
          if (this.currentMode === "chat") {
            this.sendChatMessage();
          } else {
            // All other modes are image generation modes
            this.generateImage();
          }
        }
      });

    // Personal LoRA management
    document
      .getElementById("addPersonalLoraBtn")
      .addEventListener("click", () => {
        this.addPersonalLora();
      });

    // Feature-specific controls
    this.bindFeatureControls();

    // Settings events
    this.modules.settingsManager.bindSettingsEvents(
      this.settings,
      this.updateHiddenInput.bind(this),
      this.saveToStorage.bind(this),
      this.handleLoRACompatibility.bind(this),
      this.showStatus.bind(this)
    );

    // Dismiss sidebar on outside click
    document.addEventListener("click", (e) => {
      const sidebar = document.getElementById("sidebar");
      const menuBtn = document.getElementById("menuBtn");

      if (
        sidebar &&
        sidebar.classList.contains("open") &&
        !sidebar.contains(e.target) &&
        !menuBtn.contains(e.target)
      ) {
        this.toggleSidebar();
      }
    });

    // ESC key to close sidebar
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        const sidebar = document.getElementById("sidebar");
        if (sidebar && sidebar.classList.contains("open")) {
          this.toggleSidebar();
        }
      }
    });
  }

  /**
   * Bind feature-specific controls
   */
  bindFeatureControls() {
    // PuLID image upload
    const pulidImageUpload = document.getElementById("pulidImageUpload");
    if (pulidImageUpload) {
      pulidImageUpload.addEventListener("change", (e) => {
        this.handlePulidImageUpload(e);
      });
    }

    // Kontext image upload
    const kontextImageUpload = document.getElementById("kontextImageUpload");
    if (kontextImageUpload) {
      kontextImageUpload.addEventListener("change", (e) => {
        this.handleKontextImageUpload(e);
      });
    }
  }

  /**
   * Handle PuLID image upload
   */
  handlePulidImageUpload(event) {
    const file = event.target.files[0]; // Only take the first file
    const previewContainer = document.getElementById("pulidImagePreview");

    // Clear existing previews
    previewContainer.innerHTML = "";

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = document.createElement("img");
        img.src = e.target.result;
        previewContainer.appendChild(img);
      };
      reader.readAsDataURL(file);

      console.log("PuLID reference image uploaded:", file.name);
    }
  }

  /**
   * Handle Kontext base image upload
   */
  handleKontextImageUpload(event) {
    const file = event.target.files[0]; // Only take the first file
    const previewContainer = document.getElementById("kontextImagePreview");

    // Clear existing previews
    previewContainer.innerHTML = "";

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = document.createElement("img");
        img.src = e.target.result;
        previewContainer.appendChild(img);
      };
      reader.readAsDataURL(file);

      console.log("Kontext base image uploaded:", file.name);
    }
  }

  /**
   * Generate an image using the ImageGenerator module
   */
  async generateImage() {
    // Store the current prompt before generating
    const currentPrompt = document
      .getElementById("positivePrompt")
      .value.trim();
    if (currentPrompt) {
      this.lastPrompt = currentPrompt;
      this.updateRecycleButtonState();
    }

    const result = await this.modules.imageGenerator.generateImage({
      settings: this.settings,
      validationManager: this.modules.validation,
      loraManager: this.modules.lora,
      personalLoras: this.personalLoras,
      addToRecentPrompts: this.addToRecentPrompts.bind(this),
      addMessage: this.addMessage.bind(this),
      showStatus: this.showStatus.bind(this),
      autoResizeTextarea: this.autoResizeTextarea.bind(this),
      currentMode: this.currentMode,
    });

    // Add to chat history if successful
    if (result.success && result.images) {
      this.modules.chatManager.addToChatHistory(
        `Generated image: ${document.getElementById("positivePrompt").value}`,
        false
      );
    }
  }

  /**
   * Send a chat message using the ChatManager module
   */
  async sendChatMessage() {
    // Store the current prompt before sending
    const currentPrompt = document
      .getElementById("positivePrompt")
      .value.trim();
    if (currentPrompt) {
      this.lastPrompt = currentPrompt;
      this.updateRecycleButtonState();
    }

    const result = await this.modules.chatManager.sendChatMessage({
      addMessage: this.addMessage.bind(this),
      showStatus: this.showStatus.bind(this),
      updateGenerateButton: this.updateGenerateButton.bind(this),
      autoResizeTextarea: this.autoResizeTextarea.bind(this),
    });

    // Add to chat history if successful
    if (result.success) {
      const message = document.getElementById("positivePrompt").value.trim();
      this.modules.chatManager.addToChatHistory(message, true);
      this.modules.chatManager.addToChatHistory(result.response, false);

      // Clear input in chat mode only
      document.getElementById("positivePrompt").value = "";
      this.autoResizeTextarea(document.getElementById("positivePrompt"));
    }
  }

  /**
   * Add a message to the chat interface
   * @param {string} content - Message content
   * @param {boolean} isUser - Whether message is from user
   * @param {Array} images - Optional array of images
   * @returns {HTMLElement} - The created message element
   */
  addMessage(content, isUser = false, images = null) {
    const chatContainer = document.getElementById("chatContainer");

    // Remove welcome message if it exists
    const welcomeMessage = chatContainer.querySelector(".welcome-message");
    if (welcomeMessage) {
      welcomeMessage.remove();
    }

    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${isUser ? "user" : "assistant"}`;

    const avatar = document.createElement("div");
    avatar.className = "avatar";
    avatar.innerHTML = isUser
      ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>'
      : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"/></svg>';

    const contentDiv = document.createElement("div");
    contentDiv.className = "content";

    if (images && images.length > 0) {
      images.forEach((imageUrl) => {
        const imageContainer = document.createElement("div");
        imageContainer.className = "image-container";

        const img = document.createElement("img");
        img.src = imageUrl;
        img.alt = "Generated image";
        img.style.maxWidth = "100%";
        img.style.borderRadius = "8px";

        const actionButtons = document.createElement("div");
        actionButtons.className = "image-actions";
        actionButtons.innerHTML = `
          <button onclick="realEngine.downloadImage('${imageUrl}')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7,10 12,15 17,10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Download
          </button>
          <button onclick="realEngine.createVariation('${imageUrl}')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"/>
            </svg>
            Variation
          </button>
        `;

        imageContainer.appendChild(img);
        imageContainer.appendChild(actionButtons);
        contentDiv.appendChild(imageContainer);
      });
    } else {
      // Text content with copy button
      const textDiv = document.createElement("div");
      textDiv.className = "message-text";
      textDiv.textContent = content;
      contentDiv.appendChild(textDiv);

      // Add copy button for text messages
      const actionsDiv = document.createElement("div");
      actionsDiv.className = "message-actions";

      const copyBtn = document.createElement("button");
      copyBtn.className = "copy-btn";
      copyBtn.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
        </svg>
        Copy
      `;
      copyBtn.addEventListener("click", () => {
        this.copyToClipboard(content);
      });

      actionsDiv.appendChild(copyBtn);
      contentDiv.appendChild(actionsDiv);
    }

    messageDiv.appendChild(avatar);
    messageDiv.appendChild(contentDiv);
    chatContainer.appendChild(messageDiv);

    // Scroll to bottom
    chatContainer.scrollTop = chatContainer.scrollHeight;

    return messageDiv;
  }

  /**
   * Show status message
   * @param {string} message - Status message
   * @param {number} duration - Duration in milliseconds
   */
  showStatus(message, duration = 3000) {
    const statusDiv = document.getElementById("statusMessage");
    if (statusDiv) {
      statusDiv.textContent = message;
      statusDiv.classList.add("show");

      setTimeout(() => {
        statusDiv.classList.remove("show");
      }, duration);
    }
  }

  /**
   * Toggle sidebar
   */
  toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    sidebar.classList.toggle("open");
  }

  /**
   * Show welcome message
   */
  showWelcomeMessage() {
    const chatContainer = document.getElementById("chatContainer");
    if (!chatContainer.querySelector(".welcome-message")) {
      chatContainer.innerHTML = `
        <div class="welcome-message">
          <h2>Welcome to RealEngine</h2>
          <p>Enter a prompt to generate AI images</p>
          <button class="random-prompt-btn" onclick="realEngine.getRandomPrompt()">Get Random Prompt</button>
        </div>
      `;
    }
  }

  /**
   * Start new chat
   */
  newChat() {
    this.currentChat = null;
    this.showWelcomeMessage();
    document.getElementById("positivePrompt").value = "";
    this.showStatus("Started new chat", 2000);
  }

  /**
   * Clear chat history
   */
  clearHistory() {
    this.modules.chatManager.clearHistory(
      this.showWelcomeMessage.bind(this),
      this.showStatus.bind(this),
      this.saveToStorage.bind(this)
    );
  }

  /**
   * Update generate button state
   * @param {boolean} isLoading - Whether generation is in progress
   */
  updateGenerateButton(isLoading) {
    this.modules.imageGenerator.updateGenerateButton(isLoading);
  }

  /**
   * Auto-resize textarea
   * @param {HTMLElement} textarea - Textarea element
   */
  autoResizeTextarea(textarea) {
    textarea.style.height = "auto";
    textarea.style.height = Math.min(textarea.scrollHeight, 200) + "px";
  }

  /**
   * Load a random prompt
   */
  getRandomPrompt() {
    this.modules.imageGenerator.loadRandomPrompt(
      this.autoResizeTextarea.bind(this)
    );
  }

  /**
   * Restore the last used prompt
   */
  recycleLastPrompt() {
    if (this.lastPrompt) {
      const promptInput = document.getElementById("positivePrompt");
      promptInput.value = this.lastPrompt;
      this.autoResizeTextarea(promptInput);
      promptInput.focus();
      this.showStatus("Last prompt restored", 2000);
    } else {
      this.showStatus("No previous prompt to restore", 2000);
    }
  }

  /**
   * Update recycle button state based on availability of last prompt
   */
  updateRecycleButtonState() {
    const recycleBtn = document.getElementById("recycleBtn");
    if (recycleBtn) {
      recycleBtn.disabled = !this.lastPrompt;
    }
  }

  /**
   * Toggle prompt enhancer
   */
  toggleEnhancer() {
    this.settings = this.modules.promptEnhancer.toggleEnhancement(
      this.settings,
      this.updateHiddenInput.bind(this),
      this.showStatus.bind(this),
      this.saveToStorage.bind(this)
    );
  }

  /**
   * Switch application mode
   * @param {string} mode - Mode to switch to
   */
  switchMode(mode) {
    this.currentMode = mode;

    // Update mode buttons
    document
      .querySelectorAll(".mode-btn")
      .forEach((btn) => btn.classList.remove("active"));

    if (mode === "image") {
      document.getElementById("imageModeBtn").classList.add("active");

      // Re-enable LoRA for non-PuLID modes
      const loraSelect = document.getElementById("loraSelect");
      const loraSection = loraSelect?.closest(".setting-section");
      if (loraSelect && loraSection) {
        // Check if current model supports LoRA (not Dream)
        const isDreamModel = this.settings.model === "runware:97@1";
        loraSelect.disabled = isDreamModel;
        loraSection.style.opacity = isDreamModel ? "0.5" : "1";
        loraSection.title = isDreamModel
          ? "LoRA not compatible with Dream model"
          : "";
      }
    } else if (mode === "pulid") {
      document.getElementById("pulidModeBtn").classList.add("active");

      // PuLID requires FLUX models - validate and switch if needed
      if (
        this.settings.model !== "runware:100@1" &&
        this.settings.model !== "runware:101@1"
      ) {
        this.settings.model = "runware:101@1"; // Switch to FLUX Dev for PuLID compatibility
        this.updateHiddenInput("model", this.settings.model);
        this.settingsManager.updateModelIndicator();
        this.showStatus("Switched to FLUX Dev for PuLID generation", 3000);
      }

      // PuLID cannot be used with LoRA - disable LoRA selection
      const loraSelect = document.getElementById("loraSelect");
      const loraSection = loraSelect?.closest(".setting-section");
      if (loraSelect && loraSection) {
        loraSelect.disabled = true;
        loraSelect.value = "";
        this.settings.lora = "";
        this.updateHiddenInput("lora", "");
        loraSection.style.opacity = "0.5";
        loraSection.title = "LoRA cannot be used with PuLID";
        console.log("LoRA disabled for PuLID mode (API limitation)");
      }
    } else if (mode === "layerdiffuse") {
      document.getElementById("layerDiffuseModeBtn").classList.add("active");

      // LayerDiffuse only works with FLUX Schnell - force switch if needed
      if (this.settings.model !== "runware:100@1") {
        const oldModel = this.settings.model;
        this.settings.model = "runware:100@1"; // Always use FLUX Schnell for LayerDiffuse
        this.updateHiddenInput("model", this.settings.model);

        // Update the settings panel dropdown
        const modelSelect = document.getElementById("modelSelect");
        if (modelSelect) {
          modelSelect.value = this.settings.model;
        }

        console.log(
          `LayerDiffuse mode: Auto-switched model from ${oldModel} to FLUX Schnell (LayerDiffuse only supports FLUX Schnell)`
        );
        this.showStatus(
          "Switched to FLUX Schnell model for LayerDiffuse compatibility",
          3000
        );
      }

      // Re-enable LoRA for LayerDiffuse mode
      const loraSelect = document.getElementById("loraSelect");
      const loraSection = loraSelect?.closest(".setting-section");
      if (loraSelect && loraSection) {
        // Check if current model supports LoRA (not Dream)
        const isDreamModel = this.settings.model === "runware:97@1";
        loraSelect.disabled = isDreamModel;
        loraSection.style.opacity = isDreamModel ? "0.5" : "1";
        loraSection.title = isDreamModel
          ? "LoRA not compatible with Dream model"
          : "";
      }
    } else if (mode === "kontext") {
      document.getElementById("kontextModeBtn").classList.add("active");

      // Re-enable LoRA for kontext mode
      const loraSelect = document.getElementById("loraSelect");
      const loraSection = loraSelect?.closest(".setting-section");
      if (loraSelect && loraSection) {
        // Check if current model supports LoRA (not Dream)
        const isDreamModel = this.settings.model === "runware:97@1";
        loraSelect.disabled = isDreamModel;
        loraSection.style.opacity = isDreamModel ? "0.5" : "1";
        loraSection.title = isDreamModel
          ? "LoRA not compatible with Dream model"
          : "";
      }
    } else if (mode === "chat") {
      document.getElementById("chatModeBtn").classList.add("active");

      // Re-enable LoRA for chat mode (though not used)
      const loraSelect = document.getElementById("loraSelect");
      const loraSection = loraSelect?.closest(".setting-section");
      if (loraSelect && loraSection) {
        // Check if current model supports LoRA (not Dream)
        const isDreamModel = this.settings.model === "runware:97@1";
        loraSelect.disabled = isDreamModel;
        loraSection.style.opacity = isDreamModel ? "0.5" : "1";
        loraSection.title = isDreamModel
          ? "LoRA not compatible with Dream model"
          : "";
      }
    }

    // Hide all inline controls
    document.querySelectorAll(".inline-control").forEach((control) => {
      control.style.visibility = "hidden";
    });

    // Show/hide reference image button
    const referenceImageBtn = document.getElementById("referenceImageBtn");
    if (referenceImageBtn) {
      referenceImageBtn.style.visibility =
        mode === "pulid" ? "visible" : "hidden";
    }

    // Show/hide base image button
    const baseImageBtn = document.getElementById("baseImageBtn");
    if (baseImageBtn) {
      baseImageBtn.style.visibility = mode === "kontext" ? "visible" : "hidden";
    }

    // Show/hide feature badge and controls
    const featureBadge = document.getElementById("featureBadge");
    const featureBadgeText = document.getElementById("featureBadgeText");

    if (mode === "pulid") {
      featureBadge.style.display = "block";
      featureBadgeText.textContent = "👤 Face Match";
      document.getElementById("pulidControl").style.visibility = "visible";
    } else if (mode === "layerdiffuse") {
      featureBadge.style.display = "block";
      featureBadgeText.textContent = "📐 Vector";
    } else if (mode === "kontext") {
      featureBadge.style.display = "block";
      featureBadgeText.textContent = "✏️ Edit";
      document.getElementById("kontextControl").style.visibility = "visible";
    } else {
      featureBadge.style.display = "none";
    }

    // Show/hide enhancer toggle based on mode
    const enhancerContainer = document.getElementById(
      "enhancerToggleContainer"
    );
    if (mode === "chat") {
      enhancerContainer.classList.add("hidden");
    } else {
      enhancerContainer.classList.remove("hidden");
    }

    // Update model indicator to reflect current model
    this.updateModelIndicator();
    this.updateWelcomeMessage();
    this.saveToStorage();
  }

  /**
   * Update welcome message based on current mode
   */
  updateWelcomeMessage() {
    const chatContainer = document.getElementById("chatContainer");
    const welcomeMessage = chatContainer.querySelector(".welcome-message");
    const promptInput = document.getElementById("positivePrompt");

    if (welcomeMessage) {
      if (this.currentMode === "image") {
        welcomeMessage.innerHTML = `
          <h2>Welcome to RealEngine</h2>
          <p>Enter a prompt to generate AI images</p>
          <button class="random-prompt-btn" onclick="realEngine.getRandomPrompt()">Get Random Prompt</button>
        `;
        promptInput.placeholder = "Describe the image you want to generate...";
      } else if (this.currentMode === "pulid") {
        welcomeMessage.innerHTML = `
          <h2>👤 Face Match - Identity Preservation</h2>
          <p>Upload a reference image and describe the person with specific details for best results</p>
          <p><strong>Example:</strong> "elderly man with white mustache and wild hair, scientist, portrait"</p>
          <button class="random-prompt-btn" onclick="realEngine.getRandomPrompt()">Get Random Prompt</button>
        `;
        promptInput.placeholder =
          "Upload a reference image above, then describe the person's appearance, setting, and style...";
      } else if (this.currentMode === "layerdiffuse") {
        welcomeMessage.innerHTML = `
          <h2>📐 Vector Graphics</h2>
          <p>Generate clean, isolated graphics with transparent backgrounds - perfect for logos, icons, and design elements.</p>
          <p><strong>Tips:</strong> Use terms like "isolated subject", "product photography", "studio lighting", "no background"</p>
          <p><strong>Example:</strong> "red apple, product photography, isolated subject, studio lighting, soft shadows"</p>
          <button class="random-prompt-btn" onclick="realEngine.getRandomPrompt()">Get Random Prompt</button>
        `;
        promptInput.placeholder =
          "Describe your subject with terms like: isolated subject, product photography, no background...";
      } else if (this.currentMode === "kontext") {
        welcomeMessage.innerHTML = `
          <h2>✏️ Instruction-Based Image Editing</h2>
          <p>Upload a base image and give simple edit instructions. Kontext will surgically modify only what you specify while keeping everything else intact.</p>
          <p><strong>Examples:</strong> "change the car color to red", "replace 'OPEN' with 'CLOSED'", "add sunglasses to the person"</p>
          <p><strong>Tips:</strong> Be specific about what to change. Use action verbs like "change", "add", "remove", "replace"</p>
          <button class="random-prompt-btn" onclick="realEngine.getRandomPrompt()">Get Random Prompt</button>
        `;
        promptInput.placeholder =
          "Upload a base image above, then describe what you want to change...";
      } else {
        welcomeMessage.innerHTML = `
          <h2>Chat with RealEngine AI</h2>
          <p>Ask questions, get prompt suggestions, or just chat!</p>
          <button class="random-prompt-btn" onclick="realEngine.modules.promptEnhancer.askForPromptHelp(realEngine.autoResizeTextarea.bind(realEngine))">Help me create a prompt</button>
        `;
        promptInput.placeholder =
          "Ask me anything about AI art, get prompt suggestions, or just chat...";
      }
    }
  }

  /**
   * Initialize settings panel
   */
  initSettingsPanel() {
    this.modules.settingsManager.initSettingsPanel(
      this.settings,
      this.updateHiddenInput.bind(this),
      this.handleLoRACompatibility.bind(this),
      this.updateLoraDropdown.bind(this),
      this.renderPersonalLoras.bind(this)
    );

    // Initialize enhancer state
    this.modules.promptEnhancer.initializeState(this.settings.enhancePrompt);

    // Restore mode from storage
    this.switchMode(this.currentMode);
  }

  /**
   * Handle LoRA compatibility with current model
   * @param {string} model - Model identifier
   */
  handleLoRACompatibility(model) {
    this.modules.lora.handleLoRACompatibility(
      model,
      this.settings,
      this.updateHiddenInput.bind(this),
      this.showStatus.bind(this)
    );
  }

  /**
   * Add personal LoRA
   */
  addPersonalLora() {
    this.modules.lora.addPersonalLora(
      this.personalLoras,
      this.updateLoraDropdown.bind(this),
      this.renderPersonalLoras.bind(this),
      this.saveToStorage.bind(this),
      this.showStatus.bind(this)
    );
  }

  /**
   * Remove personal LoRA
   * @param {string} airId - LoRA AIR ID
   */
  removePersonalLora(airId) {
    this.modules.lora.removePersonalLora(
      airId,
      this.personalLoras,
      this.settings,
      this.updateHiddenInput.bind(this),
      this.updateLoraDropdown.bind(this),
      this.renderPersonalLoras.bind(this),
      this.saveToStorage.bind(this),
      this.showStatus.bind(this)
    );
  }

  /**
   * Update LoRA dropdown
   */
  updateLoraDropdown() {
    this.modules.lora.updateLoraDropdown(this.personalLoras);
  }

  /**
   * Render personal LoRAs
   */
  renderPersonalLoras() {
    this.modules.lora.renderPersonalLoras(this.personalLoras, this);
  }

  /**
   * Update hidden input
   * @param {string} id - Input ID
   * @param {*} value - Value to set
   */
  updateHiddenInput(id, value) {
    const input = document.getElementById(id);
    if (input) {
      input.value = value;
    }
  }

  /**
   * Update model indicator
   */
  updateModelIndicator() {
    this.modules.settingsManager.updateModelIndicator();
  }

  /**
   * Download image
   * @param {string} imageUrl - URL of image to download
   */
  downloadImage(imageUrl) {
    this.modules.imageGenerator.downloadImage(imageUrl);
  }

  /**
   * Create image variation
   * @param {string} imageUrl - URL of source image
   */
  createVariation(imageUrl) {
    this.modules.imageGenerator.createVariation(
      imageUrl,
      this.showStatus.bind(this)
    );
  }

  /**
   * Save to storage
   */
  saveToStorage() {
    this.modules.storage.saveToStorage(
      this.storageKey,
      this.settings,
      this.currentMode,
      this.recentPrompts,
      this.modules.chatManager.getHistoryForStorage(),
      this.personalLoras,
      this.lastPrompt
    );
  }

  /**
   * Load from storage
   */
  loadFromStorage() {
    const data = this.modules.storage.loadFromStorage(this.storageKey);
    if (data) {
      if (data.settings) {
        this.settings = { ...this.settings, ...data.settings };
      }
      if (data.currentMode) {
        this.currentMode = data.currentMode;
      }
      if (data.recentPrompts) {
        this.recentPrompts = data.recentPrompts;
      }
      if (data.chatHistory) {
        this.modules.chatManager.setChatHistory(data.chatHistory);
      }
      if (data.personalLoras) {
        this.personalLoras = data.personalLoras;
      }
      if (data.lastPrompt) {
        this.lastPrompt = data.lastPrompt;
      }
    }

    // Ensure J-Pro Lighting is always the default model
    if (!this.settings.model || this.settings.model === "") {
      this.settings.model = "rundiffusion:110@101"; // Force J-Pro Lighting as default
      console.log("Set default model to J-Pro Lighting");
    }
  }

  /**
   * Add to recent prompts
   * @param {string} prompt - Prompt to add
   */
  addToRecentPrompts(prompt) {
    if (prompt && prompt.trim()) {
      // Remove if already exists to avoid duplicates
      this.recentPrompts = this.recentPrompts.filter(
        (p) => p !== prompt.trim()
      );
      // Add to beginning
      this.recentPrompts.unshift(prompt.trim());
      // Keep only last 20
      this.recentPrompts = this.recentPrompts.slice(0, 20);
      this.saveToStorage();
    }
  }

  /**
   * Copy text to clipboard
   * @param {string} text - Text to copy
   */
  copyToClipboard(text) {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        this.showStatus("✅ Copied to clipboard!", 2000);
      })
      .catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand("copy");
          this.showStatus("✅ Copied to clipboard!", 2000);
        } catch (err) {
          this.showStatus("❌ Failed to copy", 2000);
        }
        document.body.removeChild(textArea);
      });
  }

  /**
   * Reset to defaults
   */
  resetToDefaults() {
    if (confirm("Reset all settings to defaults? This will reload the page.")) {
      this.modules.storage.clearStorage(this.storageKey);
      window.location.reload();
    }
  }

  /**
   * Handle Kontext mode click
   */
  handleKontextModeClick() {
    // Check if already authenticated in this session
    const isAuthenticated =
      sessionStorage.getItem("kontextAuthenticated") === "true";

    if (isAuthenticated) {
      this.switchMode("kontext");
      return;
    }

    // Show password prompt
    const password = prompt(
      "🔒 Kontext Edit Mode - Enter Password:\n\n⚠️ This feature costs $0.04 per generation\nUse responsibly!"
    );

    if (password === null) {
      // User cancelled
      return;
    }

    // Check password (you can change this password)
    const correctPassword = "kontext2025"; // Change this to your desired password

    if (password === correctPassword) {
      // Authentication successful
      sessionStorage.setItem("kontextAuthenticated", "true");
      this.switchMode("kontext");
      this.showStatus("🔓 Kontext Edit Mode Unlocked for this session", 3000);

      // Add visual indicator to the button
      const kontextBtn = document.getElementById("kontextModeBtn");
      if (kontextBtn) {
        kontextBtn.style.borderLeft = "3px solid #4ade80";
        kontextBtn.title = "Edit Mode (Unlocked - $0.04 per generation)";
        kontextBtn.innerHTML = "🔓 Edit";
      }
    } else {
      // Wrong password
      alert("❌ Incorrect password. Access denied.");
    }
  }
}

// Initialize the application
const realEngine = new RealEngine();

// Make it globally available for onclick handlers
window.realEngine = realEngine;
