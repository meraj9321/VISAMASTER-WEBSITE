/* =========================================
   VISAMASTER PAGE LOADER
========================================= */

(function () {
  const loader = document.getElementById("vm-page-loader");

  if (!loader) return;

  let pageIsReady = document.readyState === "complete";

  // Hide loader when the page finishes loading.
  function hideLoader() {
    pageIsReady = true;

    loader.classList.add("vm-loader-hidden");

    // Remove loader from keyboard and screen-reader interaction.
    loader.setAttribute("aria-hidden", "true");
  }

  // Show loader before navigating to another local page.
  function showLoader() {
    if (pageIsReady) {
      loader.classList.remove("vm-loader-hidden");
      loader.setAttribute("aria-hidden", "false");
    }
  }

  // Hide loader once all page resources have loaded.
  if (pageIsReady) {
    hideLoader();
  } else {
    window.addEventListener("load", hideLoader, { once: true });
  }

  // Handle navigation links.
  document.addEventListener("click", function (event) {
    const link = event.target.closest("a[href]");

    if (!link) return;

    // Ignore modified clicks, downloads, and non-left clicks.
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

    // Ignore empty links, anchors, and JavaScript links.
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

    // Only handle navigation within this website.
    if (destination.origin !== window.location.origin) return;

    // Don't show the loader for the current URL.
    if (destination.href === window.location.href) return;

    showLoader();
  });

  // Restore the loader's hidden state when returning from browser cache.
  window.addEventListener("pageshow", function (event) {
    if (event.persisted) {
      hideLoader();
    }
  });
})();
