const express = require("express");

const router = express.Router();

const {
  showLogin,
  login,
  logout,
} = require("../controllers/adminAuthController");

// =========================================================
// ADMIN LOGIN
// =========================================================

router.get("/login", showLogin);

router.post("/login", login);

// =========================================================
// ADMIN LOGOUT
// =========================================================

router.post("/logout", logout);

module.exports = router;
