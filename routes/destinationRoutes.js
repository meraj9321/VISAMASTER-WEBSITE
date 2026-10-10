const express = require("express");

const router = express.Router();

const Country = require("../models/Country");

router.get("/", async (req, res) => {
  try {
    const countries = await Country.find({
      isActive: true,
    }).sort({
      displayOrder: 1,
    });

    console.log("Countries found:", countries.length);

    res.render("destinations/index", {
      countries: countries,
      currentPage: "destinations",
    });
  } catch (error) {
    console.error("Destination page error:", error);

    res.status(500).send("Something went wrong");
  }
});

module.exports = router;
