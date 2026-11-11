document.addEventListener("DOMContentLoaded", () => {
  // =======================================================
  // DOM ELEMENTS
  // =======================================================

  const toggle = document.getElementById("vmChatToggle");
  const close = document.getElementById("vmChatClose");
  const windowBox = document.getElementById("vmChatWindow");
  const form = document.getElementById("vmChatForm");
  const input = document.getElementById("vmChatInput");
  const send = document.getElementById("vmChatSend");
  const messages = document.getElementById("vmChatMessages");
  const suggestions = document.getElementById("vmChatSuggestions");

  // Stop if chatbot HTML is unavailable.
  if (
    !toggle ||
    !close ||
    !windowBox ||
    !form ||
    !input ||
    !send ||
    !messages
  ) {
    console.warn("VisaMaster chatbot elements not found.");
    return;
  }

  // =======================================================
  // CHAT STATE
  // =======================================================

  let history = [];
  let isSending = false;

  // =======================================================
  // OPEN CHATBOT
  // =======================================================

  const openChat = () => {
    windowBox.classList.add("open");
    windowBox.setAttribute("aria-hidden", "false");
    toggle.setAttribute("aria-expanded", "true");

    setTimeout(() => input.focus(), 200);
  };

  // =======================================================
  // CLOSE CHATBOT
  // =======================================================

  const closeChat = () => {
    windowBox.classList.remove("open");
    windowBox.setAttribute("aria-hidden", "true");
    toggle.setAttribute("aria-expanded", "false");
  };

  // =======================================================
  // TOGGLE EVENTS
  // =======================================================

  toggle.addEventListener("click", () => {
    if (windowBox.classList.contains("open")) {
      closeChat();
    } else {
      openChat();
    }
  });

  close.addEventListener("click", closeChat);

  // =======================================================
  // CREATE CHAT MESSAGE
  // =======================================================

  const addMessage = (text, sender, formattedHtml = null) => {
    const wrapper = document.createElement("div");
    wrapper.className = `vm-chat-message ${sender}`;

    const bubble = document.createElement("div");
    bubble.className = "vm-chat-bubble";

    if (
      sender === "bot" &&
      typeof formattedHtml === "string" &&
      formattedHtml.trim()
    ) {
      // HTML must be sanitized by chatbotController.js.
      bubble.innerHTML = formattedHtml;
    } else {
      // Always display user messages as plain text.
      bubble.textContent = String(text || "");
    }

    wrapper.appendChild(bubble);
    messages.appendChild(wrapper);

    messages.scrollTop = messages.scrollHeight;

    return wrapper;
  };

  // =======================================================
  // TYPING INDICATOR
  // =======================================================

  const showTyping = () => {
    const wrapper = document.createElement("div");
    wrapper.className = "vm-chat-message bot";

    const bubble = document.createElement("div");
    bubble.className = "vm-chat-typing";

    bubble.textContent = "VisaMaster Assistant is typing...";

    wrapper.appendChild(bubble);
    messages.appendChild(wrapper);

    messages.scrollTop = messages.scrollHeight;

    return wrapper;
  };

  // =======================================================
  // SEND MESSAGE
  // =======================================================

  const sendMessage = async (message) => {
    message = String(message || "").trim();

    if (!message || isSending) return;

    if (message.length > 1000) {
      addMessage("Please keep your message under 1000 characters.", "bot");
      return;
    }

    isSending = true;

    send.disabled = true;
    input.disabled = true;

    send.setAttribute("aria-busy", "true");

    if (suggestions) {
      suggestions.style.display = "none";
    }

    // Display visitor message.
    addMessage(message, "user");

    // Show typing indicator.
    const typing = showTyping();

    try {
      // ---------------------------------------------------
      // API REQUEST
      // ---------------------------------------------------

      const response = await fetch("/api/chatbot", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },

        body: JSON.stringify({
          message,
          history,
        }),
      });

      // ---------------------------------------------------
      // PARSE RESPONSE
      // ---------------------------------------------------

      let data;

      try {
        data = await response.json();
      } catch {
        throw new Error(
          "The server returned an invalid response. Please try again.",
        );
      }

      // ---------------------------------------------------
      // HANDLE API ERRORS
      // ---------------------------------------------------

      if (!response.ok || !data.success) {
        if (response.status === 429) {
          throw new Error(
            data.message ||
              "You've reached the message limit. Please try again after a few minutes.",
          );
        }

        throw new Error(
          data.message || "Unable to get a response. Please try again.",
        );
      }

      // ---------------------------------------------------
      // DISPLAY FORMATTED AI RESPONSE
      // ---------------------------------------------------

      addMessage(
        data.answer || "Sorry, I couldn't generate an answer.",
        "bot",
        data.answerHtml,
      );

      // ---------------------------------------------------
      // UPDATE CONVERSATION HISTORY
      // ---------------------------------------------------

      history.push(
        {
          role: "user",
          text: message,
        },
        {
          role: "model",
          text: data.answer || "",
        },
      );

      // Keep only the latest six messages.
      history = history.slice(-6);
    } catch (error) {
      console.error("VisaMaster Chatbot Error:", error);

      addMessage(
        error.message || "Sorry, something went wrong. Please try again.",
        "bot",
      );
    } finally {
      // ---------------------------------------------------
      // RESET CHAT INPUT
      // ---------------------------------------------------

      typing.remove();

      isSending = false;

      send.disabled = false;
      input.disabled = false;

      send.removeAttribute("aria-busy");

      messages.scrollTop = messages.scrollHeight;

      input.focus();
    }
  };

  // =======================================================
  // FORM SUBMISSION
  // =======================================================

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (isSending) return;

    const message = input.value.trim();

    if (!message) return;

    input.value = "";

    sendMessage(message);
  });

  // =======================================================
  // SUGGESTED QUESTIONS
  // =======================================================

  if (suggestions) {
    suggestions.addEventListener("click", (event) => {
      const button = event.target.closest("[data-question]");

      if (!button || isSending) return;

      const question = button.dataset.question;

      if (!question) return;

      openChat();

      sendMessage(question);
    });
  }

  // =======================================================
  // ESCAPE KEY CLOSE
  // =======================================================

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && windowBox.classList.contains("open")) {
      closeChat();
    }
  });

  console.log("VisaMaster Chatbot initialized successfully.");
});
