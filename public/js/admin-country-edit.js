document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("countryEditForm");

  const visaCategoriesContainer = document.getElementById(
    "visaCategoriesContainer",
  );

  if (!form || !visaCategoriesContainer) {
    console.error("Admin country edit form not found.");
    return;
  }

  // =====================================================
  // AUTO RESIZE ELIGIBILITY AND REQUIREMENTS
  // =====================================================

  function resizeTextarea(textarea) {
    if (!textarea) return;

    // Reset height first so textarea can shrink too
    textarea.style.height = "auto";

    // Calculate actual content height, including wrapped lines
    const minHeight = 82;
    const requiredHeight = Math.max(minHeight, textarea.scrollHeight);

    textarea.style.height = `${requiredHeight}px`;
    textarea.style.overflowY = "hidden";
  }

  function resizeRequirementTextareas(container = visaCategoriesContainer) {
    const textareas = container.querySelectorAll(
      'textarea[data-field="eligibility"], textarea[data-field="requirements"]',
    );

    textareas.forEach(resizeTextarea);
  }

  // Resize existing textareas after page layout is ready
  requestAnimationFrame(() => {
    resizeRequirementTextareas();
  });

  // Resize while typing or deleting
  visaCategoriesContainer.addEventListener("input", (event) => {
    if (
      event.target.matches(
        'textarea[data-field="eligibility"], textarea[data-field="requirements"]',
      )
    ) {
      resizeTextarea(event.target);
    }
  });

  // Recalculate when browser width changes and text wraps differently
  window.addEventListener("resize", () => {
    resizeRequirementTextareas();
  });

  // =====================================================
  // REINDEX SUBCATEGORIES AND PDF INPUTS
  // =====================================================

  function reindexSubcategories() {
    document
      .querySelectorAll("[data-category]")
      .forEach((categoryCard, categoryIndex) => {
        const activeSelect = categoryCard.querySelector(
          ".category-head select",
        );

        const categoryName = categoryCard.querySelector(
          'input[name$="[name]"]',
        );

        const categorySlugInput = categoryCard.querySelector(
          'input[name$="[slug]"]',
        );

        if (activeSelect) {
          activeSelect.name = `visaCategories[${categoryIndex}][isActive]`;
        }

        if (categoryName) {
          categoryName.name = `visaCategories[${categoryIndex}][name]`;
        }

        if (categorySlugInput) {
          categorySlugInput.name = `visaCategories[${categoryIndex}][slug]`;
        }

        const categorySlug = categorySlugInput?.value.trim() || "";

        categoryCard
          .querySelectorAll("[data-subcategory]")
          .forEach((subCard, subIndex) => {
            subCard.querySelectorAll("[data-field]").forEach((field) => {
              field.name = `visaCategories[${categoryIndex}][subCategories][${subIndex}][${field.dataset.field}]`;
            });

            const subSlug =
              subCard.querySelector('[data-field="slug"]')?.value.trim() || "";

            const pdfInput = subCard.querySelector("[data-subcategory-pdf]");

            if (pdfInput) {
              pdfInput.name = `subcategoryPdf[${categorySlug}][${subSlug}]`;
            }

            const heading = subCard.querySelector(".sub-head h4");

            const nameInput = subCard.querySelector('[data-field="name"]');

            if (heading && nameInput) {
              heading.textContent = `Subcategory: ${nameInput.value || "New subcategory"}`;
            }
          });
      });
  }

  // =====================================================
  // REINDEX FAQS
  // =====================================================

  function reindexFaqs() {
    document.querySelectorAll("[data-faq]").forEach((card, index) => {
      card.querySelectorAll("[data-faq-field]").forEach((field) => {
        field.name = `faqs[${index}][${field.dataset.faqField}]`;
      });

      const heading = card.querySelector(".repeat-head h4");

      if (heading) {
        heading.textContent = `FAQ ${index + 1}`;
      }
    });
  }

  // =====================================================
  // CREATE NEW SUBCATEGORY
  // =====================================================

  function createSubcategoryCard() {
    const card = document.createElement("article");

    card.className = "sub-card";
    card.setAttribute("data-subcategory", "");

    card.innerHTML = `
      <div class="sub-head">
        <h4>New subcategory</h4>

        <button
          type="button"
          class="edit-btn danger"
          data-remove-subcategory
        >
          Delete
        </button>
      </div>

      <div class="sub-content">
        <div class="edit-grid">

          <div class="edit-field">
            <label>Subcategory Name *</label>
            <input data-field="name" required>
          </div>

          <div class="edit-field">
            <label>Slug *</label>
            <input
              data-field="slug"
              required
              placeholder="tourist-visa"
            >
          </div>

          <div class="edit-field full">
            <label>Purpose</label>
            <input data-field="purpose">
          </div>

          <div class="edit-field full">
            <label>Description</label>
            <textarea data-field="description" rows="2"></textarea>
          </div>

          <div class="edit-field">
            <label>Eligibility · One item per line</label>
            <textarea data-field="eligibility" rows="4"></textarea>
          </div>

          <div class="edit-field">
            <label>Requirements · One item per line</label>
            <textarea data-field="requirements" rows="4"></textarea>
          </div>

          <div class="edit-field">
            <label>Subcategory Status</label>
            <select data-field="isActive">
              <option value="true" selected>Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>

          <div class="edit-field full">
            <label>Application Form PDF</label>

            <div class="pdf-panel">
              <span class="edit-help">
                No application form uploaded yet.
              </span>

              <div class="edit-field" style="margin-top:14px">
                <label>Upload Application Form PDF</label>

                <input
                  type="file"
                  data-subcategory-pdf
                  accept="application/pdf,.pdf"
                >

                <small class="edit-help">
                  PDF only · Maximum 5 MB.
                </small>
              </div>
            </div>
          </div>

        </div>
      </div>
    `;

    return card;
  }

  // =====================================================
  // ADD / DELETE SUBCATEGORIES
  // =====================================================

  visaCategoriesContainer.addEventListener("click", (event) => {
    const addButton = event.target.closest("[data-add-subcategory]");

    const removeButton = event.target.closest("[data-remove-subcategory]");

    if (addButton) {
      const category = addButton.closest("[data-category]");

      const newCard = createSubcategoryCard();

      category.querySelector("[data-subcategories]").appendChild(newCard);

      reindexSubcategories();

      // Initialize both auto-resizing textareas in new card
      requestAnimationFrame(() => {
        resizeRequirementTextareas(newCard);
      });
    }

    if (removeButton) {
      const card = removeButton.closest("[data-subcategory]");

      const name =
        card.querySelector('[data-field="name"]')?.value || "this subcategory";

      if (
        window.confirm(
          `Delete ${name}? This will remove it when you save the country.`,
        )
      ) {
        card.remove();
        reindexSubcategories();
      }
    }
  });

  // =====================================================
  // UPDATE SUBCATEGORY NAME AND SLUG
  // =====================================================

  visaCategoriesContainer.addEventListener("input", (event) => {
    if (
      event.target.matches('[data-field="name"]') ||
      event.target.matches('[data-field="slug"]')
    ) {
      reindexSubcategories();
    }
  });

  // =====================================================
  // ADD / DELETE FAQS
  // =====================================================

  const faqContainer = document.getElementById("faqContainer");

  const addFaqBtn = document.getElementById("addFaqBtn");

  if (faqContainer) {
    faqContainer.addEventListener("click", (event) => {
      const removeButton = event.target.closest("[data-remove-card]");

      if (removeButton) {
        if (window.confirm("Remove this FAQ?")) {
          removeButton.closest("[data-faq]").remove();
          reindexFaqs();
        }
      }
    });
  }

  if (addFaqBtn && faqContainer) {
    addFaqBtn.addEventListener("click", () => {
      const index = document.querySelectorAll("[data-faq]").length;

      const card = document.createElement("article");

      card.className = "repeat-card";
      card.setAttribute("data-faq", "");

      card.innerHTML = `
        <div class="repeat-head">
          <h4>FAQ ${index + 1}</h4>

          <button
            type="button"
            class="edit-btn danger"
            data-remove-card
          >
            Remove
          </button>
        </div>

        <div class="repeat-content edit-grid">
          <div class="edit-field full">
            <label>Question</label>
            <input data-faq-field="question">
          </div>

          <div class="edit-field full">
            <label>Answer</label>
            <textarea
              data-faq-field="answer"
              rows="3"
            ></textarea>
          </div>
        </div>
      `;

      faqContainer.appendChild(card);

      reindexFaqs();
    });
  }

  // =====================================================
  // DELETE INDIVIDUAL SUBCATEGORY PDF
  // =====================================================

  async function deleteSubcategoryPdf(
    countrySlug,
    categorySlug,
    subCategorySlug,
  ) {
    if (
      !window.confirm(
        "Delete this subcategory application form PDF? This cannot be undone.",
      )
    ) {
      return;
    }

    try {
      const url =
        `/admin/countries/${encodeURIComponent(countrySlug)}` +
        `/application-form/${encodeURIComponent(categorySlug)}` +
        `/${encodeURIComponent(subCategorySlug)}/delete`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        credentials: "same-origin",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to delete PDF.");
      }

      alert(result.message || "PDF deleted successfully.");

      window.location.reload();
    } catch (error) {
      alert(error.message || "Unable to delete PDF. Please try again.");
    }
  }

  // PDF deletion event delegation (Helmet CSP compatible)

  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-delete-subcategory-pdf]");

    if (!button) return;

    deleteSubcategoryPdf(
      button.dataset.countrySlug,
      button.dataset.categorySlug,
      button.dataset.subcategorySlug,
    );
  });

  // =====================================================
  // FORM SUBMISSION VALIDATION
  // =====================================================

  form.addEventListener("submit", (event) => {
    reindexSubcategories();

    reindexFaqs();

    const pdfInputs = document.querySelectorAll("[data-subcategory-pdf]");

    for (const input of pdfInputs) {
      if (!input.files || !input.files.length) {
        continue;
      }

      const file = input.files[0];

      const isPdfName = /\.pdf$/i.test(file.name || "");

      if (!isPdfName || file.type !== "application/pdf") {
        event.preventDefault();

        alert("Please select PDF files only.");

        input.focus();

        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        event.preventDefault();

        alert("Each PDF file must be 5 MB or smaller.");

        input.focus();

        return;
      }
    }

    if (!window.confirm("Save all changes to this country?")) {
      event.preventDefault();
    }
  });

  // =====================================================
  // INITIAL REINDEX
  // =====================================================

  reindexSubcategories();

  reindexFaqs();

  // Final resize after initial form setup
  requestAnimationFrame(() => {
    resizeRequirementTextareas();
  });
});
