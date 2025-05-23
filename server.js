/**
 * LoveAIArt Server - Modular Architecture
 * Main server file using modular routes and services
 */

require("dotenv").config();
const express = require("express");
const http = require("http");
const { redirectWWW } = require("./middleware/validation");

// Import route modules
const imageRoutes = require("./routes/image");
const chatRoutes = require("./routes/chat");
const apiRoutes = require("./routes/api");

const app = express();
const port = process.env.PORT || 3000;

// Middleware for parsing JSON and serving static files
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(express.static("public"));

// Apply middleware
app.use(redirectWWW);

// Mount route modules
app.use("/", imageRoutes); // Image generation routes
app.use("/", chatRoutes); // Chat routes
app.use("/", apiRoutes); // API utility routes

// Start the server
const server = app.listen(port, () => {
  console.log(`🚀 LoveAIArt Server running at http://localhost:${port}`);
  console.log("📁 Modular architecture loaded:");
  console.log("   ✅ Image generation routes");
  console.log("   ✅ Chat functionality routes");
  console.log("   ✅ API utility routes");
  console.log("   ✅ Runware service");
  console.log("   ✅ OpenAI service");
});

// Keep-alive pings to maintain server connection
const keepAliveInterval = 25 * 60 * 1000; // 25 minutes
setInterval(() => {
  const pingUrl = `http://localhost:${port}`;
  console.log("🏓 Sending keep-alive ping...");
  http
    .get(pingUrl, (res) => {
      console.log(`✅ Keep-alive response: ${res.statusCode}`);
    })
    .on("error", (err) => {
      console.error("❌ Keep-alive error:", err.message);
    });
}, keepAliveInterval);
