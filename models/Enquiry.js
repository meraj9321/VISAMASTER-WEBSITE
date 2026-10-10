const mongoose = require("mongoose");

// =========================================================
// ENQUIRY DELETE TIME
// =========================================================

// .env se days lega
// Example:
//
// ENQUIRY_DELETE_AFTER_DAYS=1
// OR
// ENQUIRY_DELETE_AFTER_DAYS=2
//
// Agar .env me value nahi hai,
// to default 2 days rahega.

const deleteAfterDays = Number(process.env.ENQUIRY_DELETE_AFTER_DAYS) || 2;

// =========================================================
// DAYS TO SECONDS
// =========================================================

// MongoDB TTL seconds me kaam karta hai.
//
// 1 day  = 86400 seconds
// 2 days = 172800 seconds

const deleteAfterSeconds = deleteAfterDays * 24 * 60 * 60;

// =========================================================
// ENQUIRY SCHEMA
// =========================================================

const enquirySchema = new mongoose.Schema(
  {
    // -------------------------------------------------------
    // NAME
    // -------------------------------------------------------

    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    // -------------------------------------------------------
    // PHONE
    // -------------------------------------------------------

    phone: {
      type: String,
      required: true,
      trim: true,
      maxlength: 20,
    },

    // -------------------------------------------------------
    // EMAIL
    // -------------------------------------------------------

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 150,
    },

    // -------------------------------------------------------
    // DESTINATION
    // -------------------------------------------------------

    destination: {
      type: String,
      required: true,
      trim: true,
    },

    // -------------------------------------------------------
    // VISA TYPE
    // -------------------------------------------------------

    visaType: {
      type: String,
      required: true,
      trim: true,
    },

    // -------------------------------------------------------
    // MESSAGE
    // -------------------------------------------------------

    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },

    // -------------------------------------------------------
    // ENQUIRY STATUS
    // -------------------------------------------------------

    status: {
      type: String,

      enum: ["new", "contacted", "processing", "completed", "cancelled"],

      default: "new",
    },
  },

  // =======================================================
  // SCHEMA OPTIONS
  // =======================================================

  {
    // Automatically creates:
    //
    // createdAt
    // updatedAt

    timestamps: true,

    // MongoDB collection name
    collection: "enquiries",
  },
);

// =========================================================
// TTL INDEX
// =========================================================

// MongoDB createdAt ke basis par enquiry ko
// automatically delete karega.
//
// Example:
//
// ENQUIRY_DELETE_AFTER_DAYS=1
// → approximately 24 hours
//
// ENQUIRY_DELETE_AFTER_DAYS=2
// → approximately 48 hours
//
// IMPORTANT:
// MongoDB TTL deletion background process ke through hoti hai,
// isliye exact second par deletion guaranteed nahi hoti.

enquirySchema.index(
  {
    createdAt: 1,
  },

  {
    name: "enquiry_ttl",

    expireAfterSeconds: deleteAfterSeconds,
  },
);

// =========================================================
// EXPORT MODEL
// =========================================================

module.exports = mongoose.model("Enquiry", enquirySchema);
