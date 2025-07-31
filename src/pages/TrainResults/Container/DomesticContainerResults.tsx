// src/pages/TrainResults/Container/DomesticContainerResults.tsx
import React from 'react';
import TrainResultCard from '../../../components/TrainResults/TrainResultCard'; // Corrected import path for TrainResultCard
import type { TrainContainerFormData } from '../../../types/QuoteFormHandle';
import {
  FaCube, FaInfoCircle
} from 'react-icons/fa';

// Define the structure for a freight train result (can be moved to types/QuoteFormHandle.ts if not already there)
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

interface DomesticContainerResultsProps {
  formData: TrainContainerFormData;
}

const DomesticContainerResults: React.FC<DomesticContainerResultsProps> = ({ formData }) => {

  // --- Dummy Freight Train Results (Generated based on formData) ---
  const generateDummyResults = (data: TrainContainerFormData): FreightTrainResult[] => {
    const basePricePerContainer = 75000; // Example base price
    const numContainers = data.numberOfContainers || 1;

    return [
      {
        id: 'FRT-C-D-001',
        serviceName: 'Domestic Container Express',
        originStation: data.origin,
        destinationStation: data.destination,
        departureTime: '08:00 AM',
        arrivalTime: '08:00 AM (Next Day)',
        transitTime: '24 hrs',
        price: basePricePerContainer * numContainers,
        availableCapacity: `${Math.max(numContainers + 3, 5)} Containers`,
        features: ['Fast Transit', 'GPS Tracking'],
        operator: 'Container Corp of India',
        status: 'Available',
      },
      {
        id: 'FRT-C-D-002',
        serviceName: 'Standard Domestic Freight',
        originStation: data.origin,
        destinationStation: data.destination,
        departureTime: '02:00 PM',
        arrivalTime: '02:00 PM (Day 2)',
        transitTime: '48 hrs',
        price: basePricePerContainer * numContainers * 0.85,
        availableCapacity: `${Math.max(numContainers + 5, 10)} Containers`,
        features: ['Economical', 'Heavy Load Compatible'],
        operator: 'Private Rail Logistics',
        status: 'Available',
      },
      {
        id: 'FRT-C-D-003',
        serviceName: 'Domestic Reefer Service',
        originStation: 'Mumbai',
        destinationStation: 'Delhi',
        departureTime: '10:00 PM',
        arrivalTime: '06:00 AM (Day 2)',
        transitTime: '32 Hours',
        price: basePricePerContainer * numContainers * 1.2,
        availableCapacity: 'Full', // Example of full capacity
        features: ['Reefer Compatible', 'Priority'],
        operator: 'Container Corp of India',
        status: 'Full',
      },
    ];
  };

  const dummyResults = generateDummyResults(formData);

  return (
    // Removed outer div with styling, as TrainResultsPage now handles main layout
    <div>
      <div className="flex items-center text-gray-800 font-bold text-2xl mb-6">
        <FaCube className="text-4xl mr-3 text-blue-700" /> {/* Changed to blue-700 */}
        Domestic Container Train Search Results
      </div>
      <p className="text-gray-700 text-lg mb-8"> {/* Changed to gray-700 */}
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
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 text-gray-600"> {/* Changed to gray-600 */}
          <FaInfoCircle className="text-5xl mb-4 mx-auto text-gray-500" /> {/* Changed to gray-500 */}
          <p className="text-xl font-semibold">No domestic container train services found for your criteria.</p>
          <p className="mt-2">Please try adjusting your search parameters.</p>
        </div>
      )}
    </div>
  );
};

export default DomesticContainerResults;
