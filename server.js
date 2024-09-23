require('dotenv').config();
const express = require('express');
const path = require('path');
const http = require('http');
const { RunwareServer } = require('@runware/sdk-js');


const app = express();
const port = process.env.PORT || 3000;

// Initialize RunwareServer with your API key
const runware = new RunwareServer({ apiKey: process.env.RUNWARE_API_KEY });

// Middleware for parsing JSON and serving static files
app.use(express.json());
app.use(express.static('public'));

// Middleware to redirect www.loveaiart.com to loveaiart.com
app.use((req, res, next) => {
  if (req.headers.host === 'www.loveaiart.com') {
    return res.redirect(301, `https://loveaiart.com${req.url}`);
  }
  next();
});

// Route to handle logout
app.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) { return next(err); }
    req.session.destroy(() => {
      console.log('User logged out, session destroyed');
      res.clearCookie('connect.sid', { path: '/' });  // Clear the session cookie
      res.redirect('/');
    });
  });
});

// Home route, displays different content based on authentication status
app.get('/', (req, res) => {
  console.log('Checking if user is authenticated...');
  console.log('User authenticated:', req.isAuthenticated());
  console.log('User session:', req.session);  // Log the session object for debugging

  if (req.isAuthenticated()) {
    console.log('User is authenticated. Serving index.html');
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  } else {
    console.log('User is not authenticated. Redirecting to login.');
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
      checkNSFW: false,
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