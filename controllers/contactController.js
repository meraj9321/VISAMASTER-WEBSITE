const Enquiry = require("../models/Enquiry");
const Team = require("../models/TeamMember");
const Country = require("../models/Country");
//const sendMail = require("../config/mail");

// =========================================================
// GET CONTACT PAGE DATA
// =========================================================

async function getContactPageData() {
  const partners = await Team.find({
    role: "partner",
    active: true,
  }).sort({ order: 1 });

  const accountants = await Team.find({
    role: "accountant",
    active: true,
  }).sort({ order: 1 });

  const executives = await Team.find({
    role: "executive",
    active: true,
  }).sort({ order: 1 });

  const destinations = await Country.find({
    $or: [{ isActive: true }, { isActive: { $exists: false } }],
  })
    .select("name slug")
    .sort({ name: 1 })
    .lean();

  return {
    partners,
    accountants,
    executives,
    destinations,
  };
}

// =========================================================
// SHOW CONTACT PAGE
// =========================================================

exports.showContactPage = async (req, res) => {
  try {
    const pageData = await getContactPageData();

    res.render("contacts/index", {
      currentPage: "contact",
      ...pageData,
      success: req.query.success === "1",
      error: null,
      formData: {},
    });
  } catch (error) {
    console.error("Error loading contact page:", error);
    res.status(500).send("Unable to load the contact page.");
  }
};

// =========================================================
// SUBMIT ENQUIRY
// =========================================================

exports.submitEnquiry = async (req, res) => {
  try {
    const { name, phone, email, destination, visaType, message } = req.body;

    // VALIDATION

    if (
      !name?.trim() ||
      !phone?.trim() ||
      !email?.trim() ||
      !destination?.trim() ||
      !visaType?.trim() ||
      !message?.trim()
    ) {
      const pageData = await getContactPageData();

      return res.status(400).render("contacts/index", {
        currentPage: "contact",
        ...pageData,
        success: false,
        error: "Please fill in all required fields.",
        formData: req.body,
      });
    }

    const cleanName = name.trim();
    const cleanPhone = phone.trim();
    const cleanEmail = email.trim();
    const cleanDestination = destination.trim();
    const cleanVisaType = visaType.trim();
    const cleanMessage = message.trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(cleanEmail)) {
      const pageData = await getContactPageData();

      return res.status(400).render("contacts/index", {
        currentPage: "contact",
        ...pageData,
        success: false,
        error: "Please enter a valid email address.",
        formData: req.body,
      });
    }

    // VERIFY DESTINATION

    const selectedCountry = await Country.findOne({
      slug: cleanDestination,
      $or: [{ isActive: true }, { isActive: { $exists: false } }],
    }).select("name slug");

    if (!selectedCountry) {
      const pageData = await getContactPageData();

      return res.status(400).render("contacts/index", {
        currentPage: "contact",
        ...pageData,
        success: false,
        error: "Please select a valid destination.",
        formData: req.body,
      });
    }

    const destinationName = selectedCountry.name;

    // SAVE ENQUIRY TO MONGODB

    const enquiry = new Enquiry({
      name: cleanName,
      phone: cleanPhone,
      email: cleanEmail,
      destination: destinationName,
      visaType: cleanVisaType,
      message: cleanMessage,
    });

    // =========================================================
    // ENQUIRY SAVED SUCCESSFULLY
    // =========================================================

    return res.redirect("/contact?success=1");
    // ESCAPE HTML

    const escapeHtml = (value) =>
      String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

    const safeName = escapeHtml(cleanName);
    const safePhone = escapeHtml(cleanPhone);
    const safeEmail = escapeHtml(cleanEmail);
    const safeDestination = escapeHtml(destinationName);
    const safeVisaType = escapeHtml(cleanVisaType);
    const safeMessage = escapeHtml(cleanMessage).replace(/\n/g, "<br>");

    // EMAIL OPTIONS

    const mailOptions = {
      to: process.env.CONTACT_RECEIVER_EMAIL,
      replyTo: cleanEmail,
      subject: `New Visa Enquiry - ${cleanName}`,

      text: `
New Visa Enquiry

Name: ${cleanName}
Phone: ${cleanPhone}
Email: ${cleanEmail}
Destination: ${destinationName}
Visa Type: ${cleanVisaType}

Message:
${cleanMessage}
      `,

      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
          <h2 style="color: #173b63;">New Visa Enquiry</h2>
          <hr>

          <p><strong>Name:</strong> ${safeName}</p>
          <p><strong>Phone:</strong> ${safePhone}</p>
          <p><strong>Email:</strong> ${safeEmail}</p>
          <p><strong>Phone:</strong> ${safePhone}</p>
          <p><strong>Destination:</strong> ${safeDestination}</p>
          <p><strong>Visa Type:</strong> ${safeVisaType}</p>

          <h3>Message</h3>
          <p>${safeMessage}</p>

          <hr>
          <p style="color: #777; font-size: 12px;">
            This enquiry was submitted through VisaMaster.
          </p>
        </div>
      `,
    };

    // SEND EMAIL THROUGH RESEND

    try {
      await sendMail(mailOptions);
      console.log("ENQUIRY EMAIL SENT SUCCESSFULLY");
    } catch (emailError) {
      console.error("ENQUIRY SAVED BUT EMAIL FAILED:", emailError.message);

      // Enquiry is already saved.
      // Don't make the customer submit it again.
    }

    // REDIRECT AFTER SUCCESSFUL DATABASE SAVE

    return res.redirect("/contact?success=1");
  } catch (error) {
    console.error("Error submitting enquiry:", error);

    try {
      const pageData = await getContactPageData();

      return res.status(500).render("contacts/index", {
        currentPage: "contact",
        ...pageData,
        success: false,
        error: "Something went wrong. Please try again.",
        formData: req.body,
      });
    } catch (pageError) {
      console.error("Error reloading contact page:", pageError);

      return res
        .status(500)
        .send("Something went wrong while processing your enquiry.");
    }
  }
};
