// src/pages/TruckBookingDetailsPage.tsx
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaUser, FaBuilding, FaEnvelope, FaPhone, FaArrowLeft, FaInfoCircle, FaTruck, FaRupeeSign, FaClipboardList, FaShieldAlt, FaFileAlt, FaArrowRight, FaWeight, FaBoxes, FaTag, FaRulerCombined, FaDollarSign, FaMapMarkerAlt, FaCalendarAlt, FaCheckCircle } from 'react-icons/fa'; // Added FaCheckCircle and other icons
import type { TruckFormData } from '../types/QuoteFormHandle'; // Correctly import TruckFormData

// Define the structure for a Truck service offer, matching what's passed from TruckResultsPage
interface TruckServiceOffer {
  id: string;
  serviceProvider: string; // Changed from serviceName to serviceProvider
  pickupPincode: string;
  dropoffPincode: string;
  pickupDate: string; // Ready Date
  transitTime: string;
  price: number;
  loadType: 'PTL' | 'FTL';
  truckType?: 'open' | 'closed' | 'flatbed' | 'reefer'; // Body type
  vehicleType?: 'Bike' | 'Van' | 'Mini Truck' | 'Truck' | '14 ft Truck' | '17 ft Truck' | '20 ft Truck' | '32 ft SXL' | '32 ft MXL' | 'Container Truck' | 'Trailer'; // Specific vehicle type
  features: string[];
  status: 'Available' | 'Limited' | 'Full';
}

const TruckBookingDetailsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Retrieve data passed from TruckResultsPage
  const selectedResult = location.state?.selectedResult as TruckServiceOffer | undefined;
  const originalFormData = location.state?.originalFormData as TruckFormData | undefined; // Correctly type originalFormData

  // State for contact and KYC details
  const [contactPersonName, setContactPersonName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [gstin, setGstin] = useState('');
  const [kycDocType, setKycDocType] = useState('');
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

  // State for Add-on Options (Insurance only)
  // Initialize from formData if it exists, otherwise set default
  const [insuranceRequired, setInsuranceRequired] = useState<boolean>(originalFormData?.insuranceRequired || false);

  // Handle form submission
  const handleFinalConfirmBooking = () => {
    // Basic validation
    if (!contactPersonName || !contactEmail || !contactPhone) {
      console.error('Please fill in Full Name, Email, and Phone Number to confirm booking.'); // Replaced alert
      // In a real app, you'd show a user-friendly modal or inline error message
      return;
    }
    if (!selectedResult || !originalFormData) {
      console.error('Booking details are missing. Please go back to search results.'); // Replaced alert
      return;
    }

    // Construct the final booking details object to pass to confirmation page
    const bookingDetails = {
      selectedResult: { // Map Truck result to a generic structure for confirmation page
        id: selectedResult.id,
        serviceName: selectedResult.serviceProvider, // Using serviceProvider from TruckServiceOffer
        origin: selectedResult.pickupPincode, // Use pickupPincode from TruckServiceOffer
        destination: selectedResult.dropoffPincode, // Use dropoffPincode from TruckServiceOffer
        readyDate: selectedResult.pickupDate, // Use pickupDate from TruckServiceOffer
        transitTime: selectedResult.transitTime,
        price: selectedResult.price,
        loadType: selectedResult.loadType,
        truckType: selectedResult.truckType,
        vehicleType: selectedResult.vehicleType,
        features: selectedResult.features,
        serviceProvider: selectedResult.serviceProvider,
        status: selectedResult.status,
      },
      originalFormData: originalFormData,
      contactDetails: {
        fullName: contactPersonName,
        email: contactEmail,
        phone: contactPhone,
        companyName: companyName || 'N/A',
        gstin: gstin || 'N/A',
        kycDocType: kycDocType || 'N/A',
        specialInstructions: specialInstructions || 'N/A',
      },
      bookingDate: new Date().toLocaleDateString('en-IN'),
      bookingTime: new Date().toLocaleTimeString('en-IN'),
      bookingId: `TRK-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`,
    };

    // Navigate to confirmation page
    navigate('/booking-confirmation', { state: { bookingDetails } });
  };

  // If no data is passed, redirect back or show an error
  if (!selectedResult || !originalFormData) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 flex flex-col items-center justify-center font-inter">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center border border-gray-200">
          <FaInfoCircle className="text-red-500 text-6xl mb-4 mx-auto" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Booking details missing.</h2>
          <p className="text-gray-600 mb-6">Please go back to search results and select a service.</p>
          <button
            onClick={() => navigate('/truck-results')} // Navigate back to Truck results
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl shadow-md transition-all duration-300 transform hover:scale-105"
          >
            <FaArrowLeft className="inline-block mr-2" /> Back to Results
          </button>
        </div>
      </div>
    );
  }

  // Helper function to render a detail row with label and value
  const DetailRow: React.FC<{ label: string; value: string | number | boolean | undefined; icon?: React.ElementType; format?: (val: any) => string; span?: number }> = ({ label, value, icon: Icon, format, span }) => {
    const displayValue = value === true ? 'Yes' : value === false ? 'No' : value === undefined || value === null || value === '' ? 'N/A' : format ? format(value) : String(value);
    return (
      <div className={`flex items-start ${span ? `lg:col-span-${span}` : ''}`}>
        {Icon && <Icon className="mr-2 text-blue-500 mt-1 flex-shrink-0" />}
        <div className="flex justify-between w-full">
          <span className="font-semibold text-gray-700 text-sm flex-shrink-0">{label}:</span>
          <span className="text-gray-800 font-medium text-base text-right whitespace-nowrap ml-2 flex-grow">{displayValue}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 flex flex-col items-center font-inter">
      <div className="w-full max-w-7xl bg-white rounded-2xl shadow-xl">
        {/* Header */}
        <div className="bg-blue-600 text-white p-6 rounded-t-2xl flex items-center justify-between">
          <h1 className="text-3xl font-bold">Complete Your Truck Booking</h1>
          <button
            onClick={() => navigate(-1)} // Go back to previous page (results)
            className="flex items-center px-4 py-2 bg-blue-700 hover:bg-blue-800 rounded-xl text-sm font-semibold transition-all duration-200 transform hover:scale-105"
          >
            <FaArrowLeft className="mr-2" /> Back to Results
          </button>
        </div>

        {/* Step Indicators */}
        <div className="flex justify-around mb-8 text-center p-6 border-b border-gray-200 bg-white">
          <div className="flex-1 text-gray-400"> {/* Previous step is now gray */}
            <div className="w-10 h-10 mx-auto mb-2 rounded-full flex items-center justify-center border-2 border-gray-300 bg-gray-50">
              <FaCheckCircle className="text-green-500" /> {/* Show check for completed step */}
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
            {/* Selected Truck Service Summary */}
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-200 shadow-md mb-6">
              <h2 className="text-xl font-bold text-blue-800 mb-4 flex items-center">
                <FaTruck className="text-blue-600 mr-3 text-2xl" /> Selected Truck Service
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-gray-700">
                <div><strong>Service Name:</strong> {selectedResult.serviceProvider}</div> {/* Use serviceProvider */}
                <div><strong>Carrier:</strong> {selectedResult.serviceProvider}</div> {/* Use serviceProvider */}
                <div><strong>Origin Pincode:</strong> {selectedResult.pickupPincode}</div> {/* Use pickupPincode */}
                <div><strong>Destination Pincode:</strong> {selectedResult.dropoffPincode}</div> {/* Use dropoffPincode */}
                <div><strong>Pickup Date:</strong> {selectedResult.pickupDate}</div> {/* Use pickupDate */}
                <div><strong>Transit Duration:</strong> {selectedResult.transitTime}</div>
                <div><strong>Load Type:</strong> {selectedResult.loadType}</div>
                {selectedResult.truckType && <div><strong>Truck Body Type:</strong> {selectedResult.truckType}</div>}
                {selectedResult.vehicleType && <div><strong>Specific Vehicle Type:</strong> {selectedResult.vehicleType}</div>}
                <div className="md:col-span-2">
                  <strong>Features:</strong> {selectedResult.features.join(', ') || 'N/A'}
                </div>
                <div className="md:col-span-2 text-2xl font-bold text-blue-700 flex items-center mt-2">
                  <FaRupeeSign className="text-xl mr-1" />Price: {selectedResult.price.toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            {/* Original Quote Details Section */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-md mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <FaClipboardList className="text-gray-600 mr-3 text-2xl" /> Original Quote Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-2 text-gray-700">
                <DetailRow label="Pickup Pincode" value={originalFormData.pickupPincode} icon={FaMapMarkerAlt} />
                <DetailRow label="Drop Off Pincode" value={originalFormData.dropoffPincode} icon={FaMapMarkerAlt} />
                <DetailRow label="Pickup Date" value={originalFormData.readyDate} icon={FaCalendarAlt} />
                <DetailRow label="Load Type" value={originalFormData.loadType} icon={FaTruck} />
                <DetailRow label="Number of Trucks" value={originalFormData.numberOfTrucks} icon={FaTruck} />
                <DetailRow label="Cargo Type" value={originalFormData.cargoType} icon={FaBoxes} /> {/* Corrected FaBox to FaBoxes */}
                <DetailRow label="Gross Weight" value={originalFormData.totalWeight} icon={FaWeight} format={(val) => `${val} Kgs`} />
                <DetailRow label="No. of Pieces" value={originalFormData.numberOfPieces} icon={FaBoxes} />
                <DetailRow label="Dimensions" value={originalFormData.dimensions} icon={FaRulerCombined} />
                <DetailRow label="Product Declared Value" value={originalFormData.cargoValue} icon={FaDollarSign} format={(val) => `INR ${val ? val.toLocaleString('en-IN') : 'N/A'}`} />
                <DetailRow label="Truck Body Type" value={originalFormData.truckType} icon={FaTruck} />
                <DetailRow label="Specific Vehicle Type" value={originalFormData.vehicleType} icon={FaTruck} />
                <DetailRow label="Hazardous Cargo" value={originalFormData.hazardousCargo} icon={FaInfoCircle} />
                <DetailRow label="Insurance Required" value={originalFormData.insuranceRequired} icon={FaShieldAlt} />
                <DetailRow label="Special Instructions" value={originalFormData.specialInstructions} icon={FaFileAlt} span={3} />
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
                      {kycDocOptions.map(option => (
                        <option key={option} value={option === 'Select Document Type' ? '' : option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Special Instructions for Booking */}
              <div className="mt-4">
                <label htmlFor="bookingSpecialInstructions" className="block text-sm font-medium text-gray-700 mb-1">Special Instructions for Booking (Optional)</label>
                <textarea
                  id="bookingSpecialInstructions"
                  rows={3}
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2"
                  placeholder="Any specific delivery instructions, handling notes, etc."
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                ></textarea>
              </div>

              {/* Add-on Options: Insurance */}
              <div className="mt-6 border-t pt-4 border-gray-200">
                <h4 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
                  <FaShieldAlt className="mr-2 text-blue-500" /> Add-on Options
                </h4>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="insuranceAddon"
                    checked={insuranceRequired}
                    onChange={(e) => setInsuranceRequired(e.target.checked)}
                    className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="insuranceAddon" className="ml-3 block text-base text-gray-900">
                    Cargo Insurance Required (Optional)
                  </label>
                </div>
                <p className="text-sm text-gray-500 mt-1 ml-8">
                  Protect your cargo against loss or damage during transit.
                </p>
              </div>
            </div>

            {/* Final Confirmation Button */}
            <div className="flex justify-end mt-8">
              <button
                onClick={handleFinalConfirmBooking}
                className="flex items-center px-8 py-4 bg-green-600 text-white font-bold text-xl rounded-xl shadow-lg
                           hover:bg-green-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-300"
              >
                Confirm Booking & Proceed to Payment <FaArrowRight className="ml-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TruckBookingDetailsPage;
