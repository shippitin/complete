// src/components/Profile/LoggedInDevices.tsx
import React from 'react';

const LoggedInDevices: React.FC = () => {
  // Simulate some logged-in devices
  const devices = [
    { id: 1, name: 'Current Device (Chrome on Windows)', ip: '192.168.1.100', lastActivity: 'Just now' },
    { id: 2, name: 'iPhone 15 Pro (Safari)', ip: '10.0.0.5', lastActivity: '2 hours ago' },
    { id: 3, name: 'Old Laptop (Firefox on Linux)', ip: '172.16.0.20', lastActivity: '3 days ago' },
  ];

  const handleLogoutDevice = (id: number) => {
    console.log(`Logging out device ID: ${id}`);
    alert(`Device ID ${id} logged out (simulated).`);
    // Implement actual logout device logic (API call)
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 sm:p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Logged in Devices</h1>
      <p className="text-gray-600 mb-4">Manage where your Shippitin account is currently logged in.</p>

      {devices.length > 0 ? (
        <ul className="space-y-4">
          {devices.map((device) => (
            <li key={device.id} className="flex items-center justify-between border-b pb-4 last:border-b-0 last:pb-0">
              <div>
                <div className="font-semibold text-lg">{device.name}</div>
                <div className="text-sm text-gray-500">IP: {device.ip} | Last Activity: {device.lastActivity}</div>
              </div>
              {device.id !== 1 && ( // Don't allow logging out of the current device easily
                <button
                  onClick={() => handleLogoutDevice(device.id)}
                  className="text-red-500 hover:text-red-700 text-sm font-semibold ml-4"
                >
                  Logout Device
                </button>
              )}
               {device.id === 1 && (
                <span className="text-green-600 text-sm font-semibold">Current Session</span>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-6 p-4 border border-gray-200 rounded-md text-gray-500 italic">
          No other active sessions found.
        </div>
      )}
    </div>
  );
};

export default LoggedInDevices;