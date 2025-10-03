import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Layout = ({ children, user }) => {
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-xl">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            CollabForge
          </h1>
          <p className="text-sm text-gray-600 mt-2">Welcome back,</p>
          <p className="font-semibold text-gray-800">{user?.username}</p>
        </div>
        
        <nav className="p-4">
          <ul className="space-y-3">
            <li>
              <Link 
                to="/dashboard" 
                className={`flex items-center p-3 rounded-xl transition-all duration-200 ${
                  location.pathname === '/dashboard' 
                    ? 'bg-blue-500 text-white shadow-md' 
                    : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                }`}
              >
                <span className="mr-3 text-lg">📊</span>
                Dashboard
              </Link>
            </li>
            <li>
              <Link 
                to="/profile" 
                className={`flex items-center p-3 rounded-xl transition-all duration-200 ${
                  location.pathname === '/profile' 
                    ? 'bg-blue-500 text-white shadow-md' 
                    : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                }`}
              >
                <span className="mr-3 text-lg">👤</span>
                Profile
              </Link>
            </li>
            <li>
              <Link 
                to="/requests" 
                className={`flex items-center p-3 rounded-xl transition-all duration-200 ${
                  location.pathname === '/requests' 
                    ? 'bg-blue-500 text-white shadow-md' 
                    : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                }`}
              >
                <span className="mr-3 text-lg">🔔</span>
                Requests
              </Link>
            </li>
            <li>
              <Link 
                to="/create-task" 
                className={`flex items-center p-3 rounded-xl transition-all duration-200 ${
                  location.pathname === '/create-task' 
                    ? 'bg-blue-500 text-white shadow-md' 
                    : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                }`}
              >
                <span className="mr-3 text-lg">➕</span>
                Create Task
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;