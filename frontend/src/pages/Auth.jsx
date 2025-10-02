import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Auth = (props) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isRegistering, setIsRegistering] = useState(false); // Track if user is registering
  const navigate = useNavigate();

  // NEW: Contact fields state
  const [contactInfo, setContactInfo] = useState({
    github_url: "",
    phone: "",
    show_github: true,
    show_email: true,
    show_phone: false
  });

  const handleRegister = async () => {
    try {
      // Include contact info in registration data
      const registrationData = {
        username,
        email,
        password,
        ...contactInfo
      };

      const res = await axios.post("/api/auth/register", registrationData);
      localStorage.setItem("token", res.data.token);
      props.setToken(res.data.token);
      navigate("/dashboard", { 
        state: { 
          flashMessage: `Registration successful! Welcome, ${res.data.user.username}` 
        } 
      });
    } catch (err) {
      console.error("Registration error:", err);
      console.error("Error response:", err.response);
      setMessage(err.response?.data?.message || err.message || "Registration failed");
    }
  };

  const handleLogin = async () => {
    try {
      const res = await axios.post("/api/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      props.setToken(res.data.token);
      navigate("/dashboard", { 
        state: { 
          flashMessage: `Login successful! Welcome, ${res.data.user.username}` 
        } 
      });
    } catch (err) {
      console.error("Login error:", err);
      console.error("Error response:", err.response);
      setMessage(err.response?.data?.message || err.message || "Login failed");
    }
  };

  // NEW: Toggle between login and register views
  const toggleAuthMode = () => {
    setIsRegistering(!isRegistering);
    setMessage(""); // Clear any previous messages
  };

  // NEW: Update contact info
  const handleContactChange = (field, value) => {
    setContactInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="p-6 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-4">
        {isRegistering ? "Create Account" : "Login"}
      </h1>
      
      <form onSubmit={(e) => e.preventDefault()} className="flex flex-col items-center gap-2 w-80">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="p-2 border rounded w-full"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="p-2 border rounded w-full"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="p-2 border rounded w-full"
        />

        {/* NEW: Contact Information Fields (Only show during registration) */}
        {isRegistering && (
          <div className="w-full border-t pt-4 mt-2 space-y-3">
            <h3 className="font-semibold text-gray-700">Contact Information (Optional)</h3>
            
            <div>
              <label className="block text-sm text-gray-600 mb-1">GitHub URL</label>
              <input
                type="url"
                placeholder="https://github.com/yourusername"
                value={contactInfo.github_url}
                onChange={(e) => handleContactChange('github_url', e.target.value)}
                className="p-2 border rounded w-full text-sm"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Phone Number</label>
              <input
                type="tel"
                placeholder="+1234567890"
                value={contactInfo.phone}
                onChange={(e) => handleContactChange('phone', e.target.value)}
                className="p-2 border rounded w-full text-sm"
              />
            </div>

            <div className="space-y-2 text-sm">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={contactInfo.show_github}
                  onChange={(e) => handleContactChange('show_github', e.target.checked)}
                  className="mr-2"
                />
                Show GitHub to team members
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={contactInfo.show_email}
                  onChange={(e) => handleContactChange('show_email', e.target.checked)}
                  className="mr-2"
                />
                Show email to team members
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={contactInfo.show_phone}
                  onChange={(e) => handleContactChange('show_phone', e.target.checked)}
                  className="mr-2"
                />
                Show phone to team members
              </label>
            </div>
          </div>
        )}

        <div className="flex gap-2 mt-4">
          {isRegistering ? (
            <button
              type="button"
              onClick={handleRegister}
              className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Register
            </button>
          ) : (
            <button
              type="button"
              onClick={handleLogin}
              className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Login
            </button>
          )}
        </div>

        {/* NEW: Toggle between login and register */}
        <button
          type="button"
          onClick={toggleAuthMode}
          className="mt-2 text-sm text-blue-500 hover:text-blue-700"
        >
          {isRegistering 
            ? "Already have an account? Login" 
            : "Don't have an account? Register"}
        </button>
      </form>

      {message && (
        <p className="mt-4 p-2 bg-gray-100 rounded w-80 text-left break-words">
          {message}
        </p>
      )}
    </div>
  );
};

export default Auth;