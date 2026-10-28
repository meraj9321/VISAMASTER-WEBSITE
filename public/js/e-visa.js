document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("evisaCountrySearch");
  const clearButton = document.getElementById("clearEvisaSearch");
  const countryGrid = document.getElementById("evisaCountryGrid");
  const noResults = document.getElementById("evisaNoResults");
  const countElement = document.getElementById("evisaCount");
  const countLabel = document.getElementById("evisaCountLabel");

  if (!searchInput || !countryGrid) return;

  const cards = Array.from(countryGrid.querySelectorAll(".evisa-country-card"));

  function filterCountries() {
    const query = searchInput.value.trim().toLowerCase();
    let visibleCount = 0;

    cards.forEach((card) => {
      const countryName = card.dataset.countryName || "";
      const matches = countryName.includes(query);

      card.hidden = !matches;

      if (matches) visibleCount++;
    });

    if (countElement) {
      countElement.textContent = visibleCount;
    }

    if (countLabel) {
      countLabel.textContent =
        visibleCount === 1 ? "destination found" : "destinations found";
    }

    if (noResults) {
      noResults.hidden = visibleCount !== 0;
    }

    if (clearButton) {
      clearButton.hidden = query.length === 0;
    }
  }

  searchInput.addEventListener("input", filterCountries);

  if (clearButton) {
    clearButton.addEventListener("click", () => {
      searchInput.value = "";
      filterCountries();
      searchInput.focus();
    });
  }
});
