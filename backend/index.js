import dotenv from "dotenv";
dotenv.config(); // load .env
import express from "express";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware (helps parse JSON requests later)
app.use(express.json());

// Test Route
app.get("/api/test", (req, res) => {
  res.json({ message: "Backend is running" });
});

// Auth routes
app.use("/api/auth", authRoutes);

app.use("/api/user", userRoutes);

app.use("/api/tasks", taskRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Backend server running at http://localhost:${PORT}`);
});
