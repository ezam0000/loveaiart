require('dotenv').config();
const express = require('express');
const path = require('path');
const http = require('http');
const { RunwareServer } = require('@runware/sdk-js');
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const mongoose = require('mongoose');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const app = express();
const port = process.env.PORT || 3000;

// Initialize RunwareServer with your API key
const runware = new RunwareServer({ apiKey: process.env.RUNWARE_API_KEY });

// Middleware for parsing JSON and serving static files
app.use(express.json());
app.use(express.static('public'));

// MongoDB connection with error handling
mongoose.connect(process.env.MONGO_URL).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('Failed to connect to MongoDB', err);
});

// Session middleware with MongoDB session store and domain configuration
app.use(session({
  secret: 'your_secret_key', // Replace with a secure key in production
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ 
    mongoUrl: process.env.MONGO_URL
  }),
  cookie: {
    domain: '.loveaiart.com', // Applies to all subdomains of loveaiart.com
    secure: true, // Ensures cookies are only sent over HTTPS
  }
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
    console.log('Google authentication successful, user profile:', profile);
    return done(null, profile);
  }
));

passport.serializeUser((user, done) => {
  console.log('Serializing user:', user);
  done(null, user);
});

passport.deserializeUser((user, done) => {
  console.log('Deserializing user:', user);
  done(null, user);
});

// Middleware to redirect www.loveaiart.com to loveaiart.com
app.use((req, res, next) => {
  if (req.headers.host === 'www.loveaiart.com') {
    return res.redirect(301, `https://loveaiart.com${req.url}`);
  }
  next();
});

// Route to initiate Google OAuth
app.get('/auth/google', 
  passport.authenticate('google', { scope: ['profile', 'email'] }));

// Route to handle callback from Google
app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    console.log('Google OAuth callback successful, redirecting to home');
    res.redirect('/'); // On successful authentication, redirect to home
  });

// Route to handle logout
app.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) { return next(err); }
    req.session.destroy(() => {
      console.log('User logged out, session destroyed');
      res.redirect('/');
    });
  });
});

// Home route, displays different content based on authentication status
app.get('/', (req, res) => {
  console.log('User authenticated:', req.isAuthenticated());
  console.log('Session:', req.session);  // Log the session object for debugging
  if (req.isAuthenticated()) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  } else {
    res.redirect('/login');  // Redirect to login page if not authenticated
  }
});

// Separate login route
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
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
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred while generating the image' });
  }
});

// Force logout route for testing
app.get('/force-logout', (req, res) => {
  req.logout((err) => {
    if (err) { return next(err); }
    req.session.destroy(() => {
      console.log('Force logout, session destroyed');
      res.redirect('/');
    });
  });
});

// Start the server
const server = app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

// Keep-alive pings to maintain server connection
const keepAliveInterval = 25 * 60 * 1000; // 25 minutes in milliseconds
setInterval(() => {
  const pingUrl = `http://localhost:${port}`;
  console.log('Sending keep-alive ping to server...');
  http.get(pingUrl, (res) => {
    console.log(`Keep-alive response status: ${res.statusCode}`);
  }).on('error', (err) => {
    console.error('Error with keep-alive ping:', err.message);
  });
}, keepAliveInterval);