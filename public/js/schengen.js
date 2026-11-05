document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("schengenCountrySearch");
  const clearButton = document.getElementById("schengenClearSearch");
  const countryGrid = document.getElementById("vmSchengenCountryGrid");
  const countElement = document.getElementById("schengenCountryCount");
  const countLabel = document.getElementById("schengenCountryCountLabel");
  const suggestionsBox = document.getElementById("schengenSuggestions");
  const noResults = document.getElementById("schengenNoResults");
  const resetButton = document.getElementById("schengenResetSearch");

  if (!searchInput || !countryGrid || !suggestionsBox) {
    return;
  }

  const countryCards = Array.from(
    countryGrid.querySelectorAll(".schengen-country-card"),
  );

  // Build searchable country data from existing EJS cards.
  const searchableCountries = countryCards
    .map((card) => {
      const name =
        card.dataset.countryName ||
        card.querySelector("h4")?.textContent.trim() ||
        "";

      const slug = card.dataset.countrySlug || "";
      const link = card.querySelector(".schengen-requirements-link");

      if (!name || !link || !link.href) {
        return null;
      }

      return {
        card,
        name,
        slug,
        url: link.href,
        normalizedName: normalize(name),
        normalizedSlug: normalize(slug),
      };
    })
    .filter(Boolean);

  let matchingCountries = [];
  let activeIndex = -1;

  // Normalize country names and search input.
  function normalize(value) {
    return String(value || "")
      .toLocaleLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  // Search priority:
  // 1. Exact country name
  // 2. Country name starts with query
  // 3. Any word starts with query
  // 4. Partial country name / slug match
  function getMatchScore(country, query) {
    const name = country.normalizedName;
    const slug = country.normalizedSlug;

    if (name === query || slug === query) {
      return 1;
    }

    if (name.startsWith(query)) {
      return 2;
    }

    const words = name.split(" ");

    if (words.some((word) => word.startsWith(query))) {
      return 3;
    }

    if (name.includes(query) || slug.includes(query)) {
      return 4;
    }

    return 0;
  }

  function getMatches(query) {
    if (!query) return [];

    return searchableCountries
      .map((country) => ({
        ...country,
        score: getMatchScore(country, query),
      }))
      .filter((country) => country.score > 0)
      .sort((a, b) => {
        if (a.score !== b.score) {
          return a.score - b.score;
        }

        return a.name.localeCompare(b.name);
      });
  }

  // Create one suggestion using DOM APIs.
  function createSuggestion(country, index) {
    const link = document.createElement("a");

    link.className = "schengen-suggestion-item";
    link.href = country.url;
    link.id = `schengen-suggestion-${index}`;
    link.setAttribute("role", "option");
    link.setAttribute("aria-selected", "false");

    // Country flag
    const flagContainer = document.createElement("span");
    flagContainer.className = "schengen-suggestion-flag";

    const originalImage = country.card.querySelector(".vm-country-flag img");

    if (originalImage && originalImage.src) {
      const image = document.createElement("img");

      image.src = originalImage.src;
      image.alt = "";
      image.loading = "lazy";

      image.addEventListener(
        "error",
        () => {
          flagContainer.textContent = "🌍";
        },
        { once: true },
      );

      flagContainer.appendChild(image);
    } else {
      const fallback = country.card.querySelector(".schengen-flag-fallback");

      flagContainer.textContent =
        fallback?.textContent.trim() ||
        country.card.querySelector(".vm-country-flag")?.textContent.trim() ||
        "🌍";
    }

    // Country name and action
    const details = document.createElement("span");
    details.className = "schengen-suggestion-details";

    const name = document.createElement("span");
    name.className = "schengen-suggestion-name";
    name.textContent = country.name;

    const action = document.createElement("span");
    action.className = "schengen-suggestion-action";
    action.textContent = "Explore Visa Categories";

    details.append(name, action);

    const arrow = document.createElement("span");
    arrow.className = "schengen-suggestion-arrow";
    arrow.textContent = "→";
    arrow.setAttribute("aria-hidden", "true");

    link.append(flagContainer, details, arrow);

    return link;
  }

  // Close suggestion dropdown.
  function closeSuggestions() {
    suggestionsBox.hidden = true;
    suggestionsBox.replaceChildren();

    searchInput.setAttribute("aria-expanded", "false");
    searchInput.removeAttribute("aria-activedescendant");

    activeIndex = -1;
  }

  // Render matching suggestions.
  function showSuggestions(matches) {
    suggestionsBox.replaceChildren();
    activeIndex = -1;

    if (!matches.length) {
      const empty = document.createElement("div");

      empty.className = "schengen-suggestion-empty";
      empty.textContent = "No matching Schengen country found.";

      suggestionsBox.appendChild(empty);
      suggestionsBox.hidden = false;

      searchInput.setAttribute("aria-expanded", "true");
      searchInput.removeAttribute("aria-activedescendant");

      return;
    }

    matches.slice(0, 8).forEach((country, index) => {
      suggestionsBox.appendChild(createSuggestion(country, index));
    });

    suggestionsBox.hidden = false;
    searchInput.setAttribute("aria-expanded", "true");
  }

  // Highlight keyboard-selected suggestion.
  function setActiveSuggestion(index) {
    const items = Array.from(
      suggestionsBox.querySelectorAll(".schengen-suggestion-item"),
    );

    if (!items.length) return;

    activeIndex = Math.max(0, Math.min(index, items.length - 1));

    items.forEach((item, itemIndex) => {
      const isActive = itemIndex === activeIndex;

      item.classList.toggle("active", isActive);
      item.setAttribute("aria-selected", String(isActive));
    });

    const activeItem = items[activeIndex];

    searchInput.setAttribute("aria-activedescendant", activeItem.id);

    activeItem.scrollIntoView({
      block: "nearest",
    });
  }

  // Filter the visible country cards.
  function filterCountries(query) {
    let visibleCount = 0;

    countryCards.forEach((card) => {
      const name = normalize(
        card.dataset.countryName || card.querySelector("h4")?.textContent,
      );

      const slug = normalize(card.dataset.countrySlug);

      const matches = !query || name.includes(query) || slug.includes(query);

      card.hidden = !matches;

      if (matches) {
        visibleCount++;
      }
    });

    if (countElement) {
      countElement.textContent = String(visibleCount);
    }

    if (countLabel) {
      countLabel.textContent =
        visibleCount === 1 ? "country listed" : "countries listed";
    }

    if (noResults) {
      noResults.hidden = visibleCount !== 0;
    }

    countryGrid.hidden = visibleCount === 0;
  }

  // Main search handler.
  function handleSearch() {
    const rawQuery = searchInput.value;
    const query = normalize(rawQuery);

    clearButton.hidden = rawQuery.length === 0;

    filterCountries(query);

    if (!query) {
      matchingCountries = [];
      closeSuggestions();
      return;
    }

    matchingCountries = getMatches(query);

    showSuggestions(matchingCountries);
  }

  // Open the selected country.
  function openCountry(country) {
    if (!country || !country.url) return;

    window.location.href = country.url;
  }

  // Live search.
  searchInput.addEventListener("input", handleSearch);

  // Keyboard controls.
  searchInput.addEventListener("keydown", (event) => {
    const items = suggestionsBox.querySelectorAll(".schengen-suggestion-item");

    if (event.key === "ArrowDown") {
      event.preventDefault();

      if (suggestionsBox.hidden) {
        handleSearch();
      }

      if (items.length) {
        setActiveSuggestion(activeIndex < 0 ? 0 : activeIndex + 1);
      }

      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();

      if (items.length) {
        setActiveSuggestion(
          activeIndex < 0 ? items.length - 1 : activeIndex - 1,
        );
      }

      return;
    }

    if (event.key === "Enter") {
      if (!searchInput.value.trim()) return;

      event.preventDefault();

      if (activeIndex >= 0 && items[activeIndex]) {
        openCountry(matchingCountries[activeIndex]);
        return;
      }

      if (matchingCountries.length) {
        openCountry(matchingCountries[0]);
      }

      return;
    }

    if (event.key === "Escape") {
      closeSuggestions();
    }
  });

  // Clear button.
  clearButton.addEventListener("click", () => {
    searchInput.value = "";
    matchingCountries = [];

    filterCountries("");
    closeSuggestions();

    clearButton.hidden = true;
    searchInput.focus();
  });

  // Reset button in no-results section.
  if (resetButton) {
    resetButton.addEventListener("click", () => {
      searchInput.value = "";
      matchingCountries = [];

      filterCountries("");
      closeSuggestions();

      clearButton.hidden = true;
      searchInput.focus();
    });
  }

  // Close dropdown when clicking outside.
  document.addEventListener("click", (event) => {
    if (!event.target.closest(".schengen-search-box")) {
      closeSuggestions();
    }
  });

  // Reopen suggestions if user focuses a non-empty search field.
  searchInput.addEventListener("focus", () => {
    if (searchInput.value.trim()) {
      handleSearch();
    }
  });

  // Flag image fallback for directory cards.
  countryGrid.querySelectorAll(".vm-country-flag img").forEach((image) => {
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

  // Initial state.
  filterCountries("");
  closeSuggestions();
});
