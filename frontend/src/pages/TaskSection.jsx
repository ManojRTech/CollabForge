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

  // Fetch user's task memberships
  useEffect(() => {
    const fetchUserMemberships = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("/api/tasks/user/memberships", {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Convert to a lookup object for easy access
        const memberships = {};
        res.data.memberships.forEach(membership => {
          memberships[membership.task_id] = true;
        });
        setUserTaskMemberships(memberships);
      } catch (err) {
        console.error("Error fetching user memberships:", err);
      }
    };

    fetchUserMemberships();
  }, []);

  // Check if user can see chat button for a task
  const canSeeChatButton = (task) => {
    // Task creator can always see chat
    if (task.created_by === user.id) return true;
    
    // Check if user is an approved/assigned member
    if (userTaskMemberships[task.id]) return true;
    
    return false;
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
        .map(task => (
          <li key={task.id} className="p-2 border-b flex justify-between items-center">
            <div>
              <strong>{task.title}</strong> <br />
              <small>{task.description}</small> <br />
              <small>Deadline: {task.deadline || "N/A"}</small> <br />
              <small>Category: {task.category || "General"}</small> <br />
              <small>Status: {task.status || "open"}</small><br />
            </div>
            <div className="flex gap-2 flex-col">
              {task.created_by === user.id && (
                <div className="flex gap-2 mt-2">
                  {task.status === "open" && (
                    <button
                      onClick={() => handleStatusChange(task.id, "in-progress")}
                      className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Start
                    </button>
                  )}
                  {task.status === "in-progress" && (
                    <button
                      onClick={() => handleStatusChange(task.id, "completed")}
                      className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      Complete
                    </button>
                  )}
                  <button
                    onClick={() => handleEditTask(task)}
                    className="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                  
                  {/* Chat button - always visible to creator */}
                  <button
                    onClick={() => {
                      console.log("Chat clicked", task.id);
                      window.open(`/task/${task.id}/chat`, '_blank');
                    }}
                    className="px-2 py-1 bg-purple-500 text-white rounded hover:bg-purple-600"
                  >
                    Chat
                  </button>
                </div>
              )}
            </div>
          </li>
        ))
      }

      {/* Available Tasks */}
      <h3 className="font-semibold mt-6 mb-2">Available Tasks</h3>
      {displayedTasks
        .filter(task => task.created_by !== user.id)
        .map(task => (
          <li key={task.id} className="p-2 border-b flex justify-between items-center">
            <div>
              <strong>{task.title}</strong> <br />
              <small>{task.description}</small> <br />
              <small>Deadline: {task.deadline || "N/A"}</small> <br />
              <small>Category: {task.category || "General"}</small> <br />
              <small>Status: {task.status || "open"}</small><br />
            </div>
            <div className="flex gap-2 flex-col">
              {/* Show Request button for non-members */}
              {!userTaskMemberships[task.id] && task.status === "open" && (
                <button
                  onClick={() => handleRequestTask(task.id)}
                  className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Request Task
                </button>
              )}
              
              {/* Show Chat button for approved/assigned members OR if user is creator */}
              {(userTaskMemberships[task.id] || task.created_by === user.id) && (
                <button
                  onClick={() => {
                    console.log("Chat clicked", task.id);
                    window.open(`/task/${task.id}/chat`, '_blank');
                  }}
                  className="px-2 py-1 bg-purple-500 text-white rounded hover:bg-purple-600"
                >
                  Chat
                </button>
              )}
              
              {/* Show pending message if request is pending */}
              {!userTaskMemberships[task.id] && task.status !== "open" && (
                <span className="text-gray-500 text-sm">Request Pending</span>
              )}
            </div>
          </li>
        ))
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
