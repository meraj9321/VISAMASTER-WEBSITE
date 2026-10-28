const express = require("express");
const path = require("path");
const session = require("express-session");

// =========================================================
// LOAD ENVIRONMENT VARIABLES
// =========================================================

require("dotenv").config();

// =========================================================
// CREATE EXPRESS APP
// =========================================================

const app = express();

// =========================================================
// SESSION
// =========================================================

app.use(
  session({
    name: "adminSession",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      // Browser-session cookie; no maxAge configured.
    },
  }),
);

// =========================================================
// VIEW ENGINE
// =========================================================

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// =========================================================
// STATIC FILES
// =========================================================

app.use(express.static(path.join(__dirname, "public")));

// =========================================================
// BODY PARSERS
// =========================================================

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// =========================================================
// PUBLIC ROUTES
// =========================================================

const homeRoutes = require("./routes/homeRoutes");
const aboutRoutes = require("./routes/aboutRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const destinationRoutes = require("./routes/destinationRoutes");
const contactRoutes = require("./routes/contactRoutes");
const countryRoutes = require("./routes/countryRoutes");
const visasRoutes = require("./routes/visasRoutes");
const eVisaRoutes = require("./routes/eVisaRoutes");
const schengenRoutes = require("./routes/schengenRoutes");
const newsRoutes = require("./routes/newsRoutes");

// =========================================================
// ADMIN ROUTES
// =========================================================

const adminCountryRoutes = require("./routes/adminCountryRoutes");
const adminRoutes = require("./routes/adminRoutes");
const adminEnquiryRoutes = require("./routes/adminEnquiryRoutes");
const adminTeamRoutes = require("./routes/adminTeamRoutes");
const adminAuthRoutes = require("./routes/adminAuthRoutes");
const adminNewsRoutes = require("./routes/adminNewsRoutes");

// =========================================================
// ADMIN AUTH MIDDLEWARE
// =========================================================

const adminAuth = require("./middleware/adminAuth");

// =========================================================
// MOUNT PUBLIC ROUTES
// =========================================================

// Main visa directory
app.use("/visas", visasRoutes);

// Dedicated Schengen countries page
// URL: /visas/schengen
app.use("/visas/schengen", schengenRoutes);

// Existing e-Visa routes
app.use("/visas/e-visa", eVisaRoutes);

// Other public routes
app.use("/", homeRoutes);
app.use("/about", aboutRoutes);
app.use("/services", serviceRoutes);
app.use("/destinations", destinationRoutes);
app.use("/contact", contactRoutes);
app.use("/countries", countryRoutes);
app.use("/news", newsRoutes);

// =========================================================
// ADMIN LOGIN / LOGOUT
// MUST COME BEFORE PROTECTED ADMIN ROUTES
// =========================================================

app.use("/admin", adminAuthRoutes);

// =========================================================
// PROTECTED ADMIN ROUTES
// =========================================================

app.use("/admin", adminAuth, adminRoutes);
app.use("/admin", adminAuth, adminCountryRoutes);
app.use("/admin", adminAuth, adminEnquiryRoutes);
app.use("/admin", adminAuth, adminTeamRoutes);
app.use("/admin", adminAuth, adminNewsRoutes);

// =========================================================
// 404 PAGE
// =========================================================

app.use((req, res) => {
  res.status(404).render("errors/404");
});

// =========================================================
// EXPORT APP
// =========================================================

module.exports = app;
