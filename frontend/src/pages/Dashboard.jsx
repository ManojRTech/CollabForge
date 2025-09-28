import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const Dashboard = () => {
  const location = useLocation();
  const flashMessage = location.state?.flashMessage;
  const [message, setMessage] = useState(flashMessage || "");

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Password fields and visibility state
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // Tasks
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({ title: "", description: "", deadline: "", category: "general", status: "open" });

  const navigate = useNavigate();

  // Flash message timeout
  useEffect(() => {
    if (flashMessage) {
      const timer = setTimeout(() => setMessage(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [flashMessage]);

  // Fetch user + tasks
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token found");

        const userRes = await axios.get("/api/user/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(userRes.data.user);

        const taskRes = await axios.get("/api/tasks", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTasks(taskRes.data.tasks);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        console.error("Error response:", err.response);
      
        // Only redirect if it's an authentication error
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/auth");
        } else {
          // For other errors, show error message but stay on dashboard
          setMessage("Failed to load data: " + (err.response?.data?.message || err.message));
          setLoading(false);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/auth");
  };

  // Toggle password fields visibility
  const togglePasswordFields = () => {
    setShowPasswordFields(!showPasswordFields);
    // Reset password fields when hiding
    if (showPasswordFields) {
      setCurrentPassword("");
      setNewPassword("");
    }
  };

  // Save profile updates
  const handleSaveProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const payload = {
        username: user.username,
        bio: user.bio,
        interests: user.interests,
      };

      if (currentPassword && newPassword) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }

      const res = await axios.put("/api/user/me", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUser(res.data.user);
      setMessage("Profile updated successfully!");
      
      // Reset and hide password fields after successful save
      setCurrentPassword("");
      setNewPassword("");
      setShowPasswordFields(false);
      
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage(err.response?.data?.message || "Error updating profile");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  // Add a task
  const handleAddTask = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post("/api/tasks", newTask, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setTasks([res.data.task, ...tasks]); // prepend new task
      setNewTask({ title: "", description: "", deadline: "", category: "general" });
      setMessage("Task added successfully!");
    } catch (err) {
      setMessage("Error adding task");
    }
  };

  // Delete a task
  const handleDeleteTask = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/api/tasks/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(tasks.filter((t) => t.id !== id));
      setMessage("Task deleted successfully!");
    } catch (err) {
      setMessage("Error deleting task");
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

          {/* Profile Section */}
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

            {/* Change Password Button */}
            <button
              onClick={togglePasswordFields}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 mb-2"
            >
              {showPasswordFields ? "Cancel Password Change" : "Change Password"}
            </button>

            {/* Password Fields - Conditionally Rendered */}
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

          {/* Task Section */}
          <div className="mt-8 border p-4 rounded shadow w-96 mx-auto">
            <h2 className="font-semibold mb-2">Tasks</h2>
            <input
              type="text"
              placeholder="Title"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              className="p-2 border rounded w-full mb-2"
            />
            <textarea
              placeholder="Description"
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              className="p-2 border rounded w-full mb-2"
            />
            <input
              type="date"
              value={newTask.deadline}
              onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
              className="p-2 border rounded w-full mb-2"
            />
            <select
              value={newTask.category}
              onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
              className="p-2 border rounded w-full mb-2"
            >
              <option value="general">General</option>
              <option value="work">Work</option>
              <option value="personal">Personal</option>
              <option value="urgent">Urgent</option>
            </select>

            <button
              onClick={handleAddTask}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Add Task
            </button>

            {/* Task List */}
            <ul className="mt-4 text-left">
              {tasks.map((task) => (
                <li key={task.id} className="p-2 border-b flex justify-between items-center">
                  <div>
                    <strong>{task.title}</strong> <br />
                    <small>{task.description}</small> <br />
                    <small>Deadline: {task.deadline || "N/A"}</small> <br />
                    <small>Category: {task.category || "General"}</small>
                  </div>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="mt-6 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Logout
          </button>
        </>
      )}
    </div>
  );
};

export default Dashboard;