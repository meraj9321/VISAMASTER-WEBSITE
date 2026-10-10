const News = require("../models/News");

// =========================================================
// SHOW HOME PAGE
// =========================================================

exports.showHomePage = async (req, res) => {
  try {
    // Fetch the latest 3 news articles from MongoDB Atlas.
    const news = await News.find().sort({ date: -1, _id: -1 }).limit(3).lean();

    // Render the existing Home page.
    return res.render("home/index", {
      news,
      currentPage: "home",
    });
  } catch (error) {
    console.error("Error loading Home page:", error);

    // Keep the Home page accessible even if news fetching fails.
    return res.status(500).send("Unable to load the Home page.");
  }
};
