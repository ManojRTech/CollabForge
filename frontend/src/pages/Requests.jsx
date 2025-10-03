import React from 'react';
import RequestSection from './RequestSection';

const Requests = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Task Requests</h1>
      <RequestSection />
    </div>
  );
};

export default Requests;