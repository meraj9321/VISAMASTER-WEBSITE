/* =========================================================
   VISAMASTER - E-VISA AUTOCOMPLETE SEARCH
   All E-Visa search functionality in this file
   Helmet CSP compatible
========================================================= */

document.addEventListener("DOMContentLoaded", function () {
  "use strict";

  // =======================================================
  // ELEMENTS
  // =======================================================

  const searchInput = document.getElementById("vmCountrySearch");
  const clearButton = document.getElementById("vmClearCountrySearch");
  const countryGrid = document.getElementById("vmCountryGrid");
  const countElement = document.getElementById("vmCountryCount");
  const noResults = document.getElementById("vmVisaNoResults");

  if (!searchInput || !countryGrid) {
    console.warn("[E-Visa] Search elements not found.");
    return;
  }

  // =======================================================
  // AVAILABLE COUNTRIES FROM EXISTING EJS CARDS
  // =======================================================

  const countryCards = Array.from(
    countryGrid.querySelectorAll(".vm-visa-country-card"),
  );

  const countries = countryCards
    .map((card) => {
      const nameElement = card.querySelector(".ev-country-info h3");
      const linkElement = card.querySelector(".vm-country-requirements-link");
      const flagElement = card.querySelector(".ev-flag img");

      return {
        name: card.dataset.countryName || nameElement?.textContent.trim() || "",
        slug: card.dataset.countrySlug || "",
        href: linkElement?.getAttribute("href") || "",
        flag: flagElement?.getAttribute("src") || "",
      };
    })
    .filter((country) => country.name && country.href);

  console.log(`[E-Visa] ${countries.length} countries loaded.`);

  // =======================================================
  // CREATE SUGGESTION DROPDOWN
  // =======================================================

  const searchContent = searchInput.closest(".ev-search-content");

  if (!searchContent) {
    console.error("[E-Visa] Search container not found.");
    return;
  }

  const suggestionsBox = document.createElement("div");

  suggestionsBox.id = "vmEVisaSuggestions";
  suggestionsBox.className = "ev-suggestions";
  suggestionsBox.setAttribute("role", "listbox");
  suggestionsBox.hidden = true;

  searchContent.appendChild(suggestionsBox);

  searchInput.setAttribute("role", "combobox");
  searchInput.setAttribute("aria-autocomplete", "list");
  searchInput.setAttribute("aria-controls", suggestionsBox.id);
  searchInput.setAttribute("aria-expanded", "false");

  // =======================================================
  // STATE
  // =======================================================

  let currentSuggestions = [];
  let activeIndex = -1;

  // =======================================================
  // NORMALIZE TEXT
  // =======================================================

  function normalizeText(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }

  // =======================================================
  // SHOW SUGGESTIONS
  // =======================================================

  function showSuggestions() {
    suggestionsBox.hidden = false;
    searchInput.setAttribute("aria-expanded", "true");
  }

  // =======================================================
  // HIDE SUGGESTIONS
  // =======================================================

  function hideSuggestions() {
    suggestionsBox.hidden = true;
    searchInput.setAttribute("aria-expanded", "false");
    searchInput.removeAttribute("aria-activedescendant");

    activeIndex = -1;
  }

  // =======================================================
  // CLEAR SUGGESTIONS
  // =======================================================

  function clearSuggestions() {
    suggestionsBox.replaceChildren();
    currentSuggestions = [];
    activeIndex = -1;

    searchInput.removeAttribute("aria-activedescendant");
  }

  // =======================================================
  // UPDATE ACTIVE SUGGESTION
  // =======================================================

  function updateActiveSuggestion() {
    const buttons = suggestionsBox.querySelectorAll(".ev-suggestion-item");

    buttons.forEach((button, index) => {
      const active = index === activeIndex;

      button.classList.toggle("active", active);
      button.setAttribute("aria-selected", String(active));

      if (active) {
        searchInput.setAttribute("aria-activedescendant", button.id);

        button.scrollIntoView({
          block: "nearest",
        });
      }
    });
  }

  // =======================================================
  // OPEN COUNTRY REQUIREMENTS
  // =======================================================

  function openCountry(country) {
    if (!country || !country.href) return;

    window.location.assign(country.href);
  }

  // =======================================================
  // RENDER COUNTRY SUGGESTIONS
  // =======================================================

  function renderSuggestions(results) {
    clearSuggestions();

    if (!results.length) {
      const emptyMessage = document.createElement("div");

      emptyMessage.className = "ev-suggestion-empty";
      emptyMessage.textContent = "No matching E-Visa country found.";

      suggestionsBox.appendChild(emptyMessage);

      showSuggestions();
      return;
    }

    currentSuggestions = results;

    results.forEach((country, index) => {
      const button = document.createElement("button");

      button.type = "button";
      button.className = "ev-suggestion-item";
      button.id = `ev-suggestion-${index}`;
      button.setAttribute("role", "option");
      button.setAttribute("aria-selected", "false");

      // Country flag
      const flagWrapper = document.createElement("span");
      flagWrapper.className = "ev-suggestion-flag";

      if (country.flag) {
        const img = document.createElement("img");

        img.src = country.flag;
        img.alt = "";
        img.loading = "lazy";

        flagWrapper.appendChild(img);
      } else {
        flagWrapper.textContent = "🌍";
      }

      // Country information
      const info = document.createElement("span");
      info.className = "ev-suggestion-info";

      const countryName = document.createElement("strong");
      countryName.textContent = country.name;

      const description = document.createElement("small");
      description.textContent = "View E-Visa requirements";

      info.appendChild(countryName);
      info.appendChild(description);

      // Arrow
      const arrow = document.createElement("span");
      arrow.className = "ev-suggestion-arrow";
      arrow.textContent = "→";

      button.appendChild(flagWrapper);
      button.appendChild(info);
      button.appendChild(arrow);

      // Country selection
      button.addEventListener("click", function () {
        openCountry(country);
      });

      suggestionsBox.appendChild(button);
    });

    showSuggestions();
  }

  // =======================================================
  // SEARCH COUNTRIES
  // =======================================================

  function searchCountries(query) {
    const searchText = normalizeText(query);

    if (!searchText) {
      clearSuggestions();
      hideSuggestions();
      return;
    }

    const results = countries.filter((country) => {
      const name = normalizeText(country.name);
      const slug = normalizeText(country.slug);

      return name.includes(searchText) || slug.includes(searchText);
    });

    // Show maximum 8 suggestions
    renderSuggestions(results.slice(0, 8));
  }

  // =======================================================
  // SEARCH INPUT EVENT
  // =======================================================

  searchInput.addEventListener("input", function () {
    const query = searchInput.value.trim();

    if (clearButton) {
      clearButton.hidden = query.length === 0;
    }

    searchCountries(query);
  });

  // =======================================================
  // KEYBOARD NAVIGATION
  // =======================================================

  searchInput.addEventListener("keydown", function (event) {
    if (event.key === "ArrowDown") {
      if (!currentSuggestions.length) return;

      event.preventDefault();

      activeIndex = (activeIndex + 1) % currentSuggestions.length;

      updateActiveSuggestion();
    } else if (event.key === "ArrowUp") {
      if (!currentSuggestions.length) return;

      event.preventDefault();

      activeIndex =
        activeIndex <= 0 ? currentSuggestions.length - 1 : activeIndex - 1;

      updateActiveSuggestion();
    } else if (event.key === "Enter") {
      if (!currentSuggestions.length) return;

      event.preventDefault();

      const selectedCountry =
        currentSuggestions[activeIndex >= 0 ? activeIndex : 0];

      openCountry(selectedCountry);
    } else if (event.key === "Escape") {
      hideSuggestions();
    }
  });

  // =======================================================
  // CLEAR SEARCH BUTTON
  // =======================================================

  if (clearButton) {
    clearButton.addEventListener("click", function () {
      searchInput.value = "";

      clearSuggestions();
      hideSuggestions();

      clearButton.hidden = true;

      searchInput.focus();
    });
  }

  // =======================================================
  // CLICK OUTSIDE SEARCH
  // =======================================================

  document.addEventListener("click", function (event) {
    if (!searchContent.contains(event.target)) {
      hideSuggestions();
    }
  });

  // =======================================================
  // BROKEN FLAG IMAGE FALLBACK
  // =======================================================

  document.addEventListener(
    "error",
    function (event) {
      const img = event.target;

      if (!(img instanceof HTMLImageElement) || !img.closest(".ev-flag")) {
        return;
      }

      img.hidden = true;

      const fallback = img.nextElementSibling;

      if (fallback) {
        fallback.hidden = false;
      }
    },
    true,
  );

  // =======================================================
  // INITIAL STATE
  // =======================================================

  if (clearButton) {
    clearButton.hidden = true;
  }

  hideSuggestions();

  if (countElement) {
    countElement.textContent = String(countries.length);
  }

  console.log("[E-Visa] Autocomplete search ready.");
});
