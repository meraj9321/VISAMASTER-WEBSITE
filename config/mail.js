const { Resend } = require("resend");

// =========================================================
// VISAMASTER EMAIL SERVICE - RESEND API
// =========================================================

const resend = new Resend(process.env.RESEND_API_KEY);

// =========================================================
// SEND EMAIL
// =========================================================

const sendMail = async (mailOptions) => {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is missing.");
  }

  const result = await resend.emails.send({
    from: process.env.EMAIL_FROM,
    to: mailOptions.to,
    replyTo: mailOptions.replyTo,
    subject: mailOptions.subject,
    text: mailOptions.text,
    html: mailOptions.html,
  });

  if (result.error) {
    throw new Error(result.error.message);
  }

  console.log("EMAIL SENT SUCCESSFULLY:", result.data?.id);

  return result.data;
};

module.exports = sendMail;
