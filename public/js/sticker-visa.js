/* =====================================================
   STICKER VISA SMART SEARCH
   Helmet CSP Compatible
===================================================== */

(() => {
  "use strict";

  document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("vmCountrySearch");
    const clearButton = document.getElementById("vmClearCountrySearch");
    const countryGrid = document.getElementById("vmCountryGrid");
    const countElement = document.getElementById("vmCountryCount");
    const countLabel = document.getElementById("vmCountryCountLabel");
    const noResults = document.getElementById("vmVisaNoResults");
    const suggestionsBox = document.getElementById("vmCountrySuggestions");

    if (!searchInput || !countryGrid || !suggestionsBox) {
      return;
    }

    const countryCards = Array.from(
      countryGrid.querySelectorAll(".sv-country-card"),
    );

    let suggestions = [];
    let activeIndex = -1;

    /* =====================================================
       NORMALIZE COUNTRY NAME
    ===================================================== */

    const normalize = (value) => {
      return String(value || "")
        .toLocaleLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
    };

    /* =====================================================
       GET MATCHING COUNTRIES
    ===================================================== */

    const getMatchingCountries = (query) => {
      const normalizedQuery = normalize(query);

      if (!normalizedQuery) {
        return [];
      }

      return countryCards.filter((card) => {
        const countryName = normalize(
          card.dataset.countryName || card.querySelector("h3")?.textContent,
        );

        return countryName.includes(normalizedQuery);
      });
    };

    /* =====================================================
       CLOSE SUGGESTIONS
    ===================================================== */

    const closeSuggestions = () => {
      suggestionsBox.hidden = true;

      suggestionsBox.replaceChildren();

      suggestions = [];

      activeIndex = -1;

      searchInput.setAttribute("aria-expanded", "false");

      searchInput.removeAttribute("aria-activedescendant");
    };

    /* =====================================================
       UPDATE ACTIVE SUGGESTION
    ===================================================== */

    const updateActiveSuggestion = () => {
      const items = suggestionsBox.querySelectorAll(".sv-suggestion-item");

      items.forEach((item, index) => {
        const isActive = index === activeIndex;

        item.classList.toggle("active", isActive);

        if (isActive) {
          searchInput.setAttribute("aria-activedescendant", item.id);

          item.scrollIntoView({
            block: "nearest",
          });
        }
      });

      if (activeIndex === -1) {
        searchInput.removeAttribute("aria-activedescendant");
      }
    };

    /* =====================================================
       OPEN SELECTED COUNTRY
    ===================================================== */

    const openCountry = (card) => {
      if (!card) return;

      const link = card.querySelector(".vm-country-requirements-link");

      if (!link || !link.href) return;

      window.location.assign(link.href);
    };

    /* =====================================================
       RENDER SUGGESTIONS
    ===================================================== */

    const renderSuggestions = (matches) => {
      closeSuggestions();

      if (!matches.length) {
        return;
      }

      suggestions = matches;

      const fragment = document.createDocumentFragment();

      matches.forEach((card, index) => {
        const countryName =
          card.dataset.countryName ||
          card.querySelector("h3")?.textContent.trim();

        const suggestion = document.createElement("a");

        const requirementsLink = card.querySelector(
          ".vm-country-requirements-link",
        );

        if (!requirementsLink) return;

        suggestion.href = requirementsLink.href;

        suggestion.className = "sv-suggestion-item";

        suggestion.id = `sv-suggestion-${index}`;

        suggestion.setAttribute("role", "option");

        suggestion.setAttribute("aria-selected", "false");

        const name = document.createElement("span");

        name.className = "sv-suggestion-name";

        name.textContent = countryName;

        const action = document.createElement("span");

        action.className = "sv-suggestion-action";

        action.textContent = "View requirements →";

        suggestion.append(name, action);

        // Native link navigation works with mouse and keyboard.
        fragment.appendChild(suggestion);
      });

      suggestionsBox.appendChild(fragment);

      if (!suggestionsBox.children.length) {
        closeSuggestions();
        return;
      }

      suggestionsBox.hidden = false;

      searchInput.setAttribute("aria-expanded", "true");
    };

    /* =====================================================
       FILTER COUNTRY DIRECTORY
    ===================================================== */

    const filterCountries = () => {
      const query = normalize(searchInput.value);

      let visibleCount = 0;

      countryCards.forEach((card) => {
        const countryName = normalize(
          card.dataset.countryName || card.querySelector("h3")?.textContent,
        );

        const matches = !query || countryName.includes(query);

        card.hidden = !matches;

        if (matches) {
          visibleCount++;
        }
      });

      // Update country count

      if (countElement) {
        countElement.textContent = String(visibleCount);
      }

      // Update count label

      if (countLabel) {
        countLabel.textContent =
          visibleCount === 1 ? "country found" : "countries found";
      }

      // Show no results

      if (noResults) {
        noResults.hidden = visibleCount !== 0;
      }

      // Hide empty country grid

      countryGrid.hidden = visibleCount === 0;

      // Clear button

      if (clearButton) {
        clearButton.hidden = searchInput.value.length === 0;
      }

      // Render autocomplete suggestions

      renderSuggestions(getMatchingCountries(searchInput.value));
    };

    /* =====================================================
       SEARCH INPUT
    ===================================================== */

    searchInput.addEventListener("input", () => {
      filterCountries();
    });

    /* =====================================================
       KEYBOARD NAVIGATION
    ===================================================== */

    searchInput.addEventListener("keydown", (event) => {
      if (suggestions.length === 0) {
        if (event.key === "Escape") {
          closeSuggestions();
        }

        return;
      }

      // DOWN ARROW

      if (event.key === "ArrowDown") {
        event.preventDefault();

        activeIndex++;

        if (activeIndex >= suggestions.length) {
          activeIndex = 0;
        }

        updateActiveSuggestion();
      }

      // UP ARROW
      else if (event.key === "ArrowUp") {
        event.preventDefault();

        activeIndex--;

        if (activeIndex < 0) {
          activeIndex = suggestions.length - 1;
        }

        updateActiveSuggestion();
      }

      // ENTER
      else if (event.key === "Enter") {
        event.preventDefault();

        const selectedIndex = activeIndex >= 0 ? activeIndex : 0;

        openCountry(suggestions[selectedIndex]);
      }

      // ESCAPE
      else if (event.key === "Escape") {
        event.preventDefault();

        closeSuggestions();
      }
    });

    /* =====================================================
       CLEAR SEARCH
    ===================================================== */

    if (clearButton) {
      clearButton.addEventListener("click", () => {
        searchInput.value = "";

        filterCountries();

        searchInput.focus();
      });
    }

    /* =====================================================
       CLOSE WHEN CLICKING OUTSIDE
    ===================================================== */

    document.addEventListener("click", (event) => {
      if (
        !suggestionsBox.contains(event.target) &&
        event.target !== searchInput
      ) {
        closeSuggestions();
      }
    });

    /* =====================================================
       BROKEN FLAG IMAGE FALLBACK
    ===================================================== */

    const flagImages = countryGrid.querySelectorAll(".sv-flag img");

    flagImages.forEach((image) => {
      image.addEventListener("error", () => {
        image.hidden = true;

        const fallback = image.nextElementSibling;

        if (fallback) {
          fallback.hidden = false;
        }
      });
    });

    /* =====================================================
       INITIALIZE
    ===================================================== */

    filterCountries();
  });
})();
