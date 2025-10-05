import { useEffect, useState } from "react";
import axios from "axios";

const RequestSection = ({ user }) => {
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("incoming"); // 'incoming' or 'outgoing'

  // Fetch requests
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const token = localStorage.getItem("token");
        
        // Fetch incoming requests (requests for user's tasks)
        const incomingRes = await axios.get("/api/tasks/my-requests", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setIncomingRequests(incomingRes.data.requests);

        // Fetch outgoing requests (requests made by user)
        const outgoingRes = await axios.get("/api/tasks/user/requests", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOutgoingRequests(outgoingRes.data.requests);
      } catch (err) {
        setMessage(err.response?.data?.message || "Error fetching requests");
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const handleAction = async (taskId, action, userId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`/api/tasks/${taskId}/${action}`, { userId }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Refresh both incoming and outgoing requests
    const [incomingRes, outgoingRes] = await Promise.all([
      axios.get("/api/tasks/my-requests", { headers: { Authorization: `Bearer ${token}` } }),
      axios.get("/api/tasks/user/requests", { headers: { Authorization: `Bearer ${token}` } })
    ]);


      // Update the request status in state
      setIncomingRequests(prev =>
        prev.map(req => 
          req.task_id === parseInt(taskId) && req.user_id === userId 
            ? { ...req, status: action === "approve" ? "approved" : "rejected" } 
            : req
        )
      );
      setMessage(`Request ${action}d successfully!`);
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage(err.response?.data?.message || `Error ${action}ing request`);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  if (loading) return <p>Loading requests...</p>;

  return (
    <div className="mt-8 border p-4 rounded shadow w-96 mx-auto">
      <h2 className="font-semibold mb-2">Requests</h2>
      
      {/* Tab Navigation */}
      <div className="flex mb-4 border-b">
        <button
          className={`flex-1 py-2 ${activeTab === "incoming" ? "border-b-2 border-blue-500 font-semibold" : ""}`}
          onClick={() => setActiveTab("incoming")}
        >
          Incoming
        </button>
        <button
          className={`flex-1 py-2 ${activeTab === "outgoing" ? "border-b-2 border-blue-500 font-semibold" : ""}`}
          onClick={() => setActiveTab("outgoing")}
        >
          My Requests
        </button>
      </div>

      {message && (
        <div className="mb-2 p-2 bg-blue-100 text-blue-800 rounded">{message}</div>
      )}

      {/* Incoming Requests Tab */}
      {activeTab === "incoming" && (
        <>
          <h3 className="font-semibold mb-2">Requests for My Projects</h3>
          {incomingRequests.length === 0 ? (
            <p>No incoming requests.</p>
          ) : (
            <ul>
              {incomingRequests.map((req) => (
                <li key={req.request_id} className="p-2 border-b">
                  <div>
                    <strong>Projects: {req.title}</strong> <br />
                    <small>Requested by: {req.username}</small> <br />
                    <small>Status: {req.status}</small> <br />
                    <small>
                      Requested At: {new Date(req.created_at).toLocaleString()}
                    </small>
                  </div>
                  <div className="mt-2">
                    {req.status === "pending" && (
                      <>
                        <button
                          onClick={() => handleAction(req.task_id, "approve", req.user_id)}
                          className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 mr-2"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleAction(req.task_id, "reject", req.user_id)}
                          className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {/* Outgoing Requests Tab */}
      {activeTab === "outgoing" && (
        <>
          <h3 className="font-semibold mb-2">My Projects Requests</h3>
          {outgoingRequests.length === 0 ? (
            <p>No requests made yet.</p>
          ) : (
            <ul>
              {outgoingRequests.map((req) => (
                <li key={req.request_id} className="p-2 border-b">
                  <div>
                    <strong>Task: {req.task_title}</strong> <br />
                    <small>Task Creator: {req.task_creator_name}</small> <br />
                    <small>Status: {req.status}</small> <br />
                    <small>
                      Requested At: {new Date(req.created_at).toLocaleString()}
                    </small>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
};

export default RequestSection;