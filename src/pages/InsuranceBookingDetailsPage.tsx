// src/pages/InsuranceBookingDetailsPage.tsx
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaUser, FaBuilding, FaEnvelope, FaPhone, FaArrowLeft, FaInfoCircle, FaRupeeSign, FaClipboardList, FaShieldAlt, FaFileAlt, FaArrowRight } from 'react-icons/fa';
import type { InsuranceFormData } from '../types/QuoteFormHandle';
import { bookingAPI } from '../services/api';

const InsuranceBookingDetailsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

const selectedResult = location.state?.selectedResult as any;
const originalFormData = location.state?.originalFormData as any;

  const [contactPersonName, setContactPersonName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [gstin, setGstin] = useState('');
  const [kycDocType, setKycDocType] = useState('Select Document Type');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [additionalInsuranceRequired, setAdditionalInsuranceRequired] = useState(false);
  const [loading, setLoading] = useState(false);

  const kycDocOptions = ['Select Document Type', 'Passport', 'Aadhaar Card', 'Driving License', 'PAN Card', 'Other'];

  const subtotal = selectedResult?.premium || 0;
  const taxesAndFees = subtotal * 0.18;
  const additionalInsuranceCost = additionalInsuranceRequired ? subtotal * 0.05 : 0;
  const totalAmount = subtotal + taxesAndFees + additionalInsuranceCost;

  const handleFinalConfirmBooking = async () => {
    if (!contactPersonName || !contactEmail || !contactPhone) {
      alert('Please fill in Full Name, Email, and Phone Number to confirm booking.');
      return;
    }
    if (!selectedResult || !originalFormData) {
      alert('Booking details are missing. Please go back to search results.');
      return;
    }

    setLoading(true);

    const bookingId = `INS-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;

    try {
      await bookingAPI.create({
        booking_number: bookingId,
        service_type: 'Insurance',
        origin: (originalFormData as any).origin || 'N/A',
        destination: (originalFormData as any).destination || 'N/A',
        cargo_type: originalFormData.cargoType || 'General',
        weight: originalFormData.weight || 0,
        booking_date: new Date().toISOString().split('T')[0],
        estimated_price: totalAmount,
        special_instructions: specialInstructions,
        status: 'confirmed',
      });
    } catch (error) {
      console.error('Failed to save booking:', error);
    } finally {
      setLoading(false);
    }

    const bookingDetails = {
      bookingType: 'Insurance',
      selectedResult,
      originalFormData,
      kycDetails: {
        companyName: companyName || 'N/A',
        gstin: gstin || 'N/A',
        mobile: contactPhone,
        email: contactEmail,
      },
      bookingDate: new Date().toLocaleDateString('en-IN'),
      bookingTime: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      bookingId,
      finalAmount: totalAmount,
    };

    navigate('/booking-confirmation', { state: { bookingDetails } });
  };

  if (!selectedResult || !originalFormData) {
    return (
      <div className="min-h-screen bg-gray-100 p-4 sm:p-6 flex flex-col items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center">
          <FaInfoCircle className="text-red-500 text-6xl mb-4 mx-auto" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Booking details missing.</h2>
          <p className="text-gray-600 mb-6">Please go back to search results and select a service.</p>
          <button onClick={() => navigate('/insurance-results')} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full shadow-md transition duration-300">
            <FaArrowLeft className="inline-block mr-2" /> Back to Results
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 flex flex-col items-center">
      <div className="w-full max-w-7xl bg-white rounded-2xl shadow-xl">
        <div className="bg-blue-600 text-white p-6 rounded-t-2xl flex items-center justify-between">
          <h1 className="text-3xl font-bold">Complete Your Insurance Booking</h1>
          <button onClick={() => navigate(-1)} className="flex items-center px-4 py-2 bg-blue-700 hover:bg-blue-800 rounded-full text-sm font-semibold transition duration-200">
            <FaArrowLeft className="mr-2" /> Back to Results
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-6 p-4 sm:p-6">
          <div className="w-full md:flex-grow">

            <div className="bg-blue-50 p-6 rounded-xl border border-blue-200 shadow-md mb-6">
              <h2 className="text-xl font-bold text-blue-800 mb-4 flex items-center">
                <FaShieldAlt className="text-lime-600 mr-3 text-2xl" /> Selected Insurance Policy
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-gray-700">
                <div><strong>Policy:</strong> {selectedResult.policyName}</div>
                <div><strong>Provider:</strong> {selectedResult.provider}</div>
                <div><strong>Coverage:</strong> {originalFormData.coverageType}</div>
                <div><strong>Cargo Type:</strong> {originalFormData.cargoType}</div>
                <div><strong>Weight:</strong> {originalFormData.weight} KG</div>
                <div><strong>Insurance Value:</strong> ${originalFormData.insuranceValue?.toLocaleString('en-US')}</div>
                <div className="md:col-span-2 text-2xl font-bold text-blue-700 flex items-center mt-2">
                  <FaRupeeSign className="text-xl mr-1" />Premium: {selectedResult.premium.toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <FaUser className="text-blue-500 mr-3 text-3xl" /> Contact & KYC Details
            </h3>
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person Name</label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><FaUser className="h-5 w-5 text-gray-400" /></div>
                    <input type="text" className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-2" placeholder="Full Name" value={contactPersonName} onChange={e => setContactPersonName(e.target.value)} required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><FaEnvelope className="h-5 w-5 text-gray-400" /></div>
                    <input type="email" className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-2" placeholder="your.email@example.com" value={contactEmail} onChange={e => setContactEmail(e.target.value)} required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><FaPhone className="h-5 w-5 text-gray-400" /></div>
                    <input type="tel" className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-2" placeholder="+91-XXXXXXXXXX" value={contactPhone} onChange={e => setContactPhone(e.target.value)} required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company Name (Optional)</label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><FaBuilding className="h-5 w-5 text-gray-400" /></div>
                    <input type="text" className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-2" placeholder="Your Company Name" value={companyName} onChange={e => setCompanyName(e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">GST Number (Optional)</label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><FaClipboardList className="h-5 w-5 text-gray-400" /></div>
                    <input type="text" className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-2" placeholder="GSTIN" value={gstin} onChange={e => setGstin(e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">KYC Document Type (Optional)</label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><FaFileAlt className="h-5 w-5 text-gray-400" /></div>
                    <select className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-2" value={kycDocType} onChange={e => setKycDocType(e.target.value)}>
                      {kycDocOptions.map(option => <option key={option} value={option}>{option}</option>)}
                    </select>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Special Instructions (Optional)</label>
                  <textarea rows={3} className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2" placeholder="Any specific instructions." value={specialInstructions} onChange={e => setSpecialInstructions(e.target.value)} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 mb-8">
              <label className="flex items-center cursor-pointer">
                <input type="checkbox" checked={additionalInsuranceRequired} onChange={e => setAdditionalInsuranceRequired(e.target.checked)} className="form-checkbox h-5 w-5 text-blue-600 rounded mr-3" />
                <div>
                  <span className="text-lg font-semibold text-gray-800">Add Secondary Cargo Insurance</span>
                  <p className="text-sm text-gray-500">Enhance your protection with an additional layer of insurance.</p>
                </div>
              </label>
            </div>

            <div className="flex justify-center mt-8">
              <button
                onClick={handleFinalConfirmBooking}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-10 rounded-full shadow-lg text-xl transition duration-300 flex items-center disabled:opacity-50"
              >
                {loading ? <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></span> : null}
                {loading ? 'Saving...' : <><span>Confirm Booking</span><FaArrowRight className="ml-2" /></>}
              </button>
            </div>
          </div>

          <div className="w-full md:w-72 lg:w-80 flex-shrink-0">
            <div className="sticky top-4 bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200">Order Summary</h3>
              <div className="text-gray-700">
                <div className="flex justify-between py-1">
                  <span>Base Premium</span>
                  <span className="font-semibold">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Taxes (18%)</span>
                  <span className="font-semibold">₹{taxesAndFees.toLocaleString('en-IN')}</span>
                </div>
                {additionalInsuranceRequired && (
                  <div className="flex justify-between py-1">
                    <span>Secondary Insurance</span>
                    <span className="font-semibold">₹{additionalInsuranceCost.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="border-t border-gray-300 pt-3 mt-3 flex justify-between items-baseline text-xl font-bold text-blue-700">
                  <span>Total</span>
                  <span>₹{totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-4">*Prices are indicative.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsuranceBookingDetailsPage;
