import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Navbar from "./pages/Navbar";
import TaskChat from "./pages/TaskChat";
import Layout from "./components/Layout";
import CreateTask from "./pages/CreateTask";
import Requests from "./pages/Requests";
import ProfileSection from "./pages/ProfileSection";

const PrivateRoute = ({ children, token }) => {
  return token ? children : <Navigate to="/auth" />;
};

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [user, setUser] = useState(null);

  // Fetch user when token changes
  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const userRes = await fetch("/api/user/me", {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (userRes.ok) {
            const userData = await userRes.json();
            setUser(userData.user);
          }
        } catch (err) {
          console.error("Error fetching user:", err);
        }
      }
    };
    fetchUser();
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  return (
    <Router>
      <Navbar token={token} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth setToken={setToken} />} />
        
        {/* Authenticated routes with Layout */}
        <Route path="/dashboard" element={
          <PrivateRoute token={token}>
            <Layout user={user}>
              <Dashboard />
            </Layout>
          </PrivateRoute>
        } />
        
        <Route path="/profile" element={
          <PrivateRoute token={token}>
            <Layout user={user}>
              <ProfileSection />
            </Layout>
          </PrivateRoute>
        } />
        
        <Route path="/create-task" element={
          <PrivateRoute token={token}>
            <Layout user={user}>
              <CreateTask />
            </Layout>
          </PrivateRoute>
        } />

        {/* ADD THIS MISSING ROUTE FOR EDITING */}
        <Route path="/create-task/:id" element={
          <PrivateRoute token={token}>
            <Layout user={user}>
              <CreateTask />
            </Layout>
          </PrivateRoute>
        } />
        
        <Route path="/requests" element={
          <PrivateRoute token={token}>
            <Layout user={user}>
              <Requests />
            </Layout>
          </PrivateRoute>
        } />
        
        <Route path="/task/:taskId/chat" element={<TaskChat />} />
      </Routes>
    </Router>
  );
}

export default App;