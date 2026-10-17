const Country = require("../models/Country");

/* =========================================================
   GET ALL COUNTRIES
========================================================= */

const getAllCountries = async (req, res) => {
  try {
    const countries = await Country.find({
      isActive: true,
    })
      .sort({ name: 1 })
      .lean();

    res.render("countries/index", {
      countries,
      currentPage: "countries",
    });
  } catch (error) {
    console.error("Get countries error:", error);

    res.status(500).render("errors/500");
  }
};

/* =========================================================
   GET COUNTRY DETAIL PAGE
   EXISTING FUNCTION - PRESERVED
========================================================= */

const getCountryBySlug = async (req, res) => {
  try {
    const slug = String(req.params.slug || "")
      .trim()
      .toLowerCase();

    const country = await Country.findOne({
      slug,
      isActive: true,
    }).lean();

    if (!country) {
      return res.status(404).render("errors/404");
    }

    res.render("countries/show", {
      country,
      currentPage: "countries",
    });
  } catch (error) {
    console.error("Get country error:", error);

    res.status(500).render("errors/500");
  }
};

/* =========================================================
   GET COUNTRY REQUIREMENTS PAGE
   NEW FUNCTION
========================================================= */

const getCountryRequirements = async (req, res) => {
  try {
    const slug = String(req.params.slug || "")
      .trim()
      .toLowerCase();

    const country = await Country.findOne({
      slug,
      isActive: true,
    })
      .select("name slug flag visaTypes")
      .lean();

    if (!country) {
      return res.status(404).render("errors/404");
    }

    // Get active visa categories from MongoDB
    const visaTypes = (country.visaTypes || []).filter(
      (visa) => visa && visa.isActive !== false,
    );

    // Send visaTypes to requirements.ejs
    return res.render("countries/requirements", {
      country,
      visaTypes,
      currentPage: "countries",
    });
  } catch (error) {
    console.error("Get country requirements error:", error);

    return res.status(500).render("errors/500");
  }
};
/* =========================================================
   SEARCH COUNTRIES
   EXISTING FUNCTION PRESERVED
========================================================= */

const searchCountries = async (req, res) => {
  try {
    const query = String(req.query.q || "")
      .trim()
      .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    if (query.length < 2) {
      return res.json([]);
    }

    const countries = await Country.find({
      name: {
        $regex: `^${query}`,
        $options: "i",
      },
      isActive: true,
    })
      .select("name slug flag image")
      .sort({ name: 1 })
      .limit(8)
      .lean();

    return res.json(countries);
  } catch (error) {
    console.error("Country search error:", error);

    return res.status(500).json({
      message: "Unable to search countries",
    });
  }
};

/* =========================================================
   EXPORT CONTROLLERS
========================================================= */

module.exports = {
  getAllCountries,
  getCountryBySlug,
  getCountryRequirements,
  searchCountries,
};
