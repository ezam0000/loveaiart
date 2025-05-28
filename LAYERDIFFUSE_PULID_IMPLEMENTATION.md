# LayerDiffuse & PuLID Implementation Guide

## Overview

This document details the correct implementation of LayerDiffuse (transparent backgrounds) and PuLID (identity consistency) features in LoveAIArt. Both features required switching from Runware SDK to direct HTTP API calls to achieve proper functionality.

## LayerDiffuse Implementation

### What is LayerDiffuse?

LayerDiffuse generates images with built-in transparency using FLUX models. It's perfect for:

- Product photography with transparent backgrounds
- Logo creation
- Isolated subjects
- UI elements requiring transparency

### Technical Implementation

#### Backend (`services/runware.js`)

```javascript
async generateLayerDiffuse(params) {
  const { positivePrompt, width, height, model } = params;

  // Force FLUX model (required for LayerDiffuse)
  let layerDiffuseModel = model;
  if (model !== "runware:100@1" && model !== "runware:101@1") {
    layerDiffuseModel = "runware:101@1"; // Default to FLUX Schnell
  }

  // Minimal payload structure (matches Runware docs exactly)
  const requestPayload = [
    {
      taskType: "imageInference",
      taskUUID: uuidv4(),
      positivePrompt,
      height: parseInt(height) || 1024,
      width: parseInt(width) || 1024,
      model: layerDiffuseModel,
      outputFormat: "PNG", // Required for transparency
      advancedFeatures: {
        layerDiffuse: true, // Key parameter
      },
    },
  ];

  // Direct HTTP API call (bypasses SDK limitations)
  const response = await fetch("https://api.runware.ai/v1", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.apiKey}`,
    },
    body: JSON.stringify(requestPayload),
  });
}
```

#### Frontend (`public/assets/js/core/ImageGenerator.js`)

```javascript
if (currentMode === "layerdiffuse") {
  // Auto-switch to FLUX model if needed
  if (
    settings.model !== "runware:100@1" &&
    settings.model !== "runware:101@1"
  ) {
    formData.model = "runware:101@1";
  }

  // Force PNG format for transparency
  formData.outputFormat = "PNG";
  endpoint = "/layer-diffuse";
}
```

#### API Payload Structure

**Correct Payload** (minimal, matches documentation):

```json
{
  "taskType": "imageInference",
  "taskUUID": "550e8400-e29b-41d4-a716-446655440000",
  "positivePrompt": "a crystal glass on a white background",
  "height": 1024,
  "width": 1024,
  "model": "runware:101@1",
  "outputFormat": "PNG",
  "advancedFeatures": {
    "layerDiffuse": true
  }
}
```

**❌ Wrong Payload** (too many parameters):

```json
{
  "taskType": "imageInference",
  "taskUUID": "uuid",
  "positivePrompt": "prompt",
  "negativePrompt": "blurry", // ❌ Not needed
  "height": 1024,
  "width": 1024,
  "model": "runware:101@1",
  "steps": 28, // ❌ Not needed
  "CFGScale": 3.5, // ❌ Not needed
  "scheduler": "Default", // ❌ Not needed
  "outputFormat": "PNG",
  "advancedFeatures": {
    "layerDiffuse": true
  }
}
```

### Key Success Factors

1. **Minimal Payload**: Only include required parameters
2. **FLUX Models Only**: Auto-switch to `runware:100@1` or `runware:101@1`
3. **PNG Format**: Force PNG output for transparency support
4. **Direct HTTP**: Bypass SDK limitations with direct API calls
5. **No Extra Parameters**: Remove negativePrompt, steps, CFGScale, etc.

---

## PuLID Implementation

### What is PuLID?

PuLID maintains facial identity consistency across different prompts using reference images. Perfect for:

- Character consistency in storytelling
- Brand mascot variations
- Portrait series with same person
- Identity-preserving style transfers

### Technical Implementation

#### Backend (`services/runware.js`)

```javascript
async generatePuLID(params) {
  const { positivePrompt, width, height, model, puLID } = params;
  const { inputImages, idWeight, trueCFGScale, CFGStartStep } = puLID || {};

  // Upload reference image and get UUID
  const uploadResponse = await this.uploadImage(inputImages[0]);
  const referenceImageUUID = uploadResponse.imageUUID;

  // Build minimal payload
  const requestPayload = [
    {
      taskType: "imageInference",
      taskUUID: uuidv4(),
      positivePrompt,
      height: parseInt(height) || 1024,
      width: parseInt(width) || 1024,
      model: pulidModel,
      puLID: {
        inputImages: [referenceImageUUID],
        idWeight: parseInt(idWeight) || 1,
      },
    },
  ];

  // Handle mutually exclusive parameters
  if (CFGStartStep !== undefined && CFGStartStep !== null) {
    requestPayload[0].puLID.CFGStartStep = parseInt(CFGStartStep);
  } else if (trueCFGScale !== undefined && trueCFGScale !== null) {
    requestPayload[0].puLID.trueCFGScale = parseFloat(trueCFGScale);
  }
}
```

#### Frontend Parameter Handling

```javascript
// Build PuLID object with only non-default parameters
const pulidConfig = {
  inputImages: pulidImages,
  idWeight: parseInt(document.getElementById("idWeight")?.value || "1"),
};

