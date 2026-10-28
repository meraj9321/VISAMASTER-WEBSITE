const mongoose = require("mongoose");

/* =========================================================
VISA TYPE SCHEMA
========================================================= */

const visaTypeSchema = new mongoose.Schema(
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
    },

    purpose: {
      type: String,
      trim: true,
    },

    // Directory categories are managed from the Admin Panel.
    // A visa may belong to more than one category (for example, Tourist + E-Visa).
    categories: {
      type: [
        {
          type: String,
          enum: [
            "e-visa",
            "tourist-visa",
            "visa-on-arrival",
            "business-visa",
            "stamping-visa",
            "sticker-visa",
          ],
        },
      ],
      default: [],
    },

    stayDuration: {
      type: String,
      trim: true,
    },

    validity: {
      type: String,
      trim: true,
    },

    processingTime: {
      type: String,
      trim: true,
    },

    entryType: {
      type: String,
      trim: true,
    },

    governmentFee: {
      type: String,
      trim: true,
    },

    serviceFee: {
      type: String,
      trim: true,
    },

    totalFee: {
      type: String,
      trim: true,
    },

    eligibility: {
      type: [String],
      default: [],
    },

    documents: {
      type: [String],
      default: [],
    },

    description: {
      type: String,
      trim: true,
    },

    isActive: {
      type: Boolean,
      default: true,
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
    /* =====================================================
    BASIC INFORMATION
    ===================================================== */

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

    startingFee: {
      type: String,
      trim: true,
    },

    startingProcessingTime: {
      type: String,
      trim: true,
    },

    heroBadge: {
      type: String,
      trim: true,
    },

    /* =====================================================
    VISA TYPES
    ===================================================== */

    visaTypes: {
      type: [visaTypeSchema],
      default: [],
    },

    /* =====================================================
    REQUIREMENTS
    ===================================================== */

    requirements: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },

    /* =====================================================
    ELIGIBILITY
    ===================================================== */

    eligibility: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },

    /* =====================================================
    APPLICATION PROCESS
    ===================================================== */

    applicationProcess: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },

    /* =====================================================
    ENTRY REQUIREMENTS
    ===================================================== */

    entryRequirements: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },

    /* =====================================================
    RESTRICTIONS
    ===================================================== */

    restrictions: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },

    /* =====================================================
    FEES
    ===================================================== */

    fees: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    /* =====================================================
    PROCESSING
    ===================================================== */

    processing: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    /* =====================================================
    TRAVEL INFORMATION
    ===================================================== */

    travelInfo: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    /* =====================================================
    TRAVEL TIPS
    ===================================================== */

    travelTips: {
      type: [String],
      default: [],
    },

    /* =====================================================
    IMPORTANT NOTES
    ===================================================== */

    importantNotes: {
      type: [String],
      default: [],
    },

    /* =====================================================
    FAQS
    ===================================================== */

    faqs: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },

    /* =====================================================
    COUNTRY STATUS
    ===================================================== */

    isActive: {
      type: Boolean,
      default: true,
    },

    /* =====================================================
    SCHENGEN COUNTRY STATUS
    ===================================================== */

    isSchengen: {
      type: Boolean,
      default: false,
    },

    /* =====================================================
    FIELD LEVEL UPDATE TIMESTAMPS
    ===================================================== */

    fieldUpdatedAt: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    /* =========================================
    APPLICATION FORM PDF
    ========================================= */

    applicationForm: {
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
  },

  /* =======================================================
  AUTOMATIC DOCUMENT TIMESTAMPS
  ======================================================= */

  {
    timestamps: true,
  },
);

/* =========================================================
MODEL
========================================================= */

module.exports = mongoose.model("Country", countrySchema);
