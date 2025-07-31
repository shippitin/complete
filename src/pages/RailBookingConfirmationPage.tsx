// src/pages/RailBookingConfirmationPage.tsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaPhone, FaBuilding, FaFileAlt, FaCreditCard, FaMoneyBillWave, FaArrowLeft, FaCheckCircle, FaRupeeSign, FaTrain, FaCube, FaBoxOpen, FaClipboardList, FaShieldAlt, FaIdCard, FaMapMarkerAlt, FaUpload } from 'react-icons/fa';
import type { AllFormData, FreightTrainResult, BookingType, TrainContainerFormData } from '../types/QuoteFormHandle';

interface RailBookingConfirmationPageProps {
  // Props are now received via useLocation().state
}

const RailBookingConfirmationPage: React.FC<RailBookingConfirmationPageProps> = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<AllFormData | null>(null);
  const [selectedTrainResult, setSelectedTrainResult] = useState<FreightTrainResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // KYC Form States
  const [companyName, setCompanyName] = useState('');
  const [gstin, setGstin] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [pan, setPan] = useState('');
  const [tan, setTan] = useState('');
  const [aadhaar, setAadhaar] = useState('');
  const [landline, setLandline] = useState('');
  const [fax, setFax] = useState('');
  const [cpda, setCpda] = useState('');
  const [gstAddress, setGstAddress] = useState('');
  const [companyRegCert, setCompanyRegCert] = useState<string | null>(null); // Stores file name
  const [requestLetter, setRequestLetter] = useState<string | null>(null); // Stores file name
  const [customerType, setCustomerType] = useState('');
  const [insuranceRequired, setInsuranceRequired] = useState<boolean>(false); // Initialized from state

  // State for active KYC tab
  const [activeTab, setActiveTab] = useState<'basic' | 'additional' | 'documents'>('basic');

  useEffect(() => {
    const state = location.state as {
      formData: AllFormData;
      selectedTrainResult: FreightTrainResult;
      initialInsuranceRequired: boolean;
    } | undefined;

    if (state && state.formData && state.selectedTrainResult) {
      setFormData(state.formData);
      setSelectedTrainResult(state.selectedTrainResult);
      setInsuranceRequired(state.initialInsuranceRequired); // Set insurance from passed state
      setLoading(false);
    } else {
      setError("Booking details not found. Please go back to service selection.");
      setLoading(false);
    }
  }, [location.state]);

  // Calculate total amount dynamically
  const calculateTotalAmount = () => {
    if (!selectedTrainResult) return 0;
    let total = selectedTrainResult.price || 0;
    if (insuranceRequired) {
      total += (selectedTrainResult.price || 0) * 0.01; // 1% of base price for insurance
    }
    return total;
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<string | null>>) => {
    if (event.target.files && event.target.files.length > 0) {
      setter(event.target.files[0].name); // Store file name for display
    } else {
      setter(null);
    }
  };

  const handleSubmitBooking = (e: React.FormEvent) => {
    e.preventDefault();
    // Basic validation for required fields across all tabs
    if (!companyName || !gstin || !email || !mobile || !customerType) {
      alert('Please fill in all required fields (Name, GSTIN, Email, Mobile, Customer Type).');
      // Set active tab to 'basic' if essential fields are missing
      if (!companyName || !gstin || !email || !mobile || !customerType) setActiveTab('basic');
      return;
    }

    // Generate a simple booking ID (for simulation)
    const bookingId = `TRN-${Date.now().toString().slice(-6)}`;
    const bookingDate = new Date().toLocaleDateString('en-IN');
    const bookingTime = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    const finalBookingDetails = {
      selectedResult: selectedTrainResult!,
      originalFormData: formData!,
      kycDetails: { // Updated to match new KYC fields
        companyName, gstin, email, mobile, pan, tan, aadhaar, landline, fax, cpda, gstAddress,
        companyRegCert, requestLetter, customerType
      },
      bookingDate,
      bookingTime,
      bookingId,
      finalAmount: calculateTotalAmount(),
      insuranceRequired,
    };

    // Store in sessionStorage for persistence across refreshes
    sessionStorage.setItem('lastBookingDetails', JSON.stringify(finalBookingDetails));

    // Navigate to the BookingConfirmationPage with the details
    navigate('/booking-confirmation', { state: { bookingDetails: finalBookingDetails } });
  };

  // Determine main icon and color based on original booking type for the header
  const getMainIconAndColor = (type: BookingType | undefined) => { // Type can be undefined initially
    switch (type) {
      case 'Train Goods Booking': return { icon: FaTrain, color: 'text-green-600' };
      case 'Train Container Booking': return { icon: FaCube, color: 'text-blue-600' };
      case 'Train Parcel Booking': return { icon: FaBoxOpen, color: 'text-purple-600' };
      default: return { icon: FaTrain, color: 'text-gray-600' };
    }
  };
  const { icon: MainIcon, color: mainColor } = getMainIconAndColor(formData?.bookingType);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <p className="text-xl text-gray-700">Loading booking confirmation...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10 bg-white shadow-md rounded-xl border border-red-200 text-center">
        <h3 className="text-2xl font-bold text-red-600 mb-4">Error</h3>
        <p className="text-gray-700 mb-6">{error}</p>
        <button
          onClick={() => navigate('/train-service-details', { state: { formData: formData, selectedTrainResult: selectedTrainResult } })}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-full shadow-md transition duration-300"
        >
          Go Back to Service Details
        </button>
      </div>
    );
  }

  // Ensure formData and selectedTrainResult are not null before rendering main content
  if (!formData || !selectedTrainResult) {
    return null; // Should be caught by error state, but a safeguard
  }

  const tabClass = (tabName: string) =>
    `px-6 py-3 text-lg font-semibold rounded-t-lg transition-colors duration-200 ${
      activeTab === tabName
        ? 'bg-blue-600 text-white shadow-md'
        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
    }`;

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 sm:px-6 lg:px-8 font-inter">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8">
        {/* Left Column: KYC and Payment Details */}
        <div className="w-full md:flex-grow">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            {/* Back Button */}
            <button
              onClick={() => navigate('/train-service-details', { state: { formData: formData, selectedTrainResult: selectedTrainResult } })}
              className="mb-8 flex items-center text-blue-600 hover:text-blue-800 font-medium transition duration-200 text-lg"
            >
              <FaArrowLeft className="mr-2 text-xl" /> Back to Service Details
            </button>

            <h3 className="text-3xl font-bold text-gray-800 mb-8 flex items-center">
              <MainIcon className={`${mainColor} mr-4 text-4xl`} /> Complete Your Booking
            </h3>
            <p className="text-gray-700 text-lg mb-10">
              Please provide the necessary details to finalize your booking.
            </p>

            <form onSubmit={handleSubmitBooking} className="space-y-10">
              {/* KYC Details Section with Tabs */}
              <div className="bg-gray-50 p-8 rounded-2xl border border-gray-200 shadow-inner">
                <h4 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                  <FaIdCard className="mr-3 text-gray-600 text-3xl" /> KYC Information
                </h4>

                {/* Tab Navigation */}
                <div className="flex border-b border-gray-300 mb-6">
                  <button
                    type="button"
                    onClick={() => setActiveTab('basic')}
                    className={tabClass('basic')}
                  >
                    Basic Info
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('additional')}
                    className={tabClass('additional')}
                  >
                    Additional IDs
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('documents')}
                    className={tabClass('documents')}
                  >
                    Address & Docs
                  </button>
                </div>

                {/* Tab Content */}
                {activeTab === 'basic' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <div>
                      <label htmlFor="companyName" className="block text-base font-semibold text-gray-700 mb-2">Name of the Company/Individual <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        id="companyName"
                        className="w-full p-3.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-200 text-base shadow-sm"
                        placeholder="Enter name of the Company/Individual"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="gstin" className="block text-base font-semibold text-gray-700 mb-2">GSTIN/Unique ID Number <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        id="gstin"
                        className="w-full p-3.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-200 text-base shadow-sm"
                        placeholder="Enter GSTIN/Unique ID Number"
                        value={gstin}
                        onChange={(e) => setGstin(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-base font-semibold text-gray-700 mb-2">Email ID <span className="text-red-500">*</span></label>
                      <input
                        type="email"
                        id="email"
                        className="w-full p-3.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-200 text-base shadow-sm"
                        placeholder="Enter your email id"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="mobile" className="block text-base font-semibold text-gray-700 mb-2">Mobile Number <span className="text-red-500">*</span></label>
                      <input
                        type="tel"
                        id="mobile"
                        className="w-full p-3.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-200 text-base shadow-sm"
                        placeholder="Mobile Number"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label htmlFor="customerType" className="block text-base font-semibold text-gray-700 mb-2">Type of Customer <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <select
                          id="customerType"
                          className="w-full p-3.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-200 text-base shadow-sm appearance-none bg-white pr-10"
                          value={customerType}
                          onChange={(e) => setCustomerType(e.target.value)}
                          required
                        >
                          <option value="">Select</option>
                          <option value="CHA">CHA (Customs House Agent)</option>
                          <option value="Exporter">Exporter</option>
                          <option value="Importer">Importer</option>
                          <option value="Trader">Trader</option>
                          <option value="Others">Others</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-700">
                          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'additional' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <div>
                      <label htmlFor="pan" className="block text-base font-semibold text-gray-700 mb-2">PAN</label>
                      <input
                        type="text"
                        id="pan"
                        className="w-full p-3.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-200 text-base shadow-sm"
                        placeholder="Enter PAN"
                        value={pan}
                        onChange={(e) => setPan(e.target.value)}
                      />
                    </div>
                    <div>
                      <label htmlFor="tan" className="block text-base font-semibold text-gray-700 mb-2">TAN</label>
                      <input
                        type="text"
                        id="tan"
                        className="w-full p-3.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-200 text-base shadow-sm"
                        placeholder="Enter TAN"
                        value={tan}
                        onChange={(e) => setTan(e.target.value)}
                      />
                    </div>
                    <div>
                      <label htmlFor="aadhaar" className="block text-base font-semibold text-gray-700 mb-2">Aadhar Card</label>
                      <input
                        type="text"
                        id="aadhaar"
                        className="w-full p-3.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-200 text-base shadow-sm"
                        placeholder="Enter Aadhaar Card"
                        value={aadhaar}
                        onChange={(e) => setAadhaar(e.target.value)}
                      />
                    </div>
                    <div>
                      <label htmlFor="landline" className="block text-base font-semibold text-gray-700 mb-2">Landline No.</label>
                      <input
                        type="tel"
                        id="landline"
                        className="w-full p-3.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-200 text-base shadow-sm"
                        placeholder="Enter Landline No."
                        value={landline}
                        onChange={(e) => setLandline(e.target.value)}
                      />
                    </div>
                    <div>
                      <label htmlFor="fax" className="block text-base font-semibold text-gray-700 mb-2">Fax No.</label>
                      <input
                        type="text"
                        id="fax"
                        className="w-full p-3.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-200 text-base shadow-sm"
                        placeholder="Enter Fax No."
                        value={fax}
                        onChange={(e) => setFax(e.target.value)}
                      />
                    </div>
                    <div>
                      <label htmlFor="cpda" className="block text-base font-semibold text-gray-700 mb-2">CPDA No. (if applicable)</label>
                      <input
                        type="text"
                        id="cpda"
                        className="w-full p-3.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-200 text-base shadow-sm"
                        placeholder="Enter CPDA No."
                        value={cpda}
                        onChange={(e) => setCpda(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'documents' && (
                  <div className="grid grid-cols-1 gap-y-6">
                    <div>
                      <label htmlFor="gstAddress" className="block text-base font-semibold text-gray-700 mb-2">GST Registered address with state</label>
                      <textarea
                        id="gstAddress"
                        rows={3}
                        className="w-full p-3.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-200 text-base shadow-sm"
                        placeholder="Enter GST Registered address"
                        value={gstAddress}
                        onChange={(e) => setGstAddress(e.target.value)}
                      ></textarea>
                    </div>
                    {/* File Uploads - Simulated */}
                    <div>
                      <label htmlFor="companyRegCert" className="block text-base font-semibold text-gray-700 mb-2">Company Registration Certificate</label>
                      <div className="flex items-center space-x-4">
                        <input
                          type="file"
                          id="companyRegCert"
                          className="hidden"
                          onChange={(e) => handleFileChange(e, setCompanyRegCert)}
                        />
                        <label htmlFor="companyRegCert" className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg shadow-md transition duration-200 flex items-center text-base">
                          <FaUpload className="mr-2" /> Choose File
                        </label>
                        <span className="text-gray-600 text-sm truncate flex-grow">{companyRegCert || 'No file chosen'}</span>
                      </div>
                    </div>
                    <div>
                      <label htmlFor="requestLetter" className="block text-base font-semibold text-gray-700 mb-2">Request letter from the Company</label>
                      <div className="flex items-center space-x-4">
                        <input
                          type="file"
                          id="requestLetter"
                          className="hidden"
                          onChange={(e) => handleFileChange(e, setRequestLetter)}
                        />
                        <label htmlFor="requestLetter" className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg shadow-md transition duration-200 flex items-center text-base">
                          <FaUpload className="mr-2" /> Choose File
                        </label>
                        <span className="text-gray-600 text-sm truncate flex-grow">{requestLetter || 'No file chosen'}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Payment Method Section (Simulated) */}
              <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-xl">
                <h4 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                  <FaCreditCard className="mr-3 text-gray-600 text-3xl" /> Payment Method
                </h4>
                <p className="text-gray-700 text-lg mb-6">Select your preferred payment option.</p>
                <div className="space-y-4">
                  <label className="flex items-center cursor-pointer bg-gray-50 p-4 rounded-lg border border-gray-200 hover:bg-gray-100 transition duration-150 shadow-sm">
                    <input type="radio" name="paymentMethod" value="online" className="form-radio h-5 w-5 text-blue-600 mr-4" defaultChecked />
                    <span className="text-lg font-medium text-gray-800">Online Payment (Credit/Debit Card, Net Banking, UPI)</span>
                  </label>
                  <label className="flex items-center cursor-pointer bg-gray-50 p-4 rounded-lg border border-gray-200 hover:bg-gray-100 transition duration-150 shadow-sm">
                    <input type="radio" name="paymentMethod" value="bankTransfer" className="form-radio h-5 w-5 text-blue-600 mr-4" />
                    <span className="text-lg font-medium text-gray-800">Bank Transfer</span>
                  </label>
                </div>
              </div>

              {/* Final Summary and Confirm Button */}
              <div className="flex justify-center mt-10">
                <button
                  type="submit"
                  className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-bold py-4 px-12 rounded-full shadow-lg text-2xl transition duration-300 transform hover:scale-105 flex items-center"
                >
                  Confirm Booking <FaCheckCircle className="ml-3 text-2xl" />
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Order Summary (Fixed Position) */}
        <div className="w-full md:w-80 lg:w-96 flex-shrink-0">
          <div className="sticky top-10 bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 pb-3 border-b border-gray-200">Order Summary</h3>
            <div className="text-gray-700 text-lg">
              {/* Base Price */}
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center">
                  <FaRupeeSign className="text-blue-500 mr-2 text-base" />
                  <span className="text-lg">Base Price:</span>
                </div>
                <span className="font-semibold text-lg whitespace-nowrap">INR {selectedTrainResult.price.toLocaleString('en-IN')}</span>
              </div>
              {/* Insurance */}
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center">
                  <FaRupeeSign className="text-blue-500 mr-2 text-base" />
                  <span className="text-lg">Insurance:</span>
                </div>
                <span className="font-semibold text-lg whitespace-nowrap">
                  {insuranceRequired ? `INR ${(selectedTrainResult.price * 0.01).toLocaleString('en-IN')}` : 'N/A'}
                </span>
              </div>
              {/* Total Amount */}
              <div className="border-t border-gray-300 pt-4 mt-4 flex justify-between items-baseline text-2xl font-bold text-blue-700">
                <span className="flex-grow">Total Amount:</span>
                <span className="text-right whitespace-nowrap flex-shrink-0">
                  INR {calculateTotalAmount().toLocaleString('en-IN')}
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-6">
              *Prices are indicative and subject to change.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RailBookingConfirmationPage;
