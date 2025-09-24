import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

const Navbar = () => {
  const [token, setToken] = useState(localStorage.getItem("token"));

  useEffect(() => {
    const interval = setInterval(() => {
      setToken(localStorage.getItem("token"));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    window.location.href = "/auth";
  };

  return (
    <nav className="p-4 flex gap-4 bg-gray-100">
      <Link to="/">Home</Link>
      {!token && <Link to="/auth">Login/Register</Link>}
      {token && <Link to="/dashboard">Dashboard</Link>}
      {token && (
        <button
          onClick={handleLogout}
          className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Logout
        </button>
      )}
    </nav>
  );
};

export default Navbar;
