const express = require("express");
const rateLimit = require("express-rate-limit");

const { sendChatMessage } = require("../controllers/chatbotController");

const router = express.Router();

// ==========================================
// CHATBOT RATE LIMITER
// ==========================================

const chatbotLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  limit: 10, // Maximum 10 messages per window

  standardHeaders: "draft-8",
  legacyHeaders: false,

  message: {
    success: false,
    message: "Too many messages. Please try again after a few minutes.",
  },
});

// ==========================================
// SEND CHATBOT MESSAGE
// POST /api/chatbot
// ==========================================

router.post("/", chatbotLimiter, sendChatMessage);

// ==========================================
// EXPORT
// ==========================================

module.exports = router;
