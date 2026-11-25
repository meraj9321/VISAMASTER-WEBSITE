const express = require("express");
const router = express.Router();

// TEMPORARY LOGIN / SIGNUP PAGE
router.get("/login", (req, res) => {
  res.status(200).render("auth/coming-soon", {
    currentPage: "auth",
  });
});

module.exports = router;
