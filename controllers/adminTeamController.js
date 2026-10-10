const TeamMember = require("../models/TeamMember");

// =========================================================
// SHOW ALL TEAM MEMBERS
// =========================================================

exports.showTeam = async (req, res, next) => {
  try {
    const teamMembers = await TeamMember.find({})
      .sort({ role: 1, order: 1, name: 1 })
      .lean();

    res.render("admin/team/index", {
      teamMembers,
    });
  } catch (error) {
    console.error("Admin team page error:", error);
    next(error);
  }
};

// =========================================================
// SHOW ADD TEAM MEMBER FORM
// =========================================================

exports.showAddTeam = (req, res) => {
  res.render("admin/team/form", {
    teamMember: null,
    pageTitle: "Add Team Member",
    formAction: "/admin/team/add",
  });
};

// =========================================================
// ADD TEAM MEMBER
// =========================================================

exports.addTeam = async (req, res, next) => {
  try {
    const {
      name,
      role,
      designation,
      phone,
      whatsapp,
      email,
      image,
      order,
      active,
    } = req.body;

    await TeamMember.create({
      name,
      role,
      designation,
      phone,
      whatsapp,
      email,
      image: image || "",
      order: Number(order) || 0,
      active: active === "on",
    });

    res.redirect("/admin/team");
  } catch (error) {
    console.error("Add team member error:", error);
    next(error);
  }
};

// =========================================================
// SHOW EDIT TEAM MEMBER FORM
// =========================================================

exports.showEditTeam = async (req, res, next) => {
  try {
    const teamMember = await TeamMember.findById(req.params.id).lean();

    if (!teamMember) {
      return res.status(404).send("Team member not found");
    }

    res.render("admin/team/form", {
      teamMember,
      pageTitle: "Edit Team Member",
      formAction: `/admin/team/${teamMember._id}/edit`,
    });
  } catch (error) {
    console.error("Edit team page error:", error);
    next(error);
  }
};

// =========================================================
// UPDATE TEAM MEMBER
// =========================================================

exports.updateTeam = async (req, res, next) => {
  try {
    const {
      name,
      role,
      designation,
      phone,
      whatsapp,
      email,
      image,
      order,
      active,
    } = req.body;

    const teamMember = await TeamMember.findById(req.params.id);

    if (!teamMember) {
      return res.status(404).send("Team member not found");
    }

    teamMember.name = name;
    teamMember.role = role;
    teamMember.designation = designation;
    teamMember.phone = phone;
    teamMember.whatsapp = whatsapp;
    teamMember.email = email;
    teamMember.image = image || "";
    teamMember.order = Number(order) || 0;
    teamMember.active = active === "on";

    await teamMember.save();

    res.redirect("/admin/team");
  } catch (error) {
    console.error("Update team member error:", error);
    next(error);
  }
};

// =========================================================
// DELETE TEAM MEMBER
// =========================================================

exports.deleteTeam = async (req, res, next) => {
  try {
    const teamMember = await TeamMember.findById(req.params.id);

    if (!teamMember) {
      return res.status(404).send("Team member not found");
    }

    await TeamMember.findByIdAndDelete(req.params.id);

    res.redirect("/admin/team");
  } catch (error) {
    console.error("Delete team member error:", error);
    next(error);
  }
};

// =========================================================
// TOGGLE ACTIVE / INACTIVE
// =========================================================

exports.toggleTeam = async (req, res, next) => {
  try {
    const teamMember = await TeamMember.findById(req.params.id);

    if (!teamMember) {
      return res.status(404).send("Team member not found");
    }

    teamMember.active = !teamMember.active;

    await teamMember.save();

    res.redirect("/admin/team");
  } catch (error) {
    console.error("Toggle team member error:", error);
    next(error);
  }
};
