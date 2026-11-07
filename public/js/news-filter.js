document.addEventListener("DOMContentLoaded", () => {
  const filterButtons = document.querySelectorAll(".news-filter");
  const cards = document.querySelectorAll(".all-news-card");
  const emptyMessage = document.querySelector(".news-empty-filter");

  if (!filterButtons.length || !cards.length) return;

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      // Update active tab
      filterButtons.forEach((item) => {
        item.classList.remove("active");
      });

      button.classList.add("active");

      // Get selected category
      const selectedCategory = button.dataset.filter.trim().toLowerCase();

      let visibleCards = 0;

      // Filter news cards
      cards.forEach((card) => {
        const cardCategory = (card.dataset.category || "").trim().toLowerCase();

        const matches =
          selectedCategory === "all" || cardCategory === selectedCategory;

        card.hidden = !matches;

        if (matches) {
          visibleCards++;
        }
      });

      // Show empty message if no articles found
      if (emptyMessage) {
        emptyMessage.hidden = visibleCards > 0;
      }
    });
  });
});
