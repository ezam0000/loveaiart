# LoveAIArt Development Quick Guide

## 🎉 MAJOR FEATURE UPDATES - MAY 2025

### ✅ LayerDiffuse & PuLID - CORRECTLY IMPLEMENTED

**CRITICAL BREAKTHROUGH**: Both LayerDiffuse and PuLID are now working perfectly with transparent backgrounds and identity consistency respectively. These implementations required switching from SDK to direct HTTP API calls to match Runware's exact documentation.

#### LayerDiffuse Implementation ✅

**Location**: `services/runware.js` - `generateLayerDiffuse()` method

**Key Success Factors**:

1. **Minimal Payload Structure** - Matches documentation exactly:

   ```json
   {
     "taskType": "imageInference",
     "taskUUID": "uuid-here",
     "positivePrompt": "prompt text",
     "height": 1024,
     "width": 1024,
     "model": "runware:101@1",
     "outputFormat": "PNG",
     "advancedFeatures": {
       "layerDiffuse": true
     }
   }
   ```

2. **Direct HTTP API Calls** - Bypassed SDK limitations:

   ```javascript
   const response = await fetch("https://api.runware.ai/v1", {
     method: "POST",
     headers: {
       "Content-Type": "application/json",
       Authorization: `Bearer ${this.apiKey}`,
     },
     body: JSON.stringify(requestPayload),
   });
   ```

3. **FLUX Model Enforcement** - Auto-switches to FLUX models (runware:100@1 or runware:101@1)
4. **PNG Format Forced** - Ensures transparency support
5. **No Extra Parameters** - Removed negativePrompt, steps, CFGScale, etc.

#### PuLID Implementation ✅

**Location**: `services/runware.js` - `generatePuLID()` method

**Key Success Factors**:

1. **Minimal Payload Structure** - Matches documentation exactly:

   ```json
   {
     "taskType": "imageInference",
     "taskUUID": "uuid-here",
     "positivePrompt": "portrait prompt",
     "height": 1024,
     "width": 1024,
     "model": "runware:101@1",
     "puLID": {
       "inputImages": ["image-uuid"],
       "idWeight": 1,
       "trueCFGScale": 1.5
     }
   }
   ```

2. **Mutually Exclusive Parameters** - Fixed API conflict:

   - Uses `trueCFGScale` OR `CFGStartStep`, never both
   - Frontend defaults to `trueCFGScale: 1.5` (was 10.0)
   - Only sends non-default values to API

3. **Image Upload to UUID** - Proper image handling:

   ```javascript
   const uploadResponse = await this.uploadImage(referenceImageData);
   const referenceImageUUID = uploadResponse.imageUUID;
   ```

4. **FLUX Model Enforcement** - Auto-switches to FLUX models for compatibility

#### Frontend Updates ✅

**Location**: `public/assets/js/core/ImageGenerator.js` & `public/index.html`

**Key Improvements**:

1. **Smart Parameter Handling** - Only sends non-default values
2. **Conflict Prevention** - Avoids sending both trueCFGScale and CFGStartStep
3. **Better Defaults** - trueCFGScale default changed from 10.0 to 1.5
4. **Proper Endpoint Routing** - Uses `/layer-diffuse` and `/pulid` endpoints

#### Testing Results ✅

- **LayerDiffuse**: Generates PNG images with transparent backgrounds
- **PuLID**: Maintains facial identity with proper reference image handling
- **API Compliance**: Payloads match Runware documentation exactly
- **Error-Free**: No more parameter conflicts or SDK limitations

---

## 🚨 Current State Analysis

### Files Requiring Immediate Attention

| File                | Lines | Status      | Priority |
| ------------------- | ----- | ----------- | -------- |
| `public/script.js`  | 1427  | 🔴 Critical | P0       |
| `public/styles.css` | 1111  | 🟡 High     | P1       |
| `server.js`         | 456   | 🟡 Medium   | P2       |

### Project Architecture Overview

```
Current: Monolithic files (3 large files handling everything)
Target:  Modular architecture (20+ focused files)
```

