(function () {
  function initializeNavbar() {
    const dropdown = document.getElementById("visaInfoDropdown");
    const dropdownToggle = document.getElementById("visaInfoDropdownToggle");
    const submenu = document.getElementById("visaInfoSubmenu");

    const mobileMenuButton = document.querySelector(".mobile-menu-button");
    const mainNavigation = document.querySelector(".nav-links");

    console.log("VisaMaster navbar.js loaded");

    // VISA INFO DROPDOWN
    function closeVisaDropdown() {
      if (!dropdown || !dropdownToggle || !submenu) return;

      submenu.hidden = true;
      dropdown.classList.remove("is-open");
      dropdownToggle.setAttribute("aria-expanded", "false");
    }

    function openVisaDropdown() {
      if (!dropdown || !dropdownToggle || !submenu) return;

      submenu.hidden = false;
      dropdown.classList.add("is-open");
      dropdownToggle.setAttribute("aria-expanded", "true");
    }

    if (dropdown && dropdownToggle && submenu) {
      dropdownToggle.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();

        if (submenu.hidden) {
          openVisaDropdown();
        } else {
          closeVisaDropdown();
        }

        console.log("Visa dropdown clicked:", !submenu.hidden);
      });

      document.addEventListener("click", function (event) {
        if (!dropdown.contains(event.target)) {
          closeVisaDropdown();
        }
      });

      document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
          closeVisaDropdown();
        }
      });
    } else {
      console.error("Visa dropdown HTML elements missing");
    }

    // MOBILE NAVIGATION
    function closeMobileMenu() {
      if (!mainNavigation || !mobileMenuButton) return;

      mainNavigation.classList.remove("is-active");
      mobileMenuButton.classList.remove("is-active");
      mobileMenuButton.setAttribute("aria-expanded", "false");
      mobileMenuButton.setAttribute("aria-label", "Open navigation menu");

      closeVisaDropdown();
    }

    if (mobileMenuButton && mainNavigation) {
      mobileMenuButton.addEventListener("click", function (event) {
        event.preventDefault();

        const isOpen = mainNavigation.classList.toggle("is-active");

        mobileMenuButton.classList.toggle("is-active", isOpen);
        mobileMenuButton.setAttribute("aria-expanded", String(isOpen));
        mobileMenuButton.setAttribute(
          "aria-label",
          isOpen ? "Close navigation menu" : "Open navigation menu",
        );

        if (!isOpen) closeVisaDropdown();
      });

      mainNavigation.querySelectorAll("a").forEach(function (link) {
        link.addEventListener("click", closeMobileMenu);
      });

      document.addEventListener("click", function (event) {
        if (
          window.innerWidth <= 900 &&
          !mainNavigation.contains(event.target) &&
          !mobileMenuButton.contains(event.target)
        ) {
          closeMobileMenu();
        }
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeNavbar, {
      once: true,
    });
  } else {
    initializeNavbar();
  }
})();
