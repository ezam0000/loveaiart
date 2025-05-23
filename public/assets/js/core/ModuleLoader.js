/**
 * Module Loader
 * Handles loading and initializing all modular components
 */

// Import utilities
import { StorageManager } from "../utils/storage.js";
import { ValidationManager } from "../utils/validation.js";

// Import components
import { LoraManager } from "../components/LoraManager.js";
import { PromptEnhancer } from "../components/PromptEnhancer.js";

// Import core modules
import { ImageGenerator } from "./ImageGenerator.js";
import { ChatManager } from "./ChatManager.js";
import { SettingsManager } from "./SettingsManager.js";

/**
 * Module Loader Class
 * Provides centralized access to all modules
 */
export class ModuleLoader {
  constructor() {
    this.modules = {};
    this.initializeModules();
  }

  /**
   * Initialize all modules
   */
  initializeModules() {
    // Initialize utilities
    this.modules.storage = new StorageManager();
    this.modules.validation = new ValidationManager();

    // Initialize components
    this.modules.lora = new LoraManager();
    this.modules.promptEnhancer = new PromptEnhancer();

    // Initialize core modules
    this.modules.imageGenerator = new ImageGenerator();
    this.modules.chatManager = new ChatManager();
    this.modules.settingsManager = new SettingsManager();

    console.log("Modules initialized:", Object.keys(this.modules));
  }

  /**
   * Get a specific module
   * @param {string} moduleName - Name of the module to get
   * @returns {Object} - The requested module
   */
  getModule(moduleName) {
    if (!this.modules[moduleName]) {
      console.error(`Module '${moduleName}' not found`);
      return null;
    }
    return this.modules[moduleName];
  }

  /**
   * Get all modules
   * @returns {Object} - All modules
   */
  getAllModules() {
    return this.modules;
  }

  /**
   * Check if all modules are loaded
   * @returns {boolean} - Whether all modules are loaded
   */
  isReady() {
    const requiredModules = [
      "storage",
      "validation",
      "lora",
      "promptEnhancer",
      "imageGenerator",
      "chatManager",
      "settingsManager",
    ];
    return requiredModules.every(
      (moduleName) => this.modules[moduleName] !== undefined
    );
  }
}
