const Country = require("../models/Country");

/* =========================================================
   HELPER FUNCTIONS
========================================================= */

function toArray(value) {
  if (value === undefined || value === null || value === "") {
    return [];
  }

  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  return String(value)
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

/*
  Preserve pasted requirement text:
  - Line breaks
  - Blank lines
  - Indentation
  - Numbering
  - Spacing
*/
function toPreservedTextArray(value) {
  if (value === undefined || value === null || value === "") {
    return [];
  }

  const text = Array.isArray(value)
    ? value.map((item) => String(item ?? "")).join("\n")
    : String(value);

  return text === "" ? [] : [text];
}

function toBoolean(value) {
  return value === "true" || value === true || value === "on" || value === "1";
}

/*
  Express may parse nested form fields as arrays or objects.
*/
function getObjectArray(value) {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === "object") {
    return Object.keys(value)
      .sort((a, b) => Number(a) - Number(b))
      .map((key) => value[key]);
  }

  return [];
}

function setFieldTimestamp(fieldUpdatedAt, fieldName, oldValue, newValue) {
  const oldString = JSON.stringify(oldValue ?? "");
  const newString = JSON.stringify(newValue ?? "");

  if (oldString !== newString) {
    fieldUpdatedAt[fieldName] = new Date();
  }
}

/* =========================================================
   REQUIRED VISA CATEGORIES
========================================================= */

const REQUIRED_VISA_CATEGORIES = [
  {
    name: "E-Visa",
    slug: "e-visa",
  },
  {
    name: "Sticker Visa",
    slug: "sticker-visa",
  },
  {
    name: "Visa on Arrival",
    slug: "visa-on-arrival",
  },
];

/* =========================================================
   PDF FIELD NAME

   Example:
   subcategoryPdf[e-visa][tourist-visa]
========================================================= */

function getSubcategoryPdfFieldName(categorySlug, subCategorySlug) {
  return `subcategoryPdf[${categorySlug}][${subCategorySlug}]`;
}

/* =========================================================
   NORMALIZE MULTER FILES
   Supports .any() array and .fields() object formats.
========================================================= */

function getUploadedFiles(req) {
  if (Array.isArray(req.files)) {
    return req.files;
  }

  if (req.files && typeof req.files === "object") {
    return Object.values(req.files).flat();
  }

  return req.file ? [req.file] : [];
}

/* =========================================================
   CLEAN SUBCATEGORIES

   Existing PDFs are preserved by matching the subcategory
   slug. A newly uploaded PDF replaces only that subcategory's
   existing PDF.
========================================================= */

function cleanSubCategories(
  value,
  oldSubCategories = [],
  categorySlug,
  uploadedFiles = [],
) {
  const submittedSubCategories = getObjectArray(value);

  return submittedSubCategories
    .filter((item) => item && typeof item === "object" && !Array.isArray(item))
    .map((item) => {
      const name = String(item.name || "").trim();

      const slug = String(item.slug || "")
        .trim()
        .toLowerCase();

      const oldSubcategory = oldSubCategories.find(
        (oldItem) =>
          oldItem.slug === slug ||
          (!oldItem.slug && oldItem.name?.toLowerCase() === name.toLowerCase()),
      );

      // Preserve existing PDF when the subcategory remains.
      let applicationForm = oldSubcategory?.applicationForm || undefined;

      // Find a PDF uploaded for this exact category/subcategory.
      const fieldName = getSubcategoryPdfFieldName(categorySlug, slug);

      const uploadedFile = uploadedFiles.find(
        (file) => file.fieldname === fieldName,
      );

      // Replace only this subcategory's PDF.
      if (uploadedFile) {
        applicationForm = {
          filename: String(uploadedFile.originalname || "application-form.pdf")
            .replace(/[\\/]/g, "")
            .trim(),

          contentType: "application/pdf",

          data: uploadedFile.buffer,

          size: uploadedFile.size,

          uploadedAt: new Date(),
        };
      }

      return {
        name,
        slug,

        purpose: String(item.purpose || "").trim(),

        description: String(item.description || "").trim(),

        eligibility: toPreservedTextArray(item.eligibility),

        requirements: toPreservedTextArray(item.requirements),

        isActive: toBoolean(item.isActive),

        applicationForm,
      };
    })
    .filter((item) => item.name && item.slug);
}

/* =========================================================
   CLEAN VISA CATEGORIES

   Exactly 3 main categories are maintained.

   Existing subcategory PDFs are preserved independently.
========================================================= */

