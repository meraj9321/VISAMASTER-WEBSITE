/* =========================================================
   VISAMASTER REQUIREMENTS — SUBCATEGORY TABS
   Features:
   - Smooth fade and slide transitions
   - Animated content switching
   - Keyboard navigation
   - Mobile swipe navigation
   - URL subcategory updates
   - Reduced-motion accessibility
========================================================= */

(() => {
  "use strict";

  const initializeVisaTabs = () => {
    const tabList = document.querySelector(".visa-category-tabs");
    if (!tabList) return;

    const tabs = Array.from(tabList.querySelectorAll("[data-visa-tab]"));
    const panels = Array.from(document.querySelectorAll("[data-visa-panel]"));
    const status = document.querySelector(".visa-category-slider-status");

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

    if (activeIndex < 0) activeIndex = 0;

    let transitionId = 0;

    const activateTab = (index, options = {}) => {
      if (index < 0 || index >= tabs.length) return;

      if (index === activeIndex && options.initial !== true) {
        if (options.focus) tabs[index].focus();
        return;
      }

      const previousIndex = activeIndex;
      activeIndex = index;

      transitionId++;
      const currentTransition = transitionId;

      const animate = !reducedMotion.matches && !options.initial;

      // Update tab states.
      tabs.forEach((tab, i) => {
        const selected = i === index;

        tab.setAttribute("aria-selected", String(selected));
        tab.setAttribute("tabindex", selected ? "0" : "-1");
      });

      // Find the outgoing and incoming panels.
      const outgoingPanel = panels[previousIndex];
      const incomingPanel = panels[index];

      panels.forEach((panel) => {
        if (panel.getAnimations) {
          panel.getAnimations().forEach((animation) => animation.cancel());
        }
      });

      // Hide all panels except the new active panel.
      panels.forEach((panel, i) => {
        if (i !== index && i !== previousIndex) {
          panel.hidden = true;
          panel.classList.remove("is-active", "is-entering", "is-leaving");
        }
      });

      if (outgoingPanel && outgoingPanel !== incomingPanel) {
        outgoingPanel.classList.remove("is-active", "is-entering");
        outgoingPanel.classList.add("is-leaving");
      }

      incomingPanel.hidden = false;
      incomingPanel.classList.remove("is-leaving", "is-entering");
      incomingPanel.classList.add("is-active");

      // Smooth content transition.
      if (animate && incomingPanel.animate) {
        incomingPanel.animate(
          [
            {
              opacity: 0,
              transform: "translateX(14px)",
            },
            {
              opacity: 1,
              transform: "translateX(0)",
            },
          ],
          {
            duration: 300,
            easing: "cubic-bezier(0.22, 1, 0.36, 1)",
            fill: "none",
          },
        );

        if (
          outgoingPanel &&
          outgoingPanel !== incomingPanel &&
          outgoingPanel.animate
        ) {
          const exitAnimation = outgoingPanel.animate(
            [
              {
                opacity: 1,
                transform: "translateX(0)",
              },
              {
                opacity: 0,
                transform: "translateX(-10px)",
              },
            ],
            {
              duration: 160,
              easing: "ease-in",
              fill: "forwards",
            },
          );

          exitAnimation.finished
            .then(() => {
              if (currentTransition !== transitionId) return;

              outgoingPanel.hidden = true;
              outgoingPanel.classList.remove("is-leaving");
            })
            .catch(() => {
              // Animation was cancelled by a rapid tab switch.
            });
        }
      } else {
        panels.forEach((panel, i) => {
          panel.hidden = i !== index;
          panel.classList.toggle("is-active", i === index);
          panel.classList.remove("is-entering", "is-leaving");
        });
      }

      // Update status text.
      if (status) {
        status.textContent = `Showing purpose ${index + 1} of ${tabs.length}`;
      }

      // Keep the selected tab visible.
      if (options.scrollTab) {
        tabs[index].scrollIntoView({
          behavior: reducedMotion.matches ? "auto" : "smooth",
          block: "nearest",
          inline: "nearest",
        });
      }

      if (options.focus) {
        tabs[index].focus();
      }

      // Update URL without reloading the page.
      if (options.updateUrl) {
        const url = new URL(window.location.href);

        url.searchParams.set("subcategory", tabs[index].dataset.visaSlug || "");

        window.history.replaceState({}, "", url);
      }
    };

    // Click navigation.
    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => {
        activateTab(index, {
          scrollTab: true,
          updateUrl: true,
        });
      });

      // Keyboard navigation.
      tab.addEventListener("keydown", (event) => {
        let next = index;

        if (event.key === "ArrowRight") {
          next = (index + 1) % tabs.length;
        } else if (event.key === "ArrowLeft") {
          next = (index - 1 + tabs.length) % tabs.length;
        } else if (event.key === "Home") {
          next = 0;
        } else if (event.key === "End") {
          next = tabs.length - 1;
        } else {
          return;
        }

        event.preventDefault();

        activateTab(next, {
          focus: true,
          scrollTab: true,
          updateUrl: true,
        });
      });
    });

    // Mobile swipe navigation.
    const panelsContainer = document.querySelector(".visa-tab-panels");

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

    // Initialize without animation.
    const initialIndex = activeIndex;
    activeIndex = -1;

    activateTab(initialIndex, {
      initial: true,
      scrollTab: Boolean(requestedSubcategory),
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeVisaTabs, {
      once: true,
    });
  } else {
    initializeVisaTabs();
  }
})();
