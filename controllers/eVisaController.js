const Country = require("../models/Country");

const getEVisaCountries = async (req, res) => {
  try {
    const countries = await Country.find({
      isActive: true,
      visaCategories: {
        $elemMatch: {
          slug: "e-visa",
          isActive: true,
        },
      },
    })
      .select("name slug flag image shortDescription description")
      .sort({ name: 1 })
      .lean();

    res.render("visas/e-visa", {
      currentPage: "e-visa",
      countries,
      loadError: false,
    });
  } catch (error) {
    console.error("E-Visa page error:", error);

    res.status(500).render("visas/e-visa", {
      currentPage: "e-visa",
      countries: [],
      loadError: true,
    });
  }
};

module.exports = {
  getEVisaCountries,
};
