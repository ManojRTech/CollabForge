import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [response, setResponse] = useState("");
  const navigate = useNavigate();

  const callBackend = async () => {
    try {
      const res = await fetch("/api/test"); // backend test endpoint
      const data = await res.json();
      setResponse(JSON.stringify(data, null, 2));
    } catch (err) {
      setResponse("Error: " + err.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Hero Section */}
      <header className="flex flex-col items-center text-center py-16 px-4">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-800">
          CollabForge
        </h1>
        <p className="text-lg md:text-xl text-gray-600 italic mb-8">
          Collaborate smarter. Forge together.
        </p>
        <div className="flex gap-4">
          <button
            onClick={() => navigate("/auth")}
            className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            Login
          </button>
          <button
            onClick={() => navigate("/auth")}
            className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            Register
          </button>
        </div>
      </header>

      {/* Features Section */}
      <section className="flex flex-col md:flex-row justify-center items-stretch gap-6 px-4 py-12">
        <div className="bg-white rounded-xl shadow-md p-6 flex-1 text-center">
          <h3 className="font-semibold text-xl mb-2">Create Projects</h3>
          <p className="text-gray-600">
            Easily create and manage projects for your team with full control.
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 flex-1 text-center">
          <h3 className="font-semibold text-xl mb-2">Connect with Developers</h3>
          <p className="text-gray-600">
            Find and collaborate with skilled developers and professionals.
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 flex-1 text-center">
          <h3 className="font-semibold text-xl mb-2">Track Progress</h3>
          <p className="text-gray-600">
            Monitor project milestones and team contributions in real time.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 py-6 text-center text-sm text-gray-600">
        <p>&copy; {new Date().getFullYear()} CollabForge. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
