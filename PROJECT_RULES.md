# LoveAIArt Project Rules & Guidelines

## 📁 Project Structure Overview

```
loveaiart/
├── server.js                 # Main backend server (56 lines - MODULARIZED)
├── routes/                   # Route modules
│   ├── image.js              # Image generation routes (123 lines)
│   ├── chat.js               # Chat functionality routes (30 lines)
│   └── api.js                # API utility routes (80 lines)
├── services/                 # Service layer
│   ├── runware.js            # Runware API integration (194 lines)
│   └── openai.js             # OpenAI service (89 lines)
├── middleware/               # Express middleware
│   └── validation.js         # Request validation middleware
├── config/                   # Configuration files
├── public/                   # Frontend static files
│   ├── index.html            # Main UI (456 lines)
│   ├── script.js             # Main frontend logic (32 lines - REFACTORED)
│   ├── styles.css            # Main styles (42 lines - REFACTORED)
│   ├── photomaker.js         # PhotoMaker functionality (152 lines)
│   ├── photomaker.html       # PhotoMaker UI (81 lines)
│   ├── avatar.html           # Avatar generation (158 lines)
│   ├── pulid.html            # PuLID identity consistency (NEW)
│   ├── layer-diffuse.html    # LayerDiffuse transparent bg (NEW)
│   ├── accelerated.html      # Accelerator options (NEW)
│   ├── login.html            # Authentication UI (130 lines)
│   ├── tos.html              # Terms of Service (63 lines)
│   └── pp.html               # Privacy Policy (99 lines)
├── .env                      # Environment variables
├── package.json              # Dependencies
└── documentation/            # Project docs
```

## ✅ Modularization Status & New Features

### Completed Refactoring:

- ✅ `server.js` (56 lines) → Modularized into routes, services, middleware
- ✅ `public/script.js` (32 lines) → Core functionality extracted
- ✅ `public/styles.css` (42 lines) → Base styles only

### New Features Implementation Plan:

#### 🧬 PuLID - Identity Consistency

- **Backend**: `services/runware.js` → `generatePuLID()` method
- **API**: `routes/image.js` → `POST /pulid` endpoint
- **Frontend**: `public/pulid.html` + `public/pulid.js`
- **Features**: Single reference image facial identity preservation

#### 🧼 LayerDiffuse - Transparent Backgrounds

- **Backend**: `services/runware.js` → `generateLayerDiffuse()` method
- **API**: `routes/image.js` → `POST /layer-diffuse` endpoint
- **Frontend**: `public/layer-diffuse.html` + `public/layer-diffuse.js`
- **Features**: Direct transparent background generation

#### ⚡️ Accelerator Methods - Cost & Time Optimization

- **Backend**: `services/runware.js` → `generateWithAccelerators()` method
- **API**: `routes/image.js` → `POST /accelerated` endpoint
- **Frontend**: `public/accelerated.html` + `public/accelerated.js`
- **Features**: TeaCache & DeepCache for 70% cost savings

## 📋 Code Organization Rules

### 1. File Size Limits

- **Maximum file size: 1000 lines**
- **Target file size: 500-800 lines**
- **Critical threshold: 1200+ lines requires immediate refactoring**

### 2. Modularization Strategy

#### Backend Modularization (✅ IMPLEMENTED)

```
routes/
├── image.js              # Image generation routes
│   ├── /generate         # Standard image generation
│   ├── /generate-image   # Legacy image generation
│   ├── /photomaker       # PhotoMaker API endpoint
│   ├── /generate-avatar  # Avatar generation
│   ├── /enhance-prompt   # Prompt enhancement
│   ├── /pulid            # PuLID identity consistency (NEW)
│   ├── /layer-diffuse    # LayerDiffuse transparent bg (NEW)
│   └── /accelerated      # Accelerator methods (NEW)
├── chat.js               # Chat functionality routes
└── api.js                # API utility routes

services/
├── runware.js            # Runware API integration
│   ├── generateImages()         # Standard generation
│   ├── generateImagesLegacy()   # Legacy generation
│   ├── generatePhotoMaker()     # PhotoMaker generation
│   ├── generatePuLID()          # PuLID generation (NEW)
│   ├── generateLayerDiffuse()   # LayerDiffuse generation (NEW)
│   ├── generateWithAccelerators() # Accelerated generation (NEW)
│   └── enhancePrompt()          # Prompt enhancement
└── openai.js             # OpenAI service integration

middleware/
├── validation.js         # Request validation middleware
└── redirectWWW()         # WWW redirect middleware

config/                   # Configuration files (planned)
├── express.js            # Express setup
└── environment.js        # Environment validation
```

