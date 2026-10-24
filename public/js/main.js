/* =========================================================
   VISAMASTER MAIN JAVASCRIPT
========================================================= */

/* =========================================================
   1. MOBILE MENU
========================================================= */

const mobileMenuButton = document.querySelector(".mobile-menu-button");
const navLinks = document.querySelector(".nav-links");

if (mobileMenuButton && navLinks) {
  mobileMenuButton.addEventListener("click", () => {
    navLinks.classList.toggle("mobile-open");
  });
}

/* =========================================================
   2. NEWS FILTER
========================================================= */

const newsFilterButtons = document.querySelectorAll(".news-tabs button");
const newsCards = document.querySelectorAll(".news-card");

if (newsFilterButtons.length && newsCards.length) {
  newsFilterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      newsFilterButtons.forEach((btn) => {
        btn.classList.remove("active");
      });

      button.classList.add("active");

      const selectedCategory = button.dataset.filter;

      newsCards.forEach((card) => {
        const cardCategory = card.dataset.category;

        if (selectedCategory === "all" || cardCategory === selectedCategory) {
          card.style.display = "";
        } else {
          card.style.display = "none";
        }
      });
    });
  });
}

/* =========================================================
   3. DESTINATION SEARCH
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const destinationSearchBox = document.getElementById("destinationSearchBox");

  const destinationSearchInput = document.getElementById(
    "destinationSearchInput",
  );

  const destinationSearchButton = document.getElementById(
    "destinationSearchButton",
  );

  const destinationSuggestions = document.getElementById(
    "destinationSuggestions",
  );

  const destinationCards = document.querySelectorAll(".destination-card");

  if (
    !destinationSearchBox ||
    !destinationSearchInput ||
    !destinationSuggestions
  ) {
    return;
  }

  const destinations = Array.from(destinationCards)
    .map((card) => {
      const name = card.dataset.destinationName || "";
      const slug = card.dataset.destinationSlug || "";

      const flagElement = card.querySelector(".country-flag");

      const flag = flagElement ? flagElement.textContent.trim() : "🌍";

      return {
        name,
        slug,
        flag,
        card,
      };
    })
    .filter((destination) => destination.name);

  const hideDestinationSuggestions = () => {
    destinationSuggestions.classList.remove("show");
    destinationSuggestions.innerHTML = "";
  };

  const showDestinationMessage = (message, className) => {
    destinationSuggestions.innerHTML = `
      <div class="${className}">
        ${message}
      </div>
    `;

    destinationSuggestions.classList.add("show");
  };

  const renderDestinationSuggestions = (results) => {
    if (!results.length) {
      showDestinationMessage(
        "No destination found",
        "destination-search-empty",
      );

      return;
    }

    destinationSuggestions.innerHTML = results
      .map(
        (destination) => `
          <button
            type="button"
            class="destination-suggestion"
            data-slug="${destination.slug}"
          >
            <span class="destination-suggestion-flag">
              ${destination.flag}
            </span>

            <span class="destination-suggestion-info">
              <span class="destination-suggestion-name">
                ${destination.name}
              </span>

              <span class="destination-suggestion-action">
                Explore visa details
              </span>
            </span>
          </button>
        `,
      )
      .join("");

    destinationSuggestions.classList.add("show");
  };

  const searchDestinations = (query) => {
    const searchText = query.toLowerCase().trim();

    if (!searchText) {
      hideDestinationSuggestions();
      return;
    }

    const results = destinations
      .filter((destination) => {
        const countryName = destination.name.toLowerCase();

        return countryName.includes(searchText);
      })
      .slice(0, 8);

    renderDestinationSuggestions(results);
  };

  /* INPUT EVENT */

  destinationSearchInput.addEventListener("input", () => {
    const query = destinationSearchInput.value.trim();

    if (query.length < 1) {
      hideDestinationSuggestions();
      return;
    }

    searchDestinations(query);
  });

  /* EXPLORE BUTTON */

  if (destinationSearchButton) {
    destinationSearchButton.addEventListener("click", () => {
      const query = destinationSearchInput.value.trim();

      if (!query) {
        destinationSearchInput.focus();
        hideDestinationSuggestions();
        return;
      }

      const results = destinations.filter((destination) => {
        return destination.name.toLowerCase().includes(query.toLowerCase());
      });

      if (results.length > 0) {
        const firstResult = results[0];

        if (firstResult.slug) {
          window.location.href = `/countries/${encodeURIComponent(firstResult.slug)}/requirements`;

          return;
        }
      }

      showDestinationMessage(
        "No destination found",
        "destination-search-empty",
      );
    });
  }

  /* SUGGESTION CLICK */

  destinationSuggestions.addEventListener("click", (event) => {
    const suggestion = event.target.closest(".destination-suggestion");

    if (!suggestion) {
      return;
    }

    const slug = suggestion.dataset.slug;

    if (!slug) {
      return;
    }

    window.location.href = `/countries/${encodeURIComponent(slug)}/requirements`;
  });

  /* CLICK OUTSIDE SEARCH */

  document.addEventListener("click", (event) => {
    if (!event.target.closest("#destinationSearchBox")) {
      hideDestinationSuggestions();
    }
  });

  /* ESCAPE KEY */

  destinationSearchInput.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      hideDestinationSuggestions();
      destinationSearchInput.blur();
    }

    if (event.key === "Enter") {
      event.preventDefault();

      if (destinationSearchButton) {
        destinationSearchButton.click();
      }
    }
  });
});

