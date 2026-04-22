// src/components/Profile/MyProfileForm.tsx
import React, { useState, useEffect } from 'react';
import { userAPI } from '../../services/api';

interface LogisticsUserProfileData {
  firstName: string;
  lastName: string;
  companyName: string;
  cityOfResidence: string;
  state: string;
  email: string;
  mobileNumber: string;
  gstNumber: string;
  panNumber: string;
  companyRegistrationId: string;
  address: string;
  preferredShipmentMode: string;
  usualCargoType: string;
  preferredLoadSize: string;
  carrierLicenseNumber: string;
}

const inputClass = "w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";

const MyProfileForm: React.FC = () => {
  const [form, setForm] = useState<LogisticsUserProfileData>({
    firstName: '',
    lastName: '',
    companyName: '',
    cityOfResidence: '',
    state: '',
    email: '',
    mobileNumber: '',
    gstNumber: '',
    panNumber: '',
    companyRegistrationId: '',
    address: '',
    preferredShipmentMode: '',
    usualCargoType: '',
    preferredLoadSize: '',
    carrierLicenseNumber: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await userAPI.getProfile();
        const user = response.data.data;

        // Split full_name into first and last
        const nameParts = (user.full_name || '').split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        setForm({
          firstName,
          lastName,
          companyName: user.company_name || '',
          cityOfResidence: user.city || '',
          state: user.state || '',
          email: user.email || '',
          mobileNumber: user.phone || '',
          gstNumber: user.gstin || '',
          panNumber: '',
          companyRegistrationId: '',
          address: user.address || '',
          preferredShipmentMode: '',
          usualCargoType: '',
          preferredLoadSize: '',
          carrierLicenseNumber: '',
        });
      } catch (error) {
        console.error('Failed to load profile:', error);
        setErrorMessage('Failed to load profile data.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      await userAPI.updateProfile({
        full_name: `${form.firstName} ${form.lastName}`.trim(),
        phone: form.mobileNumber,
        company_name: form.companyName,
        gstin: form.gstNumber,
        address: form.address,
        city: form.cityOfResidence,
        state: form.state,
      });

      setSuccessMessage('✅ Profile updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setErrorMessage('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const profileCompletion = () => {
    const fields = [form.firstName, form.lastName, form.email, form.mobileNumber, form.companyName, form.gstNumber, form.address];
    const filled = fields.filter(Boolean).length;
    return Math.round((filled / fields.length) * 100);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
        <p className="text-gray-600">Loading profile...</p>
      </div>
    );
  }

  const completion = profileCompletion();

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200">
      <div className="px-6 py-6 sm:px-8 sm:py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md font-semibold text-sm border border-gray-300 hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'SAVE'}
          </button>
        </div>

        {/* Success/Error messages */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-800 p-3 rounded-md text-sm mb-4">
            {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-md text-sm mb-4">
            {errorMessage}
          </div>
        )}

        {/* Profile completion banner */}
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-3 rounded-md flex items-center justify-between text-sm mb-6">
          <div className="flex items-center">
            <span className="font-bold mr-2">{completion}%</span>
            <span>Complete your profile. Share your Email ID to receive booking updates and other critical information.</span>
          </div>
          {!form.email && (
            <button className="text-blue-600 hover:underline font-semibold">Add Email</button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* General Information */}
          <section className="pb-6 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-800 mb-4">General Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
              <div>
                <label className="block text-gray-600 text-sm mb-1">First Name</label>
                <input name="firstName" type="text" value={form.firstName} onChange={handleChange} className={inputClass} placeholder="First Name" />
              </div>
              <div>
                <label className="block text-gray-600 text-sm mb-1">Last Name</label>
                <input name="lastName" type="text" value={form.lastName} onChange={handleChange} className={inputClass} placeholder="Last Name" />
              </div>
              <div>
                <label className="block text-gray-600 text-sm mb-1">Company / Business Name</label>
                <input name="companyName" type="text" value={form.companyName} onChange={handleChange} className={inputClass} placeholder="Company / Business Name" />
              </div>
              <div>
                <label className="block text-gray-600 text-sm mb-1">City of Residence</label>
                <input name="cityOfResidence" type="text" value={form.cityOfResidence} onChange={handleChange} className={inputClass} placeholder="City of Residence" />
              </div>
              <div>
                <label className="block text-gray-600 text-sm mb-1">State</label>
                <input name="state" type="text" value={form.state} onChange={handleChange} className={inputClass} placeholder="State" />
                <p className="text-xs text-gray-500 mt-1">Required for GST purpose on your tax invoice</p>
              </div>
            </div>
          </section>

          {/* Contact Details */}
          <section className="pb-6 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Contact Details</h2>
            <p className="text-sm text-gray-600 mb-4">Add contact information to receive booking details & other alerts</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <label className="block text-gray-600 text-sm mb-1">Mobile Number</label>
                <div className="relative">
                  <input name="mobileNumber" type="tel" value={form.mobileNumber} onChange={handleChange} className={inputClass} placeholder="+91-XXXXXXXXXX" readOnly />
                  {form.mobileNumber && (
                    <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-gray-600 text-sm mb-1">Email Address</label>
                <div className="relative">
                  <input name="email" type="email" value={form.email} onChange={handleChange} className={inputClass} placeholder="E.g., your.email@example.com" />
                  {!form.email && (
                    <button type="button" className="absolute right-0 top-0 h-full px-4 text-blue-600 hover:underline font-semibold text-sm">
                      ADD EMAIL ID
                    </button>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Business & Compliance */}
          <section className="pb-6 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Business & Compliance</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
              <div>
                <label className="block text-gray-600 text-sm mb-1">GST Number</label>
                <input name="gstNumber" type="text" value={form.gstNumber} onChange={handleChange} className={inputClass} placeholder="GST Number" />
              </div>
              <div>
                <label className="block text-gray-600 text-sm mb-1">PAN Number</label>
                <input name="panNumber" type="text" value={form.panNumber} onChange={handleChange} className={inputClass} placeholder="PAN Number" />
                <p className="text-xs text-gray-500 mt-1">NOTE: Your PAN No. will only be used for international bookings as per RBI Guidelines</p>
              </div>
              <div>
                <label className="block text-gray-600 text-sm mb-1">Company Registration ID</label>
                <input name="companyRegistrationId" type="text" value={form.companyRegistrationId} onChange={handleChange} className={inputClass} placeholder="Company Registration ID" />
              </div>
              <div className="md:col-span-2 lg:col-span-3">
                <label className="block text-gray-600 text-sm mb-1">Business Address</label>
                <textarea name="address" value={form.address} onChange={handleChange} className={`${inputClass} min-h-[80px] resize-y`} placeholder="Enter full business address" />
              </div>
            </div>
          </section>

          {/* Logistics Preferences */}
          <section className="pb-6 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Logistics Preferences</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
              <div>
                <label className="block text-gray-600 text-sm mb-1">Preferred Shipment Mode</label>
                <select name="preferredShipmentMode" value={form.preferredShipmentMode} onChange={handleChange} className={inputClass}>
                  <option value="">Select Mode</option>
                  <option value="Road">Road Freight</option>
                  <option value="Rail">Rail Freight</option>
                  <option value="Air">Air Freight</option>
                  <option value="Sea">Sea Freight</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-600 text-sm mb-1">Usual Cargo Type</label>
                <input name="usualCargoType" type="text" value={form.usualCargoType} onChange={handleChange} className={inputClass} placeholder="E.g., FMCG, Pharma" />
              </div>
              <div>
                <label className="block text-gray-600 text-sm mb-1">Preferred Load Size</label>
                <input name="preferredLoadSize" type="text" value={form.preferredLoadSize} onChange={handleChange} className={inputClass} placeholder="E.g., FTL, LCL etc." />
              </div>
            </div>
          </section>

          {/* Carrier Details */}
          <section className="pb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Carrier/Service Provider Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
              <div>
                <label className="block text-gray-600 text-sm mb-1">Carrier License No.</label>
                <input name="carrierLicenseNumber" type="text" value={form.carrierLicenseNumber} onChange={handleChange} className={inputClass} placeholder="E.g., A123B456C789" />
              </div>
            </div>
          </section>

          <div className="flex justify-center pt-8">
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 text-white py-2 px-6 rounded-md font-semibold hover:bg-blue-700 transition-colors shadow disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MyProfileForm;
