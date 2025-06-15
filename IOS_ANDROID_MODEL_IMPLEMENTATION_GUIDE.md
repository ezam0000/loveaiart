# RealEngine - iOS/Android Model Implementation Guide

## 📱 Executive Summary

This document provides a comprehensive guide for converting the **RealEngine** web application to iOS and Android using **Expo React Native**. The current web application features sophisticated AI image generation capabilities using multiple models and services, all of which need careful consideration for mobile implementation.

## 🏗️ Current Architecture Overview

### Backend Services

- **Node.js/Express** server with modular architecture
- **Runware API** for image generation (primary service)
- **OpenAI API** for chat functionality
- **Direct HTTP API calls** for advanced features (LayerDiffuse, PuLID)

### Frontend Structure

- **Modular JavaScript** architecture (recently refactored)
- **Progressive Web App** capabilities
- **Real-time image generation** with status updates
- **Advanced UI controls** for model parameters

---

## 🤖 Model Implementations & Constraints

### 1. Standard Image Generation Models

#### Available Models

```javascript
// Core FLUX Models (Primary)
"runware:100@1"; // FLUX Schnell - Fast generation
"runware:101@1"; // FLUX Dev - High quality

// Legacy Models (Limited support)
"civitai:25@1"; // Realistic Vision
"civitai:4201@1"; // DreamShaper
"civitai:15@1"; // OpenJourney
```

#### API Implementation

```javascript
// Current Web Implementation
const requestPayload = {
  positivePrompt: "user prompt text",
  negativePrompt: "blurry, ugly", // Default fallback
  width: parseInt(width), // 512-2048, divisible by 64
  height: parseInt(height), // 512-2048, divisible by 64
  model: "runware:101@1",
  numberResults: 1,
  outputType: "URL",
  outputFormat: "JPEG", // or PNG, WEBP
  scheduler: "Default",
  steps: 28, // 1-100
  CFGScale: 3.5, // 0-30
  seed: undefined, // Optional for reproducibility
  checkNSFW: false,
  includeCost: false,
};
```

#### Mobile Considerations

- **Network latency**: Mobile connections are slower - implement proper loading states
- **Image caching**: Store generated images locally to reduce bandwidth
- **Offline mode**: Consider queuing requests when offline
- **Cost optimization**: Use accelerated endpoints by default

### 2. LayerDiffuse (Transparent Backgrounds)

#### Purpose

Generates images with built-in transparency using FLUX models - perfect for:

- Product photography with transparent backgrounds
- Logo creation
- Isolated subjects
- UI elements requiring transparency

#### Critical Implementation Details

```javascript
// EXACT payload structure (minimal parameters only)
const layerDiffusePayload = {
  taskType: "imageInference",
  taskUUID: uuidv4(),
  positivePrompt: "a crystal glass on a white background",
  height: 1024,
  width: 1024,
  model: "runware:100@1", // FORCED - Only FLUX Schnell works
  outputFormat: "PNG", // REQUIRED for transparency
  advancedFeatures: {
    layerDiffuse: true, // Key parameter
  },
};
```

#### Strict Constraints

1. **FLUX Models Only**: Auto-switch to `runware:100@1` or `runware:101@1`
2. **PNG Format Required**: Force PNG output for transparency support
3. **Minimal Payload**: Remove negativePrompt, steps, CFGScale, etc.
4. **Direct HTTP API**: Cannot use SDK - must use direct API calls
5. **30 steps fixed**: Optimal for LayerDiffuse quality

#### Mobile Implementation

