const Country = require("../models/Country");

/* =========================================================
HELPER FUNCTIONS
========================================================= */

function toArray(value) {
  if (value === undefined || value === null || value === "") {
    return [];
  }

  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  return String(value)
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function toBoolean(value) {
  return value === "true" || value === true || value === "on";
}

function getObjectArray(value) {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value;
  }

  return Object.values(value);
}

function cleanContentSections(value) {
  const sections = getObjectArray(value);

  return sections
    .map((item) => ({
      title: item.title || "",
      icon: item.icon || "",
      description: item.description || "",
      items: toArray(item.items),
    }))
    .filter((item) => {
      return item.title || item.icon || item.description || item.items.length;
    });
}

function cleanProcessSteps(value) {
  const steps = getObjectArray(value);

  return steps
    .map((item, index) => ({
      step: Number(item.step) || index + 1,
      title: item.title || "",
      description: item.description || "",
      icon: item.icon || "",
    }))
    .filter((item) => {
      return item.title || item.description || item.icon;
    });
}

function cleanFaqs(value) {
  const faqs = getObjectArray(value);

  return faqs
    .map((item) => ({
      question: item.question || "",
      answer: item.answer || "",
    }))
    .filter((item) => {
      return item.question || item.answer;
    });
}

function cleanVisaTypes(value) {
  const visas = getObjectArray(value);

  return visas
    .filter(
      (item) =>
        item !== null && typeof item === "object" && !Array.isArray(item),
    )
    .map((item) => ({
      name: item.name || "",
      slug: item.slug || "",
      description: item.description || "",
      purpose: item.purpose || "",

      categories: toArray(item.categories).filter((category) =>
        [
          "e-visa",
          "tourist-visa",
          "visa-on-arrival",
          "business-visa",
          "stamping-visa",
          "sticker-visa",
        ].includes(category),
      ),

      stayDuration: item.stayDuration || "",
      validity: item.validity || "",
      processingTime: item.processingTime || "",
      entryType: item.entryType || "",

      governmentFee: item.governmentFee || "",
      serviceFee: item.serviceFee || "",
      totalFee: item.totalFee || "",

      eligibility: toArray(item.eligibility),
      documents: toArray(item.documents),

      isActive: toBoolean(item.isActive),
    }))
    .filter(
      (item) => item.name || item.slug || item.description || item.purpose,
    );
}
/* =========================================================
FIELD TIMESTAMP HELPER
========================================================= */

function setFieldTimestamp(fieldUpdatedAt, fieldName, oldValue, newValue) {
  const oldString = JSON.stringify(oldValue ?? "");
  const newString = JSON.stringify(newValue ?? "");

  if (oldString !== newString) {
    fieldUpdatedAt[fieldName] = new Date();
  }
}
/* =========================================================
SHOW COUNTRIES MANAGEMENT PAGE
========================================================= */

exports.showCountries = async (req, res, next) => {
  try {
    const countries = await Country.find({}).sort({ name: 1 }).lean();

    res.render("admin/countries/index", {
      countries,
    });
  } catch (error) {
    console.error("Countries admin page error:", error);

    next(error);
  }
};

/* =========================================================
SHOW EDIT PAGE
========================================================= */

exports.showEditCountry = async (req, res, next) => {
  try {
    const country = await Country.findOne({
      slug: req.params.slug,
    }).lean();

    if (!country) {
      return res.status(404).send("Country not found");
    }

    res.render("admin/countries/edit", {
      country,
    });
  } catch (error) {
    next(error);
  }
};

/* =========================================================
UPDATE COUNTRY
========================================================= */

exports.updateCountry = async (req, res, next) => {
  try {
    //console.log("Request body:", req.body);
    //console.log("Uploaded PDF:", req.file);

    if (!req.body || Object.keys(req.body).length === 0) {
      return res
        .status(400)
        .send("Form data missing. Check Multer middleware and form enctype.");
    }

    const oldSlug = req.params.slug;

    const country = await Country.findOne({
      slug: oldSlug,
    });

    if (!country) {
      return res.status(404).send("Country not found");
    }
    /* =====================================================
   FIELD TIMESTAMP OBJECT
===================================================== */

    const fieldUpdatedAt = country.fieldUpdatedAt
      ? JSON.parse(JSON.stringify(country.fieldUpdatedAt))
      : {};

    /* =====================================================
   BASIC INFORMATION
===================================================== */

    const newName = req.body.name || "";
    const newSlug = req.body.slug || oldSlug;
    const newCountryCode = req.body.countryCode || "";
    const newFlag = req.body.flag || "";
    const newImage = req.body.image || "";
    const newShortDescription = req.body.shortDescription || "";
    const newDescription = req.body.description || "";
    const newStartingFee = req.body.startingFee || "";
    const newStartingProcessingTime = req.body.startingProcessingTime || "";
    const newHeroBadge = req.body.heroBadge || "";

    setFieldTimestamp(fieldUpdatedAt, "name", country.name, newName);

    setFieldTimestamp(fieldUpdatedAt, "slug", country.slug, newSlug);

    setFieldTimestamp(
      fieldUpdatedAt,
      "countryCode",
      country.countryCode,
      newCountryCode,
    );

    setFieldTimestamp(fieldUpdatedAt, "flag", country.flag, newFlag);

    setFieldTimestamp(fieldUpdatedAt, "image", country.image, newImage);

    setFieldTimestamp(
      fieldUpdatedAt,
      "shortDescription",
      country.shortDescription,
      newShortDescription,
    );

    setFieldTimestamp(
      fieldUpdatedAt,
      "description",
      country.description,
      newDescription,
    );

    setFieldTimestamp(
      fieldUpdatedAt,
      "startingFee",
      country.startingFee,
      newStartingFee,
    );

    setFieldTimestamp(
      fieldUpdatedAt,
      "startingProcessingTime",
      country.startingProcessingTime,
      newStartingProcessingTime,
    );

    setFieldTimestamp(
      fieldUpdatedAt,
      "heroBadge",
      country.heroBadge,
      newHeroBadge,
    );

    country.name = newName;
    country.slug = newSlug;
    country.countryCode = newCountryCode;
    country.flag = newFlag;
    country.image = newImage;
    country.shortDescription = newShortDescription;
    country.description = newDescription;
    country.startingFee = newStartingFee;
    country.startingProcessingTime = newStartingProcessingTime;
    country.heroBadge = newHeroBadge;

    /* =====================================================
   VISA TYPES
===================================================== */

    const newVisaTypes = cleanVisaTypes(req.body.visaTypes);

    if (JSON.stringify(country.visaTypes) !== JSON.stringify(newVisaTypes)) {
      fieldUpdatedAt.visaTypes = new Date();
    }

    country.visaTypes = newVisaTypes;

    /* =====================================================
   REQUIREMENTS
===================================================== */

    const newRequirements = cleanContentSections(req.body.requirements);

    if (
      JSON.stringify(country.requirements) !== JSON.stringify(newRequirements)
    ) {
      fieldUpdatedAt.requirements = new Date();
    }

    country.requirements = newRequirements;

    /* =====================================================
   ELIGIBILITY
===================================================== */

    const newEligibility = cleanContentSections(req.body.eligibility);

    if (
      JSON.stringify(country.eligibility) !== JSON.stringify(newEligibility)
    ) {
      fieldUpdatedAt.eligibility = new Date();
    }

    country.eligibility = newEligibility;

    /* =====================================================
   APPLICATION PROCESS
===================================================== */

    const newApplicationProcess = cleanProcessSteps(
      req.body.applicationProcess,
    );

    if (
      JSON.stringify(country.applicationProcess) !==
      JSON.stringify(newApplicationProcess)
    ) {
      fieldUpdatedAt.applicationProcess = new Date();
    }

    country.applicationProcess = newApplicationProcess;

    /* =====================================================
   FEES
===================================================== */

    const oldFees = country.fees
      ? JSON.parse(JSON.stringify(country.fees))
      : {};

    const newFees = {
      governmentFee: req.body.fees?.governmentFee || "",

      serviceFee: req.body.fees?.serviceFee || "",

      otherCharges: req.body.fees?.otherCharges || "",

      totalEstimatedFee: req.body.fees?.totalEstimatedFee || "",

      currency: req.body.fees?.currency || "",

      notes: toArray(req.body.fees?.notes),
    };

    if (!fieldUpdatedAt.fees) {
      fieldUpdatedAt.fees = {};
    }

    setFieldTimestamp(
      fieldUpdatedAt.fees,
      "governmentFee",
      oldFees.governmentFee,
      newFees.governmentFee,
    );

    setFieldTimestamp(
      fieldUpdatedAt.fees,
      "serviceFee",
      oldFees.serviceFee,
      newFees.serviceFee,
    );

    setFieldTimestamp(
      fieldUpdatedAt.fees,
      "otherCharges",
      oldFees.otherCharges,
      newFees.otherCharges,
    );

    setFieldTimestamp(
      fieldUpdatedAt.fees,
      "totalEstimatedFee",
      oldFees.totalEstimatedFee,
      newFees.totalEstimatedFee,
    );

    setFieldTimestamp(
      fieldUpdatedAt.fees,
      "currency",
      oldFees.currency,
      newFees.currency,
    );

    setFieldTimestamp(
      fieldUpdatedAt.fees,
      "notes",
      oldFees.notes,
      newFees.notes,
    );

    country.fees = newFees;

    /* =====================================================
   PROCESSING
===================================================== */

    const oldProcessing = country.processing
      ? JSON.parse(JSON.stringify(country.processing))
      : {};

    const newProcessing = {
      normalProcessing: req.body.processing?.normalProcessing || "",

      expressProcessing: req.body.processing?.expressProcessing || "",

      urgentProcessing: req.body.processing?.urgentProcessing || "",

      possibleDelays: toArray(req.body.processing?.possibleDelays),

      processingNotes: toArray(req.body.processing?.processingNotes),
    };

    if (!fieldUpdatedAt.processing) {
      fieldUpdatedAt.processing = {};
    }

    setFieldTimestamp(
      fieldUpdatedAt.processing,
      "normalProcessing",
      oldProcessing.normalProcessing,
      newProcessing.normalProcessing,
    );

    setFieldTimestamp(
      fieldUpdatedAt.processing,
      "expressProcessing",
      oldProcessing.expressProcessing,
      newProcessing.expressProcessing,
    );

    setFieldTimestamp(
      fieldUpdatedAt.processing,
      "urgentProcessing",
      oldProcessing.urgentProcessing,
      newProcessing.urgentProcessing,
    );

    setFieldTimestamp(
      fieldUpdatedAt.processing,
      "possibleDelays",
      oldProcessing.possibleDelays,
      newProcessing.possibleDelays,
    );

    setFieldTimestamp(
      fieldUpdatedAt.processing,
      "processingNotes",
      oldProcessing.processingNotes,
      newProcessing.processingNotes,
    );

    country.processing = newProcessing;

    /* =====================================================
   TRAVEL INFORMATION
===================================================== */

    const oldTravelInfo = country.travelInfo
      ? JSON.parse(JSON.stringify(country.travelInfo))
      : {};

    const newTravelInfo = {
      bestTimeToVisit: req.body.travelInfo?.bestTimeToVisit || "",

      currency: req.body.travelInfo?.currency || "",

      language: req.body.travelInfo?.language || "",

      timezone: req.body.travelInfo?.timezone || "",

      capital: req.body.travelInfo?.capital || "",

      majorCities: toArray(req.body.travelInfo?.majorCities),

      flightDuration: req.body.travelInfo?.flightDuration || "",

      timeDifference: req.body.travelInfo?.timeDifference || "",

      airportInformation: req.body.travelInfo?.airportInformation || "",
    };

    if (!fieldUpdatedAt.travelInfo) {
      fieldUpdatedAt.travelInfo = {};
    }

    setFieldTimestamp(
      fieldUpdatedAt.travelInfo,
      "bestTimeToVisit",
      oldTravelInfo.bestTimeToVisit,
      newTravelInfo.bestTimeToVisit,
    );

    setFieldTimestamp(
      fieldUpdatedAt.travelInfo,
      "currency",
      oldTravelInfo.currency,
      newTravelInfo.currency,
    );

    setFieldTimestamp(
      fieldUpdatedAt.travelInfo,
      "language",
      oldTravelInfo.language,
      newTravelInfo.language,
    );

    setFieldTimestamp(
      fieldUpdatedAt.travelInfo,
      "timezone",
      oldTravelInfo.timezone,
      newTravelInfo.timezone,
    );

    setFieldTimestamp(
      fieldUpdatedAt.travelInfo,
      "capital",
      oldTravelInfo.capital,
      newTravelInfo.capital,
    );

    setFieldTimestamp(
      fieldUpdatedAt.travelInfo,
      "majorCities",
      oldTravelInfo.majorCities,
      newTravelInfo.majorCities,
    );

    setFieldTimestamp(
      fieldUpdatedAt.travelInfo,
      "flightDuration",
      oldTravelInfo.flightDuration,
      newTravelInfo.flightDuration,
    );

    setFieldTimestamp(
      fieldUpdatedAt.travelInfo,
      "timeDifference",
      oldTravelInfo.timeDifference,
      newTravelInfo.timeDifference,
    );

    setFieldTimestamp(
      fieldUpdatedAt.travelInfo,
      "airportInformation",
      oldTravelInfo.airportInformation,
      newTravelInfo.airportInformation,
    );

    country.travelInfo = newTravelInfo;

    /* =====================================================
   TRAVEL TIPS
===================================================== */

    const newTravelTips = toArray(req.body.travelTips);

    setFieldTimestamp(
      fieldUpdatedAt,
      "travelTips",
      country.travelTips,
      newTravelTips,
    );

    country.travelTips = newTravelTips;

    /* =====================================================
   IMPORTANT NOTES
===================================================== */

    const newImportantNotes = toArray(req.body.importantNotes);

    setFieldTimestamp(
      fieldUpdatedAt,
      "importantNotes",
      country.importantNotes,
      newImportantNotes,
    );

    country.importantNotes = newImportantNotes;

    /* =====================================================
   FAQS
===================================================== */

    const newFaqs = cleanFaqs(req.body.faqs);

    setFieldTimestamp(fieldUpdatedAt, "faqs", country.faqs, newFaqs);

    country.faqs = newFaqs;

    /* =====================================================
   ACTIVE STATUS
===================================================== */

    const newIsActive = toBoolean(req.body.isActive);

    setFieldTimestamp(
      fieldUpdatedAt,
      "isActive",
      country.isActive,
      newIsActive,
    );

    country.isActive = newIsActive;

    /* =====================================================
       APPLICATION FORM PDF
    ===================================================== */

    // Replace the existing PDF only when a new PDF is uploaded.
    // If no file is uploaded, preserve the existing PDF.
    if (req.file) {
      country.applicationForm = {
        filename: String(req.file.originalname || "application-form.pdf")
          .replace(/[\\/]/g, "")
          .trim(),

        contentType: "application/pdf",

        data: req.file.buffer,

        size: req.file.size,

        uploadedAt: new Date(),
      };

      if (!fieldUpdatedAt.applicationForm) {
        fieldUpdatedAt.applicationForm = {};
      }

      fieldUpdatedAt.applicationForm.uploadedAt = new Date();
    }

    /* =========================================
   DELETE COUNTRY APPLICATION FORM PDF
========================================= */

    /* =====================================================
   SAVE FIELD TIMESTAMPS
===================================================== */

    country.fieldUpdatedAt = fieldUpdatedAt;

    /* =====================================================
   SAVE
===================================================== */

    await country.save();

    /* =====================================================
   REDIRECT
===================================================== */

    res.redirect("/admin/countries/" + country.slug + "/edit?updated=true");
  } catch (error) {
    console.error("Country update error:", error);

    next(error);
  }
};

/* =========================================
   DELETE COUNTRY APPLICATION FORM PDF
========================================= */

exports.deleteCountryApplicationForm = async (req, res) => {
  try {
    const country = await Country.findOne({
      slug: req.params.slug,
    });

    if (!country) {
      return res.status(404).json({
        success: false,
        message: "Country not found.",
      });
    }

    if (!country.applicationForm || !country.applicationForm.filename) {
      return res.status(404).json({
        success: false,
        message: "No application form PDF exists for this country.",
      });
    }

    // Delete only the PDF field from MongoDB.
    country.applicationForm = undefined;
    country.markModified("applicationForm");

    await country.save();

    return res.status(200).json({
      success: true,
      message: "Application form PDF deleted successfully.",
    });
  } catch (error) {
    console.error("Delete application form PDF error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete application form PDF.",
    });
  }
};
