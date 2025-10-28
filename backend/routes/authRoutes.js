import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();
const JWT_SECRET = "123";

router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if user exists
    const userExists = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user
    const newUser = await pool.query(
      "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *",
      [username, email, hashedPassword]
    );

    // Create token
    const token = jwt.sign({ id: newUser.rows[0].id }, JWT_SECRET, {
      expiresIn: "1h",
    });

    // Send response with message
    res.json({
      message: "Registration successful",
      token,
      user: newUser.rows[0],
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    const user = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (user.rows.length === 0) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.rows[0].password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Create token
    const token = jwt.sign({ id: user.rows[0].id }, JWT_SECRET, {
      expiresIn: "1h",
    });

    // Send response with message
    res.json({
      message: "Login successful",
      token,
      user: user.rows[0],
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/update-password", authMiddleware, async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  try {
    // Fetch the user from DB
    const userResult = await pool.query("SELECT * FROM users WHERE id = $1", [req.user.id]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = userResult.rows[0];

    // Compare old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Old password is incorrect" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password in DB
    await pool.query("UPDATE users SET password = $1 WHERE id = $2", [hashedPassword, req.user.id]);

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
