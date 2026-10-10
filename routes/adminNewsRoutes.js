const express = require("express");
const router = express.Router();

const {
  showNews,
  showNewNewsForm,
  createNews,
  showEditNewsForm,
  updateNews,
  deleteNews,
} = require("../controllers/adminNewsController");

// NEWS LIST
router.get("/news", showNews);

// ADD NEWS FORM
router.get("/news/new", showNewNewsForm);

// CREATE NEWS
router.post("/news/new", createNews);

// EDIT NEWS FORM
router.get("/news/:id/edit", showEditNewsForm);

// UPDATE NEWS
router.post("/news/:id/edit", updateNews);

// DELETE NEWS
router.post("/news/:id/delete", deleteNews);

module.exports = router;
