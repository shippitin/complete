// src/pages/ProfilePage.tsx
import React, { useState } from 'react';
import MyProfileForm from '../components/Profile/MyProfileForm';
import MyShipments from '../components/Profile/MyShipments';
import BillingPayments from '../components/Profile/BillingPayments';
import MyDocuments from '../components/Profile/MyDocuments';
import ResetPassword from '../components/Profile/ResetPassword';
import LoggedInDevices from '../components/Profile/LoggedInDevices';
import Settings from '../components/Profile/Settings';

const ProfilePage: React.FC = () => {
  const [activeSection, setActiveSection] = useState('profile'); // Default to 'profile'

  const renderSection = () => {
    switch (activeSection) {
      case 'shipments':
        return <MyShipments />;
      case 'billing':
        return <BillingPayments />;
      case 'documents':
        return <MyDocuments />;
      case 'reset':
        return <ResetPassword />;
      case 'devices':
        return <LoggedInDevices />;
      case 'settings':
        return <Settings />;
      default:
        return <MyProfileForm />;
    }
  };

  // Helper function to determine if a sidebar link is active
  const isActive = (sectionName: string) => activeSection === sectionName;

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-800">
      {/* Top Navigation / Breadcrumbs - Mimicking MMT */}
      <div className="bg-white py-3 px-6 border-b border-gray-200">
        <div className="max-w-7xl mx-auto flex justify-between items-center text-sm text-gray-600">
          <span>Home &gt; My Account</span> {/* */}
          {/* Right side can have other elements if needed, removed travel-specific ones */}
        </div>
      </div>

      {/* Main Content Area: Sidebar + Dynamic Section */}
      <div className="max-w-7xl mx-auto flex py-6 sm:py-8 lg:py-10">
        {/* Left Sidebar Navigation */}
        <div className="w-64 bg-white rounded-lg shadow-md border border-gray-200 mr-6 p-4">
          <ul className="space-y-2">
            <li className="mb-4">
              {/* Profile image/info area */}
              <div className="flex items-center p-2">
                <div className="bg-green-100 p-2 rounded-full mr-3">
                  <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <div className="font-bold text-lg">Shippitin</div>
                  <div className="text-sm text-gray-600">+91-8056226175</div>
                  {/* You can add an email here or a link to add it if not present */}
                  <a href="#" className="text-blue-600 text-sm hover:underline">Add Email Address</a>
                </div>
              </div>
            </li>

            {/* Navigation Buttons */}
            <li>
              <button
                onClick={() => setActiveSection('profile')}
                className={`flex items-center w-full text-left px-3 py-2 rounded-md font-semibold text-sm transition-colors duration-200
                  ${isActive('profile') ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50 text-gray-700'}`}
              >
                <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                My Profile
                {isActive('profile') && <span className="ml-auto bg-red-500 rounded-full w-2 h-2"></span>} {/* Red dot for active section */}
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveSection('shipments')}
                className={`flex items-center w-full text-left px-3 py-2 rounded-md text-sm transition-colors duration-200
                  ${isActive('shipments') ? 'bg-blue-50 text-blue-700 font-semibold' : 'hover:bg-gray-50 text-gray-700'}`}
              >
                <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 6.707A1 1 0 015.586 7H4zm0 2v8h12V7H4zm3 4a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
                My Shipments
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveSection('billing')}
                className={`flex items-center w-full text-left px-3 py-2 rounded-md text-sm transition-colors duration-200
                  ${isActive('billing') ? 'bg-blue-50 text-blue-700 font-semibold' : 'hover:bg-gray-50 text-gray-700'}`}
              >
                <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17.555 17.06A2 2 0 0115.535 15H14a1 1 0 00-1-1h-2a1 1 0 00-1 1h-.535a2 2 0 01-1.99 2.06L5 18V8a2 2 0 012-2h6a2 2 0 012 2v10l-1.445-.94z" />
                </svg>
                Billing & Payments
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveSection('documents')}
                className={`flex items-center w-full text-left px-3 py-2 rounded-md text-sm transition-colors duration-200
                  ${isActive('documents') ? 'bg-blue-50 text-blue-700 font-semibold' : 'hover:bg-gray-50 text-gray-700'}`}
              >
                <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0113 3.414L16.586 7A2 2 0 0117 8.414V16a2 2 0 01-2 2H5a2 2 0 01-2-2V4zm5 2V3.5L14.5 9H10a1 1 0 01-1-1V6z" clipRule="evenodd" />
                </svg>
                My Documents
              </button>
            </li>

            <li className="border-t border-gray-200 mt-2 pt-2">
              <button
                onClick={() => setActiveSection('reset')}
                className={`flex items-center w-full text-left px-3 py-2 rounded-md text-sm transition-colors duration-200
                  ${isActive('reset') ? 'bg-blue-50 text-blue-700 font-semibold' : 'hover:bg-gray-50 text-gray-700'}`}
              >
                <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2h2a2 2 0 012 2v5a2 2 0 01-2 2H3a2 2 0 01-2-2v-5a2 2 0 012-2h2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                Reset Password
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveSection('devices')}
                className={`flex items-center w-full text-left px-3 py-2 rounded-md text-sm transition-colors duration-200
                  ${isActive('devices') ? 'bg-blue-50 text-blue-700 font-semibold' : 'hover:bg-gray-50 text-gray-700'}`}
              >
                <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zm0 2h10v10H5V5zm4 7a1 1 0 10-2 0 1 1 0 002 0zm4 0a1 1 0 10-2 0 1 1 0 002 0z" />
                </svg>
                Logged in Devices
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveSection('settings')}
                className={`flex items-center w-full text-left px-3 py-2 rounded-md text-sm transition-colors duration-200
                  ${isActive('settings') ? 'bg-blue-50 text-blue-700 font-semibold' : 'hover:bg-gray-50 text-gray-700'}`}
              >
                <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.707-10.293a1 1 0 00-1.414-1.414L7.5 9.086V7a1 1 0 10-2 0v3a1 1 0 001 1h3a1 1 0 100-2h-1.586l.293-.293z" clipRule="evenodd" />
                </svg>
                Settings
              </button>
            </li>
            <li>
              <button
                onClick={() => localStorage.clear()} // Example logout action, replace with actual logout
                className="flex items-center w-full text-left px-3 py-2 rounded-md text-red-500 hover:bg-gray-50 hover:underline text-sm transition-colors duration-200"
              >
                <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                </svg>
                Logout
              </button>
            </li>
          </ul>
        </div>

        {/* Dynamic Content Area */}
        <div className="flex-1">
          {renderSection()}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;