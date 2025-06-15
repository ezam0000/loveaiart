/**
 * Validation Middleware
 * Common validation and middleware functions
 */

/**
 * Middleware to redirect www to non-www
 */
const redirectWWW = (req, res, next) => {
  if (req.headers.host === "www.realengine.app") {
    return res.redirect(301, `https://realengine.app${req.url}`);
  }
  next();
};

/**
 * Generate UUID utility function
 */
function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

module.exports = {
  redirectWWW,
  generateUUID,
};