// Only add trueCFGScale if different from default
const trueCFGScale = parseFloat(
  document.getElementById("trueCFGScale")?.value || "1.5"
);
if (trueCFGScale !== 1.5) {
  pulidConfig.trueCFGScale = trueCFGScale;
}
// Note: We don't set CFGStartStep to avoid conflicts
```

#### API Payload Structure

**Correct Payload**:

```json
{
  "taskType": "imageInference",
  "taskUUID": "550e8400-e29b-41d4-a716-446655440000",
  "positivePrompt": "portrait, color, cinematic, in garden, soft light, detailed face",
  "height": 1024,
  "width": 1024,
  "model": "runware:101@1",
  "puLID": {
    "inputImages": ["59a2edc2-45e6-429f-be5f-7ded59b92046"],
    "idWeight": 1,
    "trueCFGScale": 1.5
  }
}
```

### Key Success Factors

1. **Image Upload to UUID**: Convert base64 images to Runware UUIDs
2. **Mutually Exclusive Parameters**: Use `trueCFGScale` OR `CFGStartStep`, never both
3. **Smart Defaults**: Only send non-default values to API
4. **FLUX Model Enforcement**: Auto-switch to compatible models
5. **Conflict Prevention**: Frontend logic prevents parameter conflicts

---

## Common Issues & Solutions

### LayerDiffuse Issues

**Problem**: Images have backgrounds instead of transparency
**Solution**: Ensure minimal payload with only required parameters

**Problem**: "Model not supported" error
**Solution**: Auto-switch to FLUX models (runware:100@1 or runware:101@1)

**Problem**: JPEG output instead of PNG
**Solution**: Force `outputFormat: "PNG"` in payload

### PuLID Issues

**Problem**: "puLID.trueCFGScale cannot be set when puLID.CFGStartStep is provided"
**Solution**: Use mutually exclusive parameter logic

**Problem**: Reference image not working
**Solution**: Upload image to get UUID instead of sending base64

**Problem**: Identity not preserved
**Solution**: Adjust idWeight (0-3) and trueCFGScale (1.0-15.0)

---

## Testing Commands

### LayerDiffuse Test

```bash
curl -X POST http://localhost:3000/layer-diffuse \
  -H "Content-Type: application/json" \
  -d '{
    "positivePrompt": "a crystal glass on a white background",
    "width": 1024,
    "height": 1024,
    "model": "runware:101@1",
    "numberResults": 1
  }'
```

### PuLID Test

```bash
curl -X POST http://localhost:3000/pulid \
  -H "Content-Type: application/json" \
  -d '{
    "positivePrompt": "portrait, color, cinematic, in garden",
    "width": 1024,
    "height": 1024,
    "model": "runware:101@1",
    "puLID": {
      "inputImages": ["base64-image-data"],
      "idWeight": 1,
      "trueCFGScale": 1.5
    }
  }'
```

---

## Performance Notes

- **LayerDiffuse**: Slightly slower than standard generation due to transparency processing
- **PuLID**: Requires image upload step, adds ~2-3 seconds to generation time
- **FLUX Models**: Generally faster than other models for these features
- **Caching**: Both features benefit from Runware's built-in caching

---

## Future Improvements

1. **Batch Processing**: Support multiple LayerDiffuse images in one request
2. **PuLID Multi-Reference**: Support multiple reference images for better identity consistency
3. **Preset Management**: Save common LayerDiffuse/PuLID configurations
4. **Advanced Controls**: Expose more fine-tuning parameters for power users
