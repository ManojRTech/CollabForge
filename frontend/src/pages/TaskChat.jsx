import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const TaskChat = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [task, setTask] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchChatData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/auth");
          return;
        }

        // Fetch task details and verify access
        const [taskRes, membersRes] = await Promise.all([
          axios.get(`/api/tasks/${taskId}`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`/api/tasks/${taskId}/members`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        setTask(taskRes.data.task);
        setMembers(membersRes.data.members);

        // Fetch initial messages
        await fetchMessages();

      } catch (err) {
        console.error("Error fetching chat data:", err);
        if (err.response?.status === 403 || err.response?.status === 404) {
          setError("You don't have access to this task chat");
        } else {
          setError("Failed to load chat");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchChatData();
  }, [taskId, navigate]);

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`/api/tasks/${taskId}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(res.data.messages || []);
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };

  // Add real-time message polling
  useEffect(() => {
    const interval = setInterval(() => {
      fetchMessages();
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(interval);
  }, [taskId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `/api/tasks/${taskId}/messages`,
        { message: newMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessages(prev => [...prev, res.data.message]);
      setNewMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Failed to send message");
      setTimeout(() => setError(""), 3000);
    }
  };

  if (loading) return <div className="p-6 text-center">Loading chat...</div>;
  if (error) return <div className="p-6 text-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
        {/* Header */}
        <div className="p-4 border-b bg-blue-600 text-white rounded-t-lg">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">{task?.title}</h1>
              <p className="text-blue-100">{task?.description}</p>
            </div>
            <button
              onClick={() => navigate("/dashboard")}
              className="px-4 py-2 bg-blue-700 hover:bg-blue-800 rounded text-white"
            >
              Back to Dashboard
            </button>
          </div>
          
          {/* Members info */}
          <div className="mt-2">
            <span className="text-blue-200">
              Members: {members.map(m => m.username).join(", ")}
            </span>
          </div>
        </div>

        {/* Messages */}
        <div className="h-96 overflow-y-auto p-4 bg-gray-50">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No messages yet. Start the conversation!
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className="mb-4 p-3 bg-white rounded-lg shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <strong className="text-blue-600">{msg.username}</strong>
                    <p className="mt-1 text-gray-700">{msg.message}</p>
                  </div>
                  <small className="text-gray-400 text-sm">
                    {new Date(msg.created_at).toLocaleString()}
                  </small>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Message Input */}
        <form onSubmit={handleSendMessage} className="p-4 border-t">
          {error && <div className="mb-2 text-red-500 text-sm">{error}</div>}
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskChat;