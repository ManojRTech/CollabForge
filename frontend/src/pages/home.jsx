import React, { useState } from "react";

const Home = () => {
  const [response, setResponse] = useState("");

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
    <div className="p-6 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-4">Home Page</h1>
      <button
        onClick={callBackend}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Call Backend
      </button>
      {response && (
        <pre className="mt-4 p-4 bg-gray-100 rounded w-full max-w-lg text-left">
          {response}
        </pre>
      )}
    </div>
  );
};

export default Home;
