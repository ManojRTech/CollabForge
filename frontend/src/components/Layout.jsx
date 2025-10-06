import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  PlusCircle, 
  Mail, 
  User, 
  LogOut,
  Home as HomeIcon   
} from 'lucide-react';

const Layout = ({ user, children }) => {
  const location = useLocation();

const profilePhotoUrl = user?.profile_photo
    ? `http://localhost:5000${user.profile_photo}`
    : null;  

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        {/* Profile Section */}
        <div className="p-6 border-b">
          <div className="flex items-center space-x-3">
            {profilePhotoUrl ? (
              <img
                src={profilePhotoUrl}
                alt="Profile"
                className="w-18 h-18 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                {user?.username?.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h3 className="font-semibold text-gray-800">{user?.username}</h3>
              <p className="text-sm text-gray-600">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-1">
          <Link
            to="/"
            className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
              location.pathname === '/' 
                ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <HomeIcon size={20} />
            <span className="font-medium">Home</span>
          </Link>

          <Link
            to="/dashboard"
            className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
              location.pathname === '/dashboard' 
                ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <LayoutDashboard size={20} />
            <span className="font-medium">Dashboard</span>
          </Link>
          
          <Link
            to="/create-task"
            className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
              location.pathname === '/create-task' 
                ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <PlusCircle size={20} />
            <span className="font-medium">Create Project</span>
          </Link>
          
          <Link
            to="/requests"
            className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
              location.pathname === '/requests' 
                ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Mail size={20} />
            <span className="font-medium">Requests</span>
          </Link>
          
          <Link
            to="/profile"
            className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
              location.pathname === '/profile' 
                ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <User size={20} />
            <span className="font-medium">Profile Settings</span>
          </Link>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col w-full">
        <div className="flex-1 overflow-auto bg-gray-50">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;