import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import TaskSection from "./TaskSection";
import API from "../api";

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

        const userRes = await API.get("/api/user/me", { headers: { Authorization: `Bearer ${token}` } });
        setUser(userRes.data.user);

        const taskRes = await API.get("/api/tasks", { headers: { Authorization: `Bearer ${token}` } });
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
      await API.delete(`/api/tasks/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setTasks(tasks.filter((t) => t.id !== id));
      setMessage("Project deleted successfully!");
    } catch (err) { setMessage("Error deleting task"); }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      const res = await API.patch(`/api/tasks/${id}/status`, { status: newStatus }, { headers: { Authorization: `Bearer ${token}` } });
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
      const res = await API.post(`/api/tasks/${id}/request`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage(res.data.message);
      // Clear the message after 5 seconds
      setTimeout(() => {
        setMessage("");
      }, 5000);
    } catch (err) {
      setMessage(err.response?.data?.message || "Error requesting Project");
      setTimeout(() => {
        setMessage("");
      }, 5000);
    }
  };

  // Calculate task counts
  const myTasksCount = displayedTasks.filter(task => task.created_by === user?.id).length;
  const availableTasksCount = displayedTasks.filter(task => task.created_by !== user?.id).length;

  if (loading) return (
    <div className="flex justify-center items-center min-h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  );
  
  if (!user) return <p className="p-6 text-center">Loading user data...</p>;

  return (
    <div className="w-full !min-w-full px-6 mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard</h1>
        <p className="text-gray-600 mb-6">Welcome back, {user.username}! Here's your Project overview.</p>
        <div className="flex flex-col md:flex-row justify-center gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 w-full max-w-md">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-700">My Projects</h3>
                <p className="text-3xl font-bold text-blue-600 mt-2">{myTasksCount}</p>
                <p className="text-sm text-gray-500 mt-1">Projects created by you</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">📝</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 w-full max-w-md">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-700">Available Projects</h3>
                <p className="text-3xl font-bold text-green-600 mt-2">{availableTasksCount}</p>
                <p className="text-sm text-gray-500 mt-1">Projects from other users</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🤝</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {message && (
        <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg border border-green-200 text-center">
          {message}
        </div>
      )}
      
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