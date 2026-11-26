document.addEventListener("DOMContentLoaded", function () {
  // ==========================================
  // ENQUIRY FORM LOADING STATE
  // ==========================================

  const enquiryForm = document.getElementById("enquiryForm");

  const enquirySubmitBtn = document.getElementById("enquirySubmitBtn");

  const enquiryBtnText = enquirySubmitBtn
    ? enquirySubmitBtn.querySelector(".enquiry-btn-text")
    : null;

  if (enquiryForm && enquirySubmitBtn) {
    enquiryForm.addEventListener("submit", function (event) {
      if (!enquiryForm.checkValidity()) {
        event.preventDefault();
        enquiryForm.reportValidity();

        return;
      }

      // Prevent duplicate submissions
      if (enquirySubmitBtn.classList.contains("is-loading")) {
        event.preventDefault();

        return;
      }

      // Loading state
      enquirySubmitBtn.classList.add("is-loading");

      enquirySubmitBtn.disabled = true;

      enquirySubmitBtn.setAttribute("aria-busy", "true");

      if (enquiryBtnText) {
        enquiryBtnText.textContent = "Sending Enquiry...";
      }
    });
  }

  // ==========================================
  // SUCCESS POPUP ELEMENTS
  // ==========================================

  const popup = document.getElementById("enquirySuccessPopup");

  const closeButton = document.getElementById("closeSuccessPopup");

  const okButton = document.getElementById("successPopupOk");

  // ==========================================
  // CLOSE POPUP FUNCTION
  // ==========================================

  function closeSuccessPopup() {
    if (!popup) {
      return;
    }

    popup.style.opacity = "0";

    setTimeout(function () {
      popup.remove();

      // Remove success parameter from URL
      const url = new URL(window.location.href);

      url.searchParams.delete("success");

      window.history.replaceState(
        {},
        document.title,
        url.pathname + url.search + url.hash,
      );
    }, 200);
  }

  // ==========================================
  // CLOSE ICON BUTTON
  // ==========================================

  if (closeButton) {
    closeButton.addEventListener("click", closeSuccessPopup);
  }

  // ==========================================
  // OK BUTTON
  // ==========================================

  if (okButton) {
    okButton.addEventListener("click", closeSuccessPopup);
  }

  // ==========================================
  // CLICK OUTSIDE POPUP
  // ==========================================

  if (popup) {
    popup.addEventListener("click", function (event) {
      if (event.target === popup) {
        closeSuccessPopup();
      }
    });
  }

  // ==========================================
  // ESCAPE KEY
  // ==========================================

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && popup) {
      closeSuccessPopup();
    }
  });
});
