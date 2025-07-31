// src/components/TrainResults/InternationalContainerResults.tsx
import React from 'react';
import TrainResultCard from '../../../components/TrainResults/TrainResultCard'; // Corrected import path for TrainResultCard
import type { TrainContainerFormData } from '../../../types/QuoteFormHandle'; // Corrected import path for QuoteFormHandle
import {
  FaCube, FaInfoCircle
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
  availableCapacity: string;
  features: string[];
  operator: string;
  status: 'Available' | 'Limited' | 'Full';
}

interface InternationalContainerResultsProps {
  formData: TrainContainerFormData;
}

const InternationalContainerResults: React.FC<InternationalContainerResultsProps> = ({ formData }) => {

  // --- Dummy Freight Train Results (Generated based on formData) ---
  const generateDummyResults = (data: TrainContainerFormData): FreightTrainResult[] => {
    const basePricePerContainer = 120000; // Example base price for international
    const numContainers = data.numberOfContainers || 1;

    return [
      {
        id: 'FRT-C-I-001',
        serviceName: 'Global Rail Link Express',
        originStation: data.origin,
        destinationStation: data.destination,
        departureTime: '05:00 AM',
        arrivalTime: '09:00 PM (Day 5)',
        transitTime: '5 Days',
        price: basePricePerContainer * numContainers,
        availableCapacity: `${Math.max(numContainers + 2, 4)} Containers`,
        features: ['Customs Support', 'End-to-End Tracking'],
        operator: 'International Freight Rail',
        status: 'Available',
      },
      {
        id: 'FRT-C-I-002',
        serviceName: 'Trans-Continental Cargo',
        originStation: data.origin,
        destinationStation: data.destination,
        departureTime: '11:00 AM',
        arrivalTime: '03:00 PM (Day 7)',
        transitTime: '7 Days',
        price: basePricePerContainer * numContainers * 0.9,
        availableCapacity: `${Math.max(numContainers + 4, 8)} Containers`,
        features: ['Bulk International', 'Cost-Optimized'],
        operator: 'Global Rail Logistics',
        status: 'Limited',
      },
      {
        id: 'FRT-C-I-003',
        serviceName: 'Reefer Global Express',
        originStation: 'Shanghai',
        destinationStation: 'Hamburg',
        departureTime: '07:00 PM',
        arrivalTime: '11:00 AM (Day 6)',
        transitTime: '6 Days',
        price: basePricePerContainer * numContainers * 1.3,
        availableCapacity: 'Full',
        features: ['Reefer Service', 'Priority International'],
        operator: 'Specialized Rail Freight',
        status: 'Full',
      },
    ];
  };

  const dummyResults = generateDummyResults(formData);

  // Add a console log to check the dummyResults array
  console.log("InternationalContainerResults dummyResults:", dummyResults);

  return (
    // Removed outer div with styling, as TrainResultsPage now handles main layout
    <div>
      <div className="flex items-center text-gray-800 font-bold text-2xl mb-6">
        <FaCube className="text-4xl mr-3 text-blue-600" />
        International Container Train Search Results
      </div>
      <p className="text-gray-600 text-lg mb-8">
        Showing results for: <span className="font-semibold">{formData.containerType}</span> from <span className="font-semibold">{formData.origin}</span> to <span className="font-semibold">{formData.destination}</span> on <span className="font-semibold">{formData.date}</span>.
      </p>

      {dummyResults.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {dummyResults.map((result) => (
            <TrainResultCard
              key={result.id}
              result={result}
              originalFormData={formData}
              bookingType="Train Container Booking" // Pass the specific booking type
              // Removed the temporary className for debugging
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 text-gray-500">
          <FaInfoCircle className="text-5xl mb-4 mx-auto text-gray-400" />
          <p className="text-xl font-semibold">No international container train services found for your criteria.</p>
          <p className="mt-2">Please try adjusting your search parameters.</p>
        </div>
      )}
    </div>
  );
};

export default InternationalContainerResults;
