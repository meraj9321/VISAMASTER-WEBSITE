/* =========================================================
VISAMASTER VISA REQUIREMENTS CATEGORY TABS
------------------------------------------

Features:

1. Switch visa categories without page refresh
2. Read selected visa category from URL
3. Activate the correct tab after redirect
4. Smooth tab navigation
5. Mobile-friendly category navigation
6. Swipe left/right to change categories
7. Keyboard navigation with ArrowLeft, ArrowRight,
   Home and End keys
8. Does not modify main.js

Example URLs:
/countries/uae/requirements?visa=tourist
/countries/uae/requirements?visa=business
========================================================= */

(() => {
  "use strict";

  const initializeVisaTabs = () => {
    const tabList = document.querySelector(".visa-category-tabs");

    // Stop if this is not the visa requirements page.
    if (!tabList) {
      return;
    }

    const tabs = Array.from(tabList.querySelectorAll("[data-visa-tab]"));

    const panels = Array.from(document.querySelectorAll("[data-visa-panel]"));

    const status = document.querySelector(".visa-category-slider-status");

    // Stop safely if tabs or panels are missing.
    if (!tabs.length || !panels.length) {
      return;
    }

    // Respect the user's reduced-motion preference.
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );

    /* =====================================================
   FIND CATEGORY FROM URL
===================================================== */

    const params = new URLSearchParams(window.location.search);

    const requestedVisa = (params.get("visa") || "").trim().toLowerCase();

    /*
  Match the URL category against the database visa slug.

  Example:
  ?visa=tourist
  matches data-visa-slug="tourist"
*/

    let activeIndex = -1;

    if (requestedVisa) {
      activeIndex = tabs.findIndex((tab) => {
        const slug = (tab.dataset.visaSlug || "").trim().toLowerCase();

        return slug === requestedVisa;
      });
    }

    /*
  Backward compatibility:
  If no matching URL category exists, retain the
  category already marked as selected in the EJS.
*/

    if (activeIndex < 0) {
      activeIndex = tabs.findIndex(
        (tab) => tab.getAttribute("aria-selected") === "true",
      );
    }

    // Final fallback.
    if (activeIndex < 0) {
      activeIndex = 0;
    }

    /* =====================================================
   ACTIVATE SELECTED CATEGORY
===================================================== */

    const activateTab = (index, options = {}) => {
      if (index < 0 || index >= tabs.length) {
        return;
      }

      activeIndex = index;

      // Update selected tab states.
      tabs.forEach((tab, tabIndex) => {
        const isSelected = tabIndex === index;

        tab.setAttribute("aria-selected", String(isSelected));

        tab.setAttribute("tabindex", isSelected ? "0" : "-1");
      });

      // Show only the selected requirements panel.
      panels.forEach((panel, panelIndex) => {
        const isSelected = panelIndex === index;

        panel.hidden = !isSelected;

        panel.classList.toggle("is-active", isSelected);
      });

      // Update the category counter.
      if (status) {
        status.textContent = `Showing category ${index + 1} of ${tabs.length}`;
      }

      // Scroll the selected tab into view.
      if (options.scrollTab) {
        tabs[index].scrollIntoView({
          behavior: prefersReducedMotion.matches ? "auto" : "smooth",
          block: "nearest",
          inline: "nearest",
        });
      }

      // Move keyboard focus when requested.
      if (options.focus) {
        tabs[index].focus();
      }
    };

    /* =====================================================
   CATEGORY CLICK EVENTS
===================================================== */

    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => {
        activateTab(index, {
          scrollTab: true,
        });
      });

      /* ===================================================
     KEYBOARD NAVIGATION
  =================================================== */

      tab.addEventListener("keydown", (event) => {
        let nextIndex = index;

        switch (event.key) {
          case "ArrowRight":
            nextIndex = (index + 1) % tabs.length;
            break;

          case "ArrowLeft":
            nextIndex = (index - 1 + tabs.length) % tabs.length;
            break;

          case "Home":
            nextIndex = 0;
            break;

          case "End":
            nextIndex = tabs.length - 1;
            break;

          default:
            return;
        }

        event.preventDefault();

        activateTab(nextIndex, {
          focus: true,
          scrollTab: true,
        });
      });
    });

    /* =====================================================
   MOBILE SWIPE NAVIGATION
===================================================== */

    const panelsContainer = document.querySelector(".visa-tab-panels");

    if (panelsContainer) {
      let startX = 0;
      let startY = 0;

      panelsContainer.addEventListener(
        "touchstart",
        (event) => {
          if (!event.changedTouches.length) {
            return;
          }

          startX = event.changedTouches[0].clientX;
          startY = event.changedTouches[0].clientY;
        },
        { passive: true },
      );

      panelsContainer.addEventListener(
        "touchend",
        (event) => {
          if (!event.changedTouches.length) {
            return;
          }

          const endX = event.changedTouches[0].clientX;
          const endY = event.changedTouches[0].clientY;

          const deltaX = endX - startX;
          const deltaY = endY - startY;

          // Ignore small movements and vertical scrolling.
          if (
            Math.abs(deltaX) < 65 ||
            Math.abs(deltaX) < Math.abs(deltaY) * 1.25
          ) {
            return;
          }

          // Swipe left: next category.
          if (deltaX < 0 && activeIndex < tabs.length - 1) {
            activateTab(activeIndex + 1, {
              scrollTab: true,
            });
          }

          // Swipe right: previous category.
          else if (deltaX > 0 && activeIndex > 0) {
            activateTab(activeIndex - 1, {
              scrollTab: true,
            });
          }
        },
        { passive: true },
      );
    }

    /* =====================================================
   INITIALIZE SELECTED CATEGORY
===================================================== */

    activateTab(activeIndex, {
      scrollTab: Boolean(requestedVisa && activeIndex >= 0),
    });
  };

  // Initialize safely after the HTML has loaded.
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeVisaTabs, {
      once: true,
    });
  } else {
    initializeVisaTabs();
  }
})();
