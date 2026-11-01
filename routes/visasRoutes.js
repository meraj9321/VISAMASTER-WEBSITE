const express = require("express");

const {
  showVisasPage,
  showSchengenPage,
  showEVisaPage,
  showStickerVisaPage,
  showVisaOnArrivalPage,
} = require("../controllers/visasController");

const router = express.Router();

// =========================================================
// E-VISA PAGE
// GET /visas/e-visa
// =========================================================

router.get("/e-visa", showEVisaPage);

// =========================================================
// STICKER VISA PAGE
// GET /visas/sticker-visa
// =========================================================

router.get("/sticker-visa", showStickerVisaPage);

// =========================================================
// VISA ON ARRIVAL PAGE
// GET /visas/visa-on-arrival
// =========================================================

router.get("/visa-on-arrival", showVisaOnArrivalPage);

// =========================================================
// SCHENGEN PAGE
// GET /visas/schengen
// =========================================================

router.get("/schengen", showSchengenPage);

// =========================================================
// MAIN VISAS PAGE
// GET /visas
// =========================================================

router.get("/", showVisasPage);

module.exports = router;