#### Frontend Modularization (🔄 IN PROGRESS)

**Current Structure:**

```
public/
├── index.html            # Main UI (456 lines)
├── script.js             # Main frontend logic (32 lines - REFACTORED)
├── styles.css            # Main styles (42 lines - REFACTORED)
├── photomaker.js         # PhotoMaker functionality (152 lines)
├── photomaker.html       # PhotoMaker UI (81 lines)
├── avatar.html           # Avatar generation (158 lines)
├── pulid.html            # PuLID identity consistency (NEW)
├── pulid.js              # PuLID frontend logic (NEW)
├── layer-diffuse.html    # LayerDiffuse transparent bg (NEW)
├── layer-diffuse.js      # LayerDiffuse frontend logic (NEW)
├── accelerated.html      # Accelerator options (NEW)
├── accelerated.js        # Accelerator frontend logic (NEW)
└── assets/               # Static assets
    ├── css/
    │   ├── base/
    │   ├── components/
    │   └── layout/
    └── js/
        ├── core/
        ├── utils/
        └── components/
```

**Target Modular Structure:**

```
assets/
├── js/
│   ├── core/
│   │   ├── RealEngine.js          # Main class (max 400 lines)
│   │   ├── ChatManager.js         # Chat functionality
│   │   ├── ImageGenerator.js      # Standard image generation
│   │   ├── PuLIDGenerator.js      # PuLID identity generation (NEW)
│   │   ├── LayerDiffuseGen.js     # LayerDiffuse generation (NEW)
│   │   ├── AcceleratedGen.js      # Accelerated generation (NEW)
│   │   └── SettingsManager.js     # Settings panel
│   ├── ui/
│   │   ├── UIManager.js           # UI interactions
│   │   ├── Modal.js               # Modal components
│   │   ├── ImageUpload.js         # Image upload component (NEW)
│   │   └── Sidebar.js             # Sidebar management
│   ├── utils/
│   │   ├── storage.js             # Local storage handling
│   │   ├── validation.js          # Content filtering
│   │   ├── imageUtils.js          # Image processing utilities (NEW)
│   │   └── helpers.js             # Utility functions
│   └── components/
│       ├── PromptEnhancer.js      # Prompt enhancement
│       ├── LoraManager.js         # LoRA management
│       ├── ModelManager.js        # Model handling
│       ├── AcceleratorPanel.js    # Accelerator options (NEW)
│       └── IdentityUpload.js      # PuLID image upload (NEW)
└── css/
    ├── base/
    │   ├── reset.css              # CSS reset
    │   ├── variables.css          # CSS custom properties
    │   └── typography.css         # Typography rules
    ├── components/
    │   ├── sidebar.css            # Sidebar styles
    │   ├── chat.css               # Chat interface
    │   ├── forms.css              # Form elements
    │   ├── buttons.css            # Button styles
    │   ├── modals.css             # Modal styles
    │   ├── image-upload.css       # Image upload component (NEW)
    │   └── accelerator-panel.css  # Accelerator options (NEW)
    ├── layout/
    │   ├── app.css                # Main app layout
    │   ├── header.css             # Header styles
    │   └── responsive.css         # Media queries
    └── themes/
        └── dark.css               # Dark theme (current)
```

## 🎨 UI/UX Design Rules

### 1. Design System Standards

- **Color Palette**: Black & white theme with CSS custom properties
- **Typography**: SF Pro Display system font stack
- **Spacing**: 8px grid system (8, 16, 24, 32px)
- **Border Radius**: `--radius: 12px`, `--radius-sm: 8px`
- **Transitions**: `--transition: all 0.2s ease`

### 2. Component Patterns

#### Button Hierarchy

