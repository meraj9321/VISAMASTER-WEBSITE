const Country = require("../models/Country");

const VALID_DIRECTORY_CATEGORIES = new Set([
  "e-visa",
  "tourist-visa",
  "visa-on-arrival",
  "business-visa",
  "stamping-visa",
  "sticker-visa",
]);

/*
 * Backward compatibility for older Country documents.
 * Older records have visaTypes but no `categories` field. We can safely
 * infer only the purpose categories from an exact, unambiguous legacy name/slug.
 * Application methods (E-Visa, Visa on Arrival, Stamping, Sticker) are NOT
 * inferred because the old schema does not prove how that visa is submitted.
 * This is a read-time normalization only; it does not mutate MongoDB records.
 */
function normalizeLegacyVisaCategories(country) {
  const normalizedCountry = { ...country };

  normalizedCountry.visaTypes = (country.visaTypes || [])
    .filter((visa) => visa && visa.isActive !== false)
    .map((visa) => {
      const existingCategories = Array.isArray(visa.categories)
        ? visa.categories.filter((category) =>
            VALID_DIRECTORY_CATEGORIES.has(category),
          )
        : [];

      if (existingCategories.length) {
        return { ...visa, categories: [...new Set(existingCategories)] };
      }

      const slug = String(visa.slug || "")
        .trim()
        .toLowerCase()
        .replace(/[_\s]+/g, "-");

      const name = String(visa.name || "")
        .trim()
        .toLowerCase()
        .replace(/[_\s]+/g, "-");

      const purpose = String(visa.purpose || "")
        .trim()
        .toLowerCase();

      // Only infer clear, exact legacy visa types. Do not guess application methods.
      if (
        ["tourist", "tourist-visa"].includes(slug) ||
        ["tourist-visa"].includes(name) ||
        purpose === "tourism and leisure"
      ) {
        return { ...visa, categories: ["tourist-visa"] };
      }

      if (
        ["business", "business-visa"].includes(slug) ||
        ["business-visa"].includes(name) ||
        purpose === "business activities"
      ) {
        return { ...visa, categories: ["business-visa"] };
      }

      return { ...visa, categories: [] };
    });

  return normalizedCountry;
}

/*
 * MAIN VISAS PAGE
 * GET /visas
 */
const showVisasPage = async (req, res) => {
  try {
    const databaseCountries = await Country.find({ isActive: true })
      .sort({ name: 1 })
      .select("name slug flag visaTypes")
      .lean();

    // Normalize legacy visa categories in memory.
    const countries = databaseCountries.map(normalizeLegacyVisaCategories);

    return res.render("visas/index", {
      currentPage: "visas",
      countries,
      loadError: false,
    });
  } catch (error) {
    console.error("VISAS PAGE ERROR:", error);

    return res.status(500).render("visas/index", {
      currentPage: "visas",
      countries: [],
      loadError: true,
    });
  }
};

/*
 * SCHENGEN COUNTRIES PAGE
 * GET /visas/schengen
 *
 * Only countries with isActive: true and isSchengen: true are displayed.
 */
const showSchengenPage = async (req, res, next) => {
  try {
    const countries = await Country.find({
      isActive: true,
      isSchengen: true,
    })
      .sort({ name: 1 })
      .select("name slug flag visaTypes isSchengen")
      .lean();

    return res.render("visas/schengen", {
      currentPage: "schengen",
      countries,
      loadError: false,
    });
  } catch (error) {
    console.error("SCHENGEN PAGE ERROR:", error);
    return next(error);
  }
};

module.exports = {
  showVisasPage,
  showSchengenPage,
};
