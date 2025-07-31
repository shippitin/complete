// src/components/TrainBooking/RailCompleteBooking.tsx
import React, { useState, useEffect } from 'react';
import { FaCheckCircle, FaInfoCircle, FaUser, FaArrowRight, FaEnvelope, FaPhone, FaBuilding, FaFileAlt, FaClipboardList, FaShieldAlt, FaRupeeSign, FaTrain, FaCube, FaBoxOpen, FaTimesCircle, FaCreditCard, FaMoneyBillWave, FaArrowLeft } from 'react-icons/fa';
// IMPORTANT: Ensure all necessary form data types are imported from QuoteFormHandle
import type { AllFormData, FreightTrainResult, TrainContainerFormData, TrainGoodsFormData, TrainParcelFormData } from '../../types/QuoteFormHandle';
// IMPORTANT: Ensure this path and filename are correct
import RailPayment from './RailPayment';

interface RailCompleteBookingProps {
  formData: AllFormData;
  selectedTrainResult: FreightTrainResult;
  bookingType: string;
  initialInsuranceRequired: boolean; // Passed from RailServiceDetails
  onBackToServiceDetails: () => void; // Callback to go back to service details
}

const RailCompleteBooking: React.FC<RailCompleteBookingProps> = ({ formData, selectedTrainResult, bookingType, initialInsuranceRequired, onBackToServiceDetails }) => {
  // --- DEBUGGING: Check if this component is rendering ---
  console.log("RailCompleteBooking component is rendering.");
  // --- END DEBUGGING ---

  // State for Contact & KYC Details
  const [contactPersonName, setContactPersonName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [gstin, setGstin] = useState('');
  const [kycDocType, setKycDocType] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');

  // State for Add-on Options (Insurance only)
  const [insuranceRequired, setInsuranceRequired] = useState<boolean>(initialInsuranceRequired);

  // State for validation errors
  const [showValidationMessage, setShowValidationMessage] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');

  // State to control showing the next step: RailPayment
  const [showPayment, setShowPayment] = useState(false);

  // Function to handle proceeding to payment
  const handleProceedToPayment = () => {
    // Basic validation for required fields
    if (!contactPersonName || !contactEmail || !contactPhone) {
      setValidationMessage('Please fill in Full Name, Email, and Phone Number to proceed.');
      setShowValidationMessage(true);
      return;
    }

    // You can gather all data here to pass to the payment component if needed
    const bookingDetails = {
      formData,
      selectedTrainResult,
      contactDetails: {
        fullName: contactPersonName,
        email: contactEmail,
        phone: contactPhone,
        companyName,
        gstin,
        kycDocType,
        specialInstructions,
      },
      insuranceRequired,
      finalPrice: calculateTotalPrice(),
    };

    console.log("Proceeding to Payment with booking details:", bookingDetails);
    setShowPayment(true);
  };

  // Calculate total price dynamically
  const calculateTotalPrice = () => {
    let total = selectedTrainResult.price;
    if (insuranceRequired) {
      total += selectedTrainResult.price * 0.01; // 1% insurance
    }
    return total;
  };

  // Determine main icon and color based on original booking type for the header
  const getMainIconAndColor = (type: string) => {
    switch (type) {
      case 'Train Goods Booking': return { icon: FaTrain, color: 'text-green-600' };
      case 'Train Container Booking': return { icon: FaCube, color: 'text-blue-600' };
      case 'Train Parcel Booking': return { icon: FaBoxOpen, color: 'text-purple-600' };
      default: return { icon: FaTrain, color: 'text-gray-600' };
    }
  };
  const { icon: MainIcon, color: mainColor } = getMainIconAndColor(bookingType);


  // If showPayment is true, render the RailPayment component
  if (showPayment) {
    return (
      <RailPayment
        finalPrice={calculateTotalPrice()}
        onBackToCompleteBooking={() => setShowPayment(false)}
      />
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-6 w-full font-inter">
      {/* Left Column: Booking Flow Content */}
      <div className="w-full md:flex-grow">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          {/* Back Button */}
          <button
            onClick={onBackToServiceDetails}
            className="mb-6 flex items-center text-blue-600 hover:text-blue-800 font-medium transition duration-200"
          >
            <FaArrowLeft className="mr-2" /> Back to Service Details
          </button>

          {/* Step Indicators */}
          <div className="flex justify-around mb-8 text-center">
            <div className={`flex-1 text-blue-600 font-bold`}>
              <div className={`w-10 h-10 mx-auto mb-2 rounded-full flex items-center justify-center border-2 border-blue-600 bg-blue-100`}>
                1
              </div>
              Review Details
            </div>
            <div className={`flex-1 text-blue-600 font-bold`}>
              <div className={`w-10 h-10 mx-auto mb-2 rounded-full flex items-center justify-center border-2 border-blue-600 bg-blue-100`}>
                2
              </div>
              Contact & KYC Details
            </div>
            <div className={`flex-1 text-gray-400`}>
              <div className={`w-10 h-10 mx-auto mb-2 rounded-full flex items-center justify-center border-2 border-gray-300 bg-gray-50`}>
                3
              </div>
              Payment
            </div>
          </div>

          {/* Contact & KYC Details Section */}
          <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <FaUser className="text-blue-500 mr-3 text-3xl" /> Contact & KYC Details
          </h3>
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 mb-8">
            <p className="text-gray-600 mb-4">Please provide the contact and KYC details for this cargo booking.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
              <div>
                <label htmlFor="contactPersonName" className="block text-sm font-medium text-gray-700 mb-1">Contact Person Name<span className="text-red-500">*</span></label>
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
                <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-1">Email Address<span className="text-red-500">*</span></label>
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
                <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number<span className="text-red-500">*</span></label>
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
                    <option value="">Select Document Type</option>
                    <option value="aadhar">Aadhar Card</option>
                    <option value="pan">PAN Card</option>
                    <option value="passport">Passport</option>
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

          {/* Insurance Option */}
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
                  Cargo Insurance Required (Optional)
                </span>
              </label>
              <p className="text-sm text-gray-500 mt-1 ml-8">
                Protect your cargo against loss or damage during transit.
              </p>
            </div>
          </div>

          {/* Important Information */}
          <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <FaInfoCircle className="text-blue-500 mr-3 text-3xl" /> Important Information
          </h3>
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 mb-8 text-gray-700 text-sm">
            <ul className="list-disc list-inside space-y-2">
              <li>Please review all submitted details carefully before proceeding.</li>
              <li>Ensure all contact and KYC information is accurate to avoid delays.</li>
              <li>Review the terms and conditions for cargo handling, cancellation, and changes.</li>
              <li>Any discrepancies may lead to booking cancellation or additional charges.</li>
              <li>For international bookings, customs clearance and duties are subject to local regulations.</li>
            </ul>
          </div>

          <div className="flex justify-center mt-8">
            <button
              onClick={handleProceedToPayment}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-10 rounded-full shadow-lg text-xl transition duration-300 transform hover:scale-105 flex items-center"
            >
              Proceed to Payment <FaArrowRight className="ml-2" />
            </button>
          </div>
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
              <span className="font-semibold text-base whitespace-nowrap">INR {selectedTrainResult.price.toLocaleString('en-IN')}</span>
            </div>
            {/* Insurance */}
            <div className="flex items-center justify-between py-1">
              <div className="flex items-center">
                <FaRupeeSign className="text-blue-500 mr-2 text-sm" />
                <span className="text-base">Insurance:</span>
              </div>
              <span className="font-semibold text-base whitespace-nowrap">
                {insuranceRequired ? `INR ${(selectedTrainResult.price * 0.01).toLocaleString('en-IN')}` : 'N/A'}
              </span>
            </div>
            {/* Total Amount */}
            <div className="border-t border-gray-300 pt-3 mt-3 flex justify-between items-baseline text-xl font-bold text-blue-700">
              <span className="flex-grow">Total Amount:</span>
              <span className="text-right whitespace-nowrap flex-shrink-0">
                INR {calculateTotalPrice().toLocaleString('en-IN')}
              </span>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            *Prices are indicative and subject to change based on final booking details.
          </p>
        </div>
      </div>

      {/* Custom Validation Message Box */}
      {showValidationMessage && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full relative">
            <button
              onClick={() => setShowValidationMessage(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              <FaTimesCircle className="h-6 w-6" />
            </button>
            <div className="flex items-center mb-4">
              <FaInfoCircle className="text-orange-500 h-8 w-8 mr-3" />
              <h4 className="text-xl font-bold text-gray-800">Validation Error</h4>
            </div>
            <p className="text-gray-700 mb-6">{validationMessage}</p>
            <button
              onClick={() => setShowValidationMessage(false)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md w-full"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RailCompleteBooking;
