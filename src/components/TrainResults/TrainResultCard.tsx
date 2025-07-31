// src/components/TrainResults/TrainResultCard.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaTrain, FaClock, FaRupeeSign, FaBoxOpen, FaMapMarkerAlt, FaCalendarAlt, FaCube
} from 'react-icons/fa';

// Import the FreightTrainResult type
import type { FreightTrainResult, AllFormData } from '../../types/QuoteFormHandle';

interface TrainResultCardProps {
  result: FreightTrainResult;
  originalFormData: AllFormData; // Pass the original form data for "Book Now" navigation
  bookingType: string; // To determine the main icon and color theme
}

const TrainResultCard: React.FC<TrainResultCardProps> = ({ result, originalFormData, bookingType }) => {
  const navigate = useNavigate();

  const handleBookNow = () => {
    // Navigate to the TrainBookingDetailsPage, passing the selected result and original form data
    navigate(`/train-booking/${result.id}`, { state: { selectedResult: result, originalFormData: originalFormData } });
  };

  const getStatusBadgeClass = (status: 'Available' | 'Limited' | 'Full') => {
    switch (status) {
      case 'Available': return 'bg-green-100 text-green-800';
      case 'Limited': return 'bg-yellow-100 text-yellow-800';
      case 'Full': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMainIconAndColor = (type: string) => {
    switch (type) {
      case 'Train Goods Booking': return { icon: FaTrain, color: 'text-green-700' };
      case 'Train Container Booking': return { icon: FaCube, color: 'text-blue-700' };
      case 'Train Parcel Booking': return { icon: FaBoxOpen, color: 'text-purple-700' };
      default: return { icon: FaTrain, color: 'text-gray-700' };
    }
  };

  const { icon: MainIcon, color: mainColor } = getMainIconAndColor(bookingType);

  // Helper component for detail rows to ensure consistent alignment
  const DetailItem: React.FC<{ icon: React.ElementType; label: string; value: string }> = ({ icon: Icon, label, value }) => (
    <div className="flex items-center">
      <Icon className="text-gray-500 mr-3 text-lg flex-shrink-0" />
      <div className="flex flex-col flex-grow">
        <p className="text-sm font-medium text-gray-600">{label}:</p>
        <p className="font-semibold text-gray-800 whitespace-nowrap overflow-hidden text-ellipsis">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-200 flex flex-col justify-between
                    hover:shadow-2xl hover:transform hover:scale-[1.01] transition-all duration-300 ease-in-out">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900 flex items-center">
            <MainIcon className={`${mainColor} mr-2`} /> {result.serviceName}
          </h3>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(result.status)}`}>
            {result.status}
          </span>
        </div>
        <p className="text-sm text-gray-600 mb-4 ml-8">{result.operator}</p>

        <div className="grid grid-cols-2 gap-y-3 mb-6 text-gray-700">
          <DetailItem icon={FaMapMarkerAlt} label="From" value={result.originStation} />
          <DetailItem icon={FaMapMarkerAlt} label="To" value={result.destinationStation} />
          <DetailItem icon={FaClock} label="Departure" value={result.departureTime} />
          <DetailItem icon={FaCalendarAlt} label="Arrival" value={result.arrivalTime} />
          <DetailItem icon={FaClock} label="Transit" value={result.transitTime} />
          {/* Capacity is now part of the main price row for better grouping */}
        </div>

        <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200"> {/* Added border-top for separation */}
          <div className="flex items-center">
            {/* Display relevant icon based on booking type for capacity */}
            {bookingType === 'Train Goods Booking' && <FaTrain className="text-gray-500 mr-2 text-xl" />}
            {bookingType === 'Train Container Booking' && <FaCube className="text-gray-500 mr-2 text-xl" />}
            {bookingType === 'Train Parcel Booking' && <FaBoxOpen className="text-gray-500 mr-2 text-xl" />}
            <span className="text-lg font-semibold text-gray-800">{result.availableCapacity}</span>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-blue-800 flex items-center">
              <FaRupeeSign className="text-2xl mr-1" />{result.price.toLocaleString('en-IN')}
            </p>
          </div>
        </div>
      </div>

      {/* Book Now Button */}
      <div className="mt-6">
        <button
          onClick={handleBookNow}
          className={`w-full py-3 px-6 rounded-full text-white font-bold text-lg shadow-lg transition duration-300 ease-in-out
                      ${result.status === 'Full' ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-700 hover:bg-blue-800 transform hover:scale-105'}`}
          disabled={result.status === 'Full'}
        >
          {result.status === 'Full' ? 'Fully Booked' : 'Book Now'}
        </button>
      </div>
    </div>
  );
};

export default TrainResultCard;
