const nodemailer = require("nodemailer");

// =========================================================
// VISAMASTER SMTP TRANSPORTER
// =========================================================

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,

  port: Number(process.env.SMTP_PORT),

  secure: process.env.SMTP_SECURE === "true",

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// =========================================================
// VERIFY SMTP CONNECTION
// =========================================================

transporter.verify((error, success) => {
  if (error) {
    console.error("SMTP CONNECTION ERROR:", error);
  } else {
    console.log("SMTP SERVER READY");
  }
});

// =========================================================
// EXPORT TRANSPORTER
// =========================================================

module.exports = transporter;
