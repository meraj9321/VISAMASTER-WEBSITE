const Enquiry = require("../models/Enquiry");

const Team = require("../models/TeamMember");

const transporter = require("../config/mail");

// =========================================================
// CONTACT PAGE DATA
// =========================================================

async function getContactPageData() {
  // -----------------------------------------
  // PARTNERS
  // -----------------------------------------

  const partners = await Team.find({
    role: "partner",
    active: true,
  }).sort({
    order: 1,
  });

  // -----------------------------------------
  // ACCOUNTANTS
  // -----------------------------------------

  const accountants = await Team.find({
    role: "accountant",
    active: true,
  }).sort({
    order: 1,
  });

  // -----------------------------------------
  // VISA EXECUTIVES
  // -----------------------------------------

  const executives = await Team.find({
    role: "executive",
    active: true,
  }).sort({
    order: 1,
  });

  // -----------------------------------------
  // DESTINATIONS
  // -----------------------------------------

  // Abhi destinations hardcoded hain.
  // Baad mein inko MongoDB se dynamic kar sakte hain.

  const destinations = [
    {
      name: "Dubai",
      slug: "dubai",
    },

    {
      name: "USA",
      slug: "usa",
    },

    {
      name: "Canada",
      slug: "canada",
    },

    {
      name: "UK",
      slug: "uk",
    },

    {
      name: "Australia",
      slug: "australia",
    },
  ];

  return {
    partners,
    accountants,
    executives,
    destinations,
  };
}

// =========================================================
// GET CONTACT PAGE
// =========================================================

exports.showContactPage = async (req, res) => {
  try {
    const { partners, accountants, executives, destinations } =
      await getContactPageData();

    // -----------------------------------------
    // SUCCESS POPUP
    // -----------------------------------------

    const success =
      req.query.success === "1"
        ? "Thank you! Your enquiry has been submitted successfully."
        : null;

    res.render("contacts/index", {
      currentPage: "contact",
      partners,
      accountants,
      executives,
      destinations,
      success,
      error: null,
      formData: {},
    });
  } catch (error) {
    console.error("CONTACT PAGE ERROR:", error);

    res.status(500).send("Something went wrong");
  }
};

// =========================================================
// POST ENQUIRY
// =========================================================

