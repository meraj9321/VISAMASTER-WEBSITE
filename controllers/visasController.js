const Country = require("../models/Country");

/* =========================================================
   NORMALIZE COUNTRY VISA CATEGORIES

   Keeps only active categories and active subcategories
   for pages that need normalized visa category data.
========================================================= */

const normalizeCountryVisaCategories = (country) => {
  const visaCategories = Array.isArray(country.visaCategories)
    ? country.visaCategories
    : [];

  return {
    ...country,

    visaCategories: visaCategories
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
      })),
  };
};

/* =========================================================
   GET COUNTRIES BY MAIN VISA CATEGORY

   Displays countries having:
   - Active country
   - Active parent visa category

   Subcategories are NOT required.
========================================================= */

/* =========================================================
   GET COUNTRIES BY MAIN VISA CATEGORY

   Displays countries having:
   - Active country
   - Exact matching active parent category
   - At least one active subcategory
========================================================= */

const getCountriesByVisaCategory = async ({
  categorySlug,
  categoryName,
  viewName,
  currentPage,
  req,
  res,
}) => {
  try {
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
      .sort({ name: 1 })
      .select("name slug flag image visaCategories")
      .lean();

    // Keep ONLY the requested category and its active subcategories.
    const filteredCountries = countries
      .map((country) => {
        const selectedCategory = (country.visaCategories || []).find(
          (category) =>
            category &&
            category.slug === categorySlug &&
            category.isActive !== false,
        );

        if (!selectedCategory) return null;

        const activeSubCategories = (
          selectedCategory.subCategories || []
        ).filter(
          (subCategory) => subCategory && subCategory.isActive !== false,
        );

        if (!activeSubCategories.length) return null;

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

    return res.render(viewName, {
      currentPage,
      countries: filteredCountries,
      loadError: false,
    });
  } catch (error) {
    console.error(`${categoryName.toUpperCase()} PAGE ERROR:`, error);

    return res.status(500).render(viewName, {
      currentPage,
      countries: [],
      loadError: true,
    });
  }
};

/* =========================================================
   MAIN VISAS PAGE
   GET /visas

   Displays all active countries.
========================================================= */

const showVisasPage = async (req, res) => {
  try {
    const databaseCountries = await Country.find({
      isActive: true,
    })
      .sort({ name: 1 })
      .select("name slug flag image visaCategories")
      .lean();

    const countries = databaseCountries.map(normalizeCountryVisaCategories);

    return res.render("visas/index", {
      currentPage: "visas",
      countries,
      loadError: false,
    });
  } catch (error) {
    console.error("VISAS PAGE ERROR:", error);

    return res.status(500).render("visas/index", {
      currentPage: "visas",
      countries: [],
      loadError: true,
    });
  }
};

/* =========================================================
   E-VISA COUNTRIES PAGE
   GET /visas/e-visa

   Displays countries having:
   - Active country
   - Active E-Visa main category

   Subcategories are NOT required.
========================================================= */

const showEVisaPage = async (req, res) => {
  return getCountriesByVisaCategory({
    categorySlug: "e-visa",
    categoryName: "E-Visa",
    viewName: "visas/e-visa",
    currentPage: "e-visa",
    req,
    res,
  });
};

/* =========================================================
   STICKER VISA COUNTRIES PAGE
   GET /visas/sticker-visa

   Displays countries having:
   - Active country
   - Active Sticker Visa main category

   Subcategories are NOT required.
========================================================= */

const showStickerVisaPage = async (req, res) => {
  return getCountriesByVisaCategory({
    categorySlug: "sticker-visa",
    categoryName: "Sticker Visa",
    viewName: "visas/sticker-visa",
    currentPage: "sticker-visa",
    req,
    res,
  });
};

/* =========================================================
   VISA ON ARRIVAL COUNTRIES PAGE
   GET /visas/visa-on-arrival

   Displays countries having:
   - Active country
   - Active Visa on Arrival main category

   Subcategories are NOT required.
========================================================= */

const showVisaOnArrivalPage = async (req, res) => {
  return getCountriesByVisaCategory({
    categorySlug: "visa-on-arrival",
    categoryName: "Visa on Arrival",
    viewName: "visas/visa-on-arrival",
    currentPage: "visa-on-arrival",
    req,
    res,
  });
};

/* =========================================================
   SCHENGEN COUNTRIES PAGE
   GET /visas/schengen

   Only active Schengen countries.
========================================================= */

const showSchengenPage = async (req, res, next) => {
  try {
    const databaseCountries = await Country.find({
      isActive: true,
      isSchengen: true,
    })
      .sort({ name: 1 })
      .select("name slug flag image visaCategories isSchengen")
      .lean();

    const countries = databaseCountries.map(normalizeCountryVisaCategories);

    return res.render("visas/schengen", {
      currentPage: "schengen",
      countries,
      loadError: false,
    });
  } catch (error) {
    console.error("SCHENGEN PAGE ERROR:", error);

    return next(error);
  }
};

/* =========================================================
   EXPORT CONTROLLERS
========================================================= */

module.exports = {
  showVisasPage,
  showEVisaPage,
  showStickerVisaPage,
  showVisaOnArrivalPage,
  showSchengenPage,
};
