import React, { useState, useEffect } from "react";
import axios from "axios";

const ProfileSection = ({
  user, setUser,
  showPasswordFields, togglePasswordFields,
  currentPassword, setCurrentPassword,
  newPassword, setNewPassword,
  handleSaveProfile
}) => {
  const [contactInfo, setContactInfo] = useState({
    github_url: "",
    phone: "",
    show_github: true,
    show_email: true,
    show_phone: false
  });
  const [showContactFields, setShowContactFields] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Load contact info when user data changes
  useEffect(() => {
    if (user) {
      setContactInfo({
        github_url: user.github_url || "",
        phone: user.phone || "",
        show_github: user.show_github !== false,
        show_email: user.show_email !== false,
        show_phone: user.show_phone || false
      });
    }
  }, [user]);

  const handleContactChange = (field, value) => {
    setContactInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // In your ProfileSection.jsx, update the handleSaveContactInfo function:
  const handleSaveContactInfo = async () => {
    try {
      setLoading(true);
      setMessage("");
      
      const token = localStorage.getItem("token");
      if (!token) {
        setMessage("Please log in again");
        return;
      }

      console.log("🔄 Sending contact update to backend...");
      
      // Test if the endpoint exists first
      const response = await axios.patch(
        "/api/user/contact-settings",
        contactInfo, 
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log("✅ Update successful:", response.data);
      setMessage("✅ Contact information updated successfully!");
      
      // Update user in parent component
      if (response.data.user) {
        setUser({ ...user, ...response.data.user });
      }
      
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("❌ Error details:", error);
      console.error("❌ Error response:", error.response);
      
      if (error.response?.status === 404) {
        setMessage("❌ Endpoint not found (404) - Backend route missing");
      } else if (error.response?.status === 401) {
        setMessage("❌ Unauthorized - Please log in again");
      } else if (error.response?.data?.message) {
        setMessage(`❌ ${error.response.data.message}`);
      } else if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
        setMessage("❌ Network error - Backend might be down");
      } else if (error.response?.status === 500) {
        setMessage("❌ Server error - Check backend logs");
      } else {
        setMessage(`❌ Failed to update: ${error.message}`);
      }
      
      setTimeout(() => setMessage(""), 5000);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="mt-6 border p-4 rounded shadow w-96 mx-auto">
      <h2 className="font-semibold mb-2">Profile</h2>
      
      {/* Basic Profile Info */}
      <input
        type="text"
        placeholder="Username"
        value={user.username || ""}
        onChange={(e) => setUser({ ...user, username: e.target.value })}
        className="p-2 border rounded w-full mb-2"
      />
      <textarea
        placeholder="Bio"
        value={user.bio || ""}
        onChange={(e) => setUser({ ...user, bio: e.target.value })}
        className="p-2 border rounded w-full mb-2"
      />
      <input
        type="text"
        placeholder="Interests"
        value={user.interests || ""}
        onChange={(e) => setUser({ ...user, interests: e.target.value })}
        className="p-2 border rounded w-full mb-2"
      />

      {/* Contact Information Section */}
      <button
        onClick={() => setShowContactFields(!showContactFields)}
        className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 mb-2 w-full"
      >
        {showContactFields ? "Hide Contact Settings" : "Edit Contact Information"}
      </button>

      {showContactFields && (
        <div className="mt-2 p-3 border rounded bg-gray-50 space-y-3">
          <h3 className="font-semibold text-gray-700">Contact Information</h3>
          
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

          <button
            onClick={handleSaveContactInfo}
            disabled={loading}
            className={`px-4 py-2 text-white rounded w-full ${
              loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-green-500 hover:bg-green-600'
            }`}
          >
            {loading ? 'Saving...' : 'Save Contact Info'}
          </button>

          {message && (
            <p className={`text-sm text-center p-2 rounded ${
              message.includes('✅') 
                ? 'bg-green-100 text-green-700' 
                : 'bg-red-100 text-red-700'
            }`}>
              {message}
            </p>
          )}
        </div>
      )}

      {/* Rest of your existing code remains the same */}
      <button
        onClick={togglePasswordFields}
        className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 mb-2 w-full"
      >
        {showPasswordFields ? "Cancel Password Change" : "Change Password"}
      </button>

      {showPasswordFields && (
        <div className="mt-2 p-2 border rounded bg-gray-50">
          <input
            type="password"
            placeholder="Current Password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="p-2 border rounded w-full mb-2"
          />
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="p-2 border rounded w-full mb-2"
          />
        </div>
      )}

      <button
        onClick={handleSaveProfile}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mt-2 w-full"
      >
        Save Profile
      </button>
    </div>
  );
};

export default ProfileSection;