const Enquiry = require("../models/Enquiry");
const Team = require("../models/TeamMember");
const Country = require("../models/Country");
const transporter = require("../config/mail");

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

  // Fetch destinations from the existing Country collection.
  // Include countries where isActive is true or the field is missing.
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
    const { partners, accountants, executives, destinations } =
      await getContactPageData();

    res.render("contacts/index", {
      currentPage: "contact",
      partners,
      accountants,
      executives,
      destinations,
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

    // -----------------------------------------------------
    // VALIDATION
    // -----------------------------------------------------

    if (!name || !phone || !email || !destination || !visaType || !message) {
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

    // -----------------------------------------------------
    // VERIFY DESTINATION AGAINST DATABASE
    // -----------------------------------------------------

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

    // Use the actual country name in the saved enquiry and email.
    const destinationName = selectedCountry.name;

    // -----------------------------------------------------
    // SAVE ENQUIRY TO MONGODB
    // -----------------------------------------------------

    const enquiry = new Enquiry({
      name: cleanName,
      phone: cleanPhone,
      email: cleanEmail,
      destination: destinationName,
      visaType: cleanVisaType,
      message: cleanMessage,
    });

    await enquiry.save();

    // -----------------------------------------------------
    // PREPARE EMAIL CONTENT
    // -----------------------------------------------------

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

    const mailOptions = {
      from: process.env.EMAIL_USER,
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
, html:
<h2>New Visa Enquiry</h2>

    <p><strong>Name:</strong> ${safeName}</p>
    <p><strong>Phone:</strong> ${safePhone}</p>
    <p><strong>Email:</strong> ${safeEmail}</p>
    <p><strong>Destination:</strong> ${safeDestination}</p>
    <p><strong>Visa Type:</strong> ${safeVisaType}</p>

    <p><strong>Message:</strong></p>
    <p>${safeMessage}</p>
  `,
    };

    // -----------------------------------------------------
    // SEND EMAIL
    // -----------------------------------------------------

    try {
      await transporter.sendMail(mailOptions);
    } catch (emailError) {
      console.error("Enquiry saved, but email failed:", emailError);

      const pageData = await getContactPageData();

      return res.status(500).render("contacts/index", {
        currentPage: "contact",
        ...pageData,
        success: false,
        error:
          "Your enquiry was saved, but the notification email could not be sent. Please contact us if needed.",
        formData: req.body,
      });
    }

    // -----------------------------------------------------
    // REDIRECT AFTER SUCCESS
    // -----------------------------------------------------

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
