import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; 
import axios from "axios";
import { 
  Calendar, 
  Tag, 
  MessageCircle, 
  Play, 
  CheckCircle, 
  XCircle, 
  Trash2,
  Clock,
  AlertCircle
} from 'lucide-react';

const TaskSection = ({
  filterCategory, setFilterCategory,
  filterStatus, setFilterStatus,
  sortByDeadline, setSortByDeadline,
  displayedTasks, user,
  handleDeleteTask,
  handleStatusChange,
  searchQuery, setSearchQuery,
  handleRequestTask,
  setMessage,
}) => {
  const [userTaskMemberships, setUserTaskMemberships] = useState({});
  const [taskProgress, setTaskProgress] = useState({});
  const [userRequests, setUserRequests] = useState({});
  const navigate = useNavigate(); 

  // Fetch user's task memberships and requests
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        
        // Fetch memberships
        const membershipsRes = await axios.get("/api/tasks/user/memberships", {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const memberships = {};
        membershipsRes.data.memberships.forEach(membership => {
          memberships[membership.task_id] = true;
        });
        setUserTaskMemberships(memberships);

        // Fetch user's requests
        const requestsRes = await axios.get("/api/tasks/user/requests", {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const requests = {};
        requestsRes.data.requests.forEach(request => {
          requests[request.task_id] = request.status;
        });
        setUserRequests(requests);

      } catch (err) {
        console.error("Error fetching user data:", err);
      }
    };

    fetchUserData();
  }, []);

  // Get progress for a task
  const getTaskProgress = (task) => {
    if (task.status === "completed") return 100;
    if (task.status === "open") return 0;
    if (task.progress !== undefined && task.progress !== null) return task.progress;
    if (task.status === "in-progress") return 0;
    return 0;
  };

  // Check if user can see chat button for a task
  const canSeeChatButton = (task) => {
    if (task.created_by === user.id) return true;
    if (userTaskMemberships[task.id]) return true;
    return false;
  };

  // Check if task can be started
  const canStartTask = (task) => {
    return (
      task.created_by === user.id &&
      task.status === "open" 
    );
  };

  // Handle start task
  const handleStartTask = async (taskId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(`/api/tasks/${taskId}/status`, 
        { status: "in-progress" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      window.location.reload();
    } catch (err) {
      console.error("Error starting task:", err);
    }
  };

  // Get progress text based on percentage
  const getProgressText = (progress, status) => {
    if (status === "completed") return "Completed - 100%";
    if (status === "in-progress") {
      if (progress === 0) return "Just started - 0%";
      return `In progress - ${progress}%`;
    }
    return "Not started - 0%";
  };

  // Get progress color based on percentage
  const getProgressColor = (progress, status) => {
    if (status === "completed") return "bg-green-600";
    if (status === "in-progress") {
      if (progress >= 75) return "bg-green-500";
      if (progress >= 50) return "bg-yellow-500";
      if (progress >= 25) return "bg-blue-500";
      return "bg-blue-600";
    }
    return "bg-gray-400";
  };

  // Check if user has requested a task
  const hasRequestedTask = (taskId) => {
    return userRequests[taskId] !== undefined;
  };

  // Get request status for a task
  const getRequestStatus = (taskId) => {
    return userRequests[taskId] || null;
  };

  const handleProgressUpdate = async (taskId, newProgress) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(`/api/tasks/${taskId}/progress`, 
        { progress: newProgress },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update local state
      setTaskProgress(prev => ({
        ...prev,
        [taskId]: newProgress
      }));
      
      // Optional: Show success message
      setMessage("Progress updated successfully!");
    } catch (err) {
      console.error("Error updating progress:", err);
      setMessage("Error updating progress");
    }
  };

  return (
    <div className="w-full px-6 py-6">
      <h2 className="font-semibold text-2xl mb-6 text-gray-800 text-center">Project Hub</h2>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-8 p-6 bg-white rounded-xl shadow-sm border border-gray-200">
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent flex-1 min-w-[150px]"
        >
          <option value="">All Categories</option>
          <option value="general">General</option>
          <option value="work">Work</option>
          <option value="personal">Personal</option>
          <option value="urgent">Urgent</option>
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent flex-1 min-w-[150px]"
        >
          <option value="">All Status</option>
          <option value="open">Open</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <input
          type="text"
          placeholder="Search Projects..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent flex-1 min-w-[200px]"
        />

        <button
          onClick={() => setSortByDeadline(sortByDeadline === "asc" ? "desc" : "asc")}
          className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
        >
          Sort by Deadline {sortByDeadline === "asc" ? "↑" : "↓"}
        </button>
      </div>

      {/* My Tasks */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-xl text-gray-800">
            My Projects
          </h3>
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
            {displayedTasks.filter(task => task.created_by === user.id).length} Projects
          </span>
        </div>
        
        {displayedTasks.filter(task => task.created_by === user.id).length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
            <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg font-medium">No Projects created by you yet</p>
            <p className="text-gray-400 mt-2">Create your first Project to get started!</p>
          </div>
        ) : (
          <div className="grid w-full grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {displayedTasks
              .filter(task => task.created_by === user.id)
              .map(task => {
                const progress = getTaskProgress(task);
                const progressText = getProgressText(progress, task.status);
                const progressColor = getProgressColor(progress, task.status);
                
                return (
                  <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 flex flex-col min-h-[320px] w-full">
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="font-semibold text-lg text-gray-800 line-clamp-2 flex-1 mr-3">{task.title}</h4>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full flex-shrink-0 ${
                          task.status === 'completed' ? 'bg-green-100 text-green-800' :
                          task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                          task.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-orange-100 text-orange-800'
                        }`}>
                          {task.status || "open"}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{task.description}</p>
                      
                      <div className="space-y-3 mb-4 text-sm">
                        <div className="flex items-center text-gray-500">
                          <Calendar size={16} className="mr-2 flex-shrink-0" />
                          <span className="truncate">{task.deadline ? new Date(task.deadline).toLocaleDateString() : "No deadline"}</span>
                        </div>
                        <div className="flex items-center text-gray-500">
                          <Tag size={16} className="mr-2 flex-shrink-0" />
                          <span className="truncate">{task.category || "General"}</span>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-700">Progress</span>
                          <span className="text-sm text-gray-500">{progressText}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className={`h-2.5 rounded-full transition-all duration-300 ${progressColor}`}
                            style={{width: `${progress}%`}}
                          ></div>
                        </div>
                      </div>
                      
                      {task.status === "in-progress" && (
                        <div className="flex items-center justify-center mb-4">
                          <div className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                            <Clock size={12} className="mr-2 animate-pulse" />
                            Active Now
                          </div>
                        </div>
                      )}
                      
                      {userTaskMemberships[task.id] && (
                        <div className="text-green-600 text-sm text-center mb-4">
                          ✓ Has approved member(s)
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-2 pt-4 border-t border-gray-100">
                      {task.created_by === user.id && (
                        <>
                          {canStartTask(task) && (
                            <button
                              onClick={() => handleStartTask(task.id)}
                              className="flex items-center justify-center w-full px-4 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium text-sm"
                            >
                              <Play size={16} className="mr-2" />
                              Start Project
                            </button>
                          )}

                          {task.status === "in-progress" && (
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                onClick={() => handleStatusChange(task.id, "completed")}
                                className="flex items-center justify-center px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                              >
                                <CheckCircle size={16} className="mr-1" />
                                Complete
                              </button>
                              <button
                                onClick={() => handleStatusChange(task.id, "cancelled")}
                                className="flex items-center justify-center px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                              >
                                <XCircle size={16} className="mr-1" />
                                Cancel
                              </button>
                            </div>
                          )}

                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => handleDeleteTask(task.id)}
                              className="flex items-center justify-center px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                            >
                              <Trash2 size={16} className="mr-1" />
                              Delete
                            </button>
                            <button
                              onClick={() => navigate(`/create-task/${task.id}`)} // ⬅️ navigate with taskId
                              className="flex items-center justify-center px-3 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors text-sm font-medium"
                            >
                              ✏️ Edit
                            </button>

                            {canSeeChatButton(task) && (
                              <button
                                onClick={() => window.open(`/task/${task.id}/chat`, '_blank')}
                                className="flex items-center justify-center px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm font-medium"
                              >
                                <MessageCircle size={16} className="mr-1" />
                                Chat
                              </button>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            }
          </div>
        )}
      </div>

      {/* Available Tasks */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-xl text-gray-800">
            Available Projects
          </h3>
          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
            {displayedTasks.filter(task => task.created_by !== user.id).length} Projects
          </span>
        </div>
        
        {displayedTasks.filter(task => task.created_by !== user.id).length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
            <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg font-medium">No available Projects from other users</p>
            <p className="text-gray-400 mt-2">Check back later for new opportunities!</p>
          </div>
        ) : (
          <div className="grid w-full grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {displayedTasks
              .filter(task => task.created_by !== user.id)
              .map(task => {
                const progress = getTaskProgress(task);
                const progressText = getProgressText(progress, task.status);
                const progressColor = getProgressColor(progress, task.status);
                const hasRequested = hasRequestedTask(task.id);
                const requestStatus = getRequestStatus(task.id);
                
                return (
                  <div key={task.id} className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 flex flex-col min-h-[320px]">
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="font-semibold text-lg text-gray-800 line-clamp-2 flex-1 mr-3">{task.title}</h4>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full flex-shrink-0 ${
                          task.status === 'completed' ? 'bg-green-100 text-green-800' :
                          task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                          task.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-orange-100 text-orange-800'
                        }`}>
                          {task.status || "open"}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{task.description}</p>
                      
                      <div className="space-y-3 mb-4 text-sm">
                        <div className="flex items-center text-gray-500">
                          <Calendar size={16} className="mr-2 flex-shrink-0" />
                          <span className="truncate">{task.deadline ? new Date(task.deadline).toLocaleDateString() : "No deadline"}</span>
                        </div>
                        <div className="flex items-center text-gray-500">
                          <Tag size={16} className="mr-2 flex-shrink-0" />
                          <span className="truncate">{task.category || "General"}</span>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-700">Progress</span>
                          <span className="text-sm text-gray-500">{progressText}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className={`h-2.5 rounded-full ${progressColor}`}
                            style={{width: `${progress}%`}}
                          ></div>
                        </div>
                      </div>
                      
                      {task.status === "in-progress" && (
                        <div className="flex items-center justify-center mb-4">
                          <div className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                            <Clock size={12} className="mr-2 animate-pulse" />
                            Active Now
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-2 pt-4 border-t border-gray-100">
                      {!hasRequested && !userTaskMemberships[task.id] && task.status === "open" && (
                        <button
                          onClick={() => handleRequestTask(task.id)}
                          className="flex items-center justify-center w-full px-4 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium text-sm"
                        >
                          Request Project
                        </button>
                      )}
                      
                      {hasRequested && (
                        <div className={`text-center py-2.5 rounded-lg text-sm font-medium ${
                          requestStatus === 'approved' ? 'bg-green-100 text-green-800' :
                          requestStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-orange-100 text-orange-800'
                        }`}>
                          Request {requestStatus}
                        </div>
                      )}
                      
                      {canSeeChatButton(task) && (
                        <button
                          onClick={() => window.open(`/task/${task.id}/chat`, '_blank')}
                          className="flex items-center justify-center w-full px-4 py-2.5 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-medium text-sm"
                        >
                          <MessageCircle size={16} className="mr-2" />
                          Open Chat
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            }
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskSection;