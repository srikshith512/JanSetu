const express = require("express");
const {
  createIssue,
  getIssues,
  updateIssue,
} = require("../controllers/issueController");

const router = express.Router();

router.post("/", createIssue);     // Create
router.get("/", getIssues);        // Read all
router.put("/:id", updateIssue);   // Update status

module.exports = router;
