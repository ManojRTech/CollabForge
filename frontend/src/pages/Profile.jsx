import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Your existing profile state
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("/api/user/me", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(res.data.user);
      } catch (err) {
        console.error("Error fetching user:", err);
        navigate("/auth");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [navigate]);

  // Your existing handleSaveProfile function
  const handleSaveProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const payload = { username: user.username, bio: user.bio, interests: user.interests };
      if (currentPassword && newPassword) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }
      const res = await axios.put("/api/user/me", payload, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      setUser(res.data.user);
      setMessage("Profile updated successfully!");
      setCurrentPassword(""); 
      setNewPassword(""); 
      setShowPasswordFields(false);
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage(err.response?.data?.message || "Error updating profile");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const togglePasswordFields = () => setShowPasswordFields(!showPasswordFields);

  if (loading) return <div className="p-6 text-center">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Profile Settings</h1>
      
      {message && (
        <div className={`mb-4 p-3 rounded ${
          message.includes('successfully') 
            ? 'bg-green-100 text-green-700' 
            : 'bg-red-100 text-red-700'
        }`}>
          {message}
        </div>
      )}

      {/* Your existing ProfileSection UI */}
      <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
        <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              type="text"
              placeholder="Username"
              value={user.username || ""}
              onChange={(e) => setUser({ ...user, username: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
            <textarea
              placeholder="Bio"
              value={user.bio || ""}
              onChange={(e) => setUser({ ...user, bio: e.target.value })}
              rows="3"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Interests</label>
            <input
              type="text"
              placeholder="Interests"
              value={user.interests || ""}
              onChange={(e) => setUser({ ...user, interests: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Password Section */}
        <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Password</h2>
            <button
              onClick={togglePasswordFields}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              {showPasswordFields ? "Cancel" : "Change Password"}
            </button>
          </div>

          {showPasswordFields && (
            <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                <input
                  type="password"
                  placeholder="Current Password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input
                  type="password"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          )}
        </div>

        {/* Save Button */}
        <button
          onClick={handleSaveProfile}
          className="w-full mt-6 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-lg"
        >
          Save Profile Changes
        </button>
      </div>
    </div>
  );
};

export default Profile;