const express = require("express");

const {
  getAllCountries,
  getCountryBySlug,
  getCountryRequirements,
  getApplicationForm,
  downloadApplicationForm,
  searchCountries,
} = require("../controllers/countryController");

const router = express.Router();

/* SEARCH COUNTRIES */
router.get("/search", searchCountries);

/* ALL COUNTRIES */
router.get("/", getAllCountries);

/* COUNTRY REQUIREMENTS */
router.get("/:slug/requirements", getCountryRequirements);

/* DOWNLOAD APPLICATION FORM PDF */
router.get("/:slug/application-form/download", downloadApplicationForm);

/* VIEW APPLICATION FORM PDF */
router.get("/:slug/application-form", getApplicationForm);

/* COUNTRY DETAIL PAGE — KEEP THIS ROUTE LAST */
router.get("/:slug", getCountryBySlug);

module.exports = router;
