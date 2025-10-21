// src/api.js
import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.REACT_APP_API_URL, // your backend URL
  withCredentials: true
});

export default API;
