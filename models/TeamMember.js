const mongoose = require("mongoose");

const teamMemberSchema = new mongoose.Schema(
  {
    // ==========================================
    // NAME
    // ==========================================
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // ==========================================
    // ROLE
    // ==========================================
    role: {
      type: String,
      required: true,
      enum: ["partner", "accountant", "executive"],
      lowercase: true,
      trim: true,
    },

    // ==========================================
    // DESIGNATION
    // ==========================================
    designation: {
      type: String,
      required: true,
      trim: true,
    },

    // ==========================================
    // PHONE
    // ==========================================
    phone: {
      type: String,
      required: true,
      trim: true,
    },

    // ==========================================
    // WHATSAPP
    // ==========================================
    whatsapp: {
      type: String,
      required: true,
      trim: true,
    },

    // ==========================================
    // EMAIL
    // ==========================================
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    // ==========================================
    // IMAGE
    // ==========================================
    image: {
      type: String,
      default: "",
      trim: true,
    },

    // ==========================================
    // DISPLAY ORDER
    // ==========================================
    order: {
      type: Number,
      default: 0,
    },

    // ==========================================
    // ACTIVE / INACTIVE
    // ==========================================
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,

    // IMPORTANT:
    // Atlas collection ka exact naam
    collection: "teamMembers",
  },
);

module.exports = mongoose.model("TeamMember", teamMemberSchema);
