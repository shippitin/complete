// src/components/Profile/MyDashboard.tsx
import React from 'react';

const MyDashboard: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-4 text-blue-700">Welcome to Your Dashboard</h2>
      <p className="text-gray-600 mb-2">Here’s a quick overview of your recent activity:</p>
      <ul className="space-y-3 mt-4">
        <li className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded">
          <strong>5</strong> shipments in transit
        </li>
        <li className="border-l-4 border-green-500 bg-green-50 p-4 rounded">
          <strong>₹12,500</strong> pending in payments
        </li>
        <li className="border-l-4 border-yellow-500 bg-yellow-50 p-4 rounded">
          2 documents pending verification
        </li>
      </ul>
    </div>
  );
};

export default MyDashboard;