const Country = require("../models/Country");

const getEVisaCountries = async (req, res) => {
  try {
    const allCountries = await Country.find({
      isActive: true,
    })
      .select("name slug flag image shortDescription description visaTypes")
      .sort({ name: 1 })
      .lean();

    // Include a country only when it has an active E-Visa category.
    const countries = allCountries
      .map((country) => {
        const eVisaTypes = (country.visaTypes || []).filter(
          (visa) =>
            visa.isActive !== false &&
            Array.isArray(visa.categories) &&
            visa.categories.some(
              (category) => String(category).trim().toLowerCase() === "e-visa",
            ),
        );

        return {
          ...country,
          eVisaTypes,
        };
      })
      .filter((country) => country.eVisaTypes.length > 0);

    res.render("visas/e-visa", {
      currentPage: "e-visa",
      countries,
    });
  } catch (error) {
    console.error("E-Visa page error:", error);

    res.status(500).send("Unable to load E-Visa countries.");
  }
};

module.exports = {
  getEVisaCountries,
};
