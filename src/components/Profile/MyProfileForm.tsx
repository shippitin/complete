// src/components/Profile/MyProfileForm.tsx
import React, { useState, useEffect } from 'react';
// Assuming you have a CSS Module for input styles, as in previous iterations
// If you don't have it, you can define these inline or in a global CSS file
import styles from '../../pages/ProfilePage.module.css'; // Adjust path if needed

// Define the shape of your form data, specific to logistics professionals
interface LogisticsUserProfileData {
  firstName: string;
  lastName: string;
  companyName: string;
  cityOfResidence: string;
  state: string;

  // Contact Details
  email: string;
  mobileNumber: string;

  // Business & Compliance
  gstNumber: string;
  panNumber: string;
  companyRegistrationId: string;
  address: string;

  // Logistics Preferences
  preferredShipmentMode: string;
  usualCargoType: string;
  preferredLoadSize: string;

  // Carrier/Service Provider Specific
  carrierLicenseNumber: string;
}

const MyProfileForm: React.FC = () => {
  const [form, setForm] = useState<LogisticsUserProfileData>({
    firstName: 'Shippitin', // Initial value for display
    lastName: 'User',
    companyName: 'Shippitin Logistics',
    cityOfResidence: 'Guntur', // Based on current location in context
    state: 'Andhra Pradesh', // Based on current location in context

    email: '',
    mobileNumber: '+91-8056226175',

    gstNumber: '',
    panNumber: '',
    companyRegistrationId: '',
    address: '',

    preferredShipmentMode: '',
    usualCargoType: '',
    preferredLoadSize: '',

    carrierLicenseNumber: '',
  });

  useEffect(() => {
    // Simulate fetching existing data
    const simulatedFetchedData: Partial<LogisticsUserProfileData> = {
      // Data that might be loaded from an API
    };
    setForm((prev) => ({ ...prev, ...simulatedFetchedData }));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Profile Saved:', form);
    alert('✅ Profile updated successfully!');
    // Implement your actual save logic (e.g., API call)
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200">
      <div className="px-6 py-6 sm:px-8 sm:py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
          <button
            type="submit"
            onClick={handleSubmit}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md font-semibold text-sm border border-gray-300 hover:bg-gray-200 transition-colors"
          >
            SAVE
          </button>
        </div>

        {/* "Complete your profile" banner */}
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-3 rounded-md flex items-center justify-between text-sm mb-6">
          <div className="flex items-center">
            <span className="font-bold mr-2">30%</span>
            <span>Complete your profile. Share your Email ID to receive booking updates and other critical information.</span>
          </div>
          <button className="text-blue-600 hover:underline font-semibold">Add Email</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* General Information Section */}
          <section className="pb-6 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-800 mb-4">General Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
              <div>
                <label htmlFor="firstName" className="block text-gray-600 text-sm mb-1">First Name</label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={form.firstName}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="First Name"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-gray-600 text-sm mb-1">Last Name</label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={form.lastName}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="Last Name"
                />
              </div>
              <div>
                <label htmlFor="companyName" className="block text-gray-600 text-sm mb-1">Company / Business Name</label>
                <input
                  id="companyName"
                  name="companyName"
                  type="text"
                  value={form.companyName}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="Company / Business Name"
                />
              </div>
              <div>
                <label htmlFor="cityOfResidence" className="block text-gray-600 text-sm mb-1">City of Residence</label>
                <input
                  id="cityOfResidence"
                  name="cityOfResidence"
                  type="text"
                  value={form.cityOfResidence}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="City of Residence"
                />
              </div>
              <div>
                <label htmlFor="state" className="block text-gray-600 text-sm mb-1">State</label>
                <input
                  id="state"
                  name="state"
                  type="text"
                  value={form.state}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="State"
                />
                <p className="text-xs text-gray-500 mt-1">Required for GST purpose on your tax invoice</p>
              </div>
            </div>
          </section>

          {/* Contact Details Section */}
          <section className="pb-6 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Contact Details</h2>
            <p className="text-sm text-gray-600 mb-4">Add contact information to receive booking details & other alerts</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <label htmlFor="mobileNumber" className="block text-gray-600 text-sm mb-1">Mobile Number</label>
                <div className="relative">
                  <input
                    id="mobileNumber"
                    name="mobileNumber"
                    type="tel"
                    value={form.mobileNumber}
                    onChange={handleChange}
                    className={`${styles.input} ${styles.readOnlyInput}`}
                    placeholder="+91-XXXXXXXXXX"
                    readOnly
                  />
                  {form.mobileNumber && (
                    <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>
              <div>
                <label htmlFor="email" className="block text-gray-600 text-sm mb-1">Email Address</label>
                <div className="relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="E.g., your.email@example.com"
                  />
                  {!form.email && (
                    <button className="absolute right-0 top-0 h-full px-4 text-blue-600 hover:underline font-semibold text-sm">
                      ADD EMAIL ID
                    </button>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Business & Compliance Section */}
          <section className="pb-6 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Business & Compliance</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
              <div>
                <label htmlFor="gstNumber" className="block text-gray-600 text-sm mb-1">GST Number</label>
                <input
                  id="gstNumber"
                  name="gstNumber"
                  type="text"
                  value={form.gstNumber}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="GST Number"
                />
              </div>
              <div>
                <label htmlFor="panNumber" className="block text-gray-600 text-sm mb-1">PAN Number</label>
                <input
                  id="panNumber"
                  name="panNumber"
                  type="text"
                  value={form.panNumber}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="PAN Number"
                />
                <p className="text-xs text-gray-500 mt-1">NOTE: Your PAN No. will only be used for international bookings as per RBI Guidelines</p>
              </div>
              <div>
                <label htmlFor="companyRegistrationId" className="block text-gray-600 text-sm mb-1">Company Registration ID</label>
                <input
                  id="companyRegistrationId"
                  name="companyRegistrationId"
                  type="text"
                  value={form.companyRegistrationId}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="Company Registration ID"
                />
              </div>
              <div className="md:col-span-2 lg:col-span-3">
                <label htmlFor="address" className="block text-gray-600 text-sm mb-1">Business Address</label>
                <textarea
                  id="address"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  className={`${styles.input} min-h-[80px] resize-y`}
                  placeholder="Enter full business address, building name, etc."
                />
              </div>
            </div>
          </section>

          {/* Logistics Preferences Section */}
          <section className="pb-6 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Logistics Preferences</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
              <div>
                <label htmlFor="preferredShipmentMode" className="block text-gray-600 text-sm mb-1">Preferred Shipment Mode</label>
                <select
                  id="preferredShipmentMode"
                  name="preferredShipmentMode"
                  value={form.preferredShipmentMode}
                  onChange={handleChange}
                  className={`${styles.input} ${styles.selectInput}`}
                >
                  <option value="">Select Mode</option>
                  <option value="Road">Road Freight</option>
                  <option value="Rail">Rail Freight</option>
                  <option value="Air">Air Freight</option>
                  <option value="Sea">Sea Freight</option>
                </select>
              </div>
              <div>
                <label htmlFor="usualCargoType" className="block text-gray-600 text-sm mb-1">Usual Cargo Type</label>
                <input
                  id="usualCargoType"
                  name="usualCargoType"
                  type="text"
                  value={form.usualCargoType}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="E.g., FMCG, Pharma"
                />
              </div>
              <div>
                <label htmlFor="preferredLoadSize" className="block text-gray-600 text-sm mb-1">Preferred Load Size</label>
                <input
                  id="preferredLoadSize"
                  name="preferredLoadSize"
                  type="text"
                  value={form.preferredLoadSize}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="E.g., FTL, LCL etc."
                />
              </div>
            </div>
          </section>

          {/* Carrier/Service Provider Specific Details (Optional, based on user role) */}
          <section className="pb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Carrier/Service Provider Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
              <div>
                <label htmlFor="carrierLicenseNumber" className="block text-gray-600 text-sm mb-1">Carrier License No.</label>
                <input
                  id="carrierLicenseNumber"
                  name="carrierLicenseNumber"
                  type="text"
                  value={form.carrierLicenseNumber}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="E.g., A123B456C789"
                />
              </div>
            </div>
          </section>
          
          {/* Main "Save Profile" Button at the bottom */}
          <div className="flex justify-center pt-8">
            <button
              type="submit"
              className="bg-blue-600 text-white py-2 px-6 rounded-md font-semibold hover:bg-blue-700 transition-colors shadow"
            >
              Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MyProfileForm;