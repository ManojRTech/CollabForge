import React from "react";

const ProfileSection = ({
  user, setUser,
  showPasswordFields, togglePasswordFields,
  currentPassword, setCurrentPassword,
  newPassword, setNewPassword,
  handleSaveProfile
}) => {
  return (
    <div className="mt-6 border p-4 rounded shadow w-96 mx-auto">
      <h2 className="font-semibold mb-2">Profile</h2>
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

      <button
        onClick={togglePasswordFields}
        className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 mb-2"
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
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mt-2"
      >
        Save Profile
      </button>
    </div>
  );
};

export default ProfileSection;
