const bcrypt = require("bcryptjs");

const AdminUser = require("../models/AdminUser");

// =========================================================
// SHOW LOGIN PAGE
// =========================================================

exports.showLogin = (req, res) => {
  if (req.session && req.session.adminUser) {
    return res.redirect("/admin");
  }

  res.render("admin/login", {
    error: null,
  });
};

// =========================================================
// LOGIN
// =========================================================

exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.render("admin/login", {
        error: "Please enter ID and password.",
      });
    }

    const adminUser = await AdminUser.findOne({
      username: username.trim().toLowerCase(),
      active: true,
    });

    if (!adminUser) {
      return res.render("admin/login", {
        error: "Invalid ID or password.",
      });
    }

    const passwordMatch = await bcrypt.compare(password, adminUser.password);

    if (!passwordMatch) {
      return res.render("admin/login", {
        error: "Invalid ID or password.",
      });
    }

    req.session.adminUser = {
      id: adminUser._id.toString(),
      username: adminUser.username,
    };

    return res.redirect("/admin");
  } catch (error) {
    console.error("Admin login error:", error);
    next(error);
  }
};

// =========================================================
// LOGOUT
// =========================================================

exports.logout = (req, res, next) => {
  req.session.destroy((error) => {
    if (error) {
      console.error("Admin logout error:", error);
      return next(error);
    }

    res.clearCookie("adminSession");

    return res.redirect("/admin/login");
  });
};
