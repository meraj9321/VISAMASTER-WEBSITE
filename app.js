const express = require("express");
const path = require("path");
const session = require("express-session");
const helmet = require("helmet");

// =========================================================
// LOAD ENVIRONMENT VARIABLES
// =========================================================

require("dotenv").config();

// =========================================================
// CREATE EXPRESS APP
// =========================================================

const app = express();

// =========================================================
// TRUST PROXY
// =========================================================

app.set("trust proxy", 1);

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
    },
  }),
);

// =========================================================
// VIEW ENGINE
// =========================================================

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// =========================================================
// HELMET SECURITY
// =========================================================

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],

        // External JavaScript from your own website
        scriptSrc: ["'self'"],

        // Keep inline styles working for existing pages
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        // Images and flags
        imgSrc: ["'self'", "data:", "https:", "blob:"],

        // Fonts
        fontSrc: ["'self'", "data:", "https:"],

        // Same-origin AJAX and fetch requests
        connectSrc: ["'self'"],

        // Security restrictions
        objectSrc: ["'none'"],

        // Allow Google Maps iframe
        frameSrc: [
          "'self'",
          "https://maps.google.com",
          "https://www.google.com",
        ],

        // Enable HTTPS upgrade only in production
        upgradeInsecureRequests:
          process.env.NODE_ENV === "production" ? [] : null,
      },
    },
  }),
);

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

app.use("/", homeRoutes);
app.use("/about", aboutRoutes);
app.use("/services", serviceRoutes);
app.use("/destinations", destinationRoutes);
app.use("/contact", contactRoutes);
app.use("/countries", countryRoutes);
app.use("/news", newsRoutes);
app.use("/visas", visasRoutes);

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
