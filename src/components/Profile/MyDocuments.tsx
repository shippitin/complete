// src/components/Profile/MyDocuments.tsx
import React from 'react';

const MyDocuments: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 sm:p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">My Documents</h1>
      <p className="text-gray-600">Upload and manage your important business documents (e.g., trade licenses, permits).</p>
      {/* Add document upload forms, list of uploaded documents here */}
      <div className="mt-6 p-4 border border-gray-200 rounded-md text-gray-500 italic">
        No documents uploaded.
      </div>
    </div>
  );
};

export default MyDocuments;