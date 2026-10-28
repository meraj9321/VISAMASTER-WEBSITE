const express = require("express");
const router = express.Router();

const visasController = require("../controllers/visasController");

// Dedicated Schengen countries page
router.get("/", visasController.showSchengenPage);

module.exports = router;
