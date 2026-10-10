const express = require("express");

const router = express.Router();

const { showDashboard } = require("../controllers/adminController");

router.get("/", showDashboard);

module.exports = router;
