import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useLocation } from "react-router-dom";

const Dashboard = () => {

  const location = useLocation();
  const flashMessage = location.state?.flashMessage;
  // Optionally show it in a temporary alert
  const [message, setMessage] = useState(flashMessage || "");
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (flashMessage) {
      const timer = setTimeout(() => setMessage(""), 5000); // hide after 3s
      return () => clearTimeout(timer);
    }
  }, [flashMessage]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Get token from localStorage
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token found");

        // Send token in Authorization header
        const res = await axios.get("/api/user/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser(res.data.user);
      } catch (err) {
        localStorage.removeItem("token");
        navigate("/auth"); // redirect if unauthorized
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/auth");
  };

  if (loading) return <p className="p-6 text-center">Loading...</p>;

  return (
    <div className="p-6 text-center">

      {message && (
        <div className="mb-4 p-2 bg-green-100 text-green-800 rounded">
          {message}
        </div>
      )}

      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      {user && (
        <>
          <p>Welcome, <strong>{user.username}</strong> ({user.email})</p>
          <button
            onClick={handleLogout}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Logout
          </button>
        </>
      )}
    </div>
  );
};

export default Dashboard;
