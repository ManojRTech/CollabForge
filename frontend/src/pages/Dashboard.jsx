import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useLocation } from "react-router-dom";

const Dashboard = () => {
  const location = useLocation();
  const flashMessage = location.state?.flashMessage;
  const [message, setMessage] = useState(flashMessage || "");

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const navigate = useNavigate();

  // Flash message timeout
  useEffect(() => {
    if (flashMessage) {
      const timer = setTimeout(() => setMessage(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [flashMessage]);

  // Fetch logged-in user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token found");

        const res = await axios.get("/api/user/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser(res.data.user);
      } catch (err) {
        localStorage.removeItem("token");
        navigate("/auth");
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

  const handleSaveProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const payload = {
        username: user.username,
        bio: user.bio,
        interests: user.interests,
      };

      if (showPasswordFields && currentPassword && newPassword) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }

      const res = await axios.put("/api/user/me", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUser(res.data.user);
      setMessage("Profile updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setShowPasswordFields(false);
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error(err.response || err);
      setMessage(err.response?.data?.message || "Error updating profile");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  if (loading) return <p className="p-6 text-center">Loading...</p>;

  return (
    <div className="p-6 text-center">
      {message && (
        <div className="mb-4 p-2 bg-green-100 text-green-800 rounded">{message}</div>
      )}

      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

      {user && (
        <>
          <p>Welcome, <strong>{user.username}</strong> ({user.email})</p>

          <div className="mt-4 flex flex-col items-center gap-2 w-80 mx-auto">
            <input
              type="text"
              placeholder="Username"
              value={user.username || ""}
              onChange={(e) => setUser({ ...user, username: e.target.value })}
              className="p-2 border rounded w-full"
            />
            <textarea
              placeholder="Bio"
              value={user.bio || ""}
              onChange={(e) => setUser({ ...user, bio: e.target.value })}
              className="p-2 border rounded w-full"
            />
            <input
              type="text"
              placeholder="Interests (comma separated)"
              value={user.interests || ""}
              onChange={(e) => setUser({ ...user, interests: e.target.value })}
              className="p-2 border rounded w-full"
            />

            {/* Toggle password fields */}
            <button
              onClick={() => setShowPasswordFields(!showPasswordFields)}
              className="mt-2 text-blue-500 underline"
            >
              {showPasswordFields ? "Cancel Password Change" : "Change Password"}
            </button>

            {showPasswordFields && (
              <>
                <input
                  type="password"
                  placeholder="Current Password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="p-2 border rounded w-full mt-2"
                />
                <input
                  type="password"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="p-2 border rounded w-full"
                />
              </>
            )}

            <button
              onClick={handleSaveProfile}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Save
            </button>
          </div>

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