```css
/* Primary: White on dark */
.btn-primary {
  background: var(--accent-color);
  color: var(--bg-primary);
}

/* Secondary: Transparent with border */
.btn-secondary {
  background: transparent;
  border: 1px solid var(--border-color);
}

/* Icon buttons: Minimal with hover states */
.btn-icon {
  padding: 8px;
  border-radius: var(--radius-sm);
}
```

#### Chat Interface Pattern

- **Message bubbles**: User (right-aligned), Assistant (left-aligned)
- **Avatar system**: Consistent 32px circular avatars
- **Image grid**: Responsive grid with hover actions
- **Typing indicators**: Animated loading states

### 3. Responsive Design Rules

- **Mobile-first approach**: Start with mobile, enhance for desktop
- **Breakpoints**:
  - Mobile: < 768px
  - Tablet: 768px - 1024px
  - Desktop: > 1024px
- **Sidebar behavior**: Overlay on mobile, persistent on desktop

## 🔧 Technical Standards

### 1. JavaScript Patterns

#### Class Structure

```javascript
class ComponentName {
  constructor(options = {}) {
    this.options = { ...this.defaultOptions, ...options };
    this.state = {};
    this.init();
  }

  init() {
    this.bindEvents();
    this.render();
  }

  bindEvents() {
    // Event listeners
  }

  render() {
    // DOM manipulation
  }

  destroy() {
    // Cleanup
  }
}
```

#### Error Handling

```javascript
// API calls must include try-catch
async apiCall() {
  try {
    const response = await fetch('/api/endpoint');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    this.showError('Operation failed. Please try again.');
    throw error;
  }
}
```

### 2. CSS Architecture

#### Naming Convention (BEM)

```css
/* Block */
.chat-message {
}

/* Element */
.chat-message__content {
}
.chat-message__avatar {
}

/* Modifier */
.chat-message--user {
}
.chat-message--system {
}
```

#### CSS Custom Properties

```css
:root {
  /* Colors */
  --bg-primary: #000000;
  --text-primary: #ffffff;

  /* Spacing */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;

  /* Typography */
  --font-size-sm: 14px;
  --font-size-md: 16px;
  --font-size-lg: 18px;
}
```

### 3. Backend Patterns

#### Route Structure

```javascript
// routes/image.js
const express = require("express");
const router = express.Router();
const imageService = require("../services/image");

router.post("/generate", async (req, res) => {
  try {
    const result = await imageService.generate(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

#### Service Pattern

```javascript
// services/image.js
class ImageService {
  constructor(runware) {
    this.runware = runware;
  }

  async generate(params) {
    // Service logic
  }
}

module.exports = ImageService;
```

## 📂 File Organization Rules

### 1. Naming Conventions

- **Files**: kebab-case (`image-generator.js`)
- **Classes**: PascalCase (`ImageGenerator`)
- **Functions**: camelCase (`generateImage`)
- **Constants**: UPPER_SNAKE_CASE (`API_ENDPOINTS`)

### 2. Import/Export Standards

```javascript
// ES6 modules for frontend
import { ImageGenerator } from "./core/ImageGenerator.js";
export { default as ChatManager } from "./ChatManager.js";

// CommonJS for backend
const ImageService = require("./services/ImageService");
module.exports = { ImageService };
```

### 3. Directory Structure Rules

- **Flat structure**: Max 3 levels deep
- **Grouped by functionality**: Not by file type
- **Clear naming**: Self-documenting folder names

## 🔒 Security & Quality Rules

### 1. Content Filtering

- **Maintain existing filter list** in `script.js` lines 47-127
- **Server-side validation**: Never trust client input
- **Sanitization**: All user inputs must be sanitized

### 2. API Security

- **Rate limiting**: Implement on all public endpoints
- **Input validation**: Validate all request parameters
- **Error handling**: Never expose internal errors to client

### 3. Environment Management

```javascript
// Required environment variables
const requiredEnvVars = ["RUNWARE_API_KEY", "PORT", "NODE_ENV"];

