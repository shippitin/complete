// src/components/TrainResults/ParcelResults.tsx
import React from 'react';
import TrainResultCard from './TrainResultCard'; // Import the new reusable card component
import type { TrainParcelFormData } from '../../types/QuoteFormHandle'; // Corrected import path
import {
  FaBoxOpen, FaInfoCircle
} from 'react-icons/fa';

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

  return (
    // Removed outer div with styling, as TrainResultsPage now handles main layout
    <div>
      <div className="flex items-center text-gray-800 font-bold text-2xl mb-6">
        <FaBoxOpen className="text-4xl mr-3 text-purple-600" />
        Parcel Train Search Results
      </div>
      <p className="text-gray-600 text-lg mb-8">
        Showing results for: <span className="font-semibold">{formData.cargoType || 'Any Parcel'}</span> from <span className="font-semibold">{formData.origin}</span> to <span className="font-semibold">{formData.destination}</span> on <span className="font-semibold">{formData.date}</span>.
      </p>

      {dummyResults.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {dummyResults.map((result) => (
            <TrainResultCard
              key={result.id}
              result={result}
              originalFormData={formData}
              bookingType="Train Parcel Booking" // Pass the specific booking type
            />
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
