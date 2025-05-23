/**
 * RealEngine - ChatGPT Style Interface
 * JavaScript Module for Image Generation
 */

class RealEngine {
  constructor() {
    this.currentChat = null;
    this.chatHistory = [];
    this.settings = {
      width: 1024,
      height: 1024,
      model: "rundiffusion:130@100",
      lora: "",
      lora2: "",
      steps: 33,
      CFGScale: 3.0,
      negativePrompt: "worst quality, low quality, blurry",
      scheduler: "FlowMatchEulerDiscreteScheduler",
      seed: "",
      enhancePrompt: false,
      outputFormat: "JPG",
      numberResults: 1,
    };
    this.isGenerating = false;
    this.modelDefaults = {
      "rundiffusion:130@100": { steps: 33, CFGScale: 3.0, name: "J-Pro" },
      "runware:101@1": { steps: 28, CFGScale: 3.5, name: "RealEngine v1" },
    };
    this.init();
  }

  init() {
    this.bindEvents();
    this.initSettingsPanel();
    this.loadRandomPrompts();
    this.updateModelIndicator();
    this.showWelcomeMessage();
  }

  bindEvents() {
    // Form submission
    document.getElementById("imageForm").addEventListener("submit", (e) => {
      e.preventDefault();
      this.generateImage();
    });

    // Sidebar toggle (mobile)
    document.getElementById("sidebarToggle").addEventListener("click", () => {
      this.toggleSidebar();
    });

    // Settings panel
    document.getElementById("settingsBtn").addEventListener("click", () => {
      this.openSettings();
    });

    document
      .getElementById("headerSettingsBtn")
      .addEventListener("click", () => {
        this.openSettings();
      });

    document.getElementById("closeSettings").addEventListener("click", () => {
      this.closeSettings();
    });

    document.getElementById("settingsOverlay").addEventListener("click", () => {
      this.closeSettings();
    });

    // Random prompt button
    document.getElementById("randomPromptBtn").addEventListener("click", () => {
      this.getRandomPrompt();
    });

    // New chat button
    document.getElementById("newChatBtn").addEventListener("click", () => {
      this.newChat();
    });

    // Auto-resize textarea
    const textarea = document.getElementById("positivePrompt");
    textarea.addEventListener("input", () => {
      this.autoResizeTextarea(textarea);
    });

    // Settings form elements
    this.bindSettingsEvents();

    // Keyboard shortcuts
    document.addEventListener("keydown", (e) => {
      // Ctrl/Cmd + Enter to generate
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        this.generateImage();
      }
      // Escape to close settings
      if (e.key === "Escape") {
        this.closeSettings();
      }
    });
  }

  bindSettingsEvents() {
    // Aspect ratio buttons
    document.querySelectorAll(".aspect-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        this.setAspectRatio(btn);
      });
    });

    // Model selection
    document.getElementById("modelSelect").addEventListener("change", (e) => {
      this.settings.model = e.target.value;
      this.updateHiddenInput("model", e.target.value);
      this.applyModelDefaults();
      this.updateModelIndicator();
    });

    // LoRA selection
    document.getElementById("loraSelect").addEventListener("change", (e) => {
      this.settings.lora = e.target.value;
      this.updateHiddenInput("lora", e.target.value);
    });

    // LoRA weight slider
    const loraWeight = document.getElementById("loraWeight");
    loraWeight.addEventListener("input", (e) => {
      document.getElementById("loraWeightValue").textContent = parseFloat(
        e.target.value
      ).toFixed(2);
    });

    // CFG Scale slider
    const cfgScale = document.getElementById("cfgScaleSlider");
    cfgScale.addEventListener("input", (e) => {
      this.settings.CFGScale = parseFloat(e.target.value);
      document.getElementById("cfgScaleValue").textContent = parseFloat(
        e.target.value
      ).toFixed(2);
      this.updateHiddenInput("CFGScale", e.target.value);
    });

    // Steps slider
    const steps = document.getElementById("stepsSlider");
    steps.addEventListener("input", (e) => {
      this.settings.steps = parseInt(e.target.value);
      document.getElementById("stepsValue").textContent = parseInt(
        e.target.value
      ).toFixed(2);
      this.updateHiddenInput("steps", e.target.value);
    });

    // Negative prompt
    document
      .getElementById("negativePromptInput")
      .addEventListener("input", (e) => {
        this.settings.negativePrompt = e.target.value;
        this.updateHiddenInput("negativePrompt", e.target.value);
      });

    // Enhance prompt toggle
    document
      .getElementById("enhancePromptToggle")
      .addEventListener("change", (e) => {
        this.settings.enhancePrompt = e.target.checked;
        this.updateHiddenInput("enhanceToggle", e.target.checked);
      });

    // Scheduler selection
    document
      .getElementById("schedulerSelect")
      .addEventListener("change", (e) => {
        this.settings.scheduler = e.target.value;
        this.updateHiddenInput("scheduler", e.target.value);
      });

    // Seed input
    document.getElementById("seedInput").addEventListener("input", (e) => {
      this.settings.seed = e.target.value;
      this.updateHiddenInput("seed", e.target.value);
    });
  }

  setAspectRatio(selectedBtn) {
    // Remove active class from all buttons
    document.querySelectorAll(".aspect-btn").forEach((btn) => {
      btn.classList.remove("active");
    });

    // Add active class to selected button
    selectedBtn.classList.add("active");

    // Update settings
    this.settings.width = parseInt(selectedBtn.dataset.width);
    this.settings.height = parseInt(selectedBtn.dataset.height);

    // Update hidden inputs
    this.updateHiddenInput("width", this.settings.width);
    this.updateHiddenInput("height", this.settings.height);
  }

  updateHiddenInput(id, value) {
    const input = document.getElementById(id);
    if (input) {
      input.value = value;
    }
  }

  updateModelIndicator() {
    const modelSelect = document.getElementById("modelSelect");
    const indicator = document.getElementById("modelIndicator");
    const selectedOption = modelSelect.selectedOptions[0];
    if (selectedOption && indicator) {
      indicator.textContent = selectedOption.textContent;
    }
  }

  autoResizeTextarea(textarea) {
    textarea.style.height = "auto";
    textarea.style.height = Math.min(textarea.scrollHeight, 200) + "px";
  }

  toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    sidebar.classList.toggle("open");
  }

  openSettings() {
    const panel = document.getElementById("settingsPanel");
    const overlay = document.getElementById("settingsOverlay");
    panel.classList.add("open");
    overlay.classList.add("visible");
    document.body.style.overflow = "hidden";
  }

  closeSettings() {
    const panel = document.getElementById("settingsPanel");
    const overlay = document.getElementById("settingsOverlay");
    panel.classList.remove("open");
    overlay.classList.remove("visible");
    document.body.style.overflow = "";
  }

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

  newChat() {
    this.currentChat = null;
    this.showWelcomeMessage();
    document.getElementById("positivePrompt").value = "";
    this.showStatus("Started new chat", 2000);
  }

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
    avatar.className = "message-avatar";
    avatar.textContent = isUser ? "U" : "AI";

    const messageContent = document.createElement("div");
    messageContent.className = "message-content";

    const messageText = document.createElement("div");
    messageText.className = "message-text";
    messageText.textContent = content;

    messageContent.appendChild(messageText);

    if (images && images.length > 0) {
      const imagesContainer = document.createElement("div");
      imagesContainer.className = "message-images";

      images.forEach((imageUrl) => {
        const imageWrapper = document.createElement("div");
        imageWrapper.className = "message-image";

        const img = document.createElement("img");
        img.src = imageUrl;
        img.alt = "Generated image";
        img.loading = "lazy";

        const actions = document.createElement("div");
        actions.className = "image-actions";
        actions.innerHTML = `
                    <button class="image-action-btn" onclick="realEngine.downloadImage('${imageUrl}')">⬇</button>
                    <button class="image-action-btn" onclick="realEngine.createVariation('${imageUrl}')">✨</button>
                `;

        imageWrapper.appendChild(img);
        imageWrapper.appendChild(actions);
        imagesContainer.appendChild(imageWrapper);
      });

      messageContent.appendChild(imagesContainer);
    }

    messageDiv.appendChild(avatar);
    messageDiv.appendChild(messageContent);

    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;

    return messageDiv;
  }

  async generateImage() {
    if (this.isGenerating) return;

    const prompt = document.getElementById("positivePrompt").value.trim();
    if (!prompt) {
      this.showStatus("Please enter a prompt", 3000);
      return;
    }

    this.isGenerating = true;
    this.updateGenerateButton(true);

    // Add user message
    this.addMessage(prompt, true);

    // Add loading message
    const loadingMessage = this.addMessage("Generating image...", false);

    try {
      const formData = this.collectFormData();
      const response = await fetch("/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Remove loading message
      loadingMessage.remove();

      if (data.images && data.images.length > 0) {
        this.addMessage("Here's your generated image:", false, data.images);
        this.showStatus("Image generated successfully!", 3000);
      } else {
        this.addMessage(
          "Sorry, I couldn't generate an image. Please try again.",
          false
        );
        this.showStatus("Generation failed", 3000);
      }
    } catch (error) {
      console.error("Generation error:", error);
      loadingMessage.remove();
      this.addMessage(
        "An error occurred while generating the image. Please try again.",
        false
      );
      this.showStatus("Generation failed", 3000);
    } finally {
      this.isGenerating = false;
      this.updateGenerateButton(false);
    }
  }

  collectFormData() {
    return {
      positivePrompt: document.getElementById("positivePrompt").value,
      negativePrompt: this.settings.negativePrompt,
      width: this.settings.width,
      height: this.settings.height,
      model: this.settings.model,
      lora: this.settings.lora,
      lora2: this.settings.lora2 || "",
      loraWeight: document.getElementById("loraWeight")
        ? parseFloat(document.getElementById("loraWeight").value)
        : 1.0,
      steps: this.settings.steps,
      CFGScale: this.settings.CFGScale,
      scheduler: this.settings.scheduler,
      seed: this.settings.seed,
      enhancePrompt: this.settings.enhancePrompt,
      outputFormat: this.settings.outputFormat,
      numberResults: this.settings.numberResults,
    };
  }

  updateGenerateButton(isLoading) {
    const sendBtn = document.getElementById("sendBtn");
    sendBtn.disabled = isLoading;

    if (isLoading) {
      sendBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 6v6l4 2"/>
                </svg>
            `;
    } else {
      sendBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="22" y1="2" x2="11" y2="13"/>
                    <polygon points="22,2 15,22 11,13 2,9 22,2"/>
                </svg>
            `;
    }
  }

  async loadRandomPrompts() {
    try {
      const response = await fetch("/random-prompt");
      const data = await response.json();
      this.randomPrompts = data.prompts || [];
    } catch (error) {
      console.error("Failed to load random prompts:", error);
      this.randomPrompts = [
        "A serene landscape with mountains and a lake",
        "A futuristic city with flying cars",
        "A magical forest with glowing mushrooms",
        "A vintage car on a desert highway",
        "A cozy coffee shop in the rain",
      ];
    }
  }

  getRandomPrompt() {
    if (!this.randomPrompts || this.randomPrompts.length === 0) {
      this.loadRandomPrompts();
      return;
    }

    const randomPrompt =
      this.randomPrompts[Math.floor(Math.random() * this.randomPrompts.length)];
    const promptInput = document.getElementById("positivePrompt");
    promptInput.value = randomPrompt;
    this.autoResizeTextarea(promptInput);
    promptInput.focus();
  }

  showStatus(message, duration = 3000) {
    const statusEl = document.getElementById("status");
    statusEl.textContent = message;
    statusEl.classList.add("visible");

    setTimeout(() => {
      statusEl.classList.remove("visible");
    }, duration);
  }

  downloadImage(imageUrl) {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `realengine-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  createVariation(imageUrl) {
    // TODO: Implement image-to-image variation
    this.showStatus("Variation feature coming soon!", 3000);
  }

  initSettingsPanel() {
    // Set initial values from settings
    document.getElementById("modelSelect").value = this.settings.model;
    document.getElementById("loraSelect").value = this.settings.lora;
    document.getElementById("cfgScaleSlider").value = this.settings.CFGScale;
    document.getElementById("stepsSlider").value = this.settings.steps;
    document.getElementById("negativePromptInput").value =
      this.settings.negativePrompt;
    document.getElementById("enhancePromptToggle").checked =
      this.settings.enhancePrompt;
    document.getElementById("schedulerSelect").value = this.settings.scheduler;
    document.getElementById("seedInput").value = this.settings.seed;

    // Update display values
    document.getElementById("cfgScaleValue").textContent =
      this.settings.CFGScale.toFixed(2);
    document.getElementById("stepsValue").textContent =
      this.settings.steps.toFixed(2);
    document.getElementById("loraWeightValue").textContent = "1.00";

    // Set Square as active aspect ratio (matches iOS default)
    const squareBtn = document.querySelector(
      '.aspect-btn[data-width="1024"][data-height="1024"]'
    );
    if (squareBtn) {
      squareBtn.classList.add("active");
    }

    // Update hidden inputs
    Object.keys(this.settings).forEach((key) => {
      this.updateHiddenInput(key, this.settings[key]);
    });

    // Apply initial model defaults
    this.applyModelDefaults();
  }

  applyModelDefaults() {
    const model = this.settings.model;
    if (this.modelDefaults[model]) {
      this.settings.steps = this.modelDefaults[model].steps;
      this.settings.CFGScale = this.modelDefaults[model].CFGScale;

      // Update UI sliders
      document.getElementById("stepsSlider").value = this.settings.steps;
      document.getElementById("cfgScaleSlider").value = this.settings.CFGScale;
      document.getElementById("stepsValue").textContent =
        this.settings.steps.toFixed(2);
      document.getElementById("cfgScaleValue").textContent =
        this.settings.CFGScale.toFixed(2);

      // Update hidden inputs
      this.updateHiddenInput("steps", this.settings.steps);
      this.updateHiddenInput("CFGScale", this.settings.CFGScale);

      console.log(
        `Applied ${this.modelDefaults[model].name} defaults: Steps=${this.settings.steps}, CFG=${this.settings.CFGScale}`
      );
    }
  }
}

// Initialize the application
let realEngine;
document.addEventListener("DOMContentLoaded", () => {
  realEngine = new RealEngine();
});

// Export for global access
window.realEngine = realEngine;