// Validation on startup
requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
});
```

## 📊 Performance Rules

### 1. Frontend Performance

- **Lazy loading**: Images and non-critical components
- **Debouncing**: User input handlers (300ms)
- **Caching**: API responses and user preferences
- **Minification**: All production assets

### 2. Backend Performance

- **Async/await**: For all I/O operations
- **Connection pooling**: Database and external APIs
- **Compression**: Enable gzip compression
- **Caching headers**: Static assets

## 🧪 Testing & Documentation

### 1. Documentation Requirements

- **JSDoc comments**: All public methods
- **README updates**: For each new module
- **API documentation**: OpenAPI/Swagger for endpoints
- **Change logs**: Document all modifications

### 2. Code Comments

```javascript
/**
 * Generates AI images using the Runware API
 * @param {Object} params - Generation parameters
 * @param {string} params.prompt - Text prompt for image generation
 * @param {number} params.width - Image width in pixels
 * @param {number} params.height - Image height in pixels
 * @returns {Promise<Array>} Array of generated image URLs
 */
async generateImages(params) {
  // Implementation
}
```

## 🚀 Deployment Rules

### 1. Build Process

- **Asset optimization**: Minify CSS/JS for production
- **Environment detection**: Different configs for dev/prod
- **Health checks**: Implement `/health` endpoint

### 2. Version Control

- **Semantic versioning**: Major.Minor.Patch
- **Conventional commits**: `feat:`, `fix:`, `docs:`, etc.
- **Protected branches**: Main branch requires PR review

## 📋 Development Workflow

### 1. Feature Development

1. Create feature branch from main
2. Implement with adherence to file size limits
3. Test locally with all breakpoints
4. Document changes in code and README
5. Submit PR with detailed description

### 2. Implementation Priorities

#### Phase 1: New Runware Features (Current Focus)

1. **🧬 PuLID Implementation**: Backend service + API + Frontend UI
2. **🧼 LayerDiffuse Implementation**: Backend service + API + Frontend UI
3. **⚡️ Accelerator Implementation**: Backend service + API + Frontend UI
4. **🔗 Integration**: Add new features to main UI navigation

#### Phase 2: Enhanced User Experience

1. **📱 Mobile Optimization**: Responsive design for new features
2. **🎨 UI/UX Polish**: Consistent design across all feature pages
3. **📊 Analytics Integration**: Track usage of new features
4. **🧪 Testing**: Comprehensive testing of all new endpoints

#### Phase 3: Advanced Features (Future)

1. **🔄 Batch Processing**: Multiple image generation queues
2. **💾 Result Caching**: Local storage for generated images
3. **🎯 Preset Management**: Save/load generation presets
4. **📈 Usage Dashboard**: Cost tracking and optimization insights

### 3. Code Review Checklist

- [ ] File size under 1000 lines
- [ ] Proper error handling
- [ ] Mobile responsive
- [ ] Accessibility compliance
- [ ] Performance considerations
- [ ] Security best practices
- [ ] Documentation updated

## 🎯 Current Development Focus

### Immediate Action Items (Phase 1):

1. **🧬 Implement PuLID Feature**
   - Add `generatePuLID()` method to `services/runware.js`
   - Create `POST /pulid` endpoint in `routes/image.js`
   - Build `public/pulid.html` and `public/pulid.js`
2. **🧼 Implement LayerDiffuse Feature**

   - Add `generateLayerDiffuse()` method to `services/runware.js`
   - Create `POST /layer-diffuse` endpoint in `routes/image.js`
   - Build `public/layer-diffuse.html` and `public/layer-diffuse.js`

3. **⚡️ Implement Accelerator Methods**

   - Add `generateWithAccelerators()` method to `services/runware.js`
   - Create `POST /accelerated` endpoint in `routes/image.js`
   - Build `public/accelerated.html` and `public/accelerated.js`

4. **🔗 Navigation Integration**
   - Update main navigation to include new features
   - Add feature cards/buttons to main dashboard
   - Implement feature discovery and onboarding

### Completed Items:

- ✅ **Modular backend structure** - Routes, services, middleware separated
- ✅ **File size optimization** - All files under 200 lines
- ✅ **Express setup** - Clean server.js with modular imports
- ✅ **Error handling** - Consistent error responses across APIs

---

_Last updated: [Current Date]_
_Version: 1.0_
_Next review: Weekly until refactoring complete_