/* =========================================================
   4. HOME COUNTRY SEARCH

   Uses the existing backend API:
   GET /countries/search?q=countryName

   FEATURES:
   - Minimum 2 characters.
   - No normal form submission.
   - No redirect when no country is found.
   - Enter and Search button work correctly.
   - Selecting a valid country opens its page.
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("countrySearchInput");

  const suggestionsBox = document.getElementById("countrySuggestions");

  const searchForm = searchInput?.closest("form");

  if (!searchInput || !suggestionsBox) {
    return;
  }

  let searchTimeout;
  let searchRequestId = 0;

  /*
   * Keep the most recent search results.
   */
  let currentCountries = [];

  /*
   * Hide suggestions.
   */
  const hideSuggestions = () => {
    suggestionsBox.classList.remove("show");
    suggestionsBox.innerHTML = "";
  };

  /*
   * Show a message.
   */
  const showMessage = (message, className) => {
    suggestionsBox.innerHTML = `
      <div class="${className}">
        ${message}
      </div>
    `;

    suggestionsBox.classList.add("show");
  };

  /*
   * Render country suggestions.
   */
  const renderSuggestions = (countries) => {
    currentCountries = countries;

    if (!countries.length) {
      showMessage("No country found", "country-search-empty");

      return;
    }

    suggestionsBox.innerHTML = countries
      .map(
        (country) => `
          <button
            type="button"
            class="country-suggestion"
            data-slug="${country.slug}"
          >
            <span class="country-suggestion-flag">
              ${country.flag || "🌍"}
            </span>

            <span class="country-suggestion-info">
              <span class="country-suggestion-name">
                ${country.name}
              </span>

              <span class="country-suggestion-action">
                View visa details
              </span>
            </span>
          </button>
        `,
      )
      .join("");

    suggestionsBox.classList.add("show");
  };

  /*
   * Search countries through the existing backend API.
   */
  const searchCountries = async (query) => {
    const requestId = ++searchRequestId;

    if (query.length < 2) {
      currentCountries = [];
      hideSuggestions();
      return [];
    }

    try {
      showMessage("Searching...", "country-search-loading");

      const response = await fetch(
        `/countries/search?q=${encodeURIComponent(query)}`,
      );

      if (!response.ok) {
        throw new Error("Country search failed");
      }

      const countries = await response.json();

      /*
       * Ignore an older response if the user has typed
       * another query in the meantime.
       */
      if (requestId !== searchRequestId) {
        return [];
      }

      renderSuggestions(countries);

      return countries;
    } catch (error) {
      console.error("Country search error:", error);

      if (requestId === searchRequestId) {
        currentCountries = [];

        showMessage("Unable to search right now", "country-search-empty");
      }

      return [];
    }
  };

  /* =======================================================
     INPUT EVENT
  ======================================================= */

  searchInput.addEventListener("input", () => {
    const query = searchInput.value.trim();

    clearTimeout(searchTimeout);

    /*
     * Invalidate any previous request.
     */
    searchRequestId++;

    currentCountries = [];

    /*
     * MINIMUM SEARCH LENGTH: 2 CHARACTERS
     */
    if (query.length < 2) {
      hideSuggestions();
      return;
    }

    /*
     * Small delay avoids sending a request for every
     * keystroke immediately.
     */
    searchTimeout = setTimeout(() => {
      searchCountries(query);
    }, 250);
  });

  /* =======================================================
     FORM SUBMISSION

     Stops redirect when no country is found.
  ======================================================= */

  if (searchForm) {
    searchForm.addEventListener("submit", async (event) => {
      /*
       * Stop default form navigation.
       */
      event.preventDefault();

      const query = searchInput.value.trim();

      /*
       * Do nothing if fewer than 2 characters
       * were entered.
       */
      if (query.length < 2) {
        hideSuggestions();
        searchInput.focus();
        return;
      }

      clearTimeout(searchTimeout);

      /*
       * Check the country against the backend.
       */
      const countries = await searchCountries(query);

      /*
       * No matching country:
       * stay on the same page.
       */
      if (!countries.length) {
        return;
      }

      /*
       * Matching country found:
       * open its country page.
       */
      const firstCountry = countries[0];

      if (firstCountry.slug) {
        window.location.href = `/countries/${encodeURIComponent(firstCountry.slug)}`;
      }
    });
  }

  /* =======================================================
     COUNTRY SUGGESTION CLICK
  ======================================================= */

  suggestionsBox.addEventListener("click", (event) => {
    const suggestion = event.target.closest(".country-suggestion");

    if (!suggestion) {
      return;
    }

    const slug = suggestion.dataset.slug;

    if (!slug) {
      return;
    }

    window.location.href = `/countries/${encodeURIComponent(slug)}`;
  });

  /* =======================================================
     CLICK OUTSIDE COUNTRY SEARCH
  ======================================================= */

  document.addEventListener("click", (event) => {
    if (!event.target.closest(".country-search")) {
      hideSuggestions();
    }
  });

  /* =======================================================
     ESCAPE KEY
  ======================================================= */

  searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      hideSuggestions();
      searchInput.blur();
    }
  });
});
