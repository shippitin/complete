// src/pages/DashboardPage.tsx
import React from 'react';
import { FaTachometerAlt, FaClipboardList, FaTruck, FaShieldAlt, FaChartLine, FaInfoCircle } from 'react-icons/fa';

const DashboardPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Dashboard Header */}
        <div className="bg-blue-600 text-white p-6 rounded-t-2xl flex items-center justify-between">
          <h1 className="text-3xl font-bold flex items-center">
            <FaTachometerAlt className="mr-3 text-4xl" /> My Dashboard
          </h1>
          {/* Add any dashboard-specific actions here */}
        </div>

        {/* Dashboard Content */}
        <div className="p-6 space-y-8">
          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200 shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-3">Welcome to Your Dashboard!</h2>
            <p className="text-gray-700">
              Here you can get a quick overview of your recent activities, shipments, and important updates.
            </p>
          </div>

          {/* Quick Stats/Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <FaClipboardList className="text-blue-600 text-2xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900">12</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 flex items-center space-x-4">
              <div className="p-3 bg-green-100 rounded-full">
                <FaTruck className="text-green-600 text-2xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Shipments In Transit</p>
                <p className="text-2xl font-bold text-gray-900">3</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 flex items-center space-x-4">
              <div className="p-3 bg-yellow-100 rounded-full">
                <FaShieldAlt className="text-yellow-600 text-2xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Active Policies</p>
                <p className="text-2xl font-bold text-gray-900">2</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 flex items-center space-x-4">
              <div className="p-3 bg-purple-100 rounded-full">
                <FaChartLine className="text-purple-600 text-2xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Recent Activity</p>
                <p className="text-2xl font-bold text-gray-900">5</p>
              </div>
            </div>
          </div>

          {/* Recent Bookings/Shipments Table (Placeholder) */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <FaClipboardList className="mr-3 text-blue-600" /> Recent Bookings
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Booking ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Service Type
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {/* Dummy Rows */}
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">FLM-12345</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">First/Last Mile</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600">In Transit</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">2025-07-15</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹ 1,250</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">INS-67890</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">Insurance</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">Active</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">2025-07-10</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹ 5,000</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">TRN-11223</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">Train Container</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">Delivered</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">2025-07-01</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹ 15,000</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="mt-6 text-center">
              <button
                onClick={() => alert('View all bookings functionality coming soon!')}
                className="px-6 py-2 bg-blue-500 text-white font-semibold rounded-full shadow-md hover:bg-blue-600 transition duration-300"
              >
                View All Bookings
              </button>
            </div>
          </div>

          {/* Other Dashboard Sections (e.g., Notifications, Analytics) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <FaInfoCircle className="mr-3 text-red-500" /> Important Notifications
              </h2>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Your shipment FLM-12345 is expected to arrive within 2 hours.</li>
                <li>New offer available: 10% off on all Air Cargo bookings!</li>
                <li>Please update your KYC documents for seamless customs clearance.</li>
              </ul>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <FaChartLine className="mr-3 text-green-500" /> Usage Analytics
              </h2>
              <p className="text-gray-700">
                Detailed analytics and reports on your shipping patterns will be available here soon.
              </p>
              {/* Placeholder for a chart or graph */}
              <div className="h-40 bg-gray-50 rounded-lg mt-4 flex items-center justify-center text-gray-400">
                [Chart Placeholder]
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
