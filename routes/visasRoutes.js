const express = require("express");

const { showVisasPage } = require("../controllers/visasController");

const router = express.Router();

// =========================================================
// VISAS PAGE
// =========================================================

router.get("/", showVisasPage);

module.exports = router;
