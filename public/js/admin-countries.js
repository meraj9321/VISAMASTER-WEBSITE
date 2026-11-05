document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.getElementById("countrySearch");

  const countryRows = document.querySelectorAll(".country-row");

  if (!searchInput) return;

  searchInput.addEventListener("input", function () {
    const searchText = this.value.toLowerCase().trim();

    countryRows.forEach(function (row) {
      const name = (row.dataset.name || "").toLowerCase();
      const code = (row.dataset.code || "").toLowerCase();

      const matches = name.includes(searchText) || code.includes(searchText);

      row.style.display = matches ? "" : "none";
    });
  });
});
