const express = require("express");

const router = express.Router();

const {
  showContactPage,
  submitEnquiry,
} = require("../controllers/contactController");

// ==========================================
// CONTACT PAGE
// ==========================================

router.get("/", showContactPage);

// ==========================================
// SUBMIT ENQUIRY
// ==========================================

router.post("/", submitEnquiry);

module.exports = router;
