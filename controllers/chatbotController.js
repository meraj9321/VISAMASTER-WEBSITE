const { generateVisaAnswer } = require("../services/visaChatbotService");
const { marked } = require("marked");
const sanitizeHtml = require("sanitize-html");

// Configure Markdown
marked.setOptions({
  gfm: true,
  breaks: true,
});

const sendChatMessage = async (req, res) => {
  try {
    const message = String(req.body.message || "").trim();

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Please enter a message.",
      });
    }

    if (message.length > 1000) {
      return res.status(400).json({
        success: false,
        message: "Your message is too long.",
      });
    }

    const history = Array.isArray(req.body.history)
      ? req.body.history.slice(-6)
      : [];

    // Generate AI answer
    const answer = await generateVisaAnswer(message, history);

    // Convert Markdown into HTML
    const rawHtml = marked.parse(answer);

    // Remove unsafe HTML and attributes
    const answerHtml = sanitizeHtml(rawHtml, {
      allowedTags: [
        "p",
        "br",
        "strong",
        "b",
        "em",
        "i",
        "h1",
        "h2",
        "h3",
        "h4",
        "ul",
        "ol",
        "li",
        "blockquote",
        "hr",
        "a",
        "code",
        "pre",
        "table",
        "thead",
        "tbody",
        "tr",
        "th",
        "td",
      ],
      allowedAttributes: {
        a: ["href", "title"],
      },
      allowedSchemes: ["http", "https", "mailto"],
    });

    return res.json({
      success: true,
      answer,
      answerHtml,
    });
  } catch (error) {
    console.error("VISAMASTER CHATBOT ERROR:", error);

    return res.status(500).json({
      success: false,
      message:
        "Our assistant is temporarily unavailable. Please try again later.",
    });
  }
};

module.exports = { sendChatMessage };
