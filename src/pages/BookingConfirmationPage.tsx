// src/pages/BookingConfirmationPage.tsx
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaClipboardCheck, FaHome, FaHistory, FaInfoCircle, FaTrain, FaUser, FaRupeeSign, FaCalendarAlt, FaClock, FaIdCard, FaMapMarkerAlt, FaFileAlt } from 'react-icons/fa';
// Import types for clarity
import type { FreightTrainResult, AllFormData, TrainContainerFormData, TrainGoodsFormData, TrainParcelFormData } from '../types/QuoteFormHandle';

// Updated BookingDetails interface to match what RailBookingConfirmation passes
interface BookingDetails {
  selectedResult: FreightTrainResult;
  originalFormData: AllFormData;
  kycDetails: { // This structure matches the data sent from RailBookingConfirmationPage
    companyName: string;
    gstin: string;
    email: string;
    mobile: string;
    pan: string;
    tan: string;
    aadhaar: string;
    landline: string;
    fax: string;
    cpda: string;
    gstAddress: string;
    companyRegCert: string | null;
    requestLetter: string | null;
    customerType: string;
  };
  bookingDate: string;
  bookingTime: string;
  bookingId: string;
  finalAmount: number;
  insuranceRequired: boolean;
}

const BookingConfirmationPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Attempt to get details from location.state first
    let details: BookingDetails | undefined = location.state?.bookingDetails;

    if (!details) {
      // If no details from location.state, try to retrieve from sessionStorage
      const storedDetails = sessionStorage.getItem('lastBookingDetails');
      if (storedDetails) {
        try {
          details = JSON.parse(storedDetails);
        } catch (e) {
          console.error("BookingConfirmationPage: Error parsing session storage data:", e);
          sessionStorage.removeItem('lastBookingDetails'); // Clear corrupted data
        }
      }
    }

    if (details) {
      setBookingDetails(details);
      // Store in sessionStorage for persistence across refreshes (if it came from location.state or was already there)
      sessionStorage.setItem('lastBookingDetails', JSON.stringify(details));
    } else {
      console.error("BookingConfirmationPage: No booking details found in state or session storage.");
    }
    setLoading(false); // Set loading to false once data retrieval is attempted
  }, [location.state]); // Depend on location.state to re-run if navigated with new state

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="text-center p-10 bg-white rounded-2xl shadow-xl">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-6"></div>
          <p className="text-2xl text-gray-700 font-semibold">Loading booking confirmation...</p>
        </div>
      </div>
    );
  }

  if (!bookingDetails) {
    return (
      <div className="min-h-screen bg-gray-100 p-4 sm:p-6 flex flex-col items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center border border-red-200">
          <FaInfoCircle className="text-red-500 text-6xl mb-4 mx-auto" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Booking details not found.</h2>
          <p className="text-gray-600 mb-6">It seems like you've navigated directly or refreshed the page. Please go back to the booking process to view your confirmation.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full shadow-md transition duration-300 flex items-center justify-center mx-auto"
          >
            <FaHome className="inline-block mr-2" /> Go to Home
          </button>
        </div>
      </div>
    );
  }

  const { selectedResult, originalFormData, kycDetails, bookingDate, bookingTime, bookingId, finalAmount, insuranceRequired } = bookingDetails;

  // Determine weight based on the specific type of originalFormData
  let displayedWeight: string = 'N/A';
  let displayedCargoType: string = originalFormData.cargoType || 'N/A';

  // Use type guards to safely access properties based on bookingType
  // Note: originalFormData.bookingType is the source of truth for the form type
  if (originalFormData.bookingType === 'Train Container Booking') {
    const trainData = originalFormData as TrainContainerFormData;
    if (trainData.totalWeight !== undefined && trainData.totalWeight !== null) {
      displayedWeight = `${trainData.totalWeight} KG`;
    }
    displayedCargoType = trainData.containerType || 'N/A';
  } else if (originalFormData.bookingType === 'Train Goods Booking') {
    const trainData = originalFormData as TrainGoodsFormData;
    if (trainData.totalWeight !== undefined && trainData.totalWeight !== null) {
      displayedWeight = `${trainData.totalWeight} Tons`;
    }
    displayedCargoType = trainData.wagonType || 'N/A';
  } else if (originalFormData.bookingType === 'Train Parcel Booking') {
    const trainData = originalFormData as TrainParcelFormData;
    if (trainData.totalWeight !== undefined && trainData.totalWeight !== null) {
      displayedWeight = `${trainData.totalWeight} KG`;
    }
    displayedCargoType = 'Parcel';
  } else if (originalFormData.totalWeight !== undefined && originalFormData.totalWeight !== null) {
    // Fallback for other booking types that might use totalWeight
    displayedWeight = `${originalFormData.totalWeight} KG`;
  }


  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 sm:px-6 lg:px-8 font-inter">
      <div className="w-full max-w-5xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-green-600 text-white p-8 rounded-t-2xl flex flex-col items-center justify-center text-center">
          <FaCheckCircle className="text-5xl mb-4" />
          <h1 className="text-4xl font-bold mb-2">Booking Confirmed!</h1>
          <p className="text-xl font-semibold">Your booking has been successfully placed.</p>
        </div>

        <div className="p-8 text-gray-800">
          <div className="text-center mb-10">
            <FaClipboardCheck className="text-green-500 text-8xl mx-auto mb-6" />
            <p className="text-2xl font-semibold mb-3">Your Booking ID:</p>
            <p className="text-4xl font-extrabold text-green-700 tracking-wide">{bookingId}</p>
            <p className="text-lg text-gray-600 mt-4 flex items-center justify-center">
              <FaCalendarAlt className="mr-2 text-xl" /> Booked on {bookingDate} <span className="mx-3">|</span> <FaClock className="mr-2 text-xl" /> {bookingTime}
            </p>
          </div>

          {/* Booking Summary Details (Train Specific) */}
          <div className="bg-blue-50 p-8 rounded-2xl border border-blue-200 shadow-md mb-10">
            <h2 className="text-2xl font-bold text-blue-800 mb-6 flex items-center">
              <FaTrain className="text-blue-600 mr-3 text-3xl" /> Train Booking Summary
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-lg">
              <div className="flex justify-between">
                <span className="font-semibold">Service Name:</span> <span className="text-right">{selectedResult.serviceName}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Origin:</span> <span className="text-right">{selectedResult.originStation}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Destination:</span> <span className="text-right">{selectedResult.destinationStation}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Transit:</span> <span className="text-right">{selectedResult.transitDuration}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Cargo Type:</span> <span className="text-right">{displayedCargoType}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Weight:</span> <span className="text-right">{displayedWeight}</span>
              </div>
              <div className="flex justify-between md:col-span-2">
                <span className="font-semibold">Price:</span> <span className="text-right"><FaRupeeSign className="inline-block text-base mr-1" />{selectedResult.price.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between md:col-span-2">
                <span className="font-semibold">Insurance:</span> <span className="text-right">{insuranceRequired ? `Yes (included in total)` : 'No'}</span>
              </div>
              <div className="md:col-span-2 text-3xl font-extrabold text-blue-700 flex items-center justify-end mt-4">
                <FaRupeeSign className="text-2xl mr-1" />Total Amount: {finalAmount.toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          {/* KYC Details Summary */}
          <div className="bg-purple-50 p-8 rounded-2xl border border-purple-200 shadow-md mb-10">
            <h2 className="text-2xl font-bold text-purple-800 mb-6 flex items-center">
              <FaUser className="text-purple-600 mr-3 text-3xl" /> Your KYC Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-lg">
              <div className="flex justify-between">
                <span className="font-semibold">Company/Individual Name:</span> <span className="text-right">{kycDetails.companyName || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">GSTIN/Unique ID:</span> <span className="text-right">{kycDetails.gstin || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Email:</span> <span className="text-right">{kycDetails.email || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Mobile:</span> <span className="text-right">{kycDetails.mobile || 'N/A'}</span>
              </div>
              {kycDetails.pan && <div className="flex justify-between"><span className="font-semibold">PAN:</span> <span className="text-right">{kycDetails.pan}</span></div>}
              {kycDetails.tan && <div className="flex justify-between"><span className="font-semibold">TAN:</span> <span className="text-right">{kycDetails.tan}</span></div>}
              {kycDetails.aadhaar && <div className="flex justify-between"><span className="font-semibold">Aadhar Card:</span> <span className="text-right">{kycDetails.aadhaar}</span></div>}
              {kycDetails.landline && <div className="flex justify-between"><span className="font-semibold">Landline No.:</span> <span className="text-right">{kycDetails.landline}</span></div>}
              {kycDetails.fax && <div className="flex justify-between"><span className="font-semibold">Fax No.:</span> <span className="text-right">{kycDetails.fax}</span></div>}
              {kycDetails.cpda && <div className="flex justify-between"><span className="font-semibold">CPDA No.:</span> <span className="text-right">{kycDetails.cpda}</span></div>}
              {kycDetails.gstAddress && <div className="md:col-span-2 flex justify-between"><span className="font-semibold">GST Address:</span> <span className="text-right">{kycDetails.gstAddress}</span></div>}
              <div className="flex justify-between">
                <span className="font-semibold">Customer Type:</span> <span className="text-right">{kycDetails.customerType || 'N/A'}</span>
              </div>
              {kycDetails.companyRegCert && <div className="flex justify-between"><span className="font-semibold">Company Reg. Cert.:</span> <span className="text-right">{kycDetails.companyRegCert}</span></div>}
              {kycDetails.requestLetter && <div className="flex justify-between"><span className="font-semibold">Request Letter:</span> <span className="text-right">{kycDetails.requestLetter}</span></div>}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-6 mt-10">
            <button
              onClick={() => navigate('/')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-10 rounded-full shadow-lg transition duration-300 transform hover:scale-105 flex items-center justify-center text-xl"
            >
              <FaHome className="mr-3 text-2xl" /> Go to Home
            </button>
            <button
              onClick={() => alert('View My Bookings functionality not yet implemented.')} // Placeholder for now
              className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-4 px-10 rounded-full shadow-lg transition duration-300 transform hover:scale-105 flex items-center justify-center text-xl"
            >
              <FaHistory className="mr-3 text-2xl" /> View My Bookings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmationPage;
