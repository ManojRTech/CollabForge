// src/socket.js
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL;

const socket = io(SOCKET_URL, {
  withCredentials: true
});

export default socket;
