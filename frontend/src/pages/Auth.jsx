import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Auth = ({ setToken }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  const [contactInfo, setContactInfo] = useState({
    github_url: "",
    phone: "",
    show_github: true,
    show_email: true,
    show_phone: false,
  });

  const navigate = useNavigate();

  const handleContactChange = (field, value) => {
    setContactInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handleRegister = async () => {
    if (!username || !email || !password) {
      setMessage("Please fill all required fields.");
      return;
    }

    try {
      const registrationData = { username, email, password, ...contactInfo };
      const res = await axios.post("/api/auth/register", registrationData);

      const token = res.data.token;
      localStorage.setItem("token", token);
      setToken(token);

      navigate("/dashboard", {
        state: { flashMessage: `Registration successful! Welcome, ${res.data.user.username}` },
      });
    } catch (err) {
      console.error("Registration error:", err.response || err.message);
      setMessage(err.response?.data?.message || "Registration failed");
    }
  };

  const handleLogin = async () => {
    if (!username || !email || !password) {
      setMessage("Please fill all required fields.");
      return;
    }

    try {
      const res = await axios.post("/api/auth/login", { username, email, password });

      const token = res.data.token;
      localStorage.setItem("token", token);
      setToken(token);

      navigate("/dashboard", {
        state: { flashMessage: `Login successful! Welcome, ${res.data.user.username}` },
      });
    } catch (err) {
      console.error("Login error:", err.response || err.message);
      setMessage(err.response?.data?.message || "Login failed");
    }
  };

  const toggleAuthMode = () => {
    setIsRegistering(!isRegistering);
    setMessage("");
  };

  return (
    <div className="min-h-screen flex items-start justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4 pt-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white shadow-xl rounded-2xl p-10 w-full max-w-md border border-gray-200 min-h-[480px]"
      >
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Collab Forge</h1>
          <p className="text-gray-500 mt-1 text-sm italic">“Collaborate smarter. Forge together.”</p>
        </div>

        <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-4">
          {/* Username always visible */}
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all duration-200"
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all duration-200"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all duration-200"
          />

          {isRegistering && (
            <div className="space-y-3 pt-4 border-t mt-2">
              <h3 className="font-semibold text-gray-700 text-sm">Contact Information (Optional)</h3>

              <input
                type="url"
                placeholder="GitHub URL"
                value={contactInfo.github_url}
                onChange={(e) => handleContactChange("github_url", e.target.value)}
                className="p-2 border rounded w-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all duration-200"
              />

              <input
                type="tel"
                placeholder="Phone Number"
                value={contactInfo.phone}
                onChange={(e) => handleContactChange("phone", e.target.value)}
                className="p-2 border rounded w-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all duration-200"
              />

              <div className="space-y-1 text-sm">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={contactInfo.show_github}
                    onChange={(e) => handleContactChange("show_github", e.target.checked)}
                    className="mr-2"
                  />
                  Show GitHub to team members
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={contactInfo.show_email}
                    onChange={(e) => handleContactChange("show_email", e.target.checked)}
                    className="mr-2"
                  />
                  Show email to team members
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={contactInfo.show_phone}
                    onChange={(e) => handleContactChange("show_phone", e.target.checked)}
                    className="mr-2"
                  />
                  Show phone to team members
                </label>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={isRegistering ? handleRegister : handleLogin}
            className={`w-full py-3 mt-4 rounded-lg text-white font-medium transition-colors duration-200 ${
              isRegistering ? "bg-green-500 hover:bg-green-600" : "bg-purple-500 hover:bg-purple-600"
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-400`}
          >
            {isRegistering ? "Register" : "Login"}
          </button>

          <button
            type="button"
            onClick={toggleAuthMode}
            className="w-full mt-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            {isRegistering ? "Already have an account? Login" : "Don't have an account? Register"}
          </button>
        </form>

        {message && (
          <p className="mt-4 p-3 bg-red-50 text-red-700 rounded text-sm">{message}</p>
        )}
      </motion.div>
    </div>
  );
};

export default Auth;
