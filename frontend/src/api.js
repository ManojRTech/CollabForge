// src/api.js
import axios from "axios";

const API = axios.create({
  baseURL: "https://collabforge-server.onrender.com", // your backend URL
  withCredentials: true
});

export default API;
