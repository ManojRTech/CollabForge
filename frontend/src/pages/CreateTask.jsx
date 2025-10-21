import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { progress } from "framer-motion";
import API from "../api";

const CreateTask = () => {
  const [newTask, setNewTask] = useState({ 
    title: "", 
    description: "", 
    deadline: "", 
    category: "general", 
    status: "open",
    progress: 0
  });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const { id } = useParams(); // get :id if editing

  // If editing, fetch existing task
  useEffect(() => {
    if (id) {
      const fetchTask = async () => {
        try {
          const token = localStorage.getItem("token");
          const res = await API.get(`/api/tasks/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });

          const formattedTask = {
            ...res.data.task,
            deadline: res.data.task.deadline
              ? new Date(res.data.task.deadline).toISOString().split("T")[0]
              : ""
          };

          setNewTask(formattedTask);
        } catch (err) {
          setMessage("Error fetching Project: " + (err.response?.data?.message || err.message));
        }
      };
      fetchTask();
    }
  }, [id]);

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("token");
      // Ensure progress is between 0 and 100, and set to 100 if status is completed
      const taskToSave = {
        ...newTask,
        progress: newTask.status === "completed" ? 100 : Math.max(0, Math.min(100, newTask.progress || 0))
      };

      if (id) {
        await axios.put(`/api/tasks/${id}`, taskToSave, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessage("Project updated successfully!");
      } else {
        // Create new task
        await API.post("/api/tasks", taskToSave, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessage("Project created successfully!");
      }

      // Reset form & redirect
      setNewTask({ 
        title: "", 
        description: "", 
        deadline: "", 
        category: "general", 
        status: "open",
        progress: 0 
      });
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      setMessage("Error: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="w-full px-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        {id ? "Edit Task" : "Create New Project"}
      </h1>
      
      {message && (
        <div className={`mb-4 p-3 rounded ${
          message.includes("successfully") 
            ? "bg-green-100 text-green-700" 
            : "bg-red-100 text-red-700"
        }`}>
          {message}
        </div>
      )}

      <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              placeholder="Task title"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              placeholder="Task description"
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              rows="4"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
            <input
              type="date"
              value={newTask.deadline}
              onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={newTask.category}
              onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="general">General</option>
              <option value="work">Work</option>
              <option value="personal">Personal</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={newTask.status}
              onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="open">Open</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div> 
            <label className="block text-sm font-medium text-gray-700 mb-1">Progress (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={newTask.progress || 0}
              onChange={(e) => setNewTask({ ...newTask, progress: Number(e.target.value) })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button
            onClick={handleSubmit}
            className="w-full px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium text-lg"
          >
            {id ? "Update Project" : "Create Project"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateTask;
