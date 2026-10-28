const express = require("express");
const router = express.Router();

const { getEVisaCountries } = require("../controllers/eVisaController");

router.get("/", getEVisaCountries);

module.exports = router;
