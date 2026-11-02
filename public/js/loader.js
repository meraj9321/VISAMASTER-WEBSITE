/* =========================================
   VISAMASTER MINIMAL PAGE LOADER
========================================= */

(function () {
  const loader = document.getElementById("vm-page-loader");

  if (!loader) return;

  function hideLoader() {
    loader.classList.add("vm-loader-hidden");
    loader.setAttribute("aria-hidden", "true");
  }

  function showLoader() {
    loader.classList.remove("vm-loader-hidden");
    loader.setAttribute("aria-hidden", "false");
  }

  // Hide loader after complete page loading
  if (document.readyState === "complete") {
    hideLoader();
  } else {
    window.addEventListener("load", hideLoader, { once: true });
  }

  // Handle internal page navigation
  document.addEventListener("click", function (event) {
    const link = event.target.closest("a[href]");

    if (!link) return;

    if (
      event.button !== 0 ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey ||
      event.altKey ||
      link.hasAttribute("download") ||
      link.target === "_blank"
    ) {
      return;
    }

    const href = link.getAttribute("href");

    if (
      !href ||
      href.startsWith("#") ||
      href.startsWith("javascript:") ||
      href.startsWith("mailto:") ||
      href.startsWith("tel:")
    ) {
      return;
    }

    let destination;

    try {
      destination = new URL(href, window.location.href);
    } catch {
      return;
    }

    if (destination.origin !== window.location.origin) return;

    if (destination.href === window.location.href) return;

    // Show loader before navigation
    showLoader();
  });

  // Handle browser back/forward cache
  window.addEventListener("pageshow", function () {
    hideLoader();
  });
})();
