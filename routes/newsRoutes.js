const express = require("express");
const router = express.Router();

const {
  showAllNews,
  showSingleNews,
} = require("../controllers/newsController");

// All news page
router.get("/", showAllNews);

// Single news page
router.get("/:slug", showSingleNews);

module.exports = router;
