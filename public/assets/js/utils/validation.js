/**
 * Validation Utility Module
 * Handles content filtering and validation for the LoveAIArt application
 */

// Content filtering - disallowed words for image generation
const DISALLOWED_WORDS = [
  // Direct terms
  "kid",
  "kids",
  "child",
  "children",
  "minor",
  "minors",
  "teen",
  "teens",
  "teenager",
  "teenagers",
  "teenage",
  "underage",
  "baby",
  "babies",
  "infant",
  "infants",
  "young",
  "youth",
  "boy",
  "girl",
  "toddler",
  "toddlers",
  "school age",
  "schoolage",
  "juvenile",
  "juveniles",
  "little girl",
  "little boy",
  "young girl",
  "young boy",

  // Common misspellings and variations
  "kidz",
  "kiddo",
  "kiddos",
  "yung",
  "yunq",
  "bby",
  "bb",
  "lil girl",
  "lil boy",
  "smol",
  "loli",
  "shota",

  // Slang and abbreviations
  "jailbait",
  "barely legal",
  "fresh 18",
  "just turned 18",
  "high school",
  "highschool",
  "schoolgirl",
  "schoolboy",
  "preteen",
  "pre-teen",
  "tween",

  // Age-related numbers (13-17)
  "13 year",
  "14 year",
  "15 year",
  "16 year",
  "17 year",
  "13-year",
  "14-year",
  "15-year",
  "16-year",
  "17-year",
  "13yr",
  "14yr",
  "15yr",
  "16yr",
  "17yr",
  "thirteen",
  "fourteen",
  "fifteen",
  "sixteen",
  "seventeen",

  // Compound words and phrases
  "babydoll",
  "kidlike",
  "childlike",
  "youthful",
  "innocent girl",
  "innocent boy",
  "sweet girl",
  "sweet boy",
  "small girl",
  "small boy",
  "tiny girl",
  "tiny boy",

  // Character substitutions (common ones)
  "k1d",
  "k1ds",
  "ch1ld",
  "y0ung",
  "g1rl",
  "b0y",
  "t33n",
  "b4by",
  "m1nor",

  // International terms
  "niña",
  "niño",
  "bambina",
  "bambino",
  "enfant",
  "mädchen",
  "junge",
  "criança",
];

export class ValidationManager {
  constructor() {
    this.disallowedWords = DISALLOWED_WORDS;
  }

  /**
   * Check if prompt contains disallowed content
   * @param {string} prompt - The prompt to validate
   * @returns {Object} - Validation result with allowed status and found word
   */
  checkContentFilter(prompt) {
    // Normalize the prompt for better detection
    let normalizedPrompt = prompt
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "") // Remove special characters
      .replace(/\s+/g, " ") // Normalize whitespace
      .replace(/(\w)\s+(\w)/g, "$1$2") // Remove spaces between characters (e.g., "y o u n g" -> "young")
      .trim();

    // Also check the original prompt for phrase detection
    const lowerPrompt = prompt.toLowerCase();

    for (const word of this.disallowedWords) {
      const lowerWord = word.toLowerCase();

      // Check in normalized prompt (catches spacing tricks)
      if (normalizedPrompt.includes(lowerWord.replace(/\s+/g, ""))) {
        return {
          allowed: false,
          foundWord: word,
        };
      }

      // Check in original prompt (catches phrases with proper spacing)
      if (lowerPrompt.includes(lowerWord)) {
        return {
          allowed: false,
          foundWord: word,
        };
      }

      // Check for word boundaries to avoid false positives (but allow the above broader checks for evasion)
      const wordBoundaryRegex = new RegExp(
        `\\b${lowerWord.replace(/\s+/g, "\\s+")}\\b`,
        "i"
      );
      if (wordBoundaryRegex.test(prompt)) {
        return {
          allowed: false,
          foundWord: word,
        };
      }
    }

    // Additional checks for number patterns
    const agePatterns = [
      /\b1[3-7]\s*(yo|y\.o\.|year old|years old)\b/i,
      /\b(thirteen|fourteen|fifteen|sixteen|seventeen)\s*(yo|y\.o\.|year old|years old)\b/i,
      /\baged?\s*1[3-7]\b/i,
      /\b1[3-7]\s*and\s*(young|cute|sweet)\b/i,
    ];

    for (const pattern of agePatterns) {
      if (pattern.test(prompt)) {
        return {
          allowed: false,
          foundWord: "age-related content",
        };
      }
    }

    return { allowed: true };
  }

  /**
   * Validate AIR ID format
   * @param {string} airId - The AIR ID to validate
   * @returns {boolean} - Whether the AIR ID is valid
   */
  validateAirId(airId) {
    if (!airId || typeof airId !== "string") {
      return false;
    }

    return airId.includes("air:") || airId.includes("civitai:");
  }

  /**
   * Validate required fields for personal LoRA
   * @param {string} name - LoRA name
   * @param {string} airId - LoRA AIR ID
   * @returns {Object} - Validation result
   */
  validatePersonalLora(name, airId) {
    const errors = [];

    if (!name || !name.trim()) {
      errors.push("Name is required");
    }

    if (!airId || !airId.trim()) {
      errors.push("AIR ID is required");
    } else if (!this.validateAirId(airId)) {
      errors.push("Please enter a valid AIR ID (e.g., air:12345@6789)");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
