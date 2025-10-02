// frontend/src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Navbar from "./pages/Navbar";
import TaskChat from "./pages/TaskChat";

const PrivateRoute = ({ children, token }) => { // ⬅️ Take token as a prop
  return token ? children : <Navigate to="/auth" />;
};

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || null);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  return (
    <Router>
      <Navbar token={token} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth setToken={setToken} />} />
        <Route path="/dashboard" element={
          <PrivateRoute token={token}> 
            <Dashboard />
          </PrivateRoute>
        } />
        <Route path="/task/:taskId/chat" element={<TaskChat />} />
      </Routes>
    </Router>
  );
}

export default App;