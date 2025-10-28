// src/socket.js
import { io } from "socket.io-client";

const SOCKET_URL = "https://collabforge-server.onrender.com";

const socket = io(SOCKET_URL, {
  withCredentials: true
});

export default socket;
