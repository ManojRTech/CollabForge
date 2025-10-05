import express from "express";
import pool from "../config/db.js";
import authMiddleware from "../middleware/authMiddleware.js";
import bcrypt from "bcryptjs";
import upload from "../middleware/upload.js";
import { updateProfile } from "../controllers/userController.js";

const router = express.Router();

// Protected route: Get logged-in user
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, username, email, bio, interests, profile_photo, created_at FROM users WHERE id = $1",
      [req.user.id]
    );
    res.json({ user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update profile (including optional profile photo)
router.put(
  "/me",
  authMiddleware,
  upload.single("profilePhoto"), // multer handles the file
  async (req, res) => {
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

      // Handle password change
      if (currentPassword && newPassword) {
        const match = await bcrypt.compare(currentPassword, user.password);
        if (!match) {
          return res.status(400).json({ message: "Current password is incorrect" });
        }
        hashedPassword = await bcrypt.hash(newPassword, 10);
      }

      // If a file was uploaded, get its path
      let profilePhotoPath = user.profile_photo; // keep existing if none uploaded
      if (req.file) {
        profilePhotoPath = `/uploads/${req.file.filename}`;
      }

      // Update the user
      const result = await pool.query(
        `UPDATE users
         SET username = COALESCE($1, username),
             bio = COALESCE($2, bio),
             interests = COALESCE($3, interests),
             password = $4,
             profile_photo = $5
         WHERE id = $6
         RETURNING id, username, email, bio, interests, profile_photo, created_at`,
        [username, bio, interests, hashedPassword, profilePhotoPath, req.user.id]
      );

      res.json({ user: result.rows[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  }
);

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

export default router;
