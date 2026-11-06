/* =========================================================
   VISAMASTER REQUIREMENTS PAGE
   Features:
   - Visa purpose tab switching
   - Smooth transitions
   - URL subcategory updates
   - Keyboard navigation
   - Mobile swipe navigation
   - Country image fallback
   - Reduced-motion accessibility
========================================================= */

(() => {
  "use strict";

  const initializeRequirementsPage = () => {
    /* =========================================
       COUNTRY IMAGE FALLBACK
    ========================================= */

    document
      .querySelectorAll(".requirements-country-image")
      .forEach((image) => {
        image.addEventListener(
          "error",
          () => {
            image.hidden = true;

            const fallback = image.nextElementSibling;

            if (fallback) {
              fallback.hidden = false;
            }
          },
          { once: true },
        );
      });

    /* =========================================
       VISA TABS
    ========================================= */

    const tabList = document.querySelector(".visa-category-tabs");

    if (!tabList) return;

    const tabs = Array.from(tabList.querySelectorAll("[data-visa-tab]"));

    const panels = Array.from(document.querySelectorAll("[data-visa-panel]"));

    const status = document.querySelector(".visa-category-slider-status");

    const panelsContainer = document.querySelector(".visa-tab-panels");

    if (!tabs.length || !panels.length) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const params = new URLSearchParams(window.location.search);

    const requestedSubcategory = (
      params.get("subcategory") ||
      params.get("visa") ||
      ""
    )
      .trim()
      .toLowerCase();

    /* =========================================
       FIND INITIAL TAB
    ========================================= */

    let activeIndex = requestedSubcategory
      ? tabs.findIndex(
          (tab) =>
            (tab.dataset.visaSlug || "").toLowerCase() === requestedSubcategory,
        )
      : -1;

    if (activeIndex < 0) {
      activeIndex = tabs.findIndex(
        (tab) => tab.getAttribute("aria-selected") === "true",
      );
    }

    if (activeIndex < 0) {
      activeIndex = 0;
    }

    let transitionId = 0;

    /* =========================================
       ACTIVATE TAB
    ========================================= */

    const activateTab = (index, options = {}) => {
      if (index < 0 || index >= tabs.length) return;

      if (index === activeIndex && options.initial !== true) {
        if (options.focus) {
          tabs[index].focus();
        }

        return;
      }

      const previousIndex = activeIndex;

      activeIndex = index;

      transitionId++;

      const currentTransition = transitionId;

      const animate = !reducedMotion.matches && options.initial !== true;

      /* Update tab accessibility states */

      tabs.forEach((tab, tabIndex) => {
        const selected = tabIndex === index;

        tab.setAttribute("aria-selected", String(selected));

        tab.setAttribute("tabindex", selected ? "0" : "-1");
      });

      /* Find corresponding panels */

      const incomingPanel = panels.find(
        (panel) => Number(panel.dataset.visaPanel) === index,
      );

      const outgoingPanel = panels.find(
        (panel) => Number(panel.dataset.visaPanel) === previousIndex,
      );

      if (!incomingPanel) return;

      /* Cancel previous animations */

      panels.forEach((panel) => {
        if (typeof panel.getAnimations === "function") {
          panel.getAnimations().forEach((animation) => {
            animation.cancel();
          });
        }
      });

      /* Hide unrelated panels */

      panels.forEach((panel) => {
        if (panel !== incomingPanel && panel !== outgoingPanel) {
          panel.hidden = true;

          panel.classList.remove("is-active", "is-entering", "is-leaving");
        }
      });

      /* Outgoing panel */

      if (outgoingPanel && outgoingPanel !== incomingPanel) {
        outgoingPanel.classList.remove("is-active", "is-entering");

        outgoingPanel.classList.add("is-leaving");
      }

      /* Incoming panel */

      incomingPanel.hidden = false;

      incomingPanel.classList.remove("is-leaving", "is-entering");

      incomingPanel.classList.add("is-active");

      /* Animate incoming content */

      if (animate && typeof incomingPanel.animate === "function") {
        incomingPanel.animate(
          [
            {
              opacity: 0,
              transform: "translateY(9px)",
            },
            {
              opacity: 1,
              transform: "translateY(0)",
            },
          ],
          {
            duration: 260,
            easing: "cubic-bezier(0.22, 1, 0.36, 1)",
            fill: "none",
          },
        );

        /* Animate outgoing content */

        if (
          outgoingPanel &&
          outgoingPanel !== incomingPanel &&
          typeof outgoingPanel.animate === "function"
        ) {
          const exitAnimation = outgoingPanel.animate(
            [
              {
                opacity: 1,
                transform: "translateY(0)",
              },
              {
                opacity: 0,
                transform: "translateY(-5px)",
              },
            ],
            {
              duration: 140,
              easing: "ease-in",
              fill: "forwards",
            },
          );

          exitAnimation.finished
            .then(() => {
              if (currentTransition !== transitionId) {
                return;
              }

              outgoingPanel.hidden = true;

              outgoingPanel.classList.remove("is-leaving");
            })
            .catch(() => {
              // Animation cancelled during rapid tab switching.
            });
        }
      } else {
        panels.forEach((panel) => {
          const isCurrent = panel === incomingPanel;

          panel.hidden = !isCurrent;

          panel.classList.toggle("is-active", isCurrent);

          panel.classList.remove("is-entering", "is-leaving");
        });
      }

      /* Update status */

      if (status) {
        status.textContent = `Showing purpose ${index + 1} of ${tabs.length}`;
      }

      /* Keep selected tab visible */

      if (options.scrollTab) {
        tabs[index].scrollIntoView({
          behavior: reducedMotion.matches ? "auto" : "smooth",

          block: "nearest",

          inline: "nearest",
        });
      }

      /* Focus selected tab */

      if (options.focus) {
        tabs[index].focus();
      }

      /* Update URL without page reload */

      if (options.updateUrl) {
        const url = new URL(window.location.href);

        url.searchParams.set("subcategory", tabs[index].dataset.visaSlug || "");

        window.history.replaceState({}, "", url);
      }
    };

    /* =========================================
       CLICK AND KEYBOARD NAVIGATION
    ========================================= */

    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => {
        activateTab(index, {
          scrollTab: true,
          updateUrl: true,
        });
      });

      tab.addEventListener("keydown", (event) => {
        let nextIndex = index;

        if (event.key === "ArrowRight") {
          nextIndex = (index + 1) % tabs.length;
        } else if (event.key === "ArrowLeft") {
          nextIndex = (index - 1 + tabs.length) % tabs.length;
        } else if (event.key === "Home") {
          nextIndex = 0;
        } else if (event.key === "End") {
          nextIndex = tabs.length - 1;
        } else {
          return;
        }

        event.preventDefault();

        activateTab(nextIndex, {
          focus: true,
          scrollTab: true,
          updateUrl: true,
        });
      });
    });

    /* =========================================
       MOBILE SWIPE NAVIGATION
    ========================================= */

    if (panelsContainer) {
      let startX = 0;
      let startY = 0;

      panelsContainer.addEventListener(
        "touchstart",
        (event) => {
          if (!event.changedTouches.length) return;

          startX = event.changedTouches[0].clientX;

          startY = event.changedTouches[0].clientY;
        },
        { passive: true },
      );

      panelsContainer.addEventListener(
        "touchend",
        (event) => {
          if (!event.changedTouches.length) return;

          const dx = event.changedTouches[0].clientX - startX;

          const dy = event.changedTouches[0].clientY - startY;

          if (Math.abs(dx) < 65 || Math.abs(dx) < Math.abs(dy) * 1.25) {
            return;
          }

          if (dx < 0 && activeIndex < tabs.length - 1) {
            activateTab(activeIndex + 1, {
              scrollTab: true,
              updateUrl: true,
            });
          } else if (dx > 0 && activeIndex > 0) {
            activateTab(activeIndex - 1, {
              scrollTab: true,
              updateUrl: true,
            });
          }
        },
        { passive: true },
      );
    }

    /* =========================================
       INITIALIZE SELECTED TAB
    ========================================= */

    const initialIndex = activeIndex;

    activeIndex = -1;

    activateTab(initialIndex, {
      initial: true,
      scrollTab: Boolean(requestedSubcategory),
    });
  };

  /* =========================================
     DOM READY
  ========================================= */

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeRequirementsPage, {
      once: true,
    });
  } else {
    initializeRequirementsPage();
  }
})();
