const Country = require("../models/Country");

exports.showDashboard = async (req, res) => {
  try {
    const countryCount = await Country.countDocuments();

    res.render("admin/index", {
      countryCount,
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);

    res.status(500).send("Unable to load admin dashboard.");
  }
};