```javascript
// React Native/Expo implementation
const generateLayerDiffuse = async (prompt, dimensions) => {
  const payload = {
    taskType: "imageInference",
    taskUUID: generateUUID(),
    positivePrompt: prompt,
    height: dimensions.height,
    width: dimensions.width,
    model: "runware:100@1", // Always FLUX Schnell
    outputFormat: "PNG",
    advancedFeatures: {
      layerDiffuse: true,
    },
  };

  const response = await fetch("https://api.runware.ai/v1", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RUNWARE_API_KEY}`,
    },
    body: JSON.stringify([payload]),
  });

  return response.json();
};
```

### 3. PuLID (Identity Consistency)

#### Purpose

Maintains facial identity consistency across different prompts using reference images:

- Character consistency in storytelling
- Brand mascot variations
- Portrait series with same person
- Identity-preserving style transfers

#### Critical Implementation Details

```javascript
// Reference image upload FIRST
const uploadResponse = await uploadImage(referenceImageBase64);
const referenceImageUUID = uploadResponse.imageUUID;

// EXACT payload structure
const pulidPayload = {
  taskType: "imageInference",
  taskUUID: uuidv4(),
  positivePrompt: "portrait, color, cinematic, in garden",
  height: 1024,
  width: 1024,
  model: "runware:101@1", // FLUX Dev preferred
  puLID: {
    inputImages: [referenceImageUUID], // UUID, not base64
    idWeight: 1, // 0-3, controls identity strength
    trueCFGScale: 1.5, // 1.0-15.0, mutually exclusive with CFGStartStep
  },
};
```

#### Strict Constraints

1. **Image Upload Required**: Convert base64 to UUID via upload endpoint
2. **FLUX Models Only**: Auto-switch to compatible models
3. **Mutually Exclusive Parameters**: Use `trueCFGScale` OR `CFGStartStep`, never both
4. **Single Reference Image**: PuLID supports exactly 1 reference image
5. **No LoRA Compatibility**: Cannot use LoRA with PuLID
6. **PNG Output Recommended**: Better quality for portraits

#### Mobile Implementation Considerations

```javascript
// React Native image handling
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";

