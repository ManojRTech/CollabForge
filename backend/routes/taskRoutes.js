import express from "express";
import pool from "../config/db.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Create a new task
router.post("/", authMiddleware, async (req, res) => {
  const { title, description, deadline, category, progress } = req.body;

  try {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Insert task
      const taskResult = await client.query(
        `INSERT INTO tasks (title, description, category, deadline, status, created_by, progress)
        VALUES ($1, $2, $3, $4, 'open', $5, $6)
        RETURNING id, title, description, category, deadline, status, progress, created_by, created_at`,
        [title, description, category, deadline, req.user.id, progress || 0]
      );


      const task = taskResult.rows[0];

      // Auto-add creator as task member with 'creator' role
      await client.query(
        `INSERT INTO task_members (task_id, user_id, role, joined_at)
         VALUES ($1, $2, 'creator', NOW())`,
        [task.id, req.user.id]
      );

      await client.query('COMMIT');
      res.status(201).json({ task });

    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Accept a task
router.post("/:id/accept", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE tasks
       SET status = 'accepted'
       WHERE id = $2 AND created_by <> $1
       RETURNING id, title, description, category, deadline, status, created_by`,
      [req.user.id, req.params.id]
    );

    if (result.rows.length === 0)
      return res.status(400).json({ message: "Cannot accept this task" });

    res.json({ task: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

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

    // Approve request and add user as a task member
    await pool.query(
      `UPDATE requests
      SET status = 'approved'
      WHERE task_id = $1 AND user_id = $2`,
      [taskId, userId]
    );

    // Add the user to task_members as 'member' (if not already added)
    await pool.query(
      `INSERT INTO task_members (task_id, user_id, role, joined_at)
      VALUES ($1, $2, 'member', NOW())
      ON CONFLICT (task_id, user_id) DO NOTHING`,
      [taskId, userId]
    );

    res.json({ message: "User approved and task assigned" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

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
      `SELECT t.id, t.title, t.description, t.category, t.deadline, t.status, t.progress, t.created_at, t.created_by
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
      `SELECT t.id, t.title, t.description, t.category, t.deadline, t.status, t.progress, 
              t.created_at, t.created_by, u.username as creator_username
       FROM tasks t
       JOIN users u ON t.created_by = u.id
       WHERE t.id = $1 
       AND (t.created_by = $2 OR EXISTS (
         SELECT 1 FROM task_members WHERE task_id = $1 AND user_id = $2
       ))`,
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Task not found or access denied" });
    }

    res.json({ task: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id/team-contacts', authMiddleware, async (req, res) => {
  try {
    const taskId = req.params.id;
    
    // Verify user has access to this task
    const accessCheck = await pool.query(
      `SELECT 1 FROM task_members WHERE task_id = $1 AND user_id = $2
       UNION
       SELECT 1 FROM tasks WHERE id = $1 AND created_by = $2`,
      [taskId, req.user.id]
    );

    if (accessCheck.rows.length === 0) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Get all team members with their contact info
    const result = await pool.query(
      `SELECT 
         u.id, 
         u.username,
         u.email,
         u.github_url,
         u.phone,
         u.linkedin_url,
         u.show_github,
         u.show_email,
         u.show_phone,
         tm.role,
         tm.joined_at
       FROM task_members tm
       JOIN users u ON tm.user_id = u.id
       WHERE tm.task_id = $1
       ORDER BY 
         CASE WHEN tm.role = 'creator' THEN 1 ELSE 2 END,
         u.username`,
      [taskId]
    );

    res.json({ teamMembers: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Update a task 
router.put("/:id", authMiddleware, async (req, res) => {
  const { title, description, category, deadline, status, progress } = req.body;

  try {
    const result = await pool.query(
      `UPDATE tasks
      SET title = $1, description = $2, category = $3, deadline = $4, status = $5, progress = $6
      WHERE id = $7 AND created_by = $8
      RETURNING id, title, description, category, deadline, status, progress, created_by, created_at`,
      [title, description, category, deadline, status, progress, req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Task not found or not yours" });
    }

    res.json({ task: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch("/:id/status", authMiddleware, async (req, res) => {
  const { status } = req.body;
  const taskId = req.params.id;

  try {
    // Verify task exists and user has access (creator or member)
    const taskRes = await pool.query(
      `SELECT t.* FROM tasks t
       LEFT JOIN task_members tm ON t.id = tm.task_id AND tm.user_id = $2
       WHERE t.id = $1 AND (t.created_by = $2 OR tm.user_id = $2)`,
      [taskId, req.user.id]
    );

    if (taskRes.rows.length === 0) {
      return res.status(404).json({ message: "Task not found or access denied" });
    }

    const task = taskRes.rows[0];

    // If status is changing to in-progress, add approved users to task_members
    if (status === "in-progress") {
      await pool.query(
        `INSERT INTO task_members (task_id, user_id, role, joined_at)
         SELECT $1, user_id, 'member', NOW()
         FROM requests
         WHERE task_id = $1 AND status = 'approved'
         ON CONFLICT (task_id, user_id) DO NOTHING`,
        [taskId]
      );
    }

    // Update task status
    const updateRes = await pool.query(
      `UPDATE tasks
       SET status = $1
       WHERE id = $2
       RETURNING id, title, description, category, deadline, status, created_at`,
      [status, taskId]
    );

    res.json({ task: updateRes.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

router.patch("/:id/progress", authMiddleware, async (req, res) => {
  const { progress } = req.body;
  const taskId = req.params.id;

  try {
    // Verify task belongs to user or user is a member
    const taskRes = await pool.query(
      `SELECT t.* FROM tasks t
       LEFT JOIN task_members tm ON t.id = tm.task_id AND tm.user_id = $2
       WHERE t.id = $1 AND (t.created_by = $2 OR tm.user_id = $2)`,
      [taskId, req.user.id]
    );

    if (taskRes.rows.length === 0) {
      return res.status(404).json({ message: "Task not found or not authorized" });
    }

    // Update progress
    const result = await pool.query(
      "UPDATE tasks SET progress = $1 WHERE id = $2 RETURNING *",
      [progress, taskId]
    );

    res.json({ task: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
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

// GET all members for a task 
router.get("/:id/members", authMiddleware, async (req, res) => {
  const taskId = req.params.id;

  try {
    // Only allow task creator or task members to view
    const membership = await pool.query(
      `SELECT 1 FROM task_members WHERE task_id = $1 AND user_id = $2
       UNION
       SELECT 1 FROM tasks WHERE id = $1 AND created_by = $2`,
      [taskId, req.user.id]
    );

    if (membership.rows.length === 0) {
      return res.status(403).json({ message: "Not authorized to view members" });
    }

    // Fetch all members of the task with usernames
    const result = await pool.query(
      `SELECT tm.user_id, tm.role, tm.joined_at, u.username
       FROM task_members tm
       JOIN users u ON tm.user_id = u.id
       WHERE tm.task_id = $1
       ORDER BY tm.joined_at ASC`,
      [taskId]
    );

    res.json({ members: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

//Get all tasks where user is a member
router.get("/user/memberships", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT tm.task_id, tm.role, tm.joined_at, t.title, t.status
       FROM task_members tm
       JOIN tasks t ON tm.task_id = t.id
       WHERE tm.user_id = $1
       ORDER BY tm.joined_at DESC`,
      [req.user.id]
    );

    res.json({ memberships: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET all messages for a task
router.get("/:id/messages", authMiddleware, async (req, res) => {
  const taskId = req.params.id;

  try {
    // Check membership or creator
    const membership = await pool.query(
      `SELECT 1 FROM task_members WHERE task_id = $1 AND user_id = $2
       UNION
       SELECT 1 FROM tasks WHERE id = $1 AND created_by = $2`,
      [taskId, req.user.id]
    );

    if (membership.rows.length === 0) {
      return res.status(403).json({ message: "Not authorized to view messages" });
    }

    const result = await pool.query(
      `SELECT m.id, m.message, m.created_at, u.username
       FROM chat_messages m
       JOIN users u ON m.user_id = u.id
       WHERE m.task_id = $1
       ORDER BY m.created_at ASC`,
      [taskId]
    );

    res.json({ messages: result.rows });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST a new message
router.post("/:id/messages", authMiddleware, async (req, res) => {
  const taskId = req.params.id;
  const { message } = req.body;

  try {
    // Check membership or creator
    const membership = await pool.query(
      `SELECT 1 FROM task_members WHERE task_id = $1 AND user_id = $2
       UNION
       SELECT 1 FROM tasks WHERE id = $1 AND created_by = $2`,
      [taskId, req.user.id]
    );

    if (membership.rows.length === 0) {
      return res.status(403).json({ message: "Not authorized to post message" });
    }

    const result = await pool.query(
      `INSERT INTO chat_messages (task_id, user_id, message, created_at)
       VALUES ($1, $2, $3, NOW())
       RETURNING id, task_id, user_id, message, created_at`,
      [taskId, req.user.id, message]
    );

    res.status(201).json({ message: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch("/:id/progress", authMiddleware, async (req, res) => {
  const { progress } = req.body;
  const taskId = req.params.id;

  try {
    // Verify task belongs to user
    const taskRes = await pool.query(
      "SELECT * FROM tasks WHERE id = $1 AND created_by = $2",
      [taskId, req.user.id]
    );

    if (taskRes.rows.length === 0) {
      return res.status(404).json({ message: "Task not found or not authorized" });
    }

    // Update progress
    const result = await pool.query(
      "UPDATE tasks SET progress = $1 WHERE id = $2 RETURNING *",
      [progress, taskId]
    );

    res.json({ task: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;