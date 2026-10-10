const News = require("../models/News");

// SHOW ALL NEWS
exports.showAllNews = async (req, res) => {
  try {
    const news = await News.find().sort({ date: -1, _id: -1 }).lean();

    res.render("news/index", {
      news,
      currentPage: "news",
    });
  } catch (error) {
    console.error("Error loading news:", error);
    res.status(500).send("Unable to load news.");
  }
};

// SHOW SINGLE NEWS ARTICLE
exports.showSingleNews = async (req, res) => {
  try {
    const article = await News.findOne({
      slug: req.params.slug,
    }).lean();

    if (!article) {
      return res.status(404).render("errors/404");
    }

    res.render("news/show", {
      article,
      currentPage: "news",
    });
  } catch (error) {
    console.error("Error loading news article:", error);
    res.status(500).send("Unable to load this news article.");
  }
};