function cleanVisaCategories(value, oldCategories = [], uploadedFiles = []) {
  const submittedCategories = getObjectArray(value);

  if (!submittedCategories.length) {
    throw new Error(
      "Visa categories were not received. Please check the edit form.",
    );
  }

  return REQUIRED_VISA_CATEGORIES.map((requiredCategory) => {
    const submittedCategory = submittedCategories.find(
      (category) =>
        category &&
        String(category.slug || "").trim() === requiredCategory.slug,
    );

    if (!submittedCategory) {
      throw new Error(
        `Missing visa category: ${requiredCategory.name}. Please refresh the edit page and try again.`,
      );
    }

    const oldCategory = oldCategories.find(
      (category) => category.slug === requiredCategory.slug,
    );

    return {
      name: requiredCategory.name,

      slug: requiredCategory.slug,

      isActive: toBoolean(submittedCategory.isActive),

      // No category-level PDF. PDFs belong to subcategories.
      subCategories: cleanSubCategories(
        submittedCategory.subCategories,
        oldCategory?.subCategories || [],
        requiredCategory.slug,
        uploadedFiles,
      ),
    };
  });
}

/* =========================================================
   CLEAN FAQS
========================================================= */

function cleanFaqs(value) {
  return getObjectArray(value)
    .filter((item) => item && typeof item === "object" && !Array.isArray(item))
    .map((item) => ({
      question: String(item.question || "").trim(),
      answer: String(item.answer || "").trim(),
    }))
    .filter((item) => item.question || item.answer);
}

/* =========================================================
   SHOW COUNTRIES MANAGEMENT PAGE
========================================================= */

exports.showCountries = async (req, res, next) => {
  try {
    const countries = await Country.find({}).sort({ name: 1 }).lean();

    res.render("admin/countries/index", {
      countries,
    });
  } catch (error) {
    console.error("Countries admin page error:", error);
    next(error);
  }
};

/* =========================================================
   SHOW EDIT COUNTRY PAGE
========================================================= */

exports.showEditCountry = async (req, res, next) => {
  try {
    const country = await Country.findOne({
      slug: req.params.slug,
    }).lean();

    if (!country) {
      return res.status(404).send("Country not found");
    }

    // Fallback for older documents.
    if (!Array.isArray(country.visaCategories)) {
      country.visaCategories = REQUIRED_VISA_CATEGORIES.map((category) => ({
        ...category,
        isActive: true,
        subCategories: [],
      }));
    }

    res.render("admin/countries/edit", {
      country,
    });
  } catch (error) {
    console.error("Show edit country error:", error);
    next(error);
  }
};

/* =========================================================
   UPDATE COUNTRY
========================================================= */

