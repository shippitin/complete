// src/components/Profile/MyShipments.tsx
import React from 'react';

const MyShipments: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 sm:p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">My Shipments</h1>
      <p className="text-gray-600">This section will display your past and current shipments.</p>
      {/* Add shipment listing, tracking, filters etc. here */}
      <div className="mt-6 p-4 border border-gray-200 rounded-md text-gray-500 italic">
        No shipments found yet. Start by booking your first shipment!
      </div>
    </div>
  );
};

export default MyShipments;