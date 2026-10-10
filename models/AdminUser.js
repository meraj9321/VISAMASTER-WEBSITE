const mongoose = require("mongoose");

const adminUserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
    },

    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: "adminUsers",
  },
);

module.exports = mongoose.model("AdminUser", adminUserSchema);
