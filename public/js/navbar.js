(function () {
  function initializeNavbar() {
    // ==========================================
    // NAVBAR ELEMENTS
    // ==========================================

    const dropdown = document.getElementById("visaInfoDropdown");
    const dropdownToggle = document.getElementById("visaInfoDropdownToggle");
    const submenu = document.getElementById("visaInfoSubmenu");

    const mobileMenuButton = document.getElementById("mobileMenuButton");
    const mainNavigation = document.getElementById("mainNavigation");

    // DESKTOP GET STARTED DROPDOWN
    const getStartedDropdown = document.getElementById("getStartedDropdown");
    const getStartedToggle = document.getElementById("getStartedToggle");
    const getStartedMenu = document.getElementById("getStartedMenu");

    // MOBILE GET STARTED DROPDOWN
    const mobileGetStartedDropdown = document.querySelector(
      ".mobile-get-started-dropdown",
    );

    const mobileGetStartedToggle = document.getElementById(
      "mobileGetStartedToggle",
    );

    const mobileGetStartedMenu = document.getElementById(
      "mobileGetStartedMenu",
    );

    console.log("VisaMaster navbar.js loaded");

    // ==========================================
    // VISA INFO DROPDOWN
    // ==========================================

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

          closeMobileGetStartedDropdown();
        } else {
          closeVisaDropdown();
        }

        console.log("Visa dropdown clicked:", !submenu.hidden);
      });
    } else {
      console.error("Visa dropdown HTML elements missing");
    }

    // ==========================================
    // DESKTOP GET STARTED DROPDOWN
    // ==========================================

    function closeGetStartedDropdown() {
      if (!getStartedDropdown || !getStartedToggle || !getStartedMenu) {
        return;
      }

      getStartedMenu.hidden = true;

      getStartedToggle.setAttribute("aria-expanded", "false");

      getStartedDropdown.classList.remove("is-open");
    }

    function openGetStartedDropdown() {
      if (!getStartedDropdown || !getStartedToggle || !getStartedMenu) {
        return;
      }

      getStartedMenu.hidden = false;

      getStartedToggle.setAttribute("aria-expanded", "true");

      getStartedDropdown.classList.add("is-open");
    }

    if (getStartedDropdown && getStartedToggle && getStartedMenu) {
      getStartedToggle.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();

        if (getStartedMenu.hidden) {
          openGetStartedDropdown();
        } else {
          closeGetStartedDropdown();
        }

        console.log("Desktop Get Started clicked:", !getStartedMenu.hidden);
      });

      console.log("Desktop Get Started dropdown initialized");
    } else {
      console.error("Desktop Get Started HTML elements missing");
    }

    // ==========================================
    // MOBILE GET STARTED DROPDOWN
    // ==========================================

    function closeMobileGetStartedDropdown() {
      if (!mobileGetStartedToggle || !mobileGetStartedMenu) {
        return;
      }

      mobileGetStartedMenu.hidden = true;

      mobileGetStartedToggle.setAttribute("aria-expanded", "false");

      if (mobileGetStartedDropdown) {
        mobileGetStartedDropdown.classList.remove("is-open");
      }
    }

    function openMobileGetStartedDropdown() {
      if (!mobileGetStartedToggle || !mobileGetStartedMenu) {
        return;
      }

      mobileGetStartedMenu.hidden = false;

      mobileGetStartedToggle.setAttribute("aria-expanded", "true");

      if (mobileGetStartedDropdown) {
        mobileGetStartedDropdown.classList.add("is-open");
      }
    }

    if (mobileGetStartedToggle && mobileGetStartedMenu) {
      mobileGetStartedToggle.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();

        if (mobileGetStartedMenu.hidden) {
          openMobileGetStartedDropdown();

          closeVisaDropdown();
        } else {
          closeMobileGetStartedDropdown();
        }

        console.log(
          "Mobile Get Started clicked:",
          !mobileGetStartedMenu.hidden,
        );
      });

      console.log("Mobile Get Started dropdown initialized");
    } else {
      console.warn("Mobile Get Started dropdown elements missing");
    }

    // ==========================================
    // MOBILE NAVIGATION
    // ==========================================

    function closeMobileMenu() {
      if (!mainNavigation || !mobileMenuButton) return;

      mainNavigation.classList.remove("is-active");

      mobileMenuButton.classList.remove("is-active");

      mobileMenuButton.setAttribute("aria-expanded", "false");

      mobileMenuButton.setAttribute("aria-label", "Open navigation menu");

      closeVisaDropdown();

      closeMobileGetStartedDropdown();
    }

    function openMobileMenu() {
      if (!mainNavigation || !mobileMenuButton) return;

      mainNavigation.classList.add("is-active");

      mobileMenuButton.classList.add("is-active");

      mobileMenuButton.setAttribute("aria-expanded", "true");

      mobileMenuButton.setAttribute("aria-label", "Close navigation menu");
    }

    if (mobileMenuButton && mainNavigation) {
      mobileMenuButton.addEventListener("click", function (event) {
        event.preventDefault();

        const isOpen = mainNavigation.classList.contains("is-active");

        if (isOpen) {
          closeMobileMenu();
        } else {
          openMobileMenu();
        }
      });

      // CLOSE MOBILE MENU AFTER CLICKING A NAVIGATION LINK

      mainNavigation.querySelectorAll("a").forEach(function (link) {
        link.addEventListener("click", function () {
          closeMobileMenu();
        });
      });
    }

    // ==========================================
    // OUTSIDE CLICK HANDLING
    // ==========================================

    document.addEventListener("click", function (event) {
      // VISA DROPDOWN
      if (dropdown && !dropdown.contains(event.target)) {
        closeVisaDropdown();
      }

      // DESKTOP GET STARTED
      if (getStartedDropdown && !getStartedDropdown.contains(event.target)) {
        closeGetStartedDropdown();
      }

      // MOBILE GET STARTED
      if (
        mobileGetStartedDropdown &&
        !mobileGetStartedDropdown.contains(event.target)
      ) {
        closeMobileGetStartedDropdown();
      }

      // MOBILE NAVIGATION
      if (
        window.innerWidth <= 900 &&
        mainNavigation &&
        mobileMenuButton &&
        !mainNavigation.contains(event.target) &&
        !mobileMenuButton.contains(event.target)
      ) {
        closeMobileMenu();
      }
    });

    // ==========================================
    // ESCAPE KEY HANDLING
    // ==========================================

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closeVisaDropdown();

        closeGetStartedDropdown();

        closeMobileGetStartedDropdown();

        closeMobileMenu();
      }
    });

    // ==========================================
    // INITIALIZATION COMPLETE
    // ==========================================

    console.log("VisaMaster navbar initialized successfully");
  }

  // ==========================================
  // INITIALIZE NAVBAR
  // ==========================================

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeNavbar, {
      once: true,
    });
  } else {
    initializeNavbar();
  }
})();
