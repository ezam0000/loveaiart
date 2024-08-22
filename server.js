require('dotenv').config();
const express = require('express');
const path = require('path');
const http = require('http');
const { RunwareServer } = require('@runware/sdk-js');
const passport = require('passport');
const session = require('express-session');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const app = express();
const port = process.env.PORT || 3000;

// Initialize RunwareServer with your API key
const runware = new RunwareServer({ apiKey: process.env.RUNWARE_API_KEY });

// Middleware for parsing JSON and serving static files
app.use(express.json());
app.use(express.static('public'));

// Session middleware
app.use(session({
  secret: 'your_secret_key', // Replace with a secure key in production
  resave: false,
  saveUninitialized: true,
}));

app.use(passport.initialize());
app.use(passport.session());

// Google OAuth configuration
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback'
  },
  function(accessToken, refreshToken, profile, done) {
    // Here you can save the user profile to your database if needed
    return done(null, profile);
  }
));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// Route to initiate Google OAuth
app.get('/auth/google', 
  passport.authenticate('google', { scope: ['profile', 'email'] }));

// Route to handle callback from Google
app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/'); // On successful authentication, redirect to home
  });

// Route to handle logout
app.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

// Home route, displays different content based on authentication status
app.get('/', (req, res) => {
  if (req.isAuthenticated()) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  } else {
    res.sendFile(path.join(__dirname, 'public', 'login.html')); // Serve the login page if not authenticated
  }
});

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
      lora // LoRA parameter
    } = req.body;

    const images = await runware.requestImages({
      positivePrompt,
      negativePrompt,
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
      checkNSFW: true,
      includeCost: false,
      lora // Pass LoRA as received
    });

    res.json(images);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while generating the image' });
  }
});

// Start the server
const server = app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

// Keep-alive pings to maintain server connection
const keepAliveInterval = 25 * 60 * 1000; // 25 minutes in milliseconds
setInterval(() => {
  const pingUrl = `http://localhost:${port}`; // Updated to reflect current port
  console.log('Sending keep-alive ping to server...');
  http.get(pingUrl, (res) => {
    console.log(`Keep-alive response status: ${res.statusCode}`);
  }).on('error', (err) => {
    console.error('Error with keep-alive ping:', err.message);
  });
}, keepAliveInterval);