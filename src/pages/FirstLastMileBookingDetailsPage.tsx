// src/pages/FirstLastMileBookingDetailsPage.tsx
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  FaUser, FaBuilding, FaEnvelope, FaPhone, FaArrowLeft, FaInfoCircle,
  FaRupeeSign, FaClipboardList, FaShieldAlt, FaFileAlt, FaArrowRight,
  FaTruck} from 'react-icons/fa';

// Import necessary types
import type { FirstLastMileFormData, FirstLastMileServiceResult } from '../types/QuoteFormHandle';

// Define the structure for BookingDetails to be passed to BookingConfirmationPage
// This must match the interface in BookingConfirmationPage.tsx
interface BookingDetailsForConfirmation {
  bookingType: 'First/Last Mile'; // Explicitly 'First/Last Mile' for this page
  selectedResult: FirstLastMileServiceResult; // Specific to First/Last Mile
  originalFormData: FirstLastMileFormData; // Specific to First/Last Mile
  contactDetails: {
    fullName: string;
    email: string;
    phone: string;
    companyName: string;
    gstin: string;
    kycDocType: string;
    specialInstructions: string;
  };
  bookingDate: string;
  bookingTime: string;
  bookingId: string;
}

interface FirstLastMileBookingDetailsPageProps {
  // Props will be passed via location.state
}

