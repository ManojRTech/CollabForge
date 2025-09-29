import express from "express";
import pool from "../config/db.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Create a new task
router.post("/", authMiddleware, async (req, res) => {
  const { title, description, deadline, category } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO tasks (title, description, category, deadline, status, created_by)
       VALUES ($1, $2, $3, $4, 'open', $5)
       RETURNING id, title, description, category, deadline, status, created_by, created_at`,
      [title, description, category, deadline, req.user.id]
    );

    res.status(201).json({ task: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Accept a task
router.post("/:id/accept", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE tasks
       SET status = 'accepted', assigned_to = $1
       WHERE id = $2 AND created_by <> $1
       RETURNING id, title, description, category, deadline, status, created_by, assigned_to`,
      [req.user.id, req.params.id]
    );

    if (result.rows.length === 0)
      return res.status(400).json({ message: "Cannot accept this task" });

    res.json({ task: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /tasks/:id/request
router.post("/tasks/:id/request", async (req, res) => {
  const taskId = req.params.id;
  const userId = req.user.id; // assume auth middleware sets req.user

  const task = await Task.findById(taskId);
  if (!task) return res.status(404).json({ message: "Task not found" });

  // Check if already requested
  if (task.pending_requests.some(r => r.user.toString() === userId)) {
    return res.status(400).json({ message: "Already requested" });
  }

  task.pending_requests.push({ user: userId });
  await task.save();

  // TODO: Send notification to task.creator
  res.json({ message: "Request sent to task creator" });
});

// POST /tasks/:id/approve
router.post("/tasks/:id/approve", async (req, res) => {
  const taskId = req.params.id;
  const { userId } = req.body; // user to approve
  const task = await Task.findById(taskId);
  if (!task) return res.status(404).json({ message: "Task not found" });

  // Only creator can approve
  if (task.created_by.toString() !== req.user.id) {
    return res.status(403).json({ message: "Not authorized" });
  }

  // Check if user requested
  const requestIndex = task.pending_requests.findIndex(r => r.user.toString() === userId);
  if (requestIndex === -1) return res.status(400).json({ message: "User did not request this task" });

  // Approve
  task.assigned_to = userId;
  task.pending_requests = []; // clear all pending requests
  await task.save();

  // TODO: Send notification to approved user
  res.json({ message: "User approved", task });
});

// POST /tasks/:id/reject
router.post("/tasks/:id/reject", async (req, res) => {
  const taskId = req.params.id;
  const { userId } = req.body; // user to reject
  const task = await Task.findById(taskId);
  if (!task) return res.status(404).json({ message: "Task not found" });

  if (task.created_by.toString() !== req.user.id) {
    return res.status(403).json({ message: "Not authorized" });
  }

  // Remove from pending_requests
  task.pending_requests = task.pending_requests.filter(r => r.user.toString() !== userId);
  await task.save();

  // TODO: Send notification to rejected user
  res.json({ message: "User rejected" });
});



// Get all tasks
router.get("/", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT t.id, t.title, t.description, t.category, t.deadline, t.status, t.created_at, t.created_by
       FROM tasks t
       ORDER BY t.created_at DESC`
    );

    res.json({ tasks: result.rows });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a single task
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, title, description, category, deadline, status, created_by, created_at
       FROM tasks WHERE id = $1 AND created_by = $2`,
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json({ task: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update a task (all fields)
router.put("/:id", authMiddleware, async (req, res) => {
  const { title, description, category, deadline, status } = req.body;

  try {
    const result = await pool.query(
      `UPDATE tasks
       SET title = $1, description = $2, category = $3, deadline = $4, status = $5
       WHERE id = $6 AND created_by = $7
       RETURNING id, title, description, category, deadline, status, created_by, created_at`,
      [title, description, category, deadline, status, req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Task not found or not yours" });
    }

    res.json({ task: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Update only task status
router.patch("/:id/status", authMiddleware, async (req, res) => {
  const { status } = req.body;

  try {
    const result = await pool.query(
      `UPDATE tasks
       SET status = $1
       WHERE id = $2 AND created_by = $3
       RETURNING id, title, description, category, deadline, status, created_at`,
      [status, req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Task not found or not yours" });
    }

    res.json({ task: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete a task
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM tasks WHERE id = $1 AND created_by = $2 RETURNING id",
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Task not found or not yours" });
    }

    res.json({ message: "Task deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
