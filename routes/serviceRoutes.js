const express = require("express");

const router = express.Router();

// SERVICES PAGE
router.get("/", (req, res) => {
  res.render("services/index", {
    currentPage: "services",
  });
});

module.exports = router;
