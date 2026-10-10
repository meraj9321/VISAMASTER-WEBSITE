const Country = require("../models/Country");

// =========================================================
// SHOW VISAS PAGE
// =========================================================

const showVisasPage = async (req, res) => {
  try {
    // -----------------------------------------
    // GET ACTIVE COUNTRIES
    // -----------------------------------------

    const countries = await Country.find({
      active: true,
    }).sort({
      name: 1,
    });

    // -----------------------------------------
    // RENDER VISAS PAGE
    // -----------------------------------------

    res.render("visas/index", {
      currentPage: "visas",
      countries,
    });
  } catch (error) {
    console.error("VISAS PAGE ERROR:", error);

    // -----------------------------------------
    // FALLBACK
    // -----------------------------------------

    res.render("visas/index", {
      currentPage: "visas",
      countries: [],
    });
  }
};

// =========================================================
// EXPORT
// =========================================================

module.exports = {
  showVisasPage,
};
