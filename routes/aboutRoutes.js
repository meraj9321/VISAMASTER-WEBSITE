const express = require("express");

const router = express.Router();

// ABOUT PAGE
router.get("/", (req, res) => {
  res.render("about/index", {
    currentPage: "about",
  });
});

module.exports = router;
