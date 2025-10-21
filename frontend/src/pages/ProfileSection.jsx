import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import API from "../api";

const ProfileSection = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  
  // Profile fields

  const [profilePhoto, setProfilePhoto] = useState(null); // File object
  const [previewPhoto, setPreviewPhoto] = useState(null); // URL for preview
  const [existingPhoto, setExistingPhoto] = useState(null); // Photo already saved on server

  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [interests, setInterests] = useState("");
  
  // Password fields
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  
  // Contact info
  const [contactInfo, setContactInfo] = useState({
    github_url: "",
    phone: "",
    show_github: false,
    show_email: false,
    show_phone: false
  });
  const [showContactFields, setShowContactFields] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await API.get("/api/user/me", {
          headers: { Authorization: `Bearer ${token}` }
        });

        const userData = res.data.user;

        setUser(userData);

        // If using full URL method:
        setExistingPhoto(userData.profile_photo ? `http://localhost:5000${userData.profile_photo}` : null);

        setUsername(userData.username || "");
        setBio(userData.bio || "");
        setInterests(userData.interests || "");

        setContactInfo({
          github_url: userData.github_url || "",
          phone: userData.phone || "",
          show_github: !!userData.show_github,  // convert to boolean
          show_email: !!userData.show_email,
          show_phone: !!userData.show_phone
        });

      } catch (err) {
        console.error("Error fetching user:", err);
        navigate("/auth");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [navigate]);


  // Function to handle file selection
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePhoto(file);          // New file to upload
      setPreviewPhoto(URL.createObjectURL(file)); // Show preview
    }
  };

  const handleSaveProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("username", username);
      formData.append("bio", bio);
      formData.append("interests", interests);
      if (profilePhoto) formData.append("profilePhoto", profilePhoto);

      const res = await axios.put("/api/user/me", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setUser(res.data.user);
      setMessage("Profile updated successfully!");
    } catch (err) {
      setMessage(err.response?.data?.message || "Error updating profile");
    }
  };

  const handleSaveContactInfo = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await API.patch("/api/user/contact-settings", contactInfo, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setMessage("Contact information updated successfully!");
      const updatedUser = res.data.user;
      setUser({ ...user, ...updatedUser });

      // Update contactInfo state too
      setContactInfo({
        github_url: updatedUser.github_url || "",
        phone: updatedUser.phone || "",
        show_github: !!updatedUser.show_github,
        show_email: !!updatedUser.show_email,
        show_phone: !!updatedUser.show_phone
      });

    } catch (err) {
      setMessage(err.response?.data?.message || "Error updating contact info");
    }
  };


  const handleContactChange = (field, value) => {
    setContactInfo(prev => ({ ...prev, [field]: value }));
  };

  const handlePasswordUpdate = async () => {
    if (!currentPassword || !newPassword) {
      setMessage("Please fill both password fields.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        "/api/auth/update-password",
        { oldPassword: currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage(res.data.message || "Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setShowPasswordFields(false); // hide fields after update
    } catch (err) {
      setMessage(err.response?.data?.message || "Error updating password");
    }
  };

  
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

      {/* Profile Photo */}
      <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200 mb-6 flex flex-col items-center">
        <h2 className="text-xl font-semibold mb-4">Profile Photo</h2>
        
        {previewPhoto ? (
          <img src={previewPhoto} alt="Preview" className="w-32 h-32 rounded-full mb-4 object-cover" />
        ) : existingPhoto ? (
          <img src={existingPhoto} alt="Profile" className="w-32 h-32 rounded-full mb-4 object-cover" />
        ) : (
          <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center mb-4 text-gray-500">
            No Photo
          </div>
        )}


        {/* Hidden input */}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files[0];
            if (file) {
              setProfilePhoto(file);
              setPreviewPhoto(URL.createObjectURL(file));
            }
          }}
          className="hidden"
          id="profilePhoto"
        />

        <label
          htmlFor="profilePhoto"
          className="cursor-pointer px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
        >
          Choose Profile Photo
        </label>

      </div>




      {/* Basic Profile Info */}
      <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200 mb-6">
        <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows="3"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Interests</label>
            <input
              type="text"
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Contact Information</h2>
          <button
            onClick={() => setShowContactFields(!showContactFields)}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
          >
            {showContactFields ? "Hide" : "Edit Contact Info"}
          </button>
        </div>

        {showContactFields && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">GitHub URL</label>
              <input
                type="url"
                placeholder="https://github.com/yourusername"
                value={contactInfo.github_url}
                onChange={(e) => handleContactChange('github_url', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                type="tel"
                placeholder="+1234567890"
                value={contactInfo.phone}
                onChange={(e) => handleContactChange('phone', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={contactInfo.show_github}
                  onChange={(e) => handleContactChange('show_github', e.target.checked)}
                  className="mr-3"
                />
                Show GitHub to team members
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={contactInfo.show_email}
                  onChange={(e) => handleContactChange('show_email', e.target.checked)}
                  className="mr-3"
                />
                Show email to team members
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={contactInfo.show_phone}
                  onChange={(e) => handleContactChange('show_phone', e.target.checked)}
                  className="mr-3"
                />
                Show phone to team members
              </label>
            </div>

            <button
              onClick={handleSaveContactInfo}
              className="w-full px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium"
            >
              Save Contact Information
            </button>
          </div>
        )}
      </div>

      {/* Password Change */}
      <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Password</h2>
          <button
            onClick={() => setShowPasswordFields(!showPasswordFields)}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            {showPasswordFields ? "Cancel" : "Change Password"}
          </button>
        </div>

        {showPasswordFields && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {showPasswordFields && (
              <button
                onClick={handlePasswordUpdate}
                className="w-full px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium"
              >
                Update Password
              </button>
            )}

          </div>
        )}
      </div>

      {/* Save Button */}
      <button
        onClick={handleSaveProfile}
        className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-lg"
      >
        Save Profile Changes
      </button>
    </div>
  );
};

export default ProfileSection;