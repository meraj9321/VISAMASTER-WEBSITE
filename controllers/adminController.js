const Country = require("../models/Country");
const News = require("../models/News");
const TeamMember = require("../models/TeamMember");
const Enquiry = require("../models/Enquiry");

// =====================================================
// ADMIN DASHBOARD
// =====================================================

exports.showDashboard = async (req, res) => {
  try {
    // Fetch all dashboard statistics
    const [countryCount, newsCount, teamMemberCount, enquiryCount] =
      await Promise.all([
        Country.countDocuments(),
        News.countDocuments(),
        TeamMember.countDocuments(),
        Enquiry.countDocuments(),
      ]);

    // Render dashboard with statistics
    res.render("admin/index", {
      countryCount,
      newsCount,
      teamMemberCount,
      enquiryCount,
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);

    res.status(500).send("Unable to load admin dashboard.");
  }
};
