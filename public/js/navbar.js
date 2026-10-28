document.addEventListener("DOMContentLoaded", function () {
  const dropdown = document.getElementById("visaInfoDropdown");
  const dropdownToggle = document.getElementById("visaInfoDropdownToggle");
  const submenu = document.getElementById("visaInfoSubmenu");

  const mobileMenuButton = document.querySelector(".mobile-menu-button");
  const mainNavigation = document.querySelector(".nav-links");

  /* =====================================
     VISA INFO DROPDOWN
  ===================================== */

  function closeVisaDropdown() {
    if (!dropdown || !dropdownToggle || !submenu) return;

    submenu.hidden = true;

    dropdown.classList.remove("is-open");

    dropdownToggle.setAttribute("aria-expanded", "false");
    dropdownToggle.setAttribute("aria-label", "Open Visa Info submenu");
  }

  function openVisaDropdown() {
    if (!dropdown || !dropdownToggle || !submenu) return;

    submenu.hidden = false;

    dropdown.classList.add("is-open");

    dropdownToggle.setAttribute("aria-expanded", "true");
    dropdownToggle.setAttribute("aria-label", "Close Visa Info submenu");
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
    });

    // Close dropdown when clicking outside
    document.addEventListener("click", function (event) {
      if (!dropdown.contains(event.target)) {
        closeVisaDropdown();
      }
    });

    // Close dropdown when pressing Escape
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closeVisaDropdown();
      }
    });
  }

  /* =====================================
     MOBILE HAMBURGER MENU
  ===================================== */

  function closeMobileMenu() {
    if (!mainNavigation || !mobileMenuButton) return;

    mainNavigation.classList.remove("is-active");

    mobileMenuButton.classList.remove("is-active");

    mobileMenuButton.setAttribute("aria-expanded", "false");
    mobileMenuButton.setAttribute("aria-label", "Open navigation menu");
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

      if (!isOpen) {
        closeVisaDropdown();
      }
    });

    // Close menu after clicking a navigation link
    mainNavigation.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        closeMobileMenu();
        closeVisaDropdown();
      });
    });

    // Close mobile menu with Escape
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closeMobileMenu();
      }
    });

    // Close menu when clicking outside on mobile
    document.addEventListener("click", function (event) {
      if (
        window.innerWidth <= 900 &&
        !mainNavigation.contains(event.target) &&
        !mobileMenuButton.contains(event.target)
      ) {
        closeMobileMenu();
        closeVisaDropdown();
      }
    });
  }
});
