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
      .select(
        "name slug flag visaTypes applicationForm.filename applicationForm.contentType applicationForm.size",
      )
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

/* =====================================================
   VIEW APPLICATION FORM PDF
===================================================== */

const getApplicationForm = async (req, res) => {
  try {
    const slug = String(req.params.slug || "")
      .trim()
      .toLowerCase();

    const country = await Country.findOne({
      slug,
      isActive: true,
    }).select(
      "+applicationForm.data applicationForm.filename applicationForm.contentType",
    );

    if (!country) {
      return res.status(404).send("Country not found.");
    }

    const applicationForm = country.applicationForm;

    if (
      !applicationForm ||
      !applicationForm.data ||
      applicationForm.data.length === 0
    ) {
      return res.status(404).send("Application form PDF not found.");
    }

    const pdfBuffer = Buffer.isBuffer(applicationForm.data)
      ? applicationForm.data
      : Buffer.from(applicationForm.data);

    const filename = String(
      applicationForm.filename || "application-form.pdf",
    ).replace(/[\r\n"]/g, "_");

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Length", String(pdfBuffer.length));
    res.setHeader("Content-Disposition", `inline; filename="${filename}"`);

    return res.status(200).end(pdfBuffer);
  } catch (error) {
    console.error("View application form error:", error);
    return res.status(500).send("Unable to open application form PDF.");
  }
};

/* =====================================================
   DOWNLOAD APPLICATION FORM PDF
===================================================== */

const downloadApplicationForm = async (req, res) => {
  try {
    const slug = String(req.params.slug || "")
      .trim()
      .toLowerCase();

    const country = await Country.findOne({
      slug,
      isActive: true,
    }).select(
      "+applicationForm.data applicationForm.filename applicationForm.contentType",
    );

    if (!country) {
      return res.status(404).send("Country not found.");
    }

    const applicationForm = country.applicationForm;

    if (
      !applicationForm ||
      !applicationForm.data ||
      applicationForm.data.length === 0
    ) {
      return res.status(404).send("Application form PDF not found.");
    }

    const pdfBuffer = Buffer.isBuffer(applicationForm.data)
      ? applicationForm.data
      : Buffer.from(applicationForm.data);

    const filename = String(
      applicationForm.filename || "application-form.pdf",
    ).replace(/[\r\n"]/g, "_");

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Length", String(pdfBuffer.length));
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    return res.status(200).end(pdfBuffer);
  } catch (error) {
    console.error("Download application form error:", error);
    return res.status(500).send("Unable to download application form PDF.");
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
  getApplicationForm,
  downloadApplicationForm,
  searchCountries,
};
