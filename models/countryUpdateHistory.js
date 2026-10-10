const mongoose = require("mongoose");

const countryUpdateHistorySchema = new mongoose.Schema(
  {
    countryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Country",
      required: true,
    },

    countryName: {
      type: String,
      required: true,
    },

    field: {
      type: String,
      required: true,
    },

    oldValue: {
      type: mongoose.Schema.Types.Mixed,
    },

    newValue: {
      type: mongoose.Schema.Types.Mixed,
    },

    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  },
);

countryUpdateHistorySchema.index({
  countryId: 1,
  field: 1,
  updatedAt: -1,
});

module.exports = mongoose.model(
  "CountryUpdateHistory",
  countryUpdateHistorySchema,
);
