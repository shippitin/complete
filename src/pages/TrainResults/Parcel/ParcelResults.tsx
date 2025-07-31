// src/components/TrainResults/ParcelResults.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { TrainParcelFormData } from '../../../types/QuoteFormHandle';
import {
  FaBoxOpen, FaClock, FaRupeeSign, FaMapMarkerAlt, FaInfoCircle, FaCalendarAlt} from 'react-icons/fa';

// Define the structure for a freight train result (can be moved to types/TrainResults.ts)
interface FreightTrainResult {
  id: string;
  serviceName: string;
  originStation: string;
  destinationStation: string;
  departureTime: string;
  arrivalTime: string;
  transitTime: string;
  price: number;
  availableCapacity: string; // E.g., "5 Parcels", "200 kg"
  features: string[];
  operator: string;
  status: 'Available' | 'Limited' | 'Full';
}

interface ParcelResultsProps {
  formData: TrainParcelFormData;
}

const ParcelResults: React.FC<ParcelResultsProps> = ({ formData }) => {
  const navigate = useNavigate();

  // --- Dummy Freight Train Results (Generated based on formData) ---
  const generateDummyResults = (data: TrainParcelFormData): FreightTrainResult[] => {
    const basePricePerParcel = 800; // Example base price
    const numParcels = data.parcelCount || 1;

    return [
      {
        id: 'FRT-P-001',
        serviceName: 'Parcel Fast Track',
        originStation: data.origin,
        destinationStation: data.destination,
        departureTime: '07:00 AM',
        arrivalTime: '11:00 AM (Next Day)',
        transitTime: '28 Hours',
        price: basePricePerParcel * numParcels,
        availableCapacity: `${Math.max(numParcels + 10, 20)} Parcels`,
        features: ['Express Delivery', 'Secure Handling'],
        operator: 'Rail Parcel Services',
        status: 'Available',
      },
      {
        id: 'FRT-P-002',
        serviceName: 'Economy Parcel Link',
        originStation: data.origin,
        destinationStation: data.destination,
        departureTime: '09:00 PM',
        arrivalTime: '06:00 PM (Day 3)',
        transitTime: '45 Hours',
        price: basePricePerParcel * numParcels * 0.7, // Cheaper
        availableCapacity: `${Math.max(numParcels + 20, 50)} Parcels`,
        features: ['Cost-Effective', 'Bulk Parcel'],
        operator: 'Indian Railways Parcel',
        status: 'Available',
      },
      {
        id: 'FRT-P-003',
        serviceName: 'Premium Parcel Express',
        originStation: 'Kolkata', // Example fixed origin
        destinationStation: 'Mumbai', // Example fixed destination
        departureTime: '05:00 AM',
        arrivalTime: '09:00 PM (Same Day)',
        transitTime: '16 Hours',
        price: basePricePerParcel * numParcels * 1.5, // Premium price
        availableCapacity: 'Full', // Example of full capacity
        features: ['Priority Shipping', 'Door-to-Door Option'],
        operator: 'Private Parcel Express',
        status: 'Full',
      },
    ];
  };

  const dummyResults = generateDummyResults(formData);

  const handleBookNow = (result: FreightTrainResult) => {
    navigate(`/train-booking/${result.id}`, { state: { selectedResult: result, originalFormData: formData } });
  };

  const getStatusBadgeClass = (status: 'Available' | 'Limited' | 'Full') => {
    switch (status) {
      case 'Available': return 'bg-green-100 text-green-800';
      case 'Limited': return 'bg-yellow-100 text-yellow-800';
      case 'Full': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-4 sm:p-6 bg-gray-50 rounded-b-2xl"> {/* Changed background to gray-50 for consistency */}
      <div className="flex items-center text-gray-800 font-bold text-2xl mb-6"> {/* Changed text color to gray-800 */}
        <FaBoxOpen className="text-4xl mr-3 text-purple-600" /> {/* Icon color specific to Parcel */}
        Parcel Train Search Results
      </div>
      <p className="text-gray-600 text-lg mb-8">
        Showing results for: <span className="font-semibold">{formData.cargoType || 'Any Parcel'}</span> from <span className="font-semibold">{formData.origin}</span> to <span className="font-semibold">{formData.destination}</span> on <span className="font-semibold">{formData.date}</span>.
      </p>

      {dummyResults.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> {/* Responsive grid for cards */}
          {dummyResults.map((result) => (
            <div key={result.id} className="bg-white p-6 rounded-2xl shadow-xl border border-gray-200 flex flex-col justify-between
                                            hover:shadow-2xl hover:transform hover:scale-[1.01] transition-all duration-300 ease-in-out">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center">
                    <FaBoxOpen className="text-purple-600 mr-2" /> {result.serviceName} {/* Icon specific to Parcel */}
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(result.status)}`}>
                    {result.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-4 ml-8">{result.operator}</p>

                <div className="grid grid-cols-2 gap-y-3 mb-6 text-gray-700">
                  <div className="flex items-center">
                    <FaMapMarkerAlt className="text-blue-500 mr-3 text-lg" />
                    <div>
                      <p className="text-sm font-medium">From:</p>
                      <p className="font-semibold">{result.originStation}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <FaMapMarkerAlt className="text-blue-500 mr-3 text-lg" />
                    <div>
                      <p className="text-sm font-medium">To:</p>
                      <p className="font-semibold">{result.destinationStation}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <FaClock className="text-purple-500 mr-3 text-lg" />
                    <div>
                      <p className="text-sm font-medium">Departure:</p>
                      <p className="font-semibold">{result.departureTime}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <FaCalendarAlt className="text-purple-500 mr-3 text-lg" />
                    <div>
                      <p className="text-sm font-medium">Arrival:</p>
                      <p className="font-semibold">{result.arrivalTime}</p>
                    </div>
                  </div>
                  <div className="flex items-center col-span-2">
                    <FaClock className="text-orange-500 mr-3 text-lg" />
                    <div>
                      <p className="text-sm font-medium">Transit:</p>
                      <p className="font-semibold">{result.transitTime}</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-4">
                  <div className="flex items-center">
                    <FaBoxOpen className="text-gray-500 mr-2 text-xl" />
                    <span className="text-lg font-semibold text-gray-800">{result.availableCapacity}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-blue-700 flex items-center">
                      <FaRupeeSign className="text-2xl mr-1" />{result.price.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Book Now Button */}
              <div className="mt-6">
                <button
                  onClick={() => handleBookNow(result)}
                  className={`w-full py-3 px-6 rounded-full text-white font-bold text-lg shadow-lg transition duration-300 ease-in-out
                              ${result.status === 'Full' ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 transform hover:scale-105'}`}
                  disabled={result.status === 'Full'}
                >
                  {result.status === 'Full' ? 'Fully Booked' : 'Book Now'}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 text-gray-500">
          <FaInfoCircle className="text-5xl mb-4 mx-auto text-gray-400" />
          <p className="text-xl font-semibold">No parcel train services found for your criteria.</p>
          <p className="mt-2">Please try adjusting your search parameters.</p>
        </div>
      )}
    </div>
  );
};

export default ParcelResults;
