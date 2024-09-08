require('dotenv').config();
const express = require('express');
const path = require('path');
const http = require('http');
const { RunwareServer } = require('@runware/sdk-js');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const mongoose = require('mongoose');
const { KindeClient, GrantType } = require("@kinde-oss/kinde-nodejs-sdk");
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// CORS middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// Initialize RunwareServer with API key
const runware = new RunwareServer({ apiKey: process.env.RUNWARE_API_KEY });

// Middleware for parsing requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// MongoDB connection
mongoose.connect(process.env.MONGO_URL).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('Failed to connect to MongoDB', err);
});

// Session management with MongoDB
app.use(session({
  secret: process.env.SESSION_SECRET || 'default_secret_key', // Ensure a secret is provided
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URL }),
  cookie: {
    domain: process.env.NODE_ENV === 'production' ? '.loveaiart.com' : 'localhost',
    secure: process.env.NODE_ENV === 'production', 
    httpOnly: true, 
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  }
}));

// KindeClient setup
const kindeClient = new KindeClient({
  domain: process.env.KINDE_DOMAIN,
  clientId: process.env.KINDE_CLIENT_ID,
  clientSecret: process.env.KINDE_CLIENT_SECRET,
  redirectUri: process.env.KINDE_REDIRECT_URI,
  logoutRedirectUri: process.env.KINDE_LOGOUT_REDIRECT_URI,
  grantType: GrantType.PKCE,
});

// Redirect www.loveaiart.com to loveaiart.com
app.use((req, res, next) => {
  if (req.headers.host === 'www.loveaiart.com') {
    return res.redirect(301, `https://loveaiart.com${req.url}`);
  }
  next();
});

// Root route - check authentication status and redirect to login if necessary
app.get('/', async (req, res) => {
  try {
    const isAuthenticated = await kindeClient.isAuthenticated(req);
    if (isAuthenticated) {
      res.sendFile(path.join(__dirname, 'public', 'index.html'));
    } else {
      return res.redirect("/login");
    }
  } catch (error) {
    console.error('Error checking authentication:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Login route - starts Kinde login flow
app.get("/login", kindeClient.login(), (req, res) => {
  return res.redirect("/callback");
});

// Callback route - handles Kinde OAuth response
app.get("/callback", kindeClient.callback(), (req, res) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    req.session.user = req.user;
    return res.redirect("/");
  } else {
    res.status(401).send("Authentication failed");
  }
});

// Logout route
app.get("/logout", kindeClient.logout(), (req, res) => {
  return res.redirect("/");
});

// Function to validate prompts
function validatePrompt(prompt) {
  return prompt && typeof prompt === 'string' && prompt.trim() !== '';
}

// Function to enhance prompts
function enhancePrompt(prompt) {
  try {
    if (validatePrompt(prompt)) {
      return `Enhanced: ${prompt} with more specific details`;
    } else {
      console.warn('Received an invalid prompt. Proceeding with the original prompt.');
      return prompt; // Return the original prompt if invalid
    }
  } catch (error) {
    console.error('Error enhancing prompt:', error.message);
    return prompt; // Return the original prompt if enhancement fails
  }
}

// Route to generate images using Runware API
app.post('/generate-image', async (req, res) => {
  try {
    const {
      positivePrompt,
      negativePrompt,
      width,
      height,
      model,
      numberResults,
      outputFormat,
      scheduler,
      steps,
      CFGScale,
      seed,
      lora
    } = req.body;

    // Validate parameters
    if (!validatePrompt(positivePrompt) || !width || !height || !model) {
      return res.status(400).json({ error: 'Missing or invalid required parameters' });
    }

    // Log the received prompts
    console.log('Received positivePrompt:', positivePrompt);
    console.log('Received negativePrompt:', negativePrompt);

    // Enhance the prompts
    const enhancedPositivePrompt = enhancePrompt(positivePrompt);
    const enhancedNegativePrompt = enhancePrompt(negativePrompt);

    const images = await runware.requestImages({
      positivePrompt: enhancedPositivePrompt,
      negativePrompt: enhancedNegativePrompt,
      width: parseInt(width),
      height: parseInt(height),
      model,
      numberResults: parseInt(numberResults) || 1,
      outputType: "URL",
      outputFormat,
      scheduler,
      steps: parseInt(steps),
      CFGScale: parseFloat(CFGScale),
      seed: parseInt(seed),
      checkNSFW: false,
      includeCost: false,
      lora
    });

    res.json(images);
  } catch (error) {
    console.error('Error generating image:', error);
    res.status(500).json({ error: 'An error occurred while generating the image' });
  }
});

// Start the server
const server = app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

// Keep-alive pings
setInterval(() => {
  const pingUrl = `http://localhost:${port}`;
  console.log('Sending keep-alive ping to server...');
  http.get(pingUrl, (res) => {
    console.log(`Keep-alive response status: ${res.statusCode}`);
  }).on('error', (err) => {
    console.error('Error with keep-alive ping:', err.message);
  });
}, 25 * 60 * 1000);