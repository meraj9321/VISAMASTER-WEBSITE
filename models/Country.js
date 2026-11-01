const mongoose = require("mongoose");

/* =========================================================
   APPLICATION FORM PDF SCHEMA
   Each subcategory has its own independent PDF.
========================================================= */

const applicationFormSchema = new mongoose.Schema(
  {
    filename: {
      type: String,
      trim: true,
    },

    contentType: {
      type: String,
      default: "application/pdf",
    },

    data: {
      type: Buffer,
      select: false,
    },

    size: {
      type: Number,
      default: 0,
    },

    uploadedAt: {
      type: Date,
    },
  },
  {
    _id: false,
  },
);

/* =========================================================
   SUBCATEGORY SCHEMA
   Each subcategory has its own requirements,
   eligibility and application form PDF.
========================================================= */

const subCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    purpose: {
      type: String,
      trim: true,
      default: "",
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    eligibility: {
      type: [String],
      default: [],
    },

    requirements: {
      type: [String],
      default: [],
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    // Independent PDF for this subcategory
    applicationForm: {
      type: applicationFormSchema,
      default: undefined,
    },
  },
  {
    _id: false,
  },
);

/* =========================================================
   VISA CATEGORY SCHEMA
   Only 3 main categories are allowed.
========================================================= */

const visaCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      enum: ["e-visa", "sticker-visa", "visa-on-arrival"],
      trim: true,
      lowercase: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    subCategories: {
      type: [subCategorySchema],
      default: [],
    },
  },
  {
    _id: false,
  },
);

/* =========================================================
   DEFAULT VISA CATEGORIES
========================================================= */

const defaultVisaCategories = () => [
  {
    name: "E-Visa",
    slug: "e-visa",
    isActive: true,
    subCategories: [],
  },
  {
    name: "Sticker Visa",
    slug: "sticker-visa",
    isActive: true,
    subCategories: [],
  },
  {
    name: "Visa on Arrival",
    slug: "visa-on-arrival",
    isActive: true,
    subCategories: [],
  },
];

/* =========================================================
   TRAVEL INFORMATION SCHEMA
========================================================= */

const travelInfoSchema = new mongoose.Schema(
  {
    bestTimeToVisit: {
      type: String,
      trim: true,
    },

    currency: {
      type: String,
      trim: true,
    },

    language: {
      type: String,
      trim: true,
    },

    timezone: {
      type: String,
      trim: true,
    },

    capital: {
      type: String,
      trim: true,
    },

    majorCities: {
      type: [String],
      default: [],
    },

    flightDuration: {
      type: String,
      trim: true,
    },

    timeDifference: {
      type: String,
      trim: true,
    },

    airportInformation: {
      type: String,
      trim: true,
    },
  },
  {
    _id: false,
  },
);

/* =========================================================
   FAQ SCHEMA
========================================================= */

const faqSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
    },

    answer: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    _id: false,
  },
);

/* =========================================================
   COUNTRY SCHEMA
========================================================= */

const countrySchema = new mongoose.Schema(
  {
    /* =========================================
       1. BASIC COUNTRY INFORMATION
    ========================================= */

    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    countryCode: {
      type: String,
      trim: true,
      uppercase: true,
    },

    flag: {
      type: String,
      trim: true,
    },

    image: {
      type: String,
      trim: true,
    },

    shortDescription: {
      type: String,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    heroBadge: {
      type: String,
      trim: true,
    },

    /* =========================================
       2. VISA CATEGORIES
       E-Visa, Sticker Visa, Visa on Arrival

       Each subcategory has its own PDF.
    ========================================= */

    visaCategories: {
      type: [visaCategorySchema],

      default: defaultVisaCategories,

      validate: {
        validator: function (categories) {
          const requiredSlugs = ["e-visa", "sticker-visa", "visa-on-arrival"];

          if (!Array.isArray(categories)) {
            return false;
          }

          if (categories.length !== 3) {
            return false;
          }

          const actualSlugs = categories.map((category) => category.slug);

          return (
            requiredSlugs.every((slug) => actualSlugs.includes(slug)) &&
            new Set(actualSlugs).size === 3
          );
        },

        message:
          "Every country must have exactly 3 unique visa categories: E-Visa, Sticker Visa and Visa on Arrival.",
      },
    },

    /* =========================================
       3. TRAVEL INFORMATION
    ========================================= */

    travelInfo: {
      type: travelInfoSchema,
      default: () => ({}),
    },

    /* =========================================
       4. TRAVEL TIPS
    ========================================= */

    travelTips: {
      type: [String],
      default: [],
    },

    /* =========================================
       5. IMPORTANT NOTES
    ========================================= */

    importantNotes: {
      type: [String],
      default: [],
    },

    /* =========================================
       6. FAQS
    ========================================= */

    faqs: {
      type: [faqSchema],
      default: [],
    },

    /* =========================================
       7. LEGACY COUNTRY-LEVEL PDF
       Kept temporarily for old records.
       New uploads belong to subcategories.
    ========================================= */

    applicationForm: {
      type: applicationFormSchema,
      default: undefined,
    },

    /* =========================================
       8. COUNTRY STATUS
    ========================================= */

    isActive: {
      type: Boolean,
      default: true,
    },

    /* =========================================
       9. SCHENGEN COUNTRY STATUS
    ========================================= */

    isSchengen: {
      type: Boolean,
      default: false,
    },

    /* =========================================
       10. FIELD LEVEL UPDATE TRACKING
    ========================================= */

    fieldUpdatedAt: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },

  {
    timestamps: true,
  },
);

/* =========================================================
   MODEL EXPORT
========================================================= */

module.exports = mongoose.model("Country", countrySchema);
