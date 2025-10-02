import React, { useEffect, useState } from "react";
import axios from "axios";

const TaskSection = ({
  newTask, setNewTask,
  editingTaskId,
  handleAddTask, handleUpdateTask,
  filterCategory, setFilterCategory,
  filterStatus, setFilterStatus,
  sortByDeadline, setSortByDeadline,
  displayedTasks, user,
  handleEditTask, handleDeleteTask,
  handleAcceptTask, handleStatusChange,
  searchQuery, setSearchQuery,
  handleRequestTask,
}) => {
  const [userTaskMemberships, setUserTaskMemberships] = useState({});
  const [taskProgress, setTaskProgress] = useState({});
  const [userRequests, setUserRequests] = useState({}); // Track user's requests

  // Fetch user's task memberships AND requests
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        
        // Fetch memberships
        const membershipsRes = await axios.get("/api/tasks/user/memberships", {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Convert to a lookup object for easy access
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
      
      // Update local state
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
    // If we have local progress state, use that
    if (taskProgress[task.id] !== undefined) return taskProgress[task.id];
    
    // Otherwise use task progress from API or default based on status
    if (task.progress !== undefined) return task.progress;
    
    // Default progress based on status
    if (task.status === "completed") return 100;
    if (task.status === "in-progress") return 0;
    return 0; // open tasks
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
    <div className="mt-8 border p-4 rounded shadow w-96 mx-auto">
      <h2 className="font-semibold mb-2">Tasks</h2>

      {/* Task Form */}
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

      {/* Status dropdown in task form */}
      <select
        value={newTask.status}
        onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
        className="p-2 border rounded w-full mb-2"
      >
        <option value="open">Open</option>
        <option value="in-progress">In Progress</option>
        <option value="completed">Completed</option>
        <option value="cancelled">Cancelled</option>
      </select>

      {/* Progress dropdown - ONLY SHOW WHEN EDITING */}
      {editingTaskId && (
        <select
          value={newTask.progress || 0}
          onChange={(e) => setNewTask({ ...newTask, progress: parseInt(e.target.value) })}
          className="p-2 border rounded w-full mb-2"
        >
          <option value={0}>0% - Not started</option>
          <option value={25}>25% - Getting there</option>
          <option value={50}>50% - Halfway</option>
          <option value={75}>75% - Almost done</option>
          <option value={100}>100% - Complete</option>
        </select>
      )}

      <button
        onClick={editingTaskId ? handleUpdateTask : handleAddTask}
        className={`px-4 py-2 rounded text-white ${editingTaskId ? "bg-blue-500 hover:bg-blue-600" : "bg-green-500 hover:bg-green-600"}`}
      >
        {editingTaskId ? "Update Task" : "Add Task"}
      </button>

      {/* Filters */}
      <div className="flex gap-2 mb-2 justify-center mt-4">
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="">All Categories</option>
          <option value="general">General</option>
          <option value="work">Work</option>
          <option value="personal">Personal</option>
          <option value="urgent">Urgent</option>
        </select>

        {/* Status filter */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="p-2 border rounded"
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
          className="p-2 border rounded w-full mb-2"
        />

        <button
          onClick={() => setSortByDeadline(sortByDeadline === "asc" ? "desc" : "asc")}
          className="px-2 py-1 bg-gray-200 rounded"
        >
          Sort by Deadline {sortByDeadline === "asc" ? "↑" : "↓"}
        </button>
      </div>

      {/* My Tasks */}
      <h3 className="font-semibold mb-2 mt-4">My Tasks</h3>
      {displayedTasks
        .filter(task => task.created_by === user.id)
        .map(task => {
          const progress = getTaskProgress(task);
          const progressText = getProgressText(progress, task.status);
          const progressColor = getProgressColor(progress, task.status);
          
          return (
            <li key={task.id} className="p-2 border-b">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <strong>{task.title}</strong> <br />
                  <small>{task.description}</small> <br />
                  <small>Deadline: {task.deadline || "N/A"}</small> <br />
                  <small>Category: {task.category || "General"}</small> <br />
                  
                  {/* Status with color coding */}
                  <div className="flex items-center gap-2 mt-1">
                    <small>Status: </small>
                    <span className={`font-medium ${
                      task.status === 'completed' ? 'text-green-600' :
                      task.status === 'in-progress' ? 'text-blue-600' :
                      task.status === 'cancelled' ? 'text-red-600' :
                      'text-orange-600'
                    }`}>
                      {task.status || "open"}
                    </span>
                    
                    {/* Active Badge - Only for in-progress tasks */}
                    {task.status === "in-progress" && (
                      <div className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></span>
                        Active Now
                      </div>
                    )}
                  </div>
                  
                  {/* Progress Bar - Read-only in task list */}
                  <div className="mt-2">
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
                  
                  {/* Show approved members count */}
                  {userTaskMemberships[task.id] && (
                    <small className="block text-green-600 mt-1">
                      ✓ Has approved member(s)
                    </small>
                  )}
                </div>
                
                <div className="flex gap-2 flex-col">
                  {task.created_by === user.id && (
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {/* START BUTTON */}
                      {canStartTask(task) && (
                        <button
                          onClick={() => handleStartTask(task.id)}
                          className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                        >
                          Start Task
                        </button>
                      )}

                      {/* STATUS CONTROLS */}
                      {task.status === "in-progress" && (
                        <>
                          <button
                            onClick={() => handleStatusChange(task.id, "completed")}
                            className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                          >
                            Complete
                          </button>
                          <button
                            onClick={() => handleStatusChange(task.id, "cancelled")}
                            className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                          >
                            Cancel
                          </button>
                        </>
                      )}

                      {/* EDIT & DELETE */}
                      <button
                        onClick={() => handleEditTask(task)}
                        className="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                      >
                        Delete
                      </button>
                      
                      {/* CHAT BUTTON */}
                      {canSeeChatButton(task) && (
                        <button
                          onClick={() => window.open(`/task/${task.id}/chat`, '_blank')}
                          className="px-2 py-1 bg-purple-500 text-white rounded hover:bg-purple-600 text-sm"
                        >
                          Chat
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </li>
          );
        })
      }

      {/* Available Tasks */}
      <h3 className="font-semibold mt-6 mb-2">Available Tasks</h3>
      {displayedTasks
        .filter(task => task.created_by !== user.id)
        .map(task => {
          const progress = getTaskProgress(task);
          const progressText = getProgressText(progress, task.status);
          const progressColor = getProgressColor(progress, task.status);
          const hasRequested = hasRequestedTask(task.id);
          const requestStatus = getRequestStatus(task.id);
          
          return (
            <li key={task.id} className="p-2 border-b">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <strong>{task.title}</strong> <br />
                  <small>{task.description}</small> <br />
                  <small>Deadline: {task.deadline || "N/A"}</small> <br />
                  <small>Category: {task.category || "General"}</small> <br />
                  
                  {/* Status and Progress (read-only) */}
                  <div className="flex items-center gap-2 mt-1">
                    <small>Status: </small>
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
                  
                  {/* Read-only Progress Bar */}
                  <div className="mt-2">
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
                
                <div className="flex gap-2 flex-col">
                  {/* Show Request button only if:
                      - User hasn't requested AND 
                      - User is not already a member AND
                      - Task is open */}
                  {!hasRequested && !userTaskMemberships[task.id] && task.status === "open" && (
                    <button
                      onClick={() => handleRequestTask(task.id)}
                      className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                    >
                      Request Task
                    </button>
                  )}
                  
                  {/* Show request status if user has requested */}
                  {hasRequested && (
                    <span className={`text-sm ${
                      requestStatus === 'approved' ? 'text-green-600' :
                      requestStatus === 'rejected' ? 'text-red-600' :
                      'text-orange-600'
                    }`}>
                      Request {requestStatus}
                    </span>
                  )}
                  
                  {/* Show Chat button for approved members OR if user is creator */}
                  {canSeeChatButton(task) && (
                    <button
                      onClick={() => window.open(`/task/${task.id}/chat`, '_blank')}
                      className="px-2 py-1 bg-purple-500 text-white rounded hover:bg-purple-600 text-sm"
                    >
                      Chat
                    </button>
                  )}
                </div>
              </div>
            </li>
          );
        })
      }
    </div>
  );
};

export default TaskSection;







// import React from "react";

// const TaskSection = ({
//   newTask, setNewTask,
//   editingTaskId,
//   handleAddTask, handleUpdateTask,
//   filterCategory, setFilterCategory,
//   filterStatus, setFilterStatus,
//   sortByDeadline, setSortByDeadline,
//   displayedTasks, user,
//   handleEditTask, handleDeleteTask,
//   handleAcceptTask, handleStatusChange,
//   searchQuery, setSearchQuery,
//   handleRequestTask,
//   setSelectedTask,
//   fetchTaskMembers
// }) => {

//   const handleChatClick = (task) => {
//     console.log("Chat clicked", task.id);
//     setSelectedTask(task.id);
//     fetchTaskMembers(task.id);
//   };

//   return (
//     <div className="mt-8 border p-4 rounded shadow w-96 mx-auto">
//       <h2 className="font-semibold mb-2">Tasks</h2>

//       {/* Task Form */}
//       <input
//         type="text"
//         placeholder="Title"
//         value={newTask.title}
//         onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
//         className="p-2 border rounded w-full mb-2"
//       />
//       <textarea
//         placeholder="Description"
//         value={newTask.description}
//         onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
//         className="p-2 border rounded w-full mb-2"
//       />
//       <input
//         type="date"
//         value={newTask.deadline}
//         onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
//         className="p-2 border rounded w-full mb-2"
//       />
//       <select
//         value={newTask.category}
//         onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
//         className="p-2 border rounded w-full mb-2"
//       >
//         <option value="general">General</option>
//         <option value="work">Work</option>
//         <option value="personal">Personal</option>
//         <option value="urgent">Urgent</option>
//       </select>

//       <button
//         onClick={editingTaskId ? handleUpdateTask : handleAddTask}
//         className={`px-4 py-2 rounded text-white ${editingTaskId ? "bg-blue-500 hover:bg-blue-600" : "bg-green-500 hover:bg-green-600"}`}
//       >
//         {editingTaskId ? "Update Task" : "Add Task"}
//       </button>

//       {/* Filters */}
//       <div className="flex gap-2 mb-2 justify-center mt-4">
//         <select
//           value={filterCategory}
//           onChange={(e) => setFilterCategory(e.target.value)}
//           className="p-2 border rounded"
//         >
//           <option value="">All Categories</option>
//           <option value="general">General</option>
//           <option value="work">Work</option>
//           <option value="personal">Personal</option>
//           <option value="urgent">Urgent</option>
//         </select>

//         <input
//             type="text"
//             placeholder="Search tasks..."
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             className="p-2 border rounded w-full mb-2"
//         />


//         <button
//           onClick={() => setSortByDeadline(sortByDeadline === "asc" ? "desc" : "asc")}
//           className="px-2 py-1 bg-gray-200 rounded"
//         >
//           Sort by Deadline {sortByDeadline === "asc" ? "↑" : "↓"}
//         </button>
//       </div>

//       {/* My Tasks */}
//       <h3 className="font-semibold mb-2 mt-4">My Tasks</h3>
//       {displayedTasks
//         .filter(task => task.created_by === user.id)
//         .map(task => (
//           <li key={task.id} className="p-2 border-b flex justify-between items-center">
//             <div>
//               <strong>{task.title}</strong> <br />
//               <small>{task.description}</small> <br />
//               <small>Deadline: {task.deadline || "N/A"}</small> <br />
//               <small>Category: {task.category || "General"}</small> <br />
//               <small>Status: {task.status || "open"}</small><br />
//             </div>
//             <div className="flex gap-2 flex-col">
//               {task.created_by === user.id && (
//                 <div className="flex gap-2 mt-2">
//                   {task.status === "open" && (
//                     <button
//                       onClick={() => handleStatusChange(task.id, "in-progress")}
//                       className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
//                     >
//                       Start
//                     </button>
//                   )}
//                   {task.status === "in-progress" && (
//                     <button
//                       onClick={() => handleStatusChange(task.id, "completed")}
//                       className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
//                     >
//                       Complete
//                     </button>
//                   )}
//                   <button
//                     onClick={() => handleEditTask(task)}
//                     className="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
//                   >
//                     Edit
//                   </button>
//                   <button
//                     onClick={() => handleDeleteTask(task.id)}
//                     className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
//                   >
//                     Delete
//                   </button>
//                   <button
//                     onClick={() => {
//                       console.log("Chat clicked", task.id); // Debug
//                       setSelectedTask(task.id);
//                       fetchTaskMembers(task.id); // Fetch members here
//                     }}
//                     className="px-2 py-1 bg-purple-500 text-white rounded hover:bg-purple-600"
//                   >
//                     Chat
//                   </button>
//                 </div>
//               )}
//             </div>
//           </li>
//         ))
//       }

//     {/* Available Tasks */}
//     <h3 className="font-semibold mt-6 mb-2">Available Tasks</h3>
//     {displayedTasks
//     .filter(task => task.created_by !== user.id)
//     .map(task => (
//         <li key={task.id} className="p-2 border-b flex justify-between items-center">
//         <div>
//             <strong>{task.title}</strong> <br />
//             <small>{task.description}</small> <br />
//             <small>Deadline: {task.deadline || "N/A"}</small> <br />
//             <small>Category: {task.category || "General"}</small> <br />
//             <small>Status: {task.status || "open"}</small><br />
//         </div>
//         <div>
//             {/* Show Request button instead of Accept */}
//             <button
//             onClick={() => handleRequestTask(task.id)}
//             className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
//             >
//             Request Task
//             </button>
//         </div>
//         </li>
//     ))}

//     </div>
//   );
// };

// export default TaskSection;
