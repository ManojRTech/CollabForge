import express from "express";
import pool from "../config/db.js";
import authMiddleware from "../middleware/authMiddleware.js";
import bcrypt from "bcryptjs";

const router = express.Router();

// Protected route: Get logged-in user
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, username, email, bio, interests, created_at FROM users WHERE id = $1",
      [req.user.id]
    );
    res.json({ user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// routes/userRoutes.js
router.patch('/contact-settings', authMiddleware, async (req, res) => {
  try {
    const { github_url, phone, show_github, show_email, show_phone } = req.body;
    
    const result = await pool.query(
      `UPDATE users 
       SET github_url = $1, phone = $2, show_github = $3, show_email = $4, show_phone = $5
       WHERE id = $6
       RETURNING id, username, email, github_url, phone, show_github, show_email, show_phone`,
      [github_url, phone, show_github, show_email, show_phone, req.user.id]
    );

    res.json({ 
      message: "Contact settings updated successfully",
      user: result.rows[0] 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Protected route: Update profile + optional password change
router.put("/me", authMiddleware, async (req, res) => {
  const { username, bio, interests, currentPassword, newPassword } = req.body;

  try {
    // Fetch current user
    const userResult = await pool.query(
      "SELECT * FROM users WHERE id = $1",
      [req.user.id]
    );
    const user = userResult.rows[0];
    if (!user) return res.status(404).json({ message: "User not found" });

    let hashedPassword = user.password;

    // If password change requested, verify current password
    if (currentPassword && newPassword) {
      const match = await bcrypt.compare(currentPassword, user.password);
      if (!match) {
        return res
          .status(400)
          .json({ message: "Current password is incorrect" });
      }
      hashedPassword = await bcrypt.hash(newPassword, 10);
    }

    // Update only changed fields
    const result = await pool.query(
      `UPDATE users
       SET username = COALESCE($1, username),
           bio = COALESCE($2, bio),
           interests = COALESCE($3, interests),
           password = $4
       WHERE id = $5
       RETURNING id, username, email, bio, interests, created_at`,
      [username, bio, interests, hashedPassword, req.user.id]
    );

    res.json({ user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