## 📋 Immediate Next Steps

### Step 1: Frontend JavaScript Refactoring (`public/script.js`)

**Current Structure** (1427 lines):

```javascript
// Lines 1-200: RealEngine class definition & initialization
// Lines 201-400: Event binding & settings management
// Lines 401-600: UI management & message handling
// Lines 601-800: Image generation & API calls
// Lines 801-1000: Storage & utility functions
// Lines 1001-1200: Content filtering & validation
// Lines 1201-1427: LoRA management & DOM manipulation
```

**Target Structure** (Multiple files <400 lines each):

1. **Create**: `public/assets/js/core/RealEngine.js` (Main class - 400 lines max)
2. **Create**: `public/assets/js/core/ImageGenerator.js` (API calls - 300 lines)
3. **Create**: `public/assets/js/core/ChatManager.js` (Chat functionality - 300 lines)
4. **Create**: `public/assets/js/core/SettingsManager.js` (Settings panel - 250 lines)
5. **Create**: `public/assets/js/utils/storage.js` (Storage functions - 150 lines)
6. **Create**: `public/assets/js/utils/validation.js` (Content filtering - 200 lines)
7. **Create**: `public/assets/js/components/LoraManager.js` (LoRA handling - 200 lines)

### Step 2: CSS Modularization (`public/styles.css`)

**Current Structure** (1111 lines):

```css
/* Lines 1-50: CSS Reset & Variables */
/* Lines 51-200: App Layout & Sidebar */
/* Lines 201-400: Chat Interface */
/* Lines 401-600: Forms & Input Elements */
/* Lines 601-800: Settings Panel */
/* Lines 801-1000: Responsive Design */
/* Lines 1001-1111: Utilities & Animations */
```

**Target Structure**:

1. **Create**: `public/assets/css/base/variables.css` (CSS custom properties)
2. **Create**: `public/assets/css/base/reset.css` (Normalize/reset)
3. **Create**: `public/assets/css/layout/app.css` (Main layout)
4. **Create**: `public/assets/css/components/sidebar.css` (Sidebar styles)
5. **Create**: `public/assets/css/components/chat.css` (Chat interface)
6. **Create**: `public/assets/css/components/forms.css` (Form elements)
7. **Create**: `public/assets/css/layout/responsive.css` (Media queries)

### Step 3: Backend Modularization (`server.js`)

**Current Routes** (456 lines):

```javascript
// Lines 1-50: Dependencies & initialization
// Lines 51-100: Middleware setup
// Lines 101-200: Authentication routes
// Lines 201-350: Image generation endpoints
// Lines 351-400: Utility routes
// Lines 401-456: Server startup
```

**Target Structure**:

1. **Create**: `routes/auth.js` (Authentication routes)
2. **Create**: `routes/image.js` (Image generation)
3. **Create**: `routes/api.js` (Utility endpoints)
4. **Create**: `services/runware.js` (Runware API integration)
5. **Create**: `middleware/validation.js` (Request validation)

## 🛠️ Implementation Workflow

### Phase 1: Create Directory Structure

```bash
mkdir -p public/assets/{js/{core,utils,components},css/{base,layout,components}}
mkdir -p {routes,services,middleware,config}
```

### Phase 2: Extract JavaScript Modules

#### Priority Order:

1. **Extract utilities first** (easier, less coupling)

   - `utils/storage.js` from lines 1003-1067 in `script.js`
   - `utils/validation.js` from lines 1127-1190 in `script.js`

2. **Extract components** (medium coupling)

   - `components/LoraManager.js` from lines 1243-1427 in `script.js`
   - `components/PromptEnhancer.js` from lines 964-1002 in `script.js`

3. **Extract core modules** (high coupling, needs careful refactoring)

   - `core/SettingsManager.js` from lines 291-820 in `script.js`
   - `core/ImageGenerator.js` from lines 561-690 in `script.js`
   - `core/ChatManager.js` from lines 459-560 in `script.js`

4. **Refactor main class** (highest coupling)
   - `core/RealEngine.js` - main orchestrator

### Phase 3: Extract CSS Modules

#### Priority Order:

1. **Base styles** (no dependencies)

   - Extract CSS custom properties to `css/base/variables.css`
   - Extract reset styles to `css/base/reset.css`

2. **Layout styles** (low dependencies)

   - Extract app container to `css/layout/app.css`
   - Extract responsive queries to `css/layout/responsive.css`

3. **Component styles** (medium dependencies)
   - Extract sidebar to `css/components/sidebar.css`
   - Extract chat interface to `css/components/chat.css`
   - Extract forms to `css/components/forms.css`

### Phase 4: Backend Refactoring

#### Priority Order:

1. **Extract services** (no routing dependencies)

   - Create `services/runware.js`
   - Create `services/prompt.js`

2. **Extract middleware** (low dependencies)

   - Create `middleware/validation.js`
   - Create `middleware/auth.js`

3. **Extract routes** (high dependencies)
   - Create `routes/image.js`
   - Create `routes/auth.js`
   - Create `routes/api.js`

## 📁 File Reference Guide

### Key Files & Line Numbers

#### `public/script.js` (1427 lines) - CRITICAL REFACTORING TARGET

- **Lines 1-35**: Class constructor & initialization
- **Lines 36-127**: Content filtering (disallowedWords array)
- **Lines 128-290**: Core initialization & event binding
- **Lines 291-382**: Settings event handlers
- **Lines 383-560**: UI management & message handling
- **Lines 561-690**: Image generation & API calls
- **Lines 691-820**: Random prompts & UI updates
- **Lines 821-963**: Mode switching & chat functionality
- **Lines 964-1002**: Prompt enhancement
- **Lines 1003-1067**: Local storage management
- **Lines 1068-1126**: Recent prompts & defaults
- **Lines 1127-1190**: Content filtering logic
- **Lines 1191-1242**: History management
- **Lines 1243-1427**: LoRA management system

#### `public/styles.css` (1111 lines) - HIGH PRIORITY REFACTORING

- **Lines 1-50**: CSS reset & custom properties
- **Lines 51-235**: Sidebar component styles
- **Lines 236-328**: Main content & header
- **Lines 329-465**: Chat interface & messages
- **Lines 466-677**: Input area & forms
- **Lines 678-1037**: Settings panel
- **Lines 1038-1111**: Responsive design & utilities

#### `server.js` (456 lines) - MEDIUM PRIORITY REFACTORING

- **Lines 1-30**: Dependencies & utilities
- **Lines 31-50**: Express setup & middleware
- **Lines 51-100**: Routing & authentication
- **Lines 101-200**: Image generation endpoint (/generate)
- **Lines 201-300**: Original image endpoint (/generate-image)
- **Lines 301-400**: Additional routes & utilities
- **Lines 401-456**: Server startup & error handling

### Supporting Files (Already Modular)

- `public/photomaker.js` (152 lines) ✅ Good size
- `public/index.html` (456 lines) ⚠️ Could be split into components
- `public/photomaker.html` (81 lines) ✅ Good size
- `public/avatar.html` (158 lines) ✅ Good size

## 🎯 Success Metrics

### File Size Targets

- ✅ **Target**: All files under 1000 lines
- 🎯 **Ideal**: Most files under 500 lines
- 🚀 **Optimal**: Core files under 300 lines

### Modularity Goals

- **Before**: 3 monolithic files (3000+ total lines)
- **After**: 20+ focused modules (avg 150 lines each)

### Development Speed Improvements

- **Faster debugging**: Smaller, focused files
- **Easier maintenance**: Clear separation of concerns
- **Better collaboration**: Multiple developers can work simultaneously
- **Improved testing**: Isolated units for testing

## 📝 Notes

- **Maintain existing functionality**: No feature regression during refactoring
- **Preserve existing APIs**: Keep same endpoints and interfaces
- **Mobile-first approach**: Ensure all breakpoints work during refactoring
- **Progressive enhancement**: Start with utilities, move to core features
- **Backup frequently**: Git commit after each successful extraction

---

_This guide provides specific line numbers and file references for efficient development workflow._
