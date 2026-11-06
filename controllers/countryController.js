const Country = require("../models/Country");

/* =========================================================
   SHARED HELPERS
========================================================= */

const ALLOWED_VISA_CATEGORIES = {
  "e-visa": "E-Visa",
  "sticker-visa": "Sticker Visa",
  "visa-on-arrival": "Visa on Arrival",
};

const getActiveVisaCategories = (categories = []) => {
  if (!Array.isArray(categories)) return [];

  return categories
    .filter(
      (category) =>
        category &&
        category.isActive !== false &&
        Array.isArray(category.subCategories) &&
        category.subCategories.some(
          (subCategory) => subCategory && subCategory.isActive !== false,
        ),
    )
    .map((category) => ({
      ...category,
      subCategories: category.subCategories.filter(
        (subCategory) => subCategory && subCategory.isActive !== false,
      ),
    }));
};

/*
 * Accept only known internal VisaMaster pages as return destinations.
 * Prevents external redirects.
 */

const getSafeReturnTo = (value, countrySlug, fallback) => {
  if (typeof value !== "string") return fallback;

  const returnTo = value.trim();

  const allowedReturnPaths = [
    "/visas",
    "/visas/schengen",
    "/visas/e-visa",
    "/visas/sticker-visa",
    "/visas/visa-on-arrival",
  ];

  // Direct return destinations.
  if (allowedReturnPaths.includes(returnTo)) {
    return returnTo;
  }

  // Allow the country's visa-category page while preserving
  // the original page from which the user arrived.
  const categorySelectionPath = `/countries/${encodeURIComponent(countrySlug)}/visa-categories`;

  if (returnTo.startsWith(categorySelectionPath + "?")) {
    try {
      const queryString = returnTo.split("?")[1];
      const params = new URLSearchParams(queryString);

      const nestedReturnTo = params.get("returnTo");

      if (allowedReturnPaths.includes(nestedReturnTo)) {
        return (
          categorySelectionPath +
          `?returnTo=${encodeURIComponent(nestedReturnTo)}`
        );
      }
    } catch (error) {
      return fallback;
    }
  }

  return fallback;
};

/*
 * Convert stored PDF data into a Buffer.
 */

const getPdfBuffer = (applicationForm) => {
  if (!applicationForm || !applicationForm.data) {
    return null;
  }

  const pdfBuffer = Buffer.isBuffer(applicationForm.data)
    ? applicationForm.data
    : Buffer.from(applicationForm.data);

  if (!pdfBuffer.length) {
    return null;
  }

  return pdfBuffer;
};

/*
 * Sanitize filename before sending it in HTTP headers.
 */

