const express = require("express");

const router = express.Router();

const {
  showCountries,
  showEditCountry,
  updateCountry,
  deleteCountryApplicationForm,
  deleteSubcategoryApplicationForm,
} = require("../controllers/adminCountryController");

const { uploadApplicationForm } = require("../middleware/uploadMiddleware");

/* =========================================================
   COUNTRIES MANAGEMENT PAGE
   GET /admin/countries
========================================================= */

router.get("/countries", showCountries);

/* =========================================================
   EDIT COUNTRY PAGE
   GET /admin/countries/:slug/edit
========================================================= */

router.get("/countries/:slug/edit", showEditCountry);

/* =========================================================
   UPDATE COUNTRY
   POST /admin/countries/:slug/edit

   Supports dynamic subcategory PDF uploads:
   subcategoryPdf[categorySlug][subCategorySlug]
========================================================= */

router.post("/countries/:slug/edit", uploadApplicationForm, updateCountry);

/* =========================================================
   DELETE SUBCATEGORY APPLICATION FORM PDF

   POST /admin/countries/:slug/application-form/:categorySlug/:subCategorySlug/delete

   Example:
   /admin/countries/usa/application-form/e-visa/tourist-visa/delete
========================================================= */

router.post(
  "/countries/:slug/application-form/:categorySlug/:subCategorySlug/delete",
  deleteSubcategoryApplicationForm,
);

/* =========================================================
   DELETE OLD COUNTRY-LEVEL APPLICATION FORM PDF
   Kept for backward compatibility.
========================================================= */

router.post(
  "/countries/:slug/application-form/delete",
  deleteCountryApplicationForm,
);

module.exports = router;