const FirstLastMileBookingDetailsPage: React.FC<FirstLastMileBookingDetailsPageProps> = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Retrieve data passed from FirstLastMileResultsPage (hypothetical)
  const selectedResult = location.state?.selectedResult as FirstLastMileServiceResult | undefined;
  const originalFormData = location.state?.originalFormData as FirstLastMileFormData | undefined;

  // State for contact and KYC details
  const [contactPersonName, setContactPersonName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [gstin, setGstin] = useState('');
  const [kycDocType, setKycDocType] = useState('Select Document Type'); // Default for select
  const [specialInstructions, setSpecialInstructions] = useState('');

  // Options for KYC Document Type
  const kycDocOptions = [
    'Select Document Type',
    'Passport',
    'Aadhaar Card',
    'Driving License',
    'PAN Card',
    'Other'
  ];

  // State for Add-on Options (e.g., insurance, express handling)
  const [insuranceRequired, setInsuranceRequired] = useState<boolean>(false);
  const [expressHandling, setExpressHandling] = useState<boolean>(false);

  // Handle form submission
  const handleFinalConfirmBooking = () => {
    // Basic validation
    if (!contactPersonName || !contactEmail || !contactPhone) {
      alert('Please fill in Full Name, Email, and Phone Number to confirm booking.');
      return;
    }
    if (!selectedResult || !originalFormData) {
      alert('Booking details are missing. Please go back to search results.');
      return;
    }

    // Construct the final booking details object to pass to confirmation page
    const now = new Date();
    const bookingDate = now.toLocaleDateString('en-IN'); // Format as per BookingConfirmationPage
    const bookingTime = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }); // HH:MM
    const bookingId = `FLM-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`; // Simple dummy ID

    const bookingDetailsToSend: BookingDetailsForConfirmation = {
      bookingType: 'First/Last Mile',
      selectedResult: selectedResult,
      originalFormData: originalFormData,
      contactDetails: {
        fullName: contactPersonName,
        email: contactEmail,
        phone: contactPhone,
        companyName: companyName || '', // Use empty string for optional fields if not provided
        gstin: gstin || '',
        kycDocType: kycDocType === 'Select Document Type' ? '' : kycDocType,
        specialInstructions: specialInstructions || '',
      },
      bookingDate: bookingDate,
      bookingTime: bookingTime,
      bookingId: bookingId,
    };

    // Navigate to confirmation page
    navigate('/booking-confirmation', { state: { bookingDetails: bookingDetailsToSend } });
  };

  // If no data is passed, redirect back or show an error
  if (!selectedResult || !originalFormData) {
    return (
      <div className="min-h-screen bg-gray-100 p-4 sm:p-6 flex flex-col items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center">
          <FaInfoCircle className="text-red-500 text-6xl mb-4 mx-auto" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Booking details missing.</h2>
          <p className="text-gray-600 mb-6">Please go back to search results and select a service.</p>
          <button
            onClick={() => navigate('/first-last-mile-results')} // Navigate back to First/Last Mile results (hypothetical)
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full shadow-md transition duration-300"
          >
            <FaArrowLeft className="inline-block mr-2" /> Back to Results
          </button>
        </div>
      </div>
    );
  }

  // Helper function to render a detail row with label and value

  // Calculate total amount for order summary
  const subtotal = selectedResult.price; // The price is the base cost for First/Last Mile
  const taxesAndFees = subtotal * 0.18; // Example: 18% GST/taxes
  const insuranceCost = insuranceRequired ? subtotal * 0.03 : 0; // Example: 3% of price for insurance
  const expressHandlingCost = expressHandling ? 150 : 0; // Example: fixed cost for express handling
  const totalAmount = subtotal + taxesAndFees + insuranceCost + expressHandlingCost;

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 flex flex-col items-center">
      <div className="w-full max-w-7xl bg-white rounded-2xl shadow-xl">
        {/* Header */}
        <div className="bg-blue-600 text-white p-6 rounded-t-2xl flex items-center justify-between">
          <h1 className="text-3xl font-bold">Complete Your First/Last Mile Booking</h1>
          <button
            onClick={() => navigate(-1)} // Go back to previous page (results)
            className="flex items-center px-4 py-2 bg-blue-700 hover:bg-blue-800 rounded-full text-sm font-semibold transition duration-200"
          >
            <FaArrowLeft className="mr-2" /> Back to Results
          </button>
        </div>

        {/* Step Indicators */}
        <div className="flex justify-around mb-8 text-center p-6 border-b border-gray-200 bg-white">
          <div className="flex-1 text-gray-400">
            <div className="w-10 h-10 mx-auto mb-2 rounded-full flex items-center justify-center border-2 border-gray-300 bg-gray-50">
              1
            </div>
            Search Results
          </div>
          <div className="flex-1 text-blue-600 font-bold">
            <div className="w-10 h-10 mx-auto mb-2 rounded-full flex items-center justify-center border-2 border-blue-600 bg-blue-100">
              2
            </div>
            Contact & KYC Details
          </div>
          <div className="flex-1 text-gray-400">
            <div className="w-10 h-10 mx-auto mb-2 rounded-full flex items-center justify-center border-2 border-gray-300 bg-gray-50">
              3
            </div>
            Payment & Confirmation
          </div>
        </div>

        {/* Main Content Area: Two Columns (Details and Summary) */}
        <div className="flex flex-col md:flex-row gap-6 p-4 sm:p-6">
          {/* Left Column: Booking Flow Content */}
          <div className="w-full md:flex-grow">
            {/* Selected First/Last Mile Service Summary */}
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-200 shadow-md mb-6">
              <h2 className="text-xl font-bold text-blue-800 mb-4 flex items-center">
                <FaTruck className="text-blue-600 mr-3 text-2xl" /> Selected First/Last Mile Service
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-gray-700">
                <div><strong>Service Name:</strong> {selectedResult.serviceName}</div>
                <div><strong>Provider:</strong> {selectedResult.provider}</div>
                <div><strong>Estimated Time:</strong> {selectedResult.estimatedTime}</div>
                <div><strong>Origin:</strong> {originalFormData.origin}</div>
                <div><strong>Destination:</strong> {originalFormData.destination}</div>
                <div><strong>Date:</strong> {originalFormData.date}</div>
                <div><strong>Cargo Type:</strong> {originalFormData.cargoType}</div>
                <div><strong>Weight:</strong> {originalFormData.weight} KG</div>
                <div><strong>Dimensions:</strong> {originalFormData.dimensions} CM</div>
                <div><strong>Vehicle Type:</strong> {originalFormData.vehicleType}</div>
                <div className="md:col-span-2"><strong>Delivery Instructions:</strong> {originalFormData.deliveryInstructions || 'N/A'}</div>
                <div className="md:col-span-2 text-2xl font-bold text-blue-700 flex items-center mt-2">
                  <FaRupeeSign className="text-xl mr-1" />Price: {selectedResult.price.toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            {/* Contact & KYC Details Section */}
            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <FaUser className="text-blue-500 mr-3 text-3xl" /> Contact & KYC Details
            </h3>
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 mb-8">
              <p className="text-gray-600 mb-4">Please provide the contact and KYC details for this booking.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
                <div>
                  <label htmlFor="contactPersonName" className="block text-sm font-medium text-gray-700 mb-1">Contact Person Name</label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaUser className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="contactPersonName"
                      className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-2"
                      placeholder="Full Name"
                      value={contactPersonName}
                      onChange={(e) => setContactPersonName(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaEnvelope className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      id="contactEmail"
                      className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-2"
                      placeholder="your.email@example.com"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaPhone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      id="contactPhone"
                      className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-2"
                      placeholder="+91-XXXXXXXXXX"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">Company Name (Optional)</label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaBuilding className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="companyName"
                      className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-2"
                      placeholder="Your Company Name"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="gstin" className="block text-sm font-medium text-gray-700 mb-1">GST Number (Optional)</label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaClipboardList className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="gstin"
                      className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-2"
                      placeholder="GSTIN (e.g., 22AAAAA0000A1Z5)"
                      value={gstin}
                      onChange={(e) => setGstin(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="kycDocType" className="block text-sm font-medium text-gray-700 mb-1">KYC Document Type (Optional)</label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaFileAlt className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      id="kycDocType"
                      className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-2"
                      value={kycDocType}
                      onChange={(e) => setKycDocType(e.target.value)}
                    >
                      {kycDocOptions.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="specialInstructions" className="block text-sm font-medium text-gray-700 mb-1">Special Instructions (Optional)</label>
                  <textarea
                    id="specialInstructions"
                    rows={3}
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2"
                    placeholder="Any specific delivery instructions, handling notes, etc."
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Additional Services Option (e.g., secondary insurance, value-added services) */}
            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <FaShieldAlt className="text-blue-500 mr-3 text-3xl" /> Additional Services
            </h3>
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 mb-8">
              <div className="mb-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={insuranceRequired}
                    onChange={(e) => setInsuranceRequired(e.target.checked)}
                    className="form-checkbox h-5 w-5 text-blue-600 rounded mr-3"
                  />
                  <span className="text-lg font-semibold text-gray-800">
                    Add Cargo Insurance (Optional)
                  </span>
                </label>
                <p className="text-sm text-gray-500 mt-1 ml-8">
                  Protect your cargo against loss or damage during transit.
                </p>
              </div>
              <div className="mb-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={expressHandling}
                    onChange={(e) => setExpressHandling(e.target.checked)}
                    className="form-checkbox h-5 w-5 text-blue-600 rounded mr-3"
                  />
                  <span className="text-lg font-semibold text-gray-800">
                    Express Handling (Optional)
                  </span>
                </label>
                <p className="text-sm text-gray-500 mt-1 ml-8">
                  Expedite your shipment for faster processing.
                </p>
              </div>
            </div>

            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <FaInfoCircle className="text-blue-500 mr-3 text-3xl" /> Important Information
            </h3>
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 mb-8 text-gray-700 text-sm">
                <ul className="list-disc list-inside space-y-2">
                    <li>Please review all submitted details carefully before proceeding.</li>
                    <li>Ensure all contact and KYC information is accurate to avoid delays.</li>
                    <li>Review the terms and conditions for cargo handling, cancellation, and changes.</li>
                    <li>Any discrepancies may lead to booking cancellation or additional charges.</li>
                </ul>
            </div>

            <div className="flex justify-center mt-8">
              <button
                onClick={handleFinalConfirmBooking}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-10 rounded-full shadow-lg text-xl transition duration-300 transform hover:scale-105 flex items-center"
              >
                Confirm Booking <FaArrowRight className="ml-2" />
              </button>
            </div>
          </div>

          {/* Right Column: Order Summary (Fixed Position) */}
          <div className="w-full md:w-72 lg:w-80 flex-shrink-0">
            <div className="sticky top-4 bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200">Order Summary</h3>
              <div className="text-gray-700">
                {/* Base Price */}
                <div className="flex items-center justify-between py-1">
                  <div className="flex items-center">
                    <FaRupeeSign className="text-blue-500 mr-2 text-sm" />
                    <span className="text-base">Base Price:</span>
                  </div>
                  <span className="font-semibold text-base whitespace-nowrap">INR {subtotal.toLocaleString('en-IN')}</span>
                </div>
                {/* Taxes & Fees */}
                <div className="flex items-center justify-between py-1">
                  <div className="flex items-center">
                    <FaRupeeSign className="text-blue-500 mr-2 text-sm" />
                    <span className="text-base">Taxes & Fees (18%):</span>
                  </div>
                  <span className="font-semibold text-base whitespace-nowrap">INR {taxesAndFees.toLocaleString('en-IN')}</span>
                </div>
                {/* Insurance */}
                <div className="flex items-center justify-between py-1">
                  <div className="flex items-center">
                    <FaRupeeSign className="text-blue-500 mr-2 text-sm" />
                    <span className="text-base">Insurance:</span>
                  </div>
                  <span className="font-semibold text-base whitespace-nowrap">
                    {insuranceRequired ? `INR ${insuranceCost.toLocaleString('en-IN')}` : 'N/A'}
                  </span>
                </div>
                {/* Express Handling */}
                <div className="flex items-center justify-between py-1">
                  <div className="flex items-center">
                    <FaRupeeSign className="text-blue-500 mr-2 text-sm" />
                    <span className="text-base">Express Handling:</span>
                  </div>
                  <span className="font-semibold text-base whitespace-nowrap">
                    {expressHandling ? `INR ${expressHandlingCost.toLocaleString('en-IN')}` : 'N/A'}
                  </span>
                </div>
                {/* Total Amount */}
                <div className="border-t border-gray-300 pt-3 mt-3 flex justify-between items-baseline text-xl font-bold text-blue-700">
                  <span className="flex-grow">Total Amount:</span>
                  <span className="text-right whitespace-nowrap flex-shrink-0">
                    INR {totalAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-4">
                *Prices are indicative and subject to change based on final booking details.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FirstLastMileBookingDetailsPage;