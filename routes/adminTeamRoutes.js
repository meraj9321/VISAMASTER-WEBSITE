const express = require("express");

const router = express.Router();

const {
  showTeam,
  showAddTeam,
  addTeam,
  showEditTeam,
  updateTeam,
  deleteTeam,
  toggleTeam,
} = require("../controllers/adminTeamController");

// =========================================================
// TEAM LIST
// =========================================================

router.get("/team", showTeam);

// =========================================================
// ADD TEAM MEMBER
// =========================================================

router.get("/team/add", showAddTeam);

router.post("/team/add", addTeam);

// =========================================================
// EDIT TEAM MEMBER
// =========================================================

router.get("/team/:id/edit", showEditTeam);

router.post("/team/:id/edit", updateTeam);

// =========================================================
// DELETE TEAM MEMBER
// =========================================================

router.post("/team/:id/delete", deleteTeam);

// =========================================================
// ACTIVE / INACTIVE
// =========================================================

router.post("/team/:id/toggle", toggleTeam);

module.exports = router;