exports.updateCountry = async (req, res, next) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res
        .status(400)
        .send("Form data missing. Check Multer middleware and form enctype.");
    }

    const oldSlug = req.params.slug;

    /*
      Explicitly select nested PDF buffers.
      Otherwise select:false prevents existing PDFs
      from being loaded and preserved during an update.
    */
    const country = await Country.findOne({
      slug: oldSlug,
    }).select("+visaCategories.subCategories.applicationForm.data");

    if (!country) {
      return res.status(404).send("Country not found");
    }

    const body = req.body;
    const uploadedFiles = getUploadedFiles(req);

    /* =====================================================
       FIELD TIMESTAMP OBJECT
    ===================================================== */

    const fieldUpdatedAt = country.fieldUpdatedAt
      ? JSON.parse(JSON.stringify(country.fieldUpdatedAt))
      : {};

    /* =====================================================
       1. BASIC COUNTRY INFORMATION
    ===================================================== */

    const basicFields = [
      "name",
      "slug",
      "countryCode",
      "flag",
      "image",
      "shortDescription",
      "description",
      "heroBadge",
    ];

    for (const field of basicFields) {
      if (body[field] !== undefined) {
        const newValue = String(body[field] || "").trim();

        setFieldTimestamp(fieldUpdatedAt, field, country[field], newValue);

        country[field] = newValue;
      }
    }

    /* =====================================================
       2. VISA CATEGORIES AND SUBCATEGORIES
    ===================================================== */

    // Keep old category/subcategory PDF data before rebuilding.
    const oldVisaCategories = (country.visaCategories || []).map((category) =>
      category.toObject(),
    );

    const newVisaCategories = cleanVisaCategories(
      body.visaCategories,
      oldVisaCategories,
      uploadedFiles,
    );

    setFieldTimestamp(
      fieldUpdatedAt,
      "visaCategories",
      oldVisaCategories,
      newVisaCategories,
    );

    /* =====================================================
       INDIVIDUAL CATEGORY TIMESTAMPS
    ===================================================== */

    if (!fieldUpdatedAt.visaCategories) {
      fieldUpdatedAt.visaCategories = {};
    }

    for (const newCategory of newVisaCategories) {
      const oldCategory = oldVisaCategories.find(
        (category) => category.slug === newCategory.slug,
      );

      const categoryTimestampKey = newCategory.slug;

      if (!fieldUpdatedAt.visaCategories[categoryTimestampKey]) {
        fieldUpdatedAt.visaCategories[categoryTimestampKey] = {};
      }

      const categoryTimestamps =
        fieldUpdatedAt.visaCategories[categoryTimestampKey];

      setFieldTimestamp(
        categoryTimestamps,
        "isActive",
        oldCategory?.isActive,
        newCategory.isActive,
      );

      setFieldTimestamp(
        categoryTimestamps,
        "subCategories",
        oldCategory?.subCategories || [],
        newCategory.subCategories,
      );

      /*
        Record individual subcategory PDF upload timestamps.
      */
      for (const newSubcategory of newCategory.subCategories) {
        const oldSubcategory = oldCategory?.subCategories?.find(
          (item) => item.slug === newSubcategory.slug,
        );

        const hasNewPdf = uploadedFiles.some(
          (file) =>
            file.fieldname ===
            getSubcategoryPdfFieldName(newCategory.slug, newSubcategory.slug),
        );

        if (hasNewPdf) {
          if (!categoryTimestamps.subcategoryApplicationForms) {
            categoryTimestamps.subcategoryApplicationForms = {};
          }

          categoryTimestamps.subcategoryApplicationForms[newSubcategory.slug] =
            {
              uploadedAt: new Date(),
            };
        }
      }
    }

    country.visaCategories = newVisaCategories;

    country.markModified("visaCategories");

    /* =====================================================
       3. TRAVEL INFORMATION
    ===================================================== */

    const oldTravelInfo = country.travelInfo
      ? country.travelInfo.toObject
        ? country.travelInfo.toObject()
        : JSON.parse(JSON.stringify(country.travelInfo))
      : {};

    const travelInfoBody = body.travelInfo || {};

    const newTravelInfo = {
      bestTimeToVisit: String(travelInfoBody.bestTimeToVisit || "").trim(),

      currency: String(travelInfoBody.currency || "").trim(),

      language: String(travelInfoBody.language || "").trim(),

      timezone: String(travelInfoBody.timezone || "").trim(),

      capital: String(travelInfoBody.capital || "").trim(),

      majorCities: toArray(travelInfoBody.majorCities),

      flightDuration: String(travelInfoBody.flightDuration || "").trim(),

      timeDifference: String(travelInfoBody.timeDifference || "").trim(),

      airportInformation: String(
        travelInfoBody.airportInformation || "",
      ).trim(),
    };

    if (!fieldUpdatedAt.travelInfo) {
      fieldUpdatedAt.travelInfo = {};
    }

    for (const field of Object.keys(newTravelInfo)) {
      setFieldTimestamp(
        fieldUpdatedAt.travelInfo,
        field,
        oldTravelInfo[field],
        newTravelInfo[field],
      );
    }

    country.travelInfo = newTravelInfo;

    /* =====================================================
       4. TRAVEL TIPS
    ===================================================== */

    const newTravelTips = toArray(body.travelTips);

    setFieldTimestamp(
      fieldUpdatedAt,
      "travelTips",
      country.travelTips,
      newTravelTips,
    );

    country.travelTips = newTravelTips;

    /* =====================================================
       5. IMPORTANT NOTES
    ===================================================== */

    const newImportantNotes = toArray(body.importantNotes);

    setFieldTimestamp(
      fieldUpdatedAt,
      "importantNotes",
      country.importantNotes,
      newImportantNotes,
    );

    country.importantNotes = newImportantNotes;

    /* =====================================================
       6. FAQS
    ===================================================== */

    const newFaqs = cleanFaqs(body.faqs);

    setFieldTimestamp(fieldUpdatedAt, "faqs", country.faqs, newFaqs);

    country.faqs = newFaqs;

    /* =====================================================
       7. SCHENGEN STATUS
    ===================================================== */

    const newIsSchengen = toBoolean(body.isSchengen);

    setFieldTimestamp(
      fieldUpdatedAt,
      "isSchengen",
      country.isSchengen,
      newIsSchengen,
    );

    country.isSchengen = newIsSchengen;

    /* =====================================================
       8. COUNTRY ACTIVE STATUS
    ===================================================== */

    const newIsActive = toBoolean(body.isActive);

    setFieldTimestamp(
      fieldUpdatedAt,
      "isActive",
      country.isActive,
      newIsActive,
    );

    country.isActive = newIsActive;

    /* =====================================================
       9. LEGACY COUNTRY-LEVEL PDF

       Old PDF is retained unless an old single-file
       upload is explicitly submitted.
    ===================================================== */

    if (req.file) {
      country.applicationForm = {
        filename: String(req.file.originalname || "application-form.pdf")
          .replace(/[\\/]/g, "")
          .trim(),

        contentType: "application/pdf",

        data: req.file.buffer,

        size: req.file.size,

        uploadedAt: new Date(),
      };
    }

    /* =====================================================
       10. SAVE FIELD TIMESTAMPS
    ===================================================== */

    country.fieldUpdatedAt = fieldUpdatedAt;

    country.markModified("fieldUpdatedAt");

    /* =====================================================
       11. SAVE COUNTRY
    ===================================================== */

    await country.save();

    console.log(`Country "${country.name}" updated successfully.`);

    /* =====================================================
       12. REDIRECT
    ===================================================== */

    return res.redirect(
      `/admin/countries/${encodeURIComponent(country.slug)}/edit?updated=true`,
    );
  } catch (error) {
    console.error("Country update error:", error);

    if (error.code === 11000) {
      return res
        .status(400)
        .send("This country slug already exists. Please use a unique slug.");
    }

    if (error.name === "ValidationError") {
      return res
        .status(400)
        .send(`Country validation failed: ${error.message}`);
    }

    if (error.message && error.message.includes("Visa categor")) {
      return res.status(400).send(error.message);
    }

    next(error);
  }
};

