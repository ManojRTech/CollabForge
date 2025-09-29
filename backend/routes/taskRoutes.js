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
router.post("/:id/request", authMiddleware, async (req, res) => {
  const taskId = req.params.id;
  const userId = req.user.id;

  try {
    // Check if task exists
    const taskResult = await pool.query(
      "SELECT * FROM tasks WHERE id = $1",
      [taskId]
    );
    if (taskResult.rows.length === 0) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Check if already requested
    const existingRequest = await pool.query(
      "SELECT * FROM requests WHERE task_id = $1 AND user_id = $2",
      [taskId, userId]
    );
    if (existingRequest.rows.length > 0) {
      return res.status(400).json({ message: "Already requested" });
    }

    // Insert request
    await pool.query(
      "INSERT INTO requests (task_id, user_id, status) VALUES ($1, $2, 'pending')",
      [taskId, userId]
    );

    res.json({ message: "Request sent to task creator" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


// POST /tasks/:id/approve
router.post("/:id/approve", authMiddleware, async (req, res) => {
  const taskId = req.params.id;
  const { userId } = req.body; // requester ID

  try {
    // Check if task exists & requester is the creator
    const taskResult = await pool.query(
      "SELECT * FROM tasks WHERE id = $1",
      [taskId]
    );
    if (taskResult.rows.length === 0) {
      return res.status(404).json({ message: "Task not found" });
    }
    if (taskResult.rows[0].created_by !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Check if the user requested this task
    const requestResult = await pool.query(
      "SELECT * FROM requests WHERE task_id = $1 AND user_id = $2 AND status = 'pending'",
      [taskId, userId]
    );
    if (requestResult.rows.length === 0) {
      return res.status(400).json({ message: "User did not request this task" });
    }

    // Approve request
    await pool.query(
      "UPDATE requests SET status = 'approved' WHERE task_id = $1 AND user_id = $2",
      [taskId, userId]
    );

    // Assign task to this user
    await pool.query(
      "UPDATE tasks SET assigned_to = $1, status = 'in-progress' WHERE id = $2",
      [userId, taskId]
    );

    res.json({ message: "User approved and task assigned" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /tasks/:id/reject
router.post("/:id/reject", authMiddleware, async (req, res) => {
  const taskId = req.params.id;
  const { userId } = req.body;

  try {
    // Check if task exists & requester is the creator
    const taskResult = await pool.query(
      "SELECT * FROM tasks WHERE id = $1",
      [taskId]
    );
    if (taskResult.rows.length === 0) {
      return res.status(404).json({ message: "Task not found" });
    }
    if (taskResult.rows[0].created_by !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Reject request
    await pool.query(
      "UPDATE requests SET status = 'rejected' WHERE task_id = $1 AND user_id = $2",
      [taskId, userId]
    );

    res.json({ message: "User rejected" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
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

// Get all requests for tasks created by logged-in user
router.get("/my-requests", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT r.id AS request_id, r.status, r.user_id, u.username,
              t.id AS task_id, t.title, t.status AS task_status, r.created_at
       FROM requests r
       JOIN tasks t ON r.task_id = t.id
       JOIN users u ON r.user_id = u.id
       WHERE t.created_by = $1
       ORDER BY r.created_at DESC`,
      [req.user.id]
    );
    res.json({ requests: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get requests made by the current user
router.get("/user/requests", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT r.id AS request_id, r.status, r.task_id, t.title AS task_title,
              t.created_by AS task_creator_id, u.username AS task_creator_name,
              r.created_at
       FROM requests r
       JOIN tasks t ON r.task_id = t.id
       JOIN users u ON t.created_by = u.id
       WHERE r.user_id = $1
       ORDER BY r.created_at DESC`,
      [req.user.id]
    );
    res.json({ requests: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
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

// Update only task status
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

// POST /tasks/:id/request
router.post("/:id/request", authMiddleware, async (req, res) => {
  const taskId = req.params.id;
  const userId = req.user.id;

  console.log("Request received - Task ID:", taskId, "User ID:", userId); // Debug log

  try {
    // Check if task exists
    const taskResult = await pool.query(
      "SELECT * FROM tasks WHERE id = $1",
      [taskId]
    );
    console.log("Task found:", taskResult.rows.length > 0); // Debug log
    
    if (taskResult.rows.length === 0) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Check if already requested
    const existingRequest = await pool.query(
      "SELECT * FROM requests WHERE task_id = $1 AND user_id = $2",
      [taskId, userId]
    );
    console.log("Already requested:", existingRequest.rows.length > 0); // Debug log
    
    if (existingRequest.rows.length > 0) {
      return res.status(400).json({ message: "Already requested" });
    }

    // Insert request
    const insertResult = await pool.query(
      "INSERT INTO requests (task_id, user_id, status) VALUES ($1, $2, 'pending') RETURNING *",
      [taskId, userId]
    );
    
    console.log("Request inserted:", insertResult.rows[0]); // Debug log

    res.json({ message: "Request sent to task creator" });
  } catch (err) {
    console.error("Error in request endpoint:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
