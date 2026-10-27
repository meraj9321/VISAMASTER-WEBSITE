const express = require("express");

const router = express.Router();

const {
  showCountries,
  showEditCountry,
  updateCountry,
  deleteCountryApplicationForm,
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
========================================================= */

router.post("/countries/:slug/edit", uploadApplicationForm, updateCountry);
router.post(
  "/countries/:slug/application-form/delete",

  deleteCountryApplicationForm,
);

module.exports = router;