const selectReferenceImage = async () => {
  // Request permissions
  const permissionResult =
    await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permissionResult.granted) {
    Alert.alert("Permission required", "Please allow access to photo library");
    return;
  }

  // Pick image
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8, // Optimize for upload
  });

  if (!result.canceled) {
    // Resize for efficiency
    const manipulatedImage = await ImageManipulator.manipulateAsync(
      result.assets[0].uri,
      [{ resize: { width: 512, height: 512 } }],
      { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
    );

    // Convert to base64 for upload
    const base64 = await FileSystem.readAsStringAsync(manipulatedImage.uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    return `data:image/jpeg;base64,${base64}`;
  }
};
```

### 4. Kontext (Instruction-Based Editing)

#### Purpose

FLUX.1 Kontext for instruction-based image editing:

- "Add sunglasses to the person"
- "Change the background to a beach"
- "Make the sky stormy"

#### Critical Implementation Details

```javascript
// Upload base image FIRST
const uploadResponse = await uploadImage(baseImageData);
const { imageUUID, imageURL } = uploadResponse;

// EXACT payload structure
const kontextPayload = {
  taskType: "imageInference",
  taskUUID: uuidv4(),
  positivePrompt: "add sunglasses to the person", // Edit instruction
  width: 1024,
  height: 1024,
  model: "bfl:3@1", // Kontext Pro (or bfl:4@1 for Max)
  outputFormat: "JPEG",
  includeCost: true,
  outputType: ["URL"],
  referenceImages: [imageURL], // Use imageURL, not UUID
  numberResults: 1,
};
```

#### Constraints

1. **Kontext Models Only**: `bfl:3@1` (Pro) or `bfl:4@1` (Max)
2. **Single Input Image**: Exactly one base image for editing
3. **Reference Images Format**: Use imageURL from upload response
4. **Edit Instructions**: Prompts should be editing instructions, not descriptions

### 5. PhotoMaker (Style Transfer)

#### Purpose

Transform and style images using PhotoMaker's advanced personalization:

- Style consistency across variations
- Subject preservation with style changes
- Up to 4 reference images for better fidelity

#### Implementation Details

```javascript
// Upload up to 4 reference images
const imageUUIDs = await Promise.all(
  referenceImages.map((img) => uploadImage(img))
);

const photoMakerPayload = {
  taskType: "photoMaker",
  taskUUID: uuidv4(),
  inputImages: imageUUIDs.map((r) => r.imageUUID),
  style: "Cinematic", // No Style, Disney Character, Digital Art, etc.
  strength: 15, // 15-50, balance between fidelity and transformation
  positivePrompt: "man img, wearing a suit", // Must include trigger word "img"
  height: 1024,
  width: 1024,
  scheduler: "Default",
  steps: 20,
  CFGScale: 7,
  outputFormat: "JPG",
  numberResults: 1,
};
```

#### Constraints

1. **Trigger Word Required**: Prompt must include "img" after class word (man img, woman img)
2. **1-4 Reference Images**: Minimum 1, maximum 4 images
3. **Strength Control**: 15-50 range for quality balance
4. **Style Options**: Predefined styles only

---

## 🔧 Technical Implementation for Mobile

### 1. API Architecture

#### Current Backend (Keep As-Is)

```javascript
// Server.js - Express routes
app.use("/", imageRoutes);    // Image generation routes
app.use("/", chatRoutes);     // Chat functionality routes
app.use("/", apiRoutes);      // API utility routes

// Services structure
services/
├── runware.js              // All Runware API implementations
├── openai.js               // Chat functionality
└── ...

// Routes structure
routes/
├── image.js               // Image generation endpoints
├── chat.js                // Chat endpoints
└── api.js                 // Utility endpoints
```

#### Mobile API Endpoints

```javascript
// Keep these exact endpoints for mobile app
POST /accelerated          // Standard image generation with cost savings
POST /layer-diffuse-async  // LayerDiffuse with timeout handling
POST /pulid-async          // PuLID with timeout handling
POST /kontext-async        // Kontext with timeout handling
POST /photomaker          // PhotoMaker style transfer
POST /upload-image        // Image upload for UUIDs
POST /enhance-prompt      // Prompt enhancement
GET /job-status/:jobId    // Async job polling
```

### 2. React Native/Expo Implementation

#### Project Structure

```
RealEngineMobile/
├── src/
│   ├── services/
│   │   ├── RunwareService.js      // API calls
│   │   └── StorageService.js      // Local storage
│   ├── components/
│   │   ├── ImageGenerator/        // Generation UI
│   │   ├── ModelSelector/         // Model selection
│   │   ├── PromptInput/           // Text input
│   │   └── ImageGallery/          // Results display
│   ├── screens/
│   │   ├── HomeScreen.js          // Main generation
│   │   ├── HistoryScreen.js       // Generated images
│   │   └── SettingsScreen.js      // App settings
│   └── utils/
│       ├── ImageUtils.js          // Image processing
│       ├── ValidationUtils.js     // Content filtering
│       └── Constants.js           // App constants
```

#### Core Service Implementation

```javascript
// src/services/RunwareService.js
import AsyncStorage from "@react-native-async-storage/async-storage";

class RunwareService {
  constructor() {
    this.baseURL = "https://your-backend.herokuapp.com";
    this.apiKey = "your-runware-api-key";
  }

  async generateImage(params) {
    const { mode, prompt, settings, referenceImages } = params;

    let endpoint = "/accelerated"; // Default
    let payload = {
      positivePrompt: prompt,
      ...settings,
    };

    // Route to appropriate endpoint based on mode
    switch (mode) {
      case "layerdiffuse":
        endpoint = "/layer-diffuse-async";
        payload.model = "runware:100@1"; // Force FLUX Schnell
        payload.outputFormat = "PNG";
        break;

      case "pulid":
        if (!referenceImages?.length) {
          throw new Error("PuLID requires reference images");
        }
        endpoint = "/pulid-async";
        payload.puLID = {
          inputImages: referenceImages,
          idWeight: settings.idWeight || 1,
          trueCFGScale: settings.trueCFGScale || 1.5,
        };
        break;

      case "kontext":
        if (!referenceImages?.length) {
          throw new Error("Kontext requires base image");
        }
        endpoint = "/kontext-async";
        payload.inputImages = referenceImages;
        payload.model = "bfl:3@1"; // Force Kontext Pro
        break;
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    // Handle async jobs
    if (data.jobId) {
      return this.pollJobStatus(data.jobId);
    }

    return data;
  }

  async pollJobStatus(jobId) {
    const maxAttempts = 60; // 5 minutes max
    let attempts = 0;

    while (attempts < maxAttempts) {
      const response = await fetch(`${this.baseURL}/job-status/${jobId}`);
      const data = await response.json();

      if (data.status === "completed") {
        return data.result;
      } else if (data.status === "failed") {
        throw new Error(data.error || "Generation failed");
      }

      // Wait 5 seconds before next poll
      await new Promise((resolve) => setTimeout(resolve, 5000));
      attempts++;
    }

    throw new Error("Generation timeout");
  }

  async uploadImage(imageUri) {
    // Convert local URI to base64
    const base64 = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const response = await fetch(`${this.baseURL}/upload-image`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        imageData: `data:image/jpeg;base64,${base64}`,
      }),
    });

    return response.json();
  }
}

