import React, { useEffect, useState } from "react";
import axios from "axios";

const TaskSection = ({
  filterCategory, setFilterCategory,
  filterStatus, setFilterStatus,
  sortByDeadline, setSortByDeadline,
  displayedTasks, user,
  handleDeleteTask,
  handleStatusChange,
  searchQuery, setSearchQuery,
  handleRequestTask,
}) => {
  const [userTaskMemberships, setUserTaskMemberships] = useState({});
  const [taskProgress, setTaskProgress] = useState({});
  const [userRequests, setUserRequests] = useState({});

  // Fetch user's task memberships AND requests
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

  // Handle progress update
  const handleProgressUpdate = async (taskId, progress) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(`/api/tasks/${taskId}/progress`, 
        { progress },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setTaskProgress(prev => ({
        ...prev,
        [taskId]: progress
      }));
    } catch (err) {
      console.error("Error updating progress:", err);
    }
  };

  // Get progress for a task
  const getTaskProgress = (task) => {
    if (taskProgress[task.id] !== undefined) return taskProgress[task.id];
    if (task.progress !== undefined) return task.progress;
    if (task.status === "completed") return 100;
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

  return (
    <div className="mt-8 border p-6 rounded shadow-lg w-full max-w-6xl mx-auto bg-white">
      <h2 className="font-semibold text-2xl mb-6 text-gray-800">Task Management</h2>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="p-2 border rounded flex-1 min-w-[150px]"
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
          className="p-2 border rounded flex-1 min-w-[150px]"
        >
          <option value="">All Status</option>
          <option value="open">Open</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <input
          type="text"
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="p-2 border rounded flex-1 min-w-[200px]"
        />

        <button
          onClick={() => setSortByDeadline(sortByDeadline === "asc" ? "desc" : "asc")}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
        >
          Sort by Deadline {sortByDeadline === "asc" ? "↑" : "↓"}
        </button>
      </div>

      {/* My Tasks */}
      <div className="mb-8">
        <h3 className="font-semibold text-xl mb-4 text-gray-700">My Tasks ({displayedTasks.filter(task => task.created_by === user.id).length})</h3>
        {displayedTasks.filter(task => task.created_by === user.id).length === 0 ? (
          <p className="text-gray-500 text-center py-4">No tasks created by you</p>
        ) : (
          <div className="space-y-4">
            {displayedTasks
              .filter(task => task.created_by === user.id)
              .map(task => {
                const progress = getTaskProgress(task);
                const progressText = getProgressText(progress, task.status);
                const progressColor = getProgressColor(progress, task.status);
                
                return (
                  <div key={task.id} className="p-4 border rounded-lg bg-white shadow-sm">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg text-gray-800">{task.title}</h4>
                        <p className="text-gray-600 mt-1">{task.description}</p>
                        <div className="grid grid-cols-2 gap-2 mt-2 text-sm text-gray-500">
                          <div>Deadline: {task.deadline || "N/A"}</div>
                          <div>Category: {task.category || "General"}</div>
                        </div>
                        
                        <div className="flex items-center gap-2 mt-3">
                          <span className="text-sm text-gray-600">Status:</span>
                          <span className={`font-medium ${
                            task.status === 'completed' ? 'text-green-600' :
                            task.status === 'in-progress' ? 'text-blue-600' :
                            task.status === 'cancelled' ? 'text-red-600' :
                            'text-orange-600'
                          }`}>
                            {task.status || "open"}
                          </span>
                          
                          {task.status === "in-progress" && (
                            <div className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                              <span className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></span>
                              Active Now
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-3">
                          <div className="flex justify-between text-xs text-gray-600 mb-1">
                            <span>Progress</span>
                            <span>{progressText}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-300 ${progressColor}`}
                              style={{width: `${progress}%`}}
                            ></div>
                          </div>
                        </div>
                        
                        {userTaskMemberships[task.id] && (
                          <div className="text-green-600 text-sm mt-2">
                            ✓ Has approved member(s)
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-2 flex-col ml-4">
                        {task.created_by === user.id && (
                          <div className="flex gap-2 flex-wrap justify-end">
                            {canStartTask(task) && (
                              <button
                                onClick={() => handleStartTask(task.id)}
                                className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm transition-colors"
                              >
                                Start Task
                              </button>
                            )}

                            {task.status === "in-progress" && (
                              <>
                                <button
                                  onClick={() => handleStatusChange(task.id, "completed")}
                                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm transition-colors"
                                >
                                  Complete
                                </button>
                                <button
                                  onClick={() => handleStatusChange(task.id, "cancelled")}
                                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm transition-colors"
                                >
                                  Cancel
                                </button>
                              </>
                            )}

                            <button
                              onClick={() => handleDeleteTask(task.id)}
                              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm transition-colors"
                            >
                              Delete
                            </button>
                            
                            {canSeeChatButton(task) && (
                              <button
                                onClick={() => window.open(`/task/${task.id}/chat`, '_blank')}
                                className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600 text-sm transition-colors"
                              >
                                Chat
                              </button>
                            )}
                          </div>
                        )}
                      </div>
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
        <h3 className="font-semibold text-xl mb-4 text-gray-700">Available Tasks ({displayedTasks.filter(task => task.created_by !== user.id).length})</h3>
        {displayedTasks.filter(task => task.created_by !== user.id).length === 0 ? (
          <p className="text-gray-500 text-center py-4">No available tasks from other users</p>
        ) : (
          <div className="space-y-4">
            {displayedTasks
              .filter(task => task.created_by !== user.id)
              .map(task => {
                const progress = getTaskProgress(task);
                const progressText = getProgressText(progress, task.status);
                const progressColor = getProgressColor(progress, task.status);
                const hasRequested = hasRequestedTask(task.id);
                const requestStatus = getRequestStatus(task.id);
                
                return (
                  <div key={task.id} className="p-4 border rounded-lg bg-white shadow-sm">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg text-gray-800">{task.title}</h4>
                        <p className="text-gray-600 mt-1">{task.description}</p>
                        <div className="grid grid-cols-2 gap-2 mt-2 text-sm text-gray-500">
                          <div>Deadline: {task.deadline || "N/A"}</div>
                          <div>Category: {task.category || "General"}</div>
                        </div>
                        
                        <div className="flex items-center gap-2 mt-3">
                          <span className="text-sm text-gray-600">Status:</span>
                          <span className={`font-medium ${
                            task.status === 'completed' ? 'text-green-600' :
                            task.status === 'in-progress' ? 'text-blue-600' :
                            task.status === 'cancelled' ? 'text-red-600' :
                            'text-orange-600'
                          }`}>
                            {task.status || "open"}
                          </span>
                          
                          {task.status === "in-progress" && (
                            <div className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                              <span className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></span>
                              Active Now
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-3">
                          <div className="flex justify-between text-xs text-gray-600 mb-1">
                            <span>Progress</span>
                            <span>{progressText}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${progressColor}`}
                              style={{width: `${progress}%`}}
                            ></div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 flex-col ml-4">
                        {!hasRequested && !userTaskMemberships[task.id] && task.status === "open" && (
                          <button
                            onClick={() => handleRequestTask(task.id)}
                            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm transition-colors"
                          >
                            Request Task
                          </button>
                        )}
                        
                        {hasRequested && (
                          <span className={`text-sm px-3 py-1 rounded ${
                            requestStatus === 'approved' ? 'bg-green-100 text-green-800' :
                            requestStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-orange-100 text-orange-800'
                          }`}>
                            Request {requestStatus}
                          </span>
                        )}
                        
                        {canSeeChatButton(task) && (
                          <button
                            onClick={() => window.open(`/task/${task.id}/chat`, '_blank')}
                            className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600 text-sm transition-colors"
                          >
                            Chat
                          </button>
                        )}
                      </div>
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