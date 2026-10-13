const express = require("express");

const router = express.Router();

const { showDashboard } = require("../controllers/adminController");

const adminAuth = require("../middleware/adminAuth");

// =====================================================
// ADMIN DASHBOARD
// GET /admin
// =====================================================

router.get("/", adminAuth, showDashboard);

// =====================================================
// CLIENT STATUS — COMING SOON
// GET /admin/client_status
// =====================================================

router.get("/client_status", adminAuth, (req, res) => {
  res.render("admin/client-status");
});

// =====================================================
// EXPORT ROUTER
// =====================================================

module.exports = router;