export default new RunwareService();
```

### 3. Image Handling & Storage

#### Local Image Management

```javascript
// src/utils/ImageUtils.js
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";

export class ImageUtils {
  static async saveImageToGallery(imageUrl, filename) {
    try {
      // Download image
      const { uri } = await FileSystem.downloadAsync(
        imageUrl,
        `${FileSystem.documentDirectory}${filename}.jpg`
      );

      // Save to gallery
      const asset = await MediaLibrary.createAssetAsync(uri);
      return asset;
    } catch (error) {
      console.error("Failed to save image:", error);
      throw error;
    }
  }

  static async cacheImage(imageUrl, cacheKey) {
    const cacheDir = `${FileSystem.cacheDirectory}images/`;
    await FileSystem.makeDirectoryAsync(cacheDir, { intermediates: true });

    const cachedUri = `${cacheDir}${cacheKey}.jpg`;

    // Check if already cached
    const fileInfo = await FileSystem.getInfoAsync(cachedUri);
    if (fileInfo.exists) {
      return cachedUri;
    }

    // Download and cache
    await FileSystem.downloadAsync(imageUrl, cachedUri);
    return cachedUri;
  }

  static async resizeImage(uri, maxDimension = 1024) {
    const manipulatedImage = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: maxDimension } }],
      { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
    );

    return manipulatedImage;
  }
}
```

#### Offline Storage

```javascript
// src/services/StorageService.js
import AsyncStorage from "@react-native-async-storage/async-storage";

export class StorageService {
  static async saveGeneratedImage(imageData) {
    const images = await this.getGeneratedImages();
    const newImage = {
      id: Date.now().toString(),
      url: imageData.url,
      prompt: imageData.prompt,
      model: imageData.model,
      timestamp: new Date().toISOString(),
      ...imageData,
    };

    images.unshift(newImage);

    // Keep only last 100 images
    if (images.length > 100) {
      images.splice(100);
    }

    await AsyncStorage.setItem("generated_images", JSON.stringify(images));
    return newImage;
  }

  static async getGeneratedImages() {
    const stored = await AsyncStorage.getItem("generated_images");
    return stored ? JSON.parse(stored) : [];
  }

  static async saveSettings(settings) {
    await AsyncStorage.setItem("app_settings", JSON.stringify(settings));
  }

