const express = require("express");
const { createIssue, getIssues, updateIssue } = require("../controllers/issueController");

const router = express.Router();

// REST endpoints
router.post("/", createIssue);       // Create issue
router.get("/", getIssues);          // Read all issues
router.put("/:id", updateIssue);     // Update issue status

module.exports = router;
