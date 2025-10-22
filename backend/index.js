import { Server } from 'socket.io';
import { createServer } from 'http';
import pool from "./config/db.js";
import dotenv from "dotenv";
if (process.env.NODE_ENV !== 'production') {
  dotenv.config(); 
}
import path from "path";
import express from "express";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";

const __dirname = path.resolve();

const app = express();
const PORT = process.env.PORT || 5000;

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",                      // for local dev
      "https://collab-forge.vercel.app/"     // your deployed frontend
    ],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware (helps parse JSON requests later)
app.use(express.json());

// Auth routes
app.use("/api/auth", authRoutes);

app.use("/api/user", userRoutes);

app.use("/api/tasks", taskRoutes);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// WebSocket Connection Handling
io.on('connection', (socket) => {
  // console.log('User connected:', socket.id);

  // Join a specific task room
  socket.on('join-task', (taskId) => {
    socket.join(`task-${taskId}`);
    // console.log(`User ${socket.id} joined task-${taskId}`);
  });

  // Handle sending messages
  socket.on('send-message', async (data) => {
    try {
      const { taskId, message, userId } = data;
      
      // console.log('Received message:', data);

      // Save message to database
      const result = await pool.query(
        `INSERT INTO chat_messages (task_id, user_id, message, created_at)
         VALUES ($1, $2, $3, NOW())
         RETURNING id, task_id, user_id, message, created_at`,
        [taskId, userId, message]
      );

      // Get username for the message
      const userResult = await pool.query(
        `SELECT username FROM users WHERE id = $1`,
        [userId]
      );

      const messageWithUser = {
        ...result.rows[0],
        username: userResult.rows[0].username
      };

      // console.log('Saved message to DB:', messageWithUser);

      // Broadcast to everyone in the task room
      io.to(`task-${taskId}`).emit('new-message', messageWithUser);

    } catch (error) {
      console.error('Error saving message:', error);
      socket.emit('error', 'Failed to send message');
    }
  });

  socket.on('disconnect', () => {
    // console.log('User disconnected:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT} with WebSocket support`);
});