  static async getSettings() {
    const stored = await AsyncStorage.getItem("app_settings");
    return stored
      ? JSON.parse(stored)
      : {
          model: "runware:101@1",
          width: 1024,
          height: 1024,
          steps: 28,
          CFGScale: 3.5,
          // ... defaults
        };
  }
}
```

---

## 📱 Mobile-Specific Considerations

### 1. Performance Optimizations

#### Network Management

```javascript
// Implement request queuing for poor connections
class RequestQueue {
  constructor() {
    this.queue = [];
    this.processing = false;
  }

  async add(request) {
    return new Promise((resolve, reject) => {
      this.queue.push({ request, resolve, reject });
      this.process();
    });
  }

  async process() {
    if (this.processing || this.queue.length === 0) return;

    this.processing = true;

    while (this.queue.length > 0) {
      const { request, resolve, reject } = this.queue.shift();

      try {
        const result = await request();
        resolve(result);
      } catch (error) {
        reject(error);
      }

      // Small delay between requests
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    this.processing = false;
  }
}
```

#### Memory Management

```javascript
// Implement image lazy loading and cleanup
const ImageGallery = ({ images }) => {
  const [loadedImages, setLoadedImages] = useState(new Set());

  const loadImage = useCallback((imageId) => {
    setLoadedImages((prev) => new Set([...prev, imageId]));
  }, []);

  const unloadImage = useCallback((imageId) => {
    setLoadedImages((prev) => {
      const newSet = new Set(prev);
      newSet.delete(imageId);
      return newSet;
    });
  }, []);

  return (
    <FlatList
      data={images}
      renderItem={({ item }) => (
        <LazyImage
          source={{ uri: item.url }}
          onLoad={() => loadImage(item.id)}
          onUnload={() => unloadImage(item.id)}
        />
      )}
      removeClippedSubviews={true}
      maxToRenderPerBatch={5}
    />
  );
};
```

### 2. User Experience

#### Loading States

```javascript
const GenerationScreen = () => {
  const [generationState, setGenerationState] = useState({
    status: "idle", // idle, generating, polling, completed, failed
    progress: 0,
    message: "",
    jobId: null,
  });

  const generateImage = async (params) => {
    setGenerationState({
      status: "generating",
      progress: 10,
      message: "Starting generation...",
    });

    try {
      const result = await RunwareService.generateImage(params);

      if (result.jobId) {
        setGenerationState({
          status: "polling",
          progress: 30,
          message: "Processing...",
          jobId: result.jobId,
        });

        // Start polling with progress updates
        const finalResult = await pollWithProgress(result.jobId);

        setGenerationState({
          status: "completed",
          progress: 100,
          message: "Complete!",
        });

        return finalResult;
      }
    } catch (error) {
      setGenerationState({
        status: "failed",
        progress: 0,
        message: error.message,
      });
    }
  };

  return (
    <View>
      {generationState.status !== "idle" && (
        <ProgressBar
          progress={generationState.progress}
          message={generationState.message}
        />
      )}
    </View>
  );
};
```

#### Responsive Design

```javascript
// Adapt UI based on device capabilities
import { Dimensions, Platform } from "react-native";

const { width, height } = Dimensions.get("window");
const isTablet = width >= 768;
const isAndroid = Platform.OS === "android";

const getOptimalImageDimensions = () => {
  if (isTablet) {
    return { width: 1024, height: 1024 }; // High quality for tablets
  } else {
    return { width: 768, height: 768 }; // Optimized for phones
  }
};
```

### 3. Offline Capabilities

#### Queue Management

```javascript
// Queue requests when offline
import NetInfo from "@react-native-netinfo/netinfo";

class OfflineQueue {
  constructor() {
    this.queue = [];
    this.isOnline = true;

    NetInfo.addEventListener((state) => {
      this.isOnline = state.isConnected;
      if (this.isOnline) {
        this.processQueue();
      }
    });
  }

  async addRequest(request) {
    if (this.isOnline) {
      return request();
    } else {
      return new Promise((resolve, reject) => {
        this.queue.push({ request, resolve, reject });
      });
    }
  }

