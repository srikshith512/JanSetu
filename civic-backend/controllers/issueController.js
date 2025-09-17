let issues = []; // temporary in-memory storage
let idCounter = 1;

// Create Issue
exports.createIssue = (req, res, next) => {
  try {
    const { title, description, category } = req.body;
    if (!title || !description) {
      return res.status(400).json({ error: "Title & Description are required" });
    }
    const newIssue = {
      id: idCounter++,
      title,
      description,
      category: category || "General",
      status: "Pending",
      created_at: new Date(),
    };
    issues.push(newIssue);
    res.status(201).json(newIssue);
  } catch (err) {
    next(err);
  }
};

// Get All Issues
exports.getIssues = (req, res, next) => {
  try {
    res.json(issues);
  } catch (err) {
    next(err);
  }
};

// Update Issue Status
exports.updateIssue = (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const issue = issues.find((i) => i.id === parseInt(id));
    if (!issue) {
      return res.status(404).json({ error: "Issue not found" });
    }
    issue.status = status || issue.status;
    res.json(issue);
  } catch (err) {
    next(err);
  }
};
