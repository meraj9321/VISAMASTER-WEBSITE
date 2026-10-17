const express = require("express");

const {
  getAllCountries,
  getCountryBySlug,
  getCountryRequirements,
  searchCountries,
} = require("../controllers/countryController");

const router = express.Router();

/* =========================================================
   COUNTRY SEARCH
========================================================= */

router.get("/search", searchCountries);

/* =========================================================
   ALL COUNTRIES
========================================================= */

router.get("/", getAllCountries);

/* =========================================================
   COUNTRY REQUIREMENTS PAGE
   NEW ROUTE
========================================================= */

router.get("/:slug/requirements", getCountryRequirements);

/* =========================================================
   COUNTRY DETAIL PAGE
   EXISTING ROUTE - PRESERVED
========================================================= */

router.get("/:slug", getCountryBySlug);

module.exports = router;
