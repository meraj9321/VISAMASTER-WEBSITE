const mongoose = require("mongoose");

// =========================================================
// NEWS SCHEMA
// =========================================================

const newsSchema = new mongoose.Schema(
  {
    title: {
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

    category: {
      type: String,
      required: true,
      enum: ["Visa Updates", "Travel Updates"],
    },

    image: {
      type: String,
      default: "",
      trim: true,
    },

    excerpt: {
      type: String,
      required: true,
      trim: true,
    },

    content: {
      type: String,
      default: "",
    },

    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

// =========================================================
// EXPORT NEWS MODEL
// =========================================================

module.exports = mongoose.model("News", newsSchema);
