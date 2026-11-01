const express = require("express");

const {
  getAllCountries,
  getCountryBySlug,
  getCountryVisaCategories,
  getCountryRequirements,
  getCountriesByVisaCategory,
  getApplicationForm,
  downloadApplicationForm,
  getSubcategoryApplicationForm,
  downloadSubcategoryApplicationForm,
  searchCountries,
} = require("../controllers/countryController");

const router = express.Router();

/* =========================================================
   SEARCH COUNTRIES
   GET /countries/search
========================================================= */

router.get("/search", searchCountries);

/* =========================================================
   VISA CATEGORY PAGES
   E-Visa, Sticker Visa, Visa on Arrival
========================================================= */

router.get("/category/:categorySlug", getCountriesByVisaCategory);

/* =========================================================
   ALL COUNTRIES
   GET /countries
========================================================= */

router.get("/", getAllCountries);

/* =========================================================
   COUNTRY VISA CATEGORY SELECTION PAGE

   Example:
   /countries/uae/visa-categories
========================================================= */

router.get("/:slug/visa-categories", getCountryVisaCategories);

/* =========================================================
   CATEGORY-SPECIFIC REQUIREMENTS PAGE

   Example:
   /countries/uae/requirements/e-visa
========================================================= */

router.get("/:slug/requirements/:categorySlug", getCountryRequirements);

/* =========================================================
   LEGACY REQUIREMENTS URL REDIRECT

   Redirect old URL to the new category selection page.
========================================================= */

router.get("/:slug/requirements", (req, res) => {
  res.redirect(
    `/countries/${encodeURIComponent(req.params.slug)}/visa-categories`,
  );
});

/* =========================================================
   DOWNLOAD SUBCATEGORY APPLICATION FORM PDF

   Example:
   /countries/uae/application-form/e-visa/tourist-visa/download
========================================================= */

router.get(
  "/:slug/application-form/:categorySlug/:subCategorySlug/download",
  downloadSubcategoryApplicationForm,
);

/* =========================================================
   VIEW SUBCATEGORY APPLICATION FORM PDF

   Example:
   /countries/uae/application-form/e-visa/tourist-visa
========================================================= */

router.get(
  "/:slug/application-form/:categorySlug/:subCategorySlug",
  getSubcategoryApplicationForm,
);

/* =========================================================
   DOWNLOAD OLD COUNTRY-LEVEL APPLICATION FORM PDF

   Backward compatibility.
========================================================= */

router.get("/:slug/application-form/download", downloadApplicationForm);

/* =========================================================
   VIEW OLD COUNTRY-LEVEL APPLICATION FORM PDF

   Backward compatibility.
========================================================= */

router.get("/:slug/application-form", getApplicationForm);

/* =========================================================
   COUNTRY DETAIL PAGE
   KEEP THIS ROUTE LAST
========================================================= */

router.get("/:slug", getCountryBySlug);

module.exports = router;