  async processQueue() {
    while (this.queue.length > 0 && this.isOnline) {
      const { request, resolve, reject } = this.queue.shift();

      try {
        const result = await request();
        resolve(result);
      } catch (error) {
        reject(error);
      }
    }
  }
}
```

---

## 🔐 Security & API Management

### 1. API Key Management

```javascript
// Secure API key storage
import * as SecureStore from "expo-secure-store";

class SecureConfig {
  static async setApiKey(key) {
    await SecureStore.setItemAsync("runware_api_key", key);
  }

  static async getApiKey() {
    return await SecureStore.getItemAsync("runware_api_key");
  }

  static async clearApiKey() {
    await SecureStore.deleteItemAsync("runware_api_key");
  }
}
```

### 2. Content Filtering

```javascript
// Implement content filtering for mobile
const contentFilter = {
  blockedWords: [
    // Current filter words from web app
    "nude",
    "naked",
    "nsfw" /* ... rest of filter list */,
  ],

  checkContent(text) {
    const lowerText = text.toLowerCase();
    const foundWord = this.blockedWords.find((word) =>
      lowerText.includes(word.toLowerCase())
    );

    return {
      allowed: !foundWord,
      foundWord: foundWord || null,
    };
  },
};
```

---

## 💰 Cost Management

### 1. Usage Tracking

```javascript
// Track API costs and usage
class CostTracker {
  static async addGeneration(cost, type) {
    const today = new Date().toISOString().split("T")[0];
    const usage = await this.getUsage(today);

    usage.generations.push({
      cost,
      type,
      timestamp: new Date().toISOString(),
    });

    usage.totalCost += cost;
    usage.totalGenerations += 1;

    await AsyncStorage.setItem(`usage_${today}`, JSON.stringify(usage));
  }

  static async getUsage(date) {
    const stored = await AsyncStorage.getItem(`usage_${date}`);
    return stored
      ? JSON.parse(stored)
      : {
          totalCost: 0,
          totalGenerations: 0,
          generations: [],
        };
  }

