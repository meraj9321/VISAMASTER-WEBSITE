module.exports = (req, res, next) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");

  if (req.session && req.session.adminUser) {
    return next();
  }

  return res.redirect("/admin/login");
};
