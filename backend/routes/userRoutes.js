// backend/routes/userRoutes.js
import express from "express";
import pool from "../config/db.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/me", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query("SELECT id, username, email FROM users WHERE id = $1", [req.user.id]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/dashboard", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, username, email FROM users WHERE id = $1",
      [req.user.id]
    );
    res.json({
      message: `Welcome ${result.rows[0].username} to your dashboard`,
      user: result.rows[0],
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
