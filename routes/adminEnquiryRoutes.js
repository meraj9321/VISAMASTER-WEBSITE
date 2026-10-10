const express = require("express");

const router = express.Router();

const { showEnquiries } = require("../controllers/adminEnquiryController");

/* =========================================================
   ENQUIRIES MANAGEMENT PAGE

   GET /admin/enquiries
========================================================= */

router.get("/enquiries", showEnquiries);

module.exports = router;
