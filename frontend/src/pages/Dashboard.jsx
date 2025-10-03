import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import TaskSection from "./TaskSection";

const Dashboard = () => {
  const location = useLocation();
  const flashMessage = location.state?.flashMessage;
  const [message, setMessage] = useState(flashMessage || "");

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);

  // Task states
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [sortByDeadline, setSortByDeadline] = useState("asc");
  const [searchQuery, setSearchQuery] = useState("");

  const navigate = useNavigate();

  // Flash message
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

        const userRes = await axios.get("/api/user/me", { headers: { Authorization: `Bearer ${token}` } });
        setUser(userRes.data.user);

        const taskRes = await axios.get("/api/tasks", { headers: { Authorization: `Bearer ${token}` } });
        setTasks(taskRes.data.tasks);
        
      } catch (err) {
        console.error(err);
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/auth");
        } else {
          setMessage("Failed to load data: " + (err.response?.data?.message || err.message));
          setLoading(false);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  const handleDeleteTask = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/api/tasks/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setTasks(tasks.filter((t) => t.id !== id));
      setMessage("Task deleted successfully!");
    } catch (err) { setMessage("Error deleting task"); }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.patch(`/api/tasks/${id}/status`, { status: newStatus }, { headers: { Authorization: `Bearer ${token}` } });
      setTasks(prev => prev.map(task => task.id === id ? { ...task, status: res.data.task.status } : task));
    } catch (err) { setMessage("Error updating status"); setTimeout(() => setMessage(""), 3000); }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesCategory = !filterCategory || task.category === filterCategory;
    const matchesStatus = !filterStatus || task.status === filterStatus;
    const matchesSearch =
      !searchQuery ||
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesStatus && matchesSearch;
  });

  const displayedTasks = [...filteredTasks].sort((a, b) => {
    if (!a.deadline) return 1;
    if (!b.deadline) return -1;
    return sortByDeadline === "asc"
      ? new Date(a.deadline) - new Date(b.deadline)
      : new Date(b.deadline) - new Date(a.deadline);
  });

  const handleRequestTask = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`/api/tasks/${id}/request`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage(res.data.message);
    } catch (err) {
      setMessage(err.response?.data?.message || "Error requesting task");
    }
  };

  if (loading) return <p className="p-6 text-center">Loading...</p>;
  if (!user) return <p className="p-6 text-center">Loading user data...</p>;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user.username}!</p>
      </div>

      {message && <div className="mb-4 p-2 bg-green-100 text-green-800 rounded">{message}</div>}

      {/* Task Section */}
      <TaskSection
        filterCategory={filterCategory}
        setFilterCategory={setFilterCategory}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        sortByDeadline={sortByDeadline}
        setSortByDeadline={setSortByDeadline}
        displayedTasks={displayedTasks}
        user={user}
        handleDeleteTask={handleDeleteTask}
        handleStatusChange={handleStatusChange}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleRequestTask={handleRequestTask}
      />
    </div>
  );
};

export default Dashboard;