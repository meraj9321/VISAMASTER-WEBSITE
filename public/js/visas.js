/* =========================================================
   VISAMASTER — ALL VISAS DIRECTORY

   FEATURES:
   1. Display all active countries
   2. Client-side country search
   3. Dynamic country count
   4. Clear search button
   5. No-results message
   6. Case-insensitive search
   7. Safe DOM handling

   NEW DATABASE STRUCTURE:
   country.visaCategories[]
      └── subCategories[]
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  /* =======================================================
     DOM ELEMENTS
  ======================================================= */

  const cards = Array.from(document.querySelectorAll(".vm-visa-country-card"));

  const countrySearch = document.getElementById("vmCountrySearch");

  const clearSearch = document.getElementById("vmClearCountrySearch");

  const count = document.getElementById("vmCountryCount");

  const countLabel = document.getElementById("vmCountryCountLabel");

  const noResults = document.getElementById("vmVisaNoResults");

  // Stop safely if this script is loaded on another page.
  if (!cards.length || !countrySearch) return;

  /* =======================================================
     NORMALIZE SEARCH TEXT
  ======================================================= */

  function normalizeText(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ");
  }

  /* =======================================================
     FILTER COUNTRIES
  ======================================================= */

  function filterCountries() {
    const searchTerm = normalizeText(countrySearch.value);

    let visibleCount = 0;

    cards.forEach((card) => {
      const countryName =
        card.dataset.countryName ||
        card.querySelector(".vm-country-card-name h4")?.textContent ||
        card.querySelector("h4")?.textContent ||
        "";

      const matchesSearch = normalizeText(countryName).includes(searchTerm);

      card.hidden = !matchesSearch;

      if (matchesSearch) {
        visibleCount++;
      }
    });

    /* =====================================================
       UPDATE COUNTRY COUNT
    ===================================================== */

    if (count) {
      count.textContent = String(visibleCount);
    }

    if (countLabel) {
      countLabel.textContent =
        visibleCount === 1 ? "country found" : "countries found";
    }

    /* =====================================================
       UPDATE NO-RESULTS MESSAGE
    ===================================================== */

    if (noResults) {
      noResults.hidden = visibleCount !== 0;
    }

    /* =====================================================
       UPDATE CLEAR BUTTON
    ===================================================== */

    if (clearSearch) {
      clearSearch.hidden = searchTerm.length === 0;
    }
  }

  /* =======================================================
     COUNTRY SEARCH EVENT
  ======================================================= */

  countrySearch.addEventListener("input", filterCountries);

  /* =======================================================
     CLEAR SEARCH EVENT
  ======================================================= */

  if (clearSearch) {
    clearSearch.addEventListener("click", () => {
      countrySearch.value = "";

      filterCountries();

      countrySearch.focus();
    });
  }

  /* =======================================================
     INITIALIZE ALL VISAS DIRECTORY

     All countries are visible by default.
  ======================================================= */

  filterCountries();
});
