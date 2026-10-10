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

    secret: process.env.SESSION_SECRET || "visamaster-admin-session-secret",

    resave: false,

    saveUninitialized: false,

    cookie: {
      httpOnly: true,
      secure: false,
      maxAge: 1000 * 60 * 60 * 8,
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

app.use(
  express.urlencoded({
    extended: true,
  }),
);

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

// =========================================================
// ADMIN ROUTES
// =========================================================

const adminCountryRoutes = require("./routes/adminCountryRoutes");
const adminRoutes = require("./routes/adminRoutes");
const adminEnquiryRoutes = require("./routes/adminEnquiryRoutes");
const adminTeamRoutes = require("./routes/adminTeamRoutes");
const adminAuthRoutes = require("./routes/adminAuthRoutes");
const newsRoutes = require("./routes/newsRoutes");
const adminNewsRoutes = require("./routes/adminNewsRoutes");

// =========================================================
// ADMIN AUTH MIDDLEWARE
// =========================================================

const adminAuth = require("./middleware/adminAuth");

// =========================================================
// PUBLIC ROUTES
// =========================================================

app.use("/", homeRoutes);

app.use("/about", aboutRoutes);

app.use("/services", serviceRoutes);

app.use("/destinations", destinationRoutes);

app.use("/contact", contactRoutes);

app.use("/visas", visasRoutes);

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
