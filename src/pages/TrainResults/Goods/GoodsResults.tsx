// src/pages/TrainResults/Goods/GoodsResults.tsx
import React from 'react';
import TrainResultCard from '../../../components/TrainResults/TrainResultCard'; // Import the reusable card component
import type { TrainGoodsFormData } from '../../../types/QuoteFormHandle';
import {
  FaTrain, FaInfoCircle, FaBolt // Added FaBolt for the offer banner
} from 'react-icons/fa';

// Define the structure for a freight train result (can be moved to types/QuoteFormHandle.ts)
interface FreightTrainResult {
  id: string;
  serviceName: string;
  originStation: string;
  destinationStation: string;
  departureTime: string;
  arrivalTime: string;
  transitTime: string;
  price: number;
  availableCapacity: string;
  features: string[];
  operator: string;
  status: 'Available' | 'Limited' | 'Full'; // Added status for visual cues
}

interface GoodsResultsProps {
  formData: TrainGoodsFormData;
}

const GoodsResults: React.FC<GoodsResultsProps> = ({ formData }) => {

  // --- Dummy Freight Train Results (Generated based on formData) ---
  const generateDummyResults = (data: TrainGoodsFormData): FreightTrainResult[] => {
    const basePricePerWagon = 50000; // Example base price
    const numWagons = data.numberOfWagons || 1;

    return [
      {
        id: 'FRT-G-001',
        serviceName: 'Express Freight 101',
        originStation: data.origin,
        destinationStation: data.destination,
        departureTime: '10:00 AM',
        arrivalTime: '10:00 AM (Next Day)',
        transitTime: '24 hrs',
        price: basePricePerWagon * numWagons,
        availableCapacity: `${Math.max(numWagons + 5, 10)} Wagons`,
        features: ['High Speed', 'GPS Tracking'],
        operator: 'Indian Railways',
        status: 'Available',
      },
      {
        id: 'FRT-G-002',
        serviceName: 'Standard Freight Carrier',
        originStation: data.origin,
        destinationStation: data.destination,
        departureTime: '04:00 PM',
        arrivalTime: '04:00 PM (Day 2)',
        transitTime: '48 hrs',
        price: basePricePerWagon * numWagons * 0.8,
        availableCapacity: `${Math.max(numWagons + 10, 20)} Wagons`,
        features: ['Cost-Effective', 'Bulk Capacity'],
        operator: 'Private Freight Logistics',
        status: 'Limited', // Example of limited availability
      },
      {
        id: 'FRT-G-003',
        serviceName: 'Northern Freight',
        originStation: 'Lucknow', // Example fixed origin for a specific service
        destinationStation: 'Chandigarh', // Example fixed destination
        departureTime: '09:00 PM',
        arrivalTime: '03:00 PM (Next Day)',
        transitTime: '18 Hours',
        price: basePricePerWagon * numWagons * 1.1,
        availableCapacity: 'Full', // Example of full capacity
        features: ['Priority Service', 'Real-time Updates'],
        operator: 'Indian Railways',
        status: 'Full',
      },
      {
        id: 'FRT-G-004',
        serviceName: 'Southern Rail Express',
        originStation: data.origin,
        destinationStation: data.destination,
        departureTime: '06:00 AM',
        arrivalTime: '08:00 AM (Day 3)',
        transitTime: '50 hrs',
        price: basePricePerWagon * numWagons * 0.9,
        availableCapacity: `${Math.max(numWagons + 7, 15)} Wagons`,
        features: ['Reliable', 'Heavy Load'],
        operator: 'National Rail Freight',
        status: 'Available',
      },
    ];
  };

  const dummyResults = generateDummyResults(formData);

  return (
    <div>
      <div className="flex items-center text-gray-800 font-bold text-2xl mb-6">
        <FaTrain className="text-4xl mr-3 text-green-600" />
        Cargo Train Search Results
      </div>
      <p className="text-gray-600 text-lg mb-8">
        Showing results for: <span className="font-semibold">{formData.cargoType || 'Any Cargo'}</span> from <span className="font-semibold">{formData.origin}</span> to <span className="font-semibold">{formData.destination}</span> on <span className="font-semibold">{formData.date}</span>.
      </p>

      {/* NEW: Limited Offer Banner */}
      <div className="bg-blue-100 border border-blue-200 rounded-xl p-4 mb-8 flex items-center shadow-md">
        <FaBolt className="text-blue-600 text-3xl mr-4" />
        <div>
          <h4 className="font-bold text-blue-800 text-lg">Limited Offer!</h4>
          <p className="text-blue-700 text-sm">Book today and get 10% off on your next freight booking.</p>
        </div>
      </div>

      {dummyResults.length > 0 ? (
        <div className="grid grid-cols-1 gap-6"> {/* Changed to single column grid */}
          {dummyResults.map((result) => (
            <TrainResultCard
              key={result.id}
              result={result}
              originalFormData={formData}
              bookingType="Train Goods Booking" // Pass the specific booking type
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 text-gray-500">
          <FaInfoCircle className="text-5xl mb-4 mx-auto text-gray-400" />
          <p className="text-xl font-semibold">No freight train services found for your criteria.</p>
          <p className="mt-2">Please try adjusting your search parameters.</p>
        </div>
      )}
    </div>
  );
};

export default GoodsResults;
