const Enquiry = require("../models/Enquiry");

/* =========================================================
   ENQUIRIES MANAGEMENT PAGE
   GET /admin/enquiries
========================================================= */

exports.showEnquiries = async (req, res, next) => {
  try {
    const enquiries = await Enquiry.find({}).sort({ createdAt: -1 }).lean();

    res.render("admin/enquiries/index", {
      enquiries,
    });
  } catch (error) {
    console.error("Admin enquiries page error:", error);

    next(error);
  }
};
