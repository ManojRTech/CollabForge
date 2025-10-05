import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { LogOut } from "lucide-react";

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
    <nav className="p-4 bg-white shadow-sm border-b">
      <div className="flex justify-between items-center"> {/* REMOVED max-w-7xl mx-auto */}
        <Link to="/" className="font-bold text-xl text-gray-800">CollabForge</Link>
        <div className="flex gap-4">
          {!token && (
            <Link 
              to="/auth" 
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Login/Register
            </Link>
          )}
          {token && (
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;