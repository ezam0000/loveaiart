/**
 * API Utility Routes
 * Handles authentication, logout, and utility endpoints
 */

const express = require("express");
const path = require("path");

const router = express.Router();

// Random prompts data
const randomPrompts = [
  "A majestic dragon soaring through a stormy sky with lightning bolts",
  "A cozy cabin in a snow-covered forest with warm light glowing from windows",
  "A futuristic cityscape with flying cars and neon lights reflecting on wet streets",
  "A serene lake surrounded by autumn trees with golden reflections",
  "A magical garden with glowing flowers and fairy lights at twilight",
  "A vintage steam train crossing a stone bridge over a misty valley",
  "A cyberpunk street market with holographic signs and diverse characters",
  "A peaceful beach at sunset with palm trees silhouetted against orange sky",
  "A medieval castle on a cliff overlooking a turbulent ocean",
  "A space station orbiting a colorful nebula with distant stars",
  "A steampunk workshop filled with intricate brass machinery and gears",
  "A mystical forest path with ancient trees and dappled sunlight",
  "A bustling Tokyo street at night with colorful neon reflections",
  "A desert oasis with crystal clear water and date palms",
  "A floating island in the clouds with waterfalls cascading down",
  "A cozy bookshop with towering shelves and warm reading nooks",
  "A Viking longship sailing through icy fjords under aurora borealis",
  "A tropical underwater coral reef teeming with colorful fish",
  "A mountain summit at dawn with clouds below and peaks in distance",
  "A lavender field in Provence with an old stone farmhouse",
];

// Route to handle logout
router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.session.destroy(() => {
      console.log("User logged out, session destroyed");
      res.clearCookie("connect.sid", { path: "/" });
      res.redirect("/");
    });
  });
});

// Force logout route for testing
router.get("/force-logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.session.destroy(() => {
      console.log("Force logout, session destroyed");
      res.redirect("/");
    });
  });
});

// Home route
router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

// Separate login route
router.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "login.html"));
});

// Route to get random prompts
router.get("/random-prompt", (req, res) => {
  res.json({
    prompts: randomPrompts,
  });
});

module.exports = router;
