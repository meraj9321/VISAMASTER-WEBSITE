const express = require("express");

const {
  getAllCountries,
  getCountryBySlug,
  searchCountries,
} = require("../controllers/countryController");

const router = express.Router();

router.get("/search", searchCountries);

router.get("/", getAllCountries);

router.get("/:slug", getCountryBySlug);

module.exports = router;
