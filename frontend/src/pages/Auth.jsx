import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Auth = (props) => { // <-- receive props
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      const res = await axios.post("/api/auth/register", { username, email, password });
      localStorage.setItem("token", res.data.token);
      props.setToken(res.data.token); // inform parent
      setMessage(`Registered successfully! Welcome ${res.data.user.username}`);
      setUsername(""); setEmail(""); setPassword("");
      navigate("/dashboard");
    } catch (err) {
      console.error(err.response || err);
      setMessage(err.response?.data?.message || err.message);
    }
  };

  const handleLogin = async () => {
    try {
      const res = await axios.post("/api/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      props.setToken(res.data.token); // inform parent
      setMessage(`Login successful! Welcome ${res.data.user.username}`);
      setEmail(""); setPassword("");
      navigate("/dashboard");
    } catch (err) {
      console.error(err.response || err);
      setMessage(err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="p-6 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-4">Auth Page</h1>
      <form onSubmit={(e) => e.preventDefault()} className="flex flex-col items-center gap-2">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="p-2 border rounded w-64"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="p-2 border rounded w-64"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="p-2 border rounded w-64"
        />
        <div className="flex gap-2 mt-2">
          <button
            type="button"
            onClick={handleRegister}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Register
          </button>
          <button
            type="button"
            onClick={handleLogin}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Login
          </button>
        </div>
      </form>
      {message && (
        <p className="mt-4 p-2 bg-gray-100 rounded w-64 text-left break-words">
          {message}
        </p>
      )}
    </div>
  );
};

export default Auth;
