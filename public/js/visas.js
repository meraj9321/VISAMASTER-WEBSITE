document.addEventListener("DOMContentLoaded", () => {
  const tabs = Array.from(document.querySelectorAll("[data-visa-category]"));

  const cards = Array.from(document.querySelectorAll(".vm-visa-country-card"));

  const title = document.getElementById("vmSelectedCategoryTitle");
  const description = document.getElementById("vmSelectedCategoryDescription");
  const count = document.getElementById("vmCountryCount");
  const countLabel = document.getElementById("vmCountryCountLabel");
  const noResults = document.getElementById("vmVisaNoResults");

  // Stop if category buttons are not available
  if (!tabs.length) return;

  function selectCategory(tab, focusTab = false) {
    const selectedSlug = tab.dataset.visaCategory;

    const categoryName =
      tab.querySelector("span:nth-child(2)")?.textContent.trim() || "Visa";

    const visibleCards = [];

    // Update active category button
    tabs.forEach((item) => {
      const isActive = item === tab;

      item.classList.toggle("is-active", isActive);
      item.setAttribute("aria-selected", String(isActive));
      item.tabIndex = isActive ? 0 : -1;
    });

    // Filter countries by selected visa category
    cards.forEach((card) => {
      const availableSlugs = (card.dataset.countrySlugs || "")
        .split(",")
        .filter(Boolean);

      const isAvailable = availableSlugs.includes(selectedSlug);

      card.hidden = !isAvailable;

      if (isAvailable) {
        visibleCards.push(card);
      }

      // Update See Requirements URL
      const requirementsButton = card.querySelector("[data-requirements-link]");

      if (requirementsButton) {
        requirementsButton.href = `${card.dataset.countryUrl}?visa=${encodeURIComponent(selectedSlug)}`;
      }
    });

    // Update selected category heading
    if (title) {
      title.textContent = "";

      title.append(document.createTextNode(`${categoryName} `));

      const span = document.createElement("span");
      span.textContent = "destinations";

      title.append(span);
    }

    // Update description
    if (description) {
      description.textContent =
        `Countries listed for ${categoryName}. ` +
        "Select a country to view this category's requirements.";
    }

    // Update country count
    if (count) {
      count.textContent = String(visibleCards.length);
    }

    if (countLabel) {
      countLabel.textContent =
        visibleCards.length === 1 ? "country found" : "countries found";
    }

    // Show or hide no-results message
    if (noResults) {
      noResults.hidden = visibleCards.length > 0;
    }

    // Optional keyboard focus
    if (focusTab) {
      tab.focus();
    }
  }

  // Category click and keyboard navigation
  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => {
      selectCategory(tab);
    });

    tab.addEventListener("keydown", (event) => {
      let nextIndex = index;

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

  // Automatically select the first category on page load
  selectCategory(tabs[0]);
});
