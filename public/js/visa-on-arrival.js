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
    countryGrid.querySelectorAll(".va-country-card"),
  );

  // Only use cards that have a valid requirements link.
  const searchableCountries = countryCards
    .map((card) => {
      const name =
        card.dataset.countryName ||
        card.querySelector("h3")?.textContent.trim() ||
        "";

      const slug = card.dataset.countrySlug || "";
      const link = card.querySelector(".vm-country-requirements-link");

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

  // NORMALIZE SEARCH TEXT
  function normalize(value) {
    return String(value || "")
      .toLocaleLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  // MATCHING PRIORITY
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

  // FIND MATCHING COUNTRIES
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

  // CREATE SUGGESTION ELEMENT
  function createSuggestion(country, index) {
    const link = document.createElement("a");

    link.className = "va-suggestion-item";
    link.href = country.url;
    link.id = `va-suggestion-${index}`;
    link.setAttribute("role", "option");
    link.setAttribute("aria-selected", "false");

    // Flag
    const flagContainer = document.createElement("span");
    flagContainer.className = "va-suggestion-flag";

    const originalImage = country.card.querySelector(".va-flag img");

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
      const originalFallback = country.card.querySelector(".va-flag-fallback");

      flagContainer.textContent = originalFallback?.textContent.trim() || "🌍";
    }

    // Country details
    const details = document.createElement("span");
    details.className = "va-suggestion-details";

    const name = document.createElement("span");
    name.className = "va-suggestion-name";
    name.textContent = country.name;

    const action = document.createElement("span");
    action.className = "va-suggestion-action";
    action.textContent = "View Visa on Arrival requirements";

    details.append(name, action);

    // Arrow
    const arrow = document.createElement("span");
    arrow.className = "va-suggestion-arrow";
    arrow.textContent = "→";
    arrow.setAttribute("aria-hidden", "true");

    link.append(flagContainer, details, arrow);

    return link;
  }

  // CLOSE SUGGESTIONS
  function closeSuggestions() {
    suggestionsBox.hidden = true;
    suggestionsBox.replaceChildren();

    searchInput.setAttribute("aria-expanded", "false");
    searchInput.removeAttribute("aria-activedescendant");

    activeIndex = -1;
  }

  // SHOW SUGGESTIONS
  function showSuggestions(matches) {
    suggestionsBox.replaceChildren();
    activeIndex = -1;

    if (!matches.length) {
      const empty = document.createElement("div");

      empty.className = "va-suggestion-empty";
      empty.textContent = "No matching country found.";

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

  // HIGHLIGHT ACTIVE SUGGESTION
  function setActiveSuggestion(index) {
    const items = Array.from(
      suggestionsBox.querySelectorAll(".va-suggestion-item"),
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

  // FILTER COUNTRY CARDS
  function filterCountries(query) {
    let visibleCount = 0;

    countryCards.forEach((card) => {
      const countryName = normalize(
        card.dataset.countryName || card.querySelector("h3")?.textContent,
      );

      const countrySlug = normalize(card.dataset.countrySlug);

      const matches =
        !query || countryName.includes(query) || countrySlug.includes(query);

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
        visibleCount === 1 ? "country found" : "countries found";
    }

    if (noResults) {
      noResults.hidden = visibleCount !== 0;
    }

    countryGrid.hidden = visibleCount === 0;
  }

  // MAIN SEARCH FUNCTION
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

  // OPEN COUNTRY REQUIREMENTS
  function openCountry(country) {
    if (!country || !country.url) return;

    window.location.href = country.url;
  }

  // SEARCH INPUT
  searchInput.addEventListener("input", handleSearch);

  // KEYBOARD NAVIGATION
  searchInput.addEventListener("keydown", (event) => {
    const items = suggestionsBox.querySelectorAll(".va-suggestion-item");

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

  // CLEAR SEARCH
  clearButton.addEventListener("click", () => {
    searchInput.value = "";

    matchingCountries = [];

    filterCountries("");
    closeSuggestions();

    clearButton.hidden = true;

    searchInput.focus();
  });

  // CLOSE SUGGESTIONS WHEN CLICKING OUTSIDE
  document.addEventListener("click", (event) => {
    if (!event.target.closest(".va-search-panel")) {
      closeSuggestions();
    }
  });

  // KEEP SUGGESTIONS OPEN WHEN FOCUS RETURNS TO INPUT
  searchInput.addEventListener("focus", () => {
    if (searchInput.value.trim()) {
      handleSearch();
    }
  });

  // FLAG IMAGE FALLBACK
  countryGrid.querySelectorAll(".va-flag img").forEach((image) => {
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

  // INITIAL STATE
  filterCountries("");
  closeSuggestions();
});
