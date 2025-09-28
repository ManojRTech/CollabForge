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

// Get all tasks (only user’s own for now)
router.get("/", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT t.id, t.title, t.description, t.category, t.deadline, t.status, t.created_at
       FROM tasks t
       WHERE t.created_by = $1
       ORDER BY t.created_at DESC`,
      [req.user.id]
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

// Update a task
router.put("/:id", authMiddleware, async (req, res) => {
  const { title, description, category, deadline, status } = req.body;

  try {
    const result = await pool.query(
      `UPDATE tasks
       SET title = $1, description = $2, category = $3, deadline = $4, status = $5
       WHERE id = $6 AND created_by = $7
       RETURNING id, title, description, category, deadline, status, created_at`,
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
