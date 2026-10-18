/* VisaMaster Visa Information Directory */
document.addEventListener("DOMContentLoaded", () => {
  const tabs = Array.from(document.querySelectorAll("[data-visa-category]"));
  const cards = Array.from(document.querySelectorAll(".vm-visa-country-card"));
  const title = document.getElementById("vmSelectedCategoryTitle");
  const description = document.getElementById("vmSelectedCategoryDescription");
  const count = document.getElementById("vmCountryCount");
  const countLabel = document.getElementById("vmCountryCountLabel");
  const noResults = document.getElementById("vmVisaNoResults");

  if (!tabs.length) return;

  const categoryDescriptions = {
    "e-visa": "Explore destinations where an electronic visa option is listed by VisaMaster.",
    "tourist-visa": "Find tourist visa options for holidays, sightseeing and leisure travel.",
    "visa-on-arrival": "Check destinations where Visa on Arrival assistance is listed.",
    "business-visa": "Explore business visa options for meetings, events and professional visits.",
    "stamping-visa": "Find visa options requiring passport submission or visa stamping, where configured.",
    "sticker-visa": "Explore sticker visa options and their country-specific requirements.",
  };

  function readRequirementsMap(card) {
    try {
      return JSON.parse(card.dataset.requirementsMap || "{}");
    } catch (error) {
      console.error("Invalid VisaMaster requirements map:", error);
      return {};
    }
  }

  function selectCategory(tab, focusTab = false) {
    const categorySlug = tab.dataset.visaCategory;
    const categoryName = tab.querySelector(".vm-tab-name")?.textContent.trim() || "Visa";
    let visibleCount = 0;

    tabs.forEach((item) => {
      const isActive = item === tab;
      item.classList.toggle("is-active", isActive);
      item.setAttribute("aria-selected", String(isActive));
      item.tabIndex = isActive ? 0 : -1;
    });

    cards.forEach((card) => {
      const requirementsMap = readRequirementsMap(card);
      const visaSlug = requirementsMap[categorySlug];
      const link = card.querySelector("[data-requirements-link]");
      const available = Boolean(visaSlug);

      card.hidden = !available;
      if (available) visibleCount += 1;

      if (link && available) {
        const countryPath = card.dataset.countryUrl || link.pathname.replace(/\/requirements.*$/, "");
        link.href = `${countryPath}/requirements?visa=${encodeURIComponent(visaSlug)}`;
      }
    });

    if (title) {
      title.replaceChildren(document.createTextNode(`${categoryName} `));
      const span = document.createElement("span");
      span.textContent = "destinations";
      title.append(span);
    }
    if (description) description.textContent = categoryDescriptions[categorySlug] || "Select a country to view the matching visa requirements.";
    if (count) count.textContent = String(visibleCount);
    if (countLabel) countLabel.textContent = visibleCount === 1 ? "country found" : "countries found";
    if (noResults) noResults.hidden = visibleCount > 0;
    if (focusTab) tab.focus();
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => selectCategory(tab));
    tab.addEventListener("keydown", (event) => {
      let nextIndex;
      if (event.key === "ArrowRight") nextIndex = (index + 1) % tabs.length;
      else if (event.key === "ArrowLeft") nextIndex = (index - 1 + tabs.length) % tabs.length;
      else if (event.key === "Home") nextIndex = 0;
      else if (event.key === "End") nextIndex = tabs.length - 1;
      else return;
      event.preventDefault();
      selectCategory(tabs[nextIndex], true);
    });
  });

  selectCategory(tabs.find((tab) => tab.getAttribute("aria-selected") === "true") || tabs[0]);
});
