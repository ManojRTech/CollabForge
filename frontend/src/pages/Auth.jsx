import { useState } from "react";
import axios from "axios";

const Auth = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState(""); 
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleRegister = async () => {
    try {
      const res = await axios.post("/api/auth/register", { username, email, password });
      // Show success message + user info + token
      setMessage(
        `Registered successfully! | Token: ${res.data.token} | User: ${res.data.user.username} (${res.data.user.email})`
      );
      // Clear fields
      setUsername("");
      setEmail("");
      setPassword("");
    } catch (err) {
      setMessage(err.response?.data?.message || err.message);
    }
  };

  const handleLogin = async () => {
    try {
      const res = await axios.post("/api/auth/login", { email, password });
      // Save token
      localStorage.setItem("token", res.data.token);
      // Show success message + user info
      setMessage(
        `Login successful! | Token: ${res.data.token} | User: ${res.data.user.username} (${res.data.user.email})`
      );
      // Clear fields
      setEmail("");
      setPassword("");
    } catch (err) {
      setMessage(err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="p-6 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-4">Auth Page</h1>
      <input 
        type="text" 
        placeholder="Username" 
        value={username} 
        onChange={(e) => setUsername(e.target.value)}
        className="mb-2 p-2 border rounded"
      />
      <input 
        type="email" 
        placeholder="Email" 
        value={email} 
        onChange={(e) => setEmail(e.target.value)}
        className="mb-2 p-2 border rounded"
      />
      <input 
        type="password" 
        placeholder="Password" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)}
        className="mb-2 p-2 border rounded"
      />
      <div className="flex gap-2">
        <button 
          onClick={handleRegister} 
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Register
        </button>
        <button 
          onClick={handleLogin} 
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Login
        </button>
      </div>
      {message && (
        <p className="mt-4 p-2 bg-gray-100 rounded w-full max-w-lg text-left break-words">
          {message}
        </p>
      )}
    </div>
  );
};

export default Auth;
