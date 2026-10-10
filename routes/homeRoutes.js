const express = require("express");

const router = express.Router();

// HOME PAGE
router.get("/", (req, res) => {
  res.render("home/index", {
    currentPage: "home",
  });
});

module.exports = router;
