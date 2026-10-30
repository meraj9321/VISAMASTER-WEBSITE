document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("evisaCountrySearch");
  const clearButton = document.getElementById("clearEvisaSearch");
  const countryGrid = document.getElementById("evisaCountryGrid");
  const noResults = document.getElementById("evisaNoResults");
  const countElement = document.getElementById("evisaCount");
  const countLabel = document.getElementById("evisaCountLabel");

  if (!searchInput || !countryGrid) return;

  const searchWrap = searchInput.closest(".evisa-search-wrap");
  if (!searchWrap) return;

  const cards = Array.from(countryGrid.querySelectorAll(".evisa-country-card"));

  let activeIndex = -1;
  let matches = [];
  let highlightedCard = null;

  // --------------------------------------------------
  // CREATE AUTOCOMPLETE DROPDOWN
  // --------------------------------------------------

  const suggestions = document.createElement("div");

  suggestions.className = "evisa-suggestions";
  suggestions.id = "evisaSearchSuggestions";
  suggestions.setAttribute("role", "listbox");
  suggestions.setAttribute("aria-label", "Matching countries");
  suggestions.hidden = true;

  searchWrap.insertAdjacentElement("afterend", suggestions);

  searchInput.setAttribute("role", "combobox");
  searchInput.setAttribute("aria-autocomplete", "list");
  searchInput.setAttribute("aria-expanded", "false");
  searchInput.setAttribute("aria-controls", suggestions.id);

  // --------------------------------------------------
  // COUNTRY NAME
  // --------------------------------------------------

  function getCountryName(card) {
    return (
      card.dataset.countryName ||
      card.querySelector("h3")?.textContent ||
      ""
    ).trim();
  }

  // --------------------------------------------------
  // CLOSE DROPDOWN
  // --------------------------------------------------

  function closeSuggestions() {
    suggestions.hidden = true;
    searchInput.setAttribute("aria-expanded", "false");
    searchInput.removeAttribute("aria-activedescendant");

    activeIndex = -1;
  }

  // --------------------------------------------------
  // UPDATE ACTIVE SUGGESTION
  // --------------------------------------------------

  function setActiveSuggestion(index) {
    const items = Array.from(suggestions.querySelectorAll(".evisa-suggestion"));

    if (!items.length) {
      activeIndex = -1;
      return;
    }

    activeIndex = Math.max(0, Math.min(index, items.length - 1));

    items.forEach((item, itemIndex) => {
      const isActive = itemIndex === activeIndex;

      item.classList.toggle("is-active", isActive);
      item.setAttribute("aria-selected", String(isActive));
    });

    const activeItem = items[activeIndex];

    searchInput.setAttribute("aria-activedescendant", activeItem.id);

    activeItem.scrollIntoView({
      block: "nearest",
      behavior: "auto",
    });
  }

  // --------------------------------------------------
  // TEMPORARILY HIGHLIGHT SELECTED COUNTRY
  // --------------------------------------------------

  function highlightCountry(card) {
    if (highlightedCard) {
      highlightedCard.classList.remove("evisa-card-highlight");
    }

    highlightedCard = card;
    card.classList.add("evisa-card-highlight");

    window.setTimeout(() => {
      card.classList.remove("evisa-card-highlight");

      if (highlightedCard === card) {
        highlightedCard = null;
      }
    }, 2200);
  }

  // --------------------------------------------------
  // SELECT COUNTRY AND SCROLL TO CARD
  // --------------------------------------------------

  function selectCountry(card) {
    if (!card) return;

    const countryName = getCountryName(card);

    searchInput.value = countryName;

    // Keep all country cards visible.
    cards.forEach((countryCard) => {
      countryCard.hidden = false;
    });

    // Restore the original destination count.
    if (countElement) {
      countElement.textContent = String(cards.length);
    }

    if (countLabel) {
      countLabel.textContent =
        cards.length === 1 ? "destination available" : "destinations available";
    }

    if (noResults) {
      noResults.hidden = true;
    }

    if (clearButton) {
      clearButton.hidden = false;
    }

    closeSuggestions();

    // Scroll to the selected country.
    card.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });

    highlightCountry(card);
    searchInput.blur();
  }

  // --------------------------------------------------
  // RENDER MATCHING SUGGESTIONS
  // --------------------------------------------------

  function renderSuggestions(query) {
    suggestions.replaceChildren();
    activeIndex = -1;

    if (!query) {
      closeSuggestions();
      return;
    }

    matches = cards.filter((card) => {
      return getCountryName(card).toLowerCase().includes(query);
    });

    if (!matches.length) {
      const emptyMessage = document.createElement("div");

      emptyMessage.className = "evisa-suggestion-empty";
      emptyMessage.textContent = "No matching countries found";

      suggestions.appendChild(emptyMessage);

      suggestions.hidden = false;
      searchInput.setAttribute("aria-expanded", "true");

      return;
    }

    matches.forEach((card, index) => {
      const countryName = getCountryName(card);

      const item = document.createElement("button");

      item.type = "button";
      item.className = "evisa-suggestion";
      item.id = `evisa-suggestion-${index}`;
      item.setAttribute("role", "option");
      item.setAttribute("aria-selected", "false");

      // Country flag
      const flag = card.querySelector(".evisa-card-flag");

      const flagElement = document.createElement("span");
      flagElement.className = "evisa-suggestion-flag";
      flagElement.setAttribute("aria-hidden", "true");
      flagElement.textContent = flag?.textContent.trim() || "🌍";

      // Country name
      const nameElement = document.createElement("span");
      nameElement.className = "evisa-suggestion-name";
      nameElement.textContent = countryName;

      // Right arrow
      const arrowElement = document.createElement("span");
      arrowElement.className = "evisa-suggestion-arrow";
      arrowElement.setAttribute("aria-hidden", "true");
      arrowElement.textContent = "→";

      item.append(flagElement, nameElement, arrowElement);

      // Clicking a suggestion scrolls to its country card.
      item.addEventListener("click", () => {
        selectCountry(card);
      });

      suggestions.appendChild(item);
    });

    suggestions.hidden = false;
    searchInput.setAttribute("aria-expanded", "true");
  }

  // --------------------------------------------------
  // SEARCH INPUT
  // --------------------------------------------------

  searchInput.addEventListener("input", () => {
    const query = searchInput.value.trim().toLowerCase();

    if (clearButton) {
      clearButton.hidden = query.length === 0;
    }

    // Do not filter or hide country cards while typing.
    cards.forEach((card) => {
      card.hidden = false;
    });

    if (noResults) {
      noResults.hidden = true;
    }

    renderSuggestions(query);
  });

  // --------------------------------------------------
  // KEYBOARD NAVIGATION
  // --------------------------------------------------

  searchInput.addEventListener("keydown", (event) => {
    const items = suggestions.querySelectorAll(".evisa-suggestion");

    if (event.key === "ArrowDown") {
      if (suggestions.hidden) {
        renderSuggestions(searchInput.value.trim().toLowerCase());
      }

      if (suggestions.querySelector(".evisa-suggestion")) {
        event.preventDefault();
        setActiveSuggestion(activeIndex + 1);
      }

      return;
    }

    if (event.key === "ArrowUp") {
      if (!suggestions.hidden && items.length) {
        event.preventDefault();

        setActiveSuggestion(
          activeIndex <= 0 ? items.length - 1 : activeIndex - 1,
        );
      }

      return;
    }

    if (event.key === "Enter") {
      if (!suggestions.hidden) {
        event.preventDefault();

        const selectedCard =
          activeIndex >= 0 ? matches[activeIndex] : matches[0];

        if (selectedCard) {
          selectCountry(selectedCard);
        }
      }

      return;
    }

    if (event.key === "Escape") {
      closeSuggestions();
    }
  });

  // --------------------------------------------------
  // CLEAR SEARCH
  // --------------------------------------------------

  if (clearButton) {
    clearButton.addEventListener("click", () => {
      searchInput.value = "";

      cards.forEach((card) => {
        card.hidden = false;
      });

      if (countElement) {
        countElement.textContent = String(cards.length);
      }

      if (countLabel) {
        countLabel.textContent =
          cards.length === 1
            ? "destination available"
            : "destinations available";
      }

      if (noResults) {
        noResults.hidden = true;
      }

      clearButton.hidden = true;

      closeSuggestions();
      searchInput.focus();
    });
  }

  // --------------------------------------------------
  // CLOSE WHEN CLICKING OUTSIDE
  // --------------------------------------------------

  document.addEventListener("click", (event) => {
    if (
      !searchWrap.contains(event.target) &&
      !suggestions.contains(event.target)
    ) {
      closeSuggestions();
    }
  });

  // --------------------------------------------------
  // INITIAL STATE
  // --------------------------------------------------

  cards.forEach((card) => {
    card.hidden = false;
  });

  if (countElement) {
    countElement.textContent = String(cards.length);
  }

  if (countLabel) {
    countLabel.textContent =
      cards.length === 1 ? "destination available" : "destinations available";
  }

  if (noResults) {
    noResults.hidden = true;
  }

  if (clearButton) {
    clearButton.hidden = true;
  }
});
