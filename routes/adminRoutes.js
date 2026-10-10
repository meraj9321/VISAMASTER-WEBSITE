const express = require("express");

const router = express.Router();

const { showDashboard } = require("../controllers/adminController");
const adminAuth = require("../middleware/adminAuth");

// Protect admin dashboard
router.get("/", adminAuth, showDashboard);

module.exports = router;