const getSafePdfFilename = (filename) => {
  return String(filename || "application-form.pdf")
    .replace(/[\r\n"]/g, "_")
    .replace(/[\\/]/g, "_");
};

/*
 * Shared PDF response handler.
 *
 * disposition:
 * inline     = Open in browser
 * attachment = Download
 */

const sendPdfResponse = (res, applicationForm, disposition) => {
  const pdfBuffer = getPdfBuffer(applicationForm);

  if (!pdfBuffer) {
    return res.status(404).send("Application form PDF not found.");
  }

  const filename = getSafePdfFilename(applicationForm.filename);

  res.setHeader(
    "Content-Type",
    applicationForm.contentType || "application/pdf",
  );

  res.setHeader("Content-Length", String(pdfBuffer.length));

  res.setHeader(
    "Content-Disposition",
    `${disposition}; filename="${filename}"`,
  );

  return res.status(200).end(pdfBuffer);
};

/*
 * Validate and normalize route parameters.
 */

const getNormalizedSlug = (value) => {
  return String(value || "")
    .trim()
    .toLowerCase();
};

/* =========================================================
   GET ALL COUNTRIES
========================================================= */

const getAllCountries = async (req, res) => {
  try {
    const countries = await Country.find({
      isActive: true,
    })
      .sort({ name: 1 })
      .lean();

    return res.render("countries/index", {
      countries,
      currentPage: "countries",
    });
  } catch (error) {
    console.error("Get countries error:", error);

    return res.status(500).render("errors/500");
  }
};

/* =========================================================
   GET COUNTRY DETAIL PAGE
========================================================= */

const getCountryBySlug = async (req, res) => {
  try {
    const slug = getNormalizedSlug(req.params.slug);

    const country = await Country.findOne({
      slug,
      isActive: true,
    }).lean();

    if (!country) {
      return res.status(404).render("errors/404");
    }

    country.visaCategories = getActiveVisaCategories(country.visaCategories);

    return res.render("countries/show", {
      country,
      currentPage: "countries",
    });
  } catch (error) {
    console.error("Get country error:", error);

    return res.status(500).render("errors/500");
  }
};

/* =========================================================
   GET COUNTRY VISA CATEGORY SELECTION PAGE

   URL:
   /countries/:slug/visa-categories
========================================================= */

const getCountryVisaCategories = async (req, res) => {
  try {
    const slug = getNormalizedSlug(req.params.slug);

    const country = await Country.findOne({
      slug,
      isActive: true,
    })
      .select("name slug flag image visaCategories")
      .lean();

    if (!country) {
      return res.status(404).render("errors/404");
    }

    const visaCategories = getActiveVisaCategories(country.visaCategories);

    if (!visaCategories.length) {
      return res.status(404).render("errors/404");
    }

    // Accept Schengen as a valid return destination.
    const returnTo = getSafeReturnTo(req.query.returnTo, slug, "/visas");

    return res.render("countries/visa-categories", {
      country,
      visaCategories,
      returnTo,
      currentPage: "countries",
    });
  } catch (error) {
    console.error("Country visa categories error:", error);

    return res.status(500).render("errors/500");
  }
};

/* =========================================================
   GET CATEGORY-SPECIFIC REQUIREMENTS PAGE

   URL:
   /countries/:slug/requirements/:categorySlug
========================================================= */

const getCountryRequirements = async (req, res) => {
  try {
    const slug = getNormalizedSlug(req.params.slug);

    const categorySlug = getNormalizedSlug(req.params.categorySlug);

    if (!ALLOWED_VISA_CATEGORIES[categorySlug]) {
      return res.status(404).render("errors/404");
    }

    /*
     * IMPORTANT:
     * Fetch all country information fields required by
     * requirements.ejs.
     *
     * Previously these fields were missing from .select(),
     * so EJS was receiving undefined values.
     */

    const country = await Country.findOne({
      slug,
      isActive: true,
    })
      .select(
        [
          "name",
          "slug",
          "countryCode",
          "flag",
          "image",
          "shortDescription",
          "description",
          "heroBadge",
          "visaCategories",
          "travelInfo",
          "travelTips",
          "importantNotes",
          "faqs",
          "applicationForm.filename",
          "applicationForm.contentType",
          "applicationForm.size",
          "applicationForm.uploadedAt",
        ].join(" "),
      )
      .lean();

    if (!country) {
      return res.status(404).render("errors/404");
    }

    // Find ONLY the requested active parent category.
    const selectedCategory = (country.visaCategories || []).find(
      (category) =>
        category &&
        category.slug === categorySlug &&
        category.isActive !== false,
    );

    if (!selectedCategory) {
      return res.status(404).render("errors/404");
    }

    // Get only active subcategories.
    const subCategories = (selectedCategory.subCategories || []).filter(
      (subCategory) => subCategory && subCategory.isActive !== false,
    );

    if (!subCategories.length) {
      return res.status(404).render("errors/404");
    }

    const filteredSelectedCategory = {
      ...selectedCategory,
      subCategories,
    };

    /*
     * IMPORTANT BACK NAVIGATION LOGIC
     *
     * E-Visa       -> /visas/e-visa
     * Sticker Visa -> /visas/sticker-visa
     * VOA          -> /visas/visa-on-arrival
     *
     * Schengen can still return to the country's
     * visa-category selection page through returnTo.
     */

    const defaultReturnPath = `/visas/${categorySlug}`;

    const returnTo = getSafeReturnTo(
      req.query.returnTo,
      slug,
      defaultReturnPath,
    );

    return res.render("countries/requirements", {
      country,
      selectedCategory: filteredSelectedCategory,
      subCategories,
      returnTo,
      currentPage: "countries",
    });
  } catch (error) {
    console.error("Get country requirements error:", error);

    return res.status(500).render("errors/500");
  }
};

/* =========================================================
   GET COUNTRIES BY VISA CATEGORY

   Allowed categories:
   - e-visa
   - sticker-visa
   - visa-on-arrival
========================================================= */

const getCountriesByVisaCategory = async (req, res) => {
  try {
    const categorySlug = getNormalizedSlug(req.params.categorySlug);

    const categoryName = ALLOWED_VISA_CATEGORIES[categorySlug];

    if (!categoryName) {
      return res.status(404).render("errors/404");
    }

    const countries = await Country.find({
      isActive: true,

      visaCategories: {
        $elemMatch: {
          slug: categorySlug,
          isActive: { $ne: false },

          subCategories: {
            $elemMatch: {
              isActive: { $ne: false },
            },
          },
        },
      },
    })
      .select("name slug flag image visaCategories")
      .sort({ name: 1 })
      .lean();

    // Keep only the selected parent category and active subcategories.
    const filteredCountries = countries
      .map((country) => {
        const selectedCategory = (country.visaCategories || []).find(
          (category) =>
            category &&
            category.slug === categorySlug &&
            category.isActive !== false,
        );

        if (!selectedCategory) {
          return null;
        }

        const activeSubCategories = (
          selectedCategory.subCategories || []
        ).filter(
          (subCategory) => subCategory && subCategory.isActive !== false,
        );

        if (!activeSubCategories.length) {
          return null;
        }

        return {
          ...country,

          visaCategories: [
            {
              ...selectedCategory,
              subCategories: activeSubCategories,
            },
          ],
        };
      })
      .filter(Boolean);

    return res.render("visas/category", {
      countries: filteredCountries,
      categorySlug,
      categoryName,
      currentPage: categorySlug,
    });
  } catch (error) {
    console.error("Get countries by visa category error:", error);

    return res.status(500).render("errors/500");
  }
};

/* =========================================================
   FIND SUBCATEGORY APPLICATION FORM

   Finds:
   Country
      -> Visa Category
          -> Subcategory
              -> Application Form PDF

   Used by View and Download handlers.
========================================================= */

const findSubcategoryApplicationForm = async (
  slug,
  categorySlug,
  subCategorySlug,
) => {
  const country = await Country.findOne({
    slug,
    isActive: true,
  }).select("+visaCategories.subCategories.applicationForm.data");

  if (!country) {
    return {
      country: null,
      applicationForm: null,
    };
  }

  const category = (country.visaCategories || []).find(
    (item) => item && item.slug === categorySlug,
  );

  if (!category) {
    return {
      country,
      applicationForm: null,
    };
  }

  const subCategory = (category.subCategories || []).find(
    (item) => item && item.slug === subCategorySlug,
  );

  if (!subCategory) {
    return {
      country,
      applicationForm: null,
    };
  }

  return {
    country,
    applicationForm: subCategory.applicationForm,
  };
};

/* =========================================================
   VIEW SUBCATEGORY APPLICATION FORM PDF

   URL:
   /countries/:slug/application-form/:categorySlug/:subCategorySlug
========================================================= */

const getSubcategoryApplicationForm = async (req, res) => {
  try {
    const slug = getNormalizedSlug(req.params.slug);

    const categorySlug = getNormalizedSlug(req.params.categorySlug);

    const subCategorySlug = getNormalizedSlug(req.params.subCategorySlug);

    if (!ALLOWED_VISA_CATEGORIES[categorySlug]) {
      return res.status(404).send("Invalid visa category.");
    }

    const { country, applicationForm } = await findSubcategoryApplicationForm(
      slug,
      categorySlug,
      subCategorySlug,
    );

    if (!country) {
      return res.status(404).send("Country not found.");
    }

    if (!applicationForm) {
      return res.status(404).send("Application form PDF not found.");
    }

    return sendPdfResponse(res, applicationForm, "inline");
  } catch (error) {
    console.error("View subcategory application form error:", error);

    return res.status(500).send("Unable to open application form PDF.");
  }
};

/* =========================================================
   DOWNLOAD SUBCATEGORY APPLICATION FORM PDF

   URL:
   /countries/:slug/application-form/:categorySlug/:subCategorySlug/download
========================================================= */

const downloadSubcategoryApplicationForm = async (req, res) => {
  try {
    const slug = getNormalizedSlug(req.params.slug);

    const categorySlug = getNormalizedSlug(req.params.categorySlug);

    const subCategorySlug = getNormalizedSlug(req.params.subCategorySlug);

    if (!ALLOWED_VISA_CATEGORIES[categorySlug]) {
      return res.status(404).send("Invalid visa category.");
    }

    const { country, applicationForm } = await findSubcategoryApplicationForm(
      slug,
      categorySlug,
      subCategorySlug,
    );

    if (!country) {
      return res.status(404).send("Country not found.");
    }

    if (!applicationForm) {
      return res.status(404).send("Application form PDF not found.");
    }

    return sendPdfResponse(res, applicationForm, "attachment");
  } catch (error) {
    console.error("Download subcategory application form error:", error);

    return res.status(500).send("Unable to download application form PDF.");
  }
};

/* =========================================================
   LEGACY COUNTRY-LEVEL APPLICATION FORM PDF

   Kept for backward compatibility with old documents.

   URL:
   /countries/:slug/application-form
========================================================= */

const getApplicationForm = async (req, res) => {
  try {
    const slug = getNormalizedSlug(req.params.slug);

    const country = await Country.findOne({
      slug,
      isActive: true,
    }).select(
      "+applicationForm.data applicationForm.filename applicationForm.contentType",
    );

    if (!country) {
      return res.status(404).send("Country not found.");
    }

    return sendPdfResponse(res, country.applicationForm, "inline");
  } catch (error) {
    console.error("View application form error:", error);

    return res.status(500).send("Unable to open application form PDF.");
  }
};

/* =========================================================
   DOWNLOAD LEGACY COUNTRY-LEVEL APPLICATION FORM PDF

   URL:
   /countries/:slug/application-form/download
========================================================= */

const downloadApplicationForm = async (req, res) => {
  try {
    const slug = getNormalizedSlug(req.params.slug);

    const country = await Country.findOne({
      slug,
      isActive: true,
    }).select(
      "+applicationForm.data applicationForm.filename applicationForm.contentType",
    );

    if (!country) {
      return res.status(404).send("Country not found.");
    }

    return sendPdfResponse(res, country.applicationForm, "attachment");
  } catch (error) {
    console.error("Download application form error:", error);

    return res.status(500).send("Unable to download application form PDF.");
  }
};

/* =========================================================
   SEARCH COUNTRIES
========================================================= */

const searchCountries = async (req, res) => {
  try {
    const query = String(req.query.q || "")
      .trim()
      .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    if (query.length < 2) {
      return res.json([]);
    }

    const countries = await Country.find({
      name: {
        $regex: `^${query}`,
        $options: "i",
      },

      isActive: true,
    })
      .select("name slug flag image")
      .sort({ name: 1 })
      .limit(8)
      .lean();

    return res.json(countries);
  } catch (error) {
    console.error("Country search error:", error);

    return res.status(500).json({
      message: "Unable to search countries",
    });
  }
};

/* =========================================================
   EXPORT CONTROLLERS
========================================================= */

module.exports = {
  getAllCountries,
  getCountryBySlug,
  getCountryVisaCategories,
  getCountryRequirements,
  getCountriesByVisaCategory,

  // New subcategory PDF handlers
  getSubcategoryApplicationForm,
  downloadSubcategoryApplicationForm,

  // Old country-level PDF handlers
  getApplicationForm,
  downloadApplicationForm,

  searchCountries,
};