  static async getMonthlyUsage() {
    // Calculate monthly costs across all stored days
    // Implementation details...
  }
}
```

### 2. Optimization Settings

```javascript
// Default settings optimized for mobile
const MOBILE_OPTIMIZED_SETTINGS = {
  // Use accelerated endpoints by default
  useAcceleration: true,
  teaCache: true,
  deepCache: true,

  // Optimize image dimensions for mobile screens
  defaultDimensions: {
    phone: { width: 768, height: 768 },
    tablet: { width: 1024, height: 1024 },
  },

  // Reduce steps for faster generation
  defaultSteps: 20, // vs 28 on web

  // Use cost-effective models by default
  defaultModel: "runware:101@1", // FLUX Dev

  // Limit concurrent generations
  maxConcurrentJobs: 2,
};
```

---

## 🚀 Migration Strategy

### Phase 1: Core Functionality (Week 1-2)

1. **Basic Image Generation**
   - Standard text-to-image
   - Model selection
   - Basic settings (dimensions, steps, CFG)
2. **Essential UI Components**
   - Prompt input
   - Generation button with loading states
   - Image display and saving
3. **API Integration**
   - Connect to existing backend
   - Basic error handling
   - Image caching

### Phase 2: Advanced Features (Week 3-4)

1. **LayerDiffuse Implementation**
   - Transparent background generation
   - PNG format handling
   - Model auto-switching
2. **PuLID Implementation**
   - Reference image upload
   - Identity consistency generation
   - Parameter handling
3. **Enhanced UI**
   - Settings panel
   - Image gallery
   - History management

### Phase 3: Mobile Optimization (Week 5-6)

1. **Performance Optimization**
   - Image lazy loading
   - Memory management
   - Network optimization
2. **Offline Support**
   - Request queueing
   - Local storage
   - Sync when online
3. **Mobile-Specific Features**
   - Push notifications for completed generations
   - Share functionality
   - Camera integration

### Phase 4: Advanced Features (Week 7-8)

1. **Kontext & PhotoMaker**
   - Image editing capabilities
   - Style transfer
   - Advanced workflows
2. **Chat Integration**
   - OpenAI chat functionality
   - Conversation history
   - Image context in chat
3. **Polish & Testing**
   - Performance testing
   - User experience refinement
   - App store preparation

---

## 📋 Implementation Checklist

### Backend Requirements ✅

- [x] Modular Express.js server
- [x] Runware API integration with direct HTTP calls
- [x] Image upload/UUID conversion
- [x] Async job handling for timeouts
- [x] All model implementations working

### Frontend Requirements (React Native/Expo)

- [ ] Project setup with Expo
- [ ] Navigation structure
- [ ] API service layer
- [ ] Image generation UI
- [ ] Settings management
- [ ] Local storage implementation
- [ ] Image gallery component
- [ ] Camera/gallery integration
- [ ] Offline support
- [ ] Push notifications

### Model Implementation Requirements

- [ ] Standard image generation
- [ ] LayerDiffuse (transparent backgrounds)
- [ ] PuLID (identity consistency)
- [ ] Kontext (image editing)
- [ ] PhotoMaker (style transfer)
- [ ] Prompt enhancement
- [ ] Content filtering

### Performance Requirements

- [ ] Image lazy loading
- [ ] Memory management
- [ ] Network optimization
- [ ] Request queueing
- [ ] Progress tracking
- [ ] Error handling
- [ ] Offline queue management

### Security Requirements

- [ ] Secure API key storage
- [ ] Content filtering
- [ ] Data encryption
- [ ] Privacy compliance

---

## 🔧 Development Environment Setup

### Required Dependencies

```json
{
  "expo": "~49.0.0",
  "react-native": "0.72.0",
  "react-navigation": "^6.0.0",
  "@react-native-async-storage/async-storage": "^1.18.0",
  "expo-file-system": "~15.4.0",
  "expo-image-picker": "~14.3.0",
  "expo-image-manipulator": "~11.3.0",
  "expo-media-library": "~15.4.0",
  "expo-secure-store": "~12.3.0",
  "@react-native-netinfo/netinfo": "^9.4.0",
  "react-native-uuid": "^2.0.0"
}
```

### Environment Configuration

```javascript
// app.config.js
export default {
  expo: {
    name: "RealEngine",
    slug: "realengine",
    version: "1.0.0",
    platforms: ["ios", "android"],

    // Permissions for image handling
    ios: {
      infoPlist: {
        NSPhotoLibraryUsageDescription:
          "This app needs access to photo library to save generated images.",
        NSCameraUsageDescription:
          "This app needs access to camera to take reference photos.",
      },
    },

    android: {
      permissions: [
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE",
        "CAMERA",
      ],
    },
  },
};
```

---

## 📈 Success Metrics

### Performance Targets

- **Generation Time**: < 30 seconds for standard images
- **App Launch**: < 3 seconds cold start
- **Image Loading**: < 2 seconds for cached images
- **Memory Usage**: < 200MB baseline, < 500MB peak

### User Experience Goals

- **Intuitive Interface**: One-tap generation
- **Offline Support**: Queue up to 10 requests
- **Battery Efficiency**: < 5% drain per generation
- **Storage Management**: Auto-cleanup of old cache

### Quality Metrics

- **Image Quality**: Maintain web app quality
- **Feature Parity**: 100% model compatibility
- **Reliability**: < 1% failed generations
- **Cost Efficiency**: 20% cost reduction vs web

---

This comprehensive guide provides all the technical details needed to successfully convert your RealEngine web application to iOS and Android using Expo React Native. The current web implementation is sophisticated and well-architected, making the mobile transition straightforward with careful attention to the model-specific constraints and mobile optimization requirements outlined above.
