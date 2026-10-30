/* =========================================================
   VisaMaster Visa Information Directory
   ---------------------------------------------------------
   Features:
   1. All Visas tab displays all countries with active visas
   2. Filter countries according to selected visa category
   3. Search countries on the client side only
   4. Update country count dynamically
   5. Update country requirements links
   6. Clear country search
   7. Keyboard navigation for visa category tabs
   8. Display no-results message when nothing matches
   9. Sticker Visa removed
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  // -------------------------------------------------------
  // DOM ELEMENTS
  // -------------------------------------------------------

  const tabs = Array.from(document.querySelectorAll("[data-visa-category]"));

  const cards = Array.from(document.querySelectorAll(".vm-visa-country-card"));

  const title = document.getElementById("vmSelectedCategoryTitle");
  const description = document.getElementById("vmSelectedCategoryDescription");

  const count = document.getElementById("vmCountryCount");
  const countLabel = document.getElementById("vmCountryCountLabel");

  const noResults = document.getElementById("vmVisaNoResults");

  const countrySearch = document.getElementById("vmCountrySearch");
  const clearSearch = document.getElementById("vmClearCountrySearch");

  if (!tabs.length) return;

  // -------------------------------------------------------
  // CATEGORY DESCRIPTIONS
  // -------------------------------------------------------

  const categoryDescriptions = {
    "all-visas":
      "Explore all countries with active visa options listed by VisaMaster.",

    "e-visa":
      "Explore destinations where an electronic visa option is listed by VisaMaster.",

    "tourist-visa":
      "Find tourist visa options for holidays, sightseeing and leisure travel.",

    "visa-on-arrival":
      "Check destinations where Visa on Arrival assistance is listed.",

    "business-visa":
      "Explore business visa options for meetings, events and professional visits.",

    "stamping-visa":
      "Find visa options requiring passport submission or visa stamping, where configured.",
  };

  // -------------------------------------------------------
  // READ COUNTRY VISA REQUIREMENTS MAP
  // -------------------------------------------------------

  function readRequirementsMap(card) {
    try {
      const map = JSON.parse(card.dataset.requirementsMap || "{}");

      return map && typeof map === "object" && !Array.isArray(map) ? map : {};
    } catch (error) {
      console.error("Invalid VisaMaster requirements map:", error);
      return {};
    }
  }

  // -------------------------------------------------------
  // GET CURRENT SEARCH VALUE
  // -------------------------------------------------------

  function getSearchTerm() {
    return countrySearch?.value.trim().toLowerCase() || "";
  }

  // -------------------------------------------------------
  // SELECT CATEGORY AND FILTER COUNTRIES
  // -------------------------------------------------------

  function selectCategory(tab, focusTab = false) {
    const categorySlug = tab.dataset.visaCategory;

    const categoryName =
      tab.querySelector(".vm-tab-name")?.textContent.trim() || "Visa";

    const searchTerm = getSearchTerm();

    let visibleCount = 0;

    // Update active tab and accessibility attributes
    tabs.forEach((item) => {
      const isActive = item === tab;

      item.classList.toggle("is-active", isActive);
      item.setAttribute("aria-selected", String(isActive));
      item.tabIndex = isActive ? 0 : -1;
    });

    // -----------------------------------------------------
    // FILTER COUNTRY CARDS
    // -----------------------------------------------------

    cards.forEach((card) => {
      const requirementsMap = readRequirementsMap(card);

      // All Visas: show countries with at least one visa option.
      // Other tabs: show countries matching that category.
      const available =
        categorySlug === "all-visas"
          ? Object.values(requirementsMap).some(
              (visaSlug) => typeof visaSlug === "string" && visaSlug.length > 0,
            )
          : Boolean(requirementsMap[categorySlug]);

      const countryName =
        card.querySelector("h4")?.textContent.trim().toLowerCase() || "";

      const matchesSearch = countryName.includes(searchTerm);

      const shouldShow = available && matchesSearch;

      card.hidden = !shouldShow;

      if (shouldShow) {
        visibleCount++;
      }

      // ---------------------------------------------------
      // UPDATE REQUIREMENTS LINK
      // ---------------------------------------------------

      const link = card.querySelector("[data-requirements-link]");

      if (link && available) {
        const countryPath =
          card.dataset.countryUrl ||
          link.pathname.replace(/\/requirements.*$/, "");

        // For All Visas, prefer E-Visa if available.
        // Otherwise, use the first available visa option.
        const visaSlug =
          categorySlug === "all-visas"
            ? requirementsMap["e-visa"] ||
              Object.values(requirementsMap).find(
                (slug) => typeof slug === "string" && slug.length > 0,
              )
            : requirementsMap[categorySlug];

        if (visaSlug) {
          link.href =
            `${countryPath}/requirements?visa=` + encodeURIComponent(visaSlug);
        }
      }
    });

    // -----------------------------------------------------
    // UPDATE CATEGORY TITLE
    // -----------------------------------------------------

    if (title) {
      title.replaceChildren(document.createTextNode(`${categoryName} `));

      const span = document.createElement("span");
      span.textContent = "destinations";

      title.append(span);
    }

    // -----------------------------------------------------
    // UPDATE CATEGORY DESCRIPTION
    // -----------------------------------------------------

    if (description) {
      description.textContent =
        categoryDescriptions[categorySlug] ||
        "Select a country to view the available visa requirements.";
    }

    // -----------------------------------------------------
    // UPDATE COUNTRY COUNT
    // -----------------------------------------------------

    if (count) {
      count.textContent = String(visibleCount);
    }

    if (countLabel) {
      countLabel.textContent =
        visibleCount === 1 ? "country found" : "countries found";
    }

    // -----------------------------------------------------
    // UPDATE NO-RESULTS MESSAGE
    // -----------------------------------------------------

    if (noResults) {
      noResults.hidden = visibleCount > 0;
    }

    // Update clear-search button visibility
    if (clearSearch) {
      clearSearch.hidden = !getSearchTerm();
    }

    // Move keyboard focus when requested
    if (focusTab) {
      tab.focus();
    }
  }

  // -------------------------------------------------------
  // VISA CATEGORY TAB EVENTS
  // -------------------------------------------------------

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => {
      selectCategory(tab);
    });

    tab.addEventListener("keydown", (event) => {
      let nextIndex;

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
      selectCategory(tabs[nextIndex], true);
    });
  });

  // -------------------------------------------------------
  // COUNTRY SEARCH
  // -------------------------------------------------------

  if (countrySearch) {
    countrySearch.addEventListener("input", () => {
      const activeTab =
        tabs.find((tab) => tab.getAttribute("aria-selected") === "true") ||
        tabs[0];

      selectCategory(activeTab);
    });
  }

  // -------------------------------------------------------
  // CLEAR COUNTRY SEARCH
  // -------------------------------------------------------

  if (clearSearch) {
    clearSearch.addEventListener("click", () => {
      if (countrySearch) {
        countrySearch.value = "";
        countrySearch.focus();
      }

      const activeTab =
        tabs.find((tab) => tab.getAttribute("aria-selected") === "true") ||
        tabs[0];

      selectCategory(activeTab);
    });
  }

  // -------------------------------------------------------
  // INITIALIZE DIRECTORY
  // -------------------------------------------------------

  // Prefer All Visas as the initial category.
  const initialTab =
    tabs.find((tab) => tab.dataset.visaCategory === "all-visas") ||
    tabs.find((tab) => tab.getAttribute("aria-selected") === "true") ||
    tabs[0];

  selectCategory(initialTab);
});