exports.submitEnquiry = async (req, res) => {
  try {
    const { name, phone, email, destination, visaType, message } = req.body;

    // =====================================================
    // VALIDATION
    // =====================================================

    if (!name || !phone || !email || !destination || !visaType || !message) {
      const { partners, accountants, executives, destinations } =
        await getContactPageData();

      return res.status(400).render("contacts/index", {
        currentPage: "contact",

        partners,
        accountants,
        executives,
        destinations,

        success: null,

        error: "Please fill in all required fields.",

        formData: {
          name,
          phone,
          email,
          destination,
          visaType,
          message,
        },
      });
    }

    // =====================================================
    // EMAIL VALIDATION
    // =====================================================

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email.trim())) {
      const { partners, accountants, executives, destinations } =
        await getContactPageData();

      return res.status(400).render("contacts/index", {
        currentPage: "contact",

        partners,
        accountants,
        executives,
        destinations,

        success: null,

        error: "Please enter a valid email address.",

        formData: {
          name,
          phone,
          email,
          destination,
          visaType,
          message,
        },
      });
    }

    // =====================================================
    // CLEAN FORM DATA
    // =====================================================

    const cleanName = name.trim();

    const cleanPhone = phone.trim();

    const cleanEmail = email.trim().toLowerCase();

    const cleanDestination = destination.trim();

    const cleanVisaType = visaType.trim();

    const cleanMessage = message.trim();

    // =====================================================
    // SAVE ENQUIRY TO MONGODB
    // =====================================================

    const enquiry = new Enquiry({
      name: cleanName,

      phone: cleanPhone,

      email: cleanEmail,

      destination: cleanDestination,

      visaType: cleanVisaType,

      message: cleanMessage,
    });

    await enquiry.save();

    console.log("ENQUIRY SAVED TO MONGODB:", enquiry._id.toString());

    // =====================================================
    // SEND EMAIL USING NODEMAILER
    // =====================================================

    const mailOptions = {
      // -----------------------------------------
      // EMAIL SENDER
      // -----------------------------------------

      from: `"VisaMaster Website" <${process.env.EMAIL_USER}>`,

      // -----------------------------------------
      // EMAIL RECEIVER
      // -----------------------------------------

      to: process.env.CONTACT_RECEIVER_EMAIL,

      // -----------------------------------------
      // EMAIL SUBJECT
      // -----------------------------------------

      subject: `New VisaMaster Enquiry - ${cleanName}`,

      // -----------------------------------------
      // PLAIN TEXT EMAIL
      // -----------------------------------------

      text: `
New VisaMaster Enquiry
======================

Name: ${cleanName}

Phone: ${cleanPhone}

Email: ${cleanEmail}

Destination: ${cleanDestination}

Visa Type: ${cleanVisaType}

Message:
${cleanMessage}

----------------------------------------

Enquiry ID:
${enquiry._id.toString()}

Submitted At:
${enquiry.createdAt}
      `,

      // -----------------------------------------
      // HTML EMAIL
      // -----------------------------------------

      html: `
        <div style="
          font-family: Arial, Helvetica, sans-serif;
          max-width: 700px;
          margin: 0 auto;
          padding: 30px;
          background: #f7f9fc;
          color: #102d50;
        ">

          <div style="
            background: #102d50;
            padding: 22px;
            border-radius: 12px 12px 0 0;
            color: white;
          ">

            <h1 style="
              margin: 0;
              font-size: 26px;
            ">
              VisaMaster
            </h1>

            <p style="
              margin: 6px 0 0;
              font-size: 14px;
              opacity: 0.9;
            ">
              New Website Enquiry
            </p>

          </div>

          <div style="
            background: white;
            padding: 25px;
            border-radius: 0 0 12px 12px;
            border: 1px solid #e5e7eb;
          ">

            <h2 style="
              margin-top: 0;
              color: #102d50;
            ">
              New Visa Enquiry
            </h2>

            <table style="
              width: 100%;
              border-collapse: collapse;
              font-size: 15px;
            ">

              <tr>
                <td style="
                  padding: 12px 8px;
                  font-weight: bold;
                  border-bottom: 1px solid #eee;
                  width: 35%;
                ">
                  Name
                </td>

                <td style="
                  padding: 12px 8px;
                  border-bottom: 1px solid #eee;
                ">
                  ${cleanName}
                </td>
              </tr>

              <tr>
                <td style="
                  padding: 12px 8px;
                  font-weight: bold;
                  border-bottom: 1px solid #eee;
                ">
                  Phone
                </td>

                <td style="
                  padding: 12px 8px;
                  border-bottom: 1px solid #eee;
                ">
                  ${cleanPhone}
                </td>
              </tr>

              <tr>
                <td style="
                  padding: 12px 8px;
                  font-weight: bold;
                  border-bottom: 1px solid #eee;
                ">
                  Email
                </td>

                <td style="
                  padding: 12px 8px;
                  border-bottom: 1px solid #eee;
                ">
                  ${cleanEmail}
                </td>
              </tr>

              <tr>
                <td style="
                  padding: 12px 8px;
                  font-weight: bold;
                  border-bottom: 1px solid #eee;
                ">
                  Destination
                </td>

                <td style="
                  padding: 12px 8px;
                  border-bottom: 1px solid #eee;
                ">
                  ${cleanDestination}
                </td>
              </tr>

              <tr>
                <td style="
                  padding: 12px 8px;
                  font-weight: bold;
                  border-bottom: 1px solid #eee;
                ">
                  Visa Type
                </td>

                <td style="
                  padding: 12px 8px;
                  border-bottom: 1px solid #eee;
                ">
                  ${cleanVisaType}
                </td>
              </tr>

              <tr>
                <td style="
                  padding: 12px 8px;
                  font-weight: bold;
                  vertical-align: top;
                ">
                  Message
                </td>

                <td style="
                  padding: 12px 8px;
                  white-space: pre-wrap;
                ">
                  ${cleanMessage}
                </td>
              </tr>

            </table>

            <div style="
              margin-top: 25px;
              padding: 15px;
              background: #fff8df;
              border-left: 4px solid #ffc43d;
              border-radius: 6px;
              font-size: 13px;
            ">

              <strong>Enquiry ID:</strong>
              ${enquiry._id.toString()}

              <br><br>

              <strong>Submitted At:</strong>
              ${enquiry.createdAt}

            </div>

          </div>

          <p style="
            text-align: center;
            margin-top: 20px;
            font-size: 12px;
            color: #777;
          ">
            This enquiry was submitted through the VisaMaster website.
          </p>

        </div>
      `,
    };

    // =====================================================
    // SEND EMAIL
    // =====================================================

    try {
      await transporter.sendMail(mailOptions);

      console.log(
        "ENQUIRY EMAIL SENT SUCCESSFULLY TO:",
        process.env.CONTACT_RECEIVER_EMAIL,
      );
    } catch (mailError) {
      // ---------------------------------------------------
      // IMPORTANT
      // ---------------------------------------------------
      // MongoDB me enquiry already save ho chuki hai.
      // Isliye email fail hone par enquiry delete nahi karenge.
      // ---------------------------------------------------

      console.error("ENQUIRY EMAIL ERROR:", mailError);

      const { partners, accountants, executives, destinations } =
        await getContactPageData();

      return res.status(500).render("contacts/index", {
        currentPage: "contact",

        partners,
        accountants,
        executives,
        destinations,

        success: null,

        error:
          "Your enquiry was saved, but we could not send the notification email. Please try again later.",

        formData: {
          name: cleanName,
          phone: cleanPhone,
          email: cleanEmail,
          destination: cleanDestination,
          visaType: cleanVisaType,
          message: cleanMessage,
        },
      });
    }

    // =====================================================
    // SUCCESS
    // =====================================================

    // POST ke baad render nahi kar rahe.
    //
    // Redirect kar rahe hain.
    //
    // Isse browser refresh karne par POST dobara
    // execute nahi hoga.

    return res.redirect("/contact?success=1");
  } catch (error) {
    // =====================================================
    // GENERAL ERROR
    // =====================================================

    console.error("ENQUIRY SUBMISSION ERROR:", error);

    try {
      const { partners, accountants, executives, destinations } =
        await getContactPageData();

      return res.status(500).render("contacts/index", {
        currentPage: "contact",

        partners,
        accountants,
        executives,
        destinations,

        success: null,

        error:
          "Something went wrong while submitting your enquiry. Please try again.",

        formData: {
          name: req.body.name || "",
          phone: req.body.phone || "",
          email: req.body.email || "",
          destination: req.body.destination || "",
          visaType: req.body.visaType || "",
          message: req.body.message || "",
        },
      });
    } catch (pageError) {
      console.error("CONTACT ERROR PAGE FAILED:", pageError);

      return res.status(500).send("Something went wrong");
    }
  }
};
