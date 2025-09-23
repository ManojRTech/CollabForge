// index.js
import express from "express";
import authRoutes from "./routes/authRoutes.js";

const app = express();
const PORT = 5000;

// Middleware (helps parse JSON requests later)
app.use(express.json());

// Test Route
app.get("/api/test", (req, res) => {
  res.json({ message: "Backend is running" });
});

// Auth routes
app.use("/api/auth", authRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Backend server running at http://localhost:${PORT}`);
});