/* =========================================================
   DELETE ONE SUBCATEGORY APPLICATION FORM PDF

   POST /admin/countries/:slug/application-form/:categorySlug/:subCategorySlug/delete
========================================================= */

exports.deleteSubcategoryApplicationForm = async (req, res) => {
  try {
    const { slug, categorySlug, subCategorySlug } = req.params;

    const allowedCategorySlugs = ["e-visa", "sticker-visa", "visa-on-arrival"];

    if (!allowedCategorySlugs.includes(categorySlug)) {
      return res.status(400).json({
        success: false,
        message: "Invalid visa category.",
      });
    }

    const country = await Country.findOne({ slug });

    if (!country) {
      return res.status(404).json({
        success: false,
        message: "Country not found.",
      });
    }

    const category = country.visaCategories.find(
      (item) => item.slug === categorySlug,
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Visa category not found.",
      });
    }

    const subcategory = category.subCategories.find(
      (item) => item.slug === subCategorySlug,
    );

    if (!subcategory) {
      return res.status(404).json({
        success: false,
        message: "Visa subcategory not found.",
      });
    }

    if (!subcategory.applicationForm?.filename) {
      return res.status(404).json({
        success: false,
        message: "No application form PDF exists for this subcategory.",
      });
    }

    // Delete only this subcategory's PDF.
    subcategory.applicationForm = undefined;

    country.markModified("visaCategories");

    if (!country.fieldUpdatedAt) {
      country.fieldUpdatedAt = {};
    }

    if (!country.fieldUpdatedAt.visaCategories) {
      country.fieldUpdatedAt.visaCategories = {};
    }

    if (!country.fieldUpdatedAt.visaCategories[categorySlug]) {
      country.fieldUpdatedAt.visaCategories[categorySlug] = {};
    }

    const categoryTimestamps =
      country.fieldUpdatedAt.visaCategories[categorySlug];

    if (!categoryTimestamps.subcategoryApplicationForms) {
      categoryTimestamps.subcategoryApplicationForms = {};
    }

    categoryTimestamps.subcategoryApplicationForms[subCategorySlug] = {
      deletedAt: new Date(),
    };

    country.markModified("fieldUpdatedAt");

    await country.save();

    return res.status(200).json({
      success: true,
      message: `${subcategory.name} application form PDF deleted successfully.`,
    });
  } catch (error) {
    console.error("Delete subcategory application form PDF error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete application form PDF.",
    });
  }
};

/* =========================================================
   DELETE OLD COUNTRY-LEVEL APPLICATION FORM PDF
   Kept for backward compatibility.
========================================================= */

exports.deleteCountryApplicationForm = async (req, res) => {
  try {
    const country = await Country.findOne({
      slug: req.params.slug,
    });

    if (!country) {
      return res.status(404).json({
        success: false,
        message: "Country not found.",
      });
    }

    if (!country.applicationForm || !country.applicationForm.filename) {
      return res.status(404).json({
        success: false,
        message: "No application form PDF exists for this country.",
      });
    }

    country.applicationForm = undefined;

    country.markModified("applicationForm");

    if (!country.fieldUpdatedAt) {
      country.fieldUpdatedAt = {};
    }

    country.fieldUpdatedAt.applicationForm = {
      deletedAt: new Date(),
    };

    country.markModified("fieldUpdatedAt");

    await country.save();

    return res.status(200).json({
      success: true,
      message: "Application form PDF deleted successfully.",
    });
  } catch (error) {
    console.error("Delete country application form PDF error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete application form PDF.",
    });
  }
};
