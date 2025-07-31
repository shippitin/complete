// src/pages/TrackPage.tsx
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom'; // Import useSearchParams for query parameters
import { FaSearch, FaTruck, FaMapMarkerAlt, FaCalendarAlt, FaClipboardList, FaInfoCircle, FaCheckCircle, FaHourglassHalf, FaTimesCircle, FaPlane, FaShip, FaBoxOpen, FaTrain, FaGlobeAmericas } from 'react-icons/fa'; // Added FaGlobeAmericas
import Map from '../components/Map'; // Assuming Map component is in ../components/Map.tsx

// Define the ShipmentStatus interface
interface ShipmentStatus {
  date: string;
  status: string;
  location: string;
  coordinates?: [number, number]; // Optional coordinates for map visualization
}

// Define the Shipment interface
interface Shipment {
  id: string;
  carrier: string;
  currentLocation: string;
  status: string;
  estimatedDelivery: string;
  shipmentType: 'Truck' | 'Sea' | 'Air' | 'Parcel' | 'International' | 'Rail';
  path: [number, number][]; // Array of [latitude, longitude] for the route
  statusTimeline: ShipmentStatus[]; // Detailed timeline
}

const dummyShipments: Shipment[] = [
  {
    id: 'TRK001',
    carrier: 'Roadways Express',
    currentLocation: 'Mumbai',
    status: 'Delivered', // Changed to Delivered for a complete timeline example
    estimatedDelivery: '2025-07-25',
    shipmentType: 'Truck',
    path: [
      [28.7041, 77.1025], // Delhi
      [26.9124, 75.7873], // Jaipur
      [23.0225, 72.5714], // Ahmedabad
      [19.0760, 72.8777], // Mumbai
    ],
    statusTimeline: [
      { date: '2025-07-20', status: 'Booked', location: 'Delhi', coordinates: [28.7041, 77.1025] },
      { date: '2025-07-21', status: 'Departed', location: 'Delhi', coordinates: [28.7041, 77.1025] },
      { date: '2025-07-22', status: 'In Transit', location: 'Ahmedabad', coordinates: [23.0225, 72.5714] },
      { date: '2025-07-23', status: 'Arrived at Destination Hub', location: 'Mumbai', coordinates: [19.0760, 72.8777] },
      { date: '2025-07-24', status: 'Out for Delivery', location: 'Mumbai', coordinates: [19.0760, 72.8777] },
      { date: '2025-07-25', status: 'Delivered', location: 'Mumbai', coordinates: [19.0760, 72.8777] },
    ],
  },
  {
    id: 'AIR002',
    carrier: 'Sky Cargo',
    currentLocation: 'New York',
    status: 'In Transit',
    estimatedDelivery: '2025-07-28',
    shipmentType: 'Air',
    path: [
      [34.0522, -118.2437], // Los Angeles
      [40.7128, -74.0060], // New York
      [51.5074, 0.1278],   // London
    ],
    statusTimeline: [
      { date: '2025-07-20', status: 'Booked', location: 'Los Angeles', coordinates: [34.0522, -118.2437] },
      { date: '2025-07-21', status: 'Departed', location: 'Los Angeles', coordinates: [34.0522, -118.2437] },
      { date: '2025-07-22', status: 'In Flight', location: 'Over Atlantic', coordinates: [38.0, -40.0] }, // Mid-point
      { date: '2025-07-23', status: 'Arrived at Destination Airport', location: 'New York', coordinates: [40.7128, -74.0060] },
      { date: '2025-07-24', status: 'Customs Clearance', location: 'New York', coordinates: [40.7128, -74.0060] },
    ],
  },
  {
    id: 'SEA003',
    carrier: 'Ocean Freight',
    currentLocation: 'Singapore',
    status: 'At Sea',
    estimatedDelivery: '2025-08-10',
    shipmentType: 'Sea',
    path: [
      [34.6937, 135.5022], // Osaka
      [1.3521, 103.8198], // Singapore
      [-33.8688, 151.2093], // Sydney
    ],
    statusTimeline: [
      { date: '2025-07-20', status: 'Booked', location: 'Osaka', coordinates: [34.6937, 135.5022] },
      { date: '2025-07-21', status: 'Departed', location: 'Osaka', coordinates: [34.6937, 135.5022] },
      { date: '2025-07-25', status: 'At Sea', location: 'Near Philippines', coordinates: [10.0, 120.0] }, // Mid-point
      { date: '2025-07-30', status: 'Arrived at Destination Port', location: 'Singapore', coordinates: [1.3521, 103.8198] },
    ],
  },
  {
    id: 'PARCEL004',
    carrier: 'Local Post',
    currentLocation: 'Bengaluru',
    status: 'Out for Delivery',
    estimatedDelivery: '2025-07-24',
    shipmentType: 'Parcel',
    path: [
      [12.9716, 77.5946], // Bengaluru
      [13.0827, 80.2707], // Chennai (example short path)
    ],
    statusTimeline: [
      { date: '2025-07-22', status: 'Booked', location: 'Bengaluru', coordinates: [12.9716, 77.5946] },
      { date: '2025-07-23', status: 'Processed at Hub', location: 'Bengaluru Hub', coordinates: [12.9716, 77.5946] },
      { date: '2025-07-24', status: 'Out for Delivery', location: 'Chennai Delivery Center', coordinates: [13.0827, 80.2707] },
    ],
  },
  {
    id: 'INTL005',
    carrier: 'Global Logistics',
    currentLocation: 'Frankfurt',
    status: 'Customs Clearance',
    estimatedDelivery: '2025-08-01',
    shipmentType: 'International',
    path: [
      [35.6895, 139.6917], // Tokyo
      [50.1109, 8.6821],   // Frankfurt
      [48.8566, 2.3522],   // Paris
    ],
    statusTimeline: [
      { date: '2025-07-20', status: 'Booked', location: 'Tokyo', coordinates: [35.6895, 139.6917] },
      { date: '2025-07-21', status: 'Departed', location: 'Tokyo', coordinates: [35.6895, 139.6917] },
      { date: '2025-07-24', status: 'Arrived at Port', location: 'Frankfurt', coordinates: [50.1109, 8.6821] },
      { date: '2025-07-25', status: 'Customs Clearance', location: 'Frankfurt Airport Customs', coordinates: [50.1109, 8.6821] },
    ],
  },
  {
    id: 'RAIL006',
    carrier: 'National Rail Cargo',
    currentLocation: 'Nagpur',
    status: 'Delayed',
    estimatedDelivery: '2025-07-27',
    shipmentType: 'Rail',
    path: [
      [22.5726, 88.3639], // Kolkata
      [21.1458, 79.0882], // Nagpur
      [17.3850, 78.4867], // Hyderabad
    ],
    statusTimeline: [
      { date: '2025-07-20', status: 'Booked', location: 'Kolkata', coordinates: [22.5726, 88.3639] },
      { date: '2025-07-21', status: 'Departed', location: 'Kolkata', coordinates: [22.5726, 88.3639] },
      { date: '2025-07-23', status: 'In Transit', location: 'Rourkela', coordinates: [22.2587, 84.8524] },
      { date: '2025-07-24', status: 'Delayed', location: 'Nagpur Yard', coordinates: [21.1458, 79.0882] },
    ],
  },
];


const TrackPage: React.FC = () => {
  const [trackingId, setTrackingId] = useState('');
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchParams] = useSearchParams(); // Hook to access URL query parameters

  useEffect(() => {
    // Check if a shipment ID is provided in the URL query parameters (e.g., /track-shipment?id=TRK001)
    const idFromUrl = searchParams.get('id');
    if (idFromUrl) {
      setTrackingId(idFromUrl);
      handleTrack(idFromUrl); // Automatically track if ID is in URL
    }
  }, [searchParams]); // Re-run effect if searchParams change

  const handleTrack = (idToTrack: string = trackingId) => {
    setError(null);
    setShipment(null);

    if (!idToTrack) {
      setError('Please enter a tracking ID.');
      return;
    }

    const foundShipment = dummyShipments.find((s) => s.id.toLowerCase() === idToTrack.toLowerCase());

    if (foundShipment) {
      setShipment(foundShipment);
    } else {
      setError('Shipment not found. Please check the tracking ID.');
    }
  };

  // Helper function to get icon and color for status timeline
  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'booked':
        return <FaClipboardList className="text-blue-500" />; // Kept a lighter blue
      case 'departed':
        return <FaTruck className="text-indigo-500" />;
      case 'in transit':
      case 'in flight':
      case 'at sea':
        return <FaHourglassHalf className="text-yellow-500" />;
      case 'arrived':
      case 'arrived at destination hub':
      case 'arrived at destination airport':
      case 'arrived at port':
        return <FaMapMarkerAlt className="text-green-500" />;
      case 'out for delivery':
        return <FaBoxOpen className="text-orange-500" />;
      case 'delivered':
        return <FaCheckCircle className="text-green-600" />;
      case 'customs clearance':
        return <FaInfoCircle className="text-purple-500" />;
      case 'delayed':
        return <FaTimesCircle className="text-red-500" />;
      default:
        return <FaInfoCircle className="text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden border border-blue-200">
        {/* Header Section */}
        <div
          className="text-white p-8 rounded-t-3xl text-center"
          style={{
            background: 'linear-gradient(to right, #53b2fe, #065af3)',
          }}
        >
          <h1 className="text-4xl font-extrabold flex items-center justify-center mb-2 animate-fade-in-down">
            <FaTruck className="mr-4 text-5xl" /> Real-time Shipment Tracking
          </h1>
          <p className="mt-2 text-blue-100 text-lg animate-fade-in-up">
            Enter your tracking ID below to get the latest updates on your cargo.
          </p>
        </div>

        {/* Tracking Input Section */}
        <div className="p-8">
          <div className="flex flex-col sm:flex-row gap-4 mb-6 animate-fade-in" style={{ animationDelay: '300ms' }}>
            <input
              type="text"
              className="flex-grow p-4 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 shadow-md text-gray-800 text-lg placeholder-gray-400 transition duration-300"
              placeholder="Enter Tracking ID (e.g., TRK001, AIR002, SEA003)"
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleTrack();
                }
              }}
            />
            <button
              onClick={() => handleTrack()}
              className="px-8 py-4 text-white font-bold text-lg rounded-xl shadow-lg transition duration-300 transform hover:scale-105 flex items-center justify-center"
              style={{
                background: 'linear-gradient(to right, #53b2fe, #065af3)',
                border: 'none',
              }}
            >
              <FaSearch className="mr-3 text-xl" /> Track Now
            </button>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg relative text-center animate-fade-in" role="alert">
              <span className="block sm:inline font-medium">{error}</span>
            </div>
          )}
        </div>

        {/* Shipment Details and Map Section */}
        {shipment && (
          <div className="p-8 border-t border-gray-200 bg-gray-50 animate-fade-in-up" style={{ animationDelay: '500ms' }}>
            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center justify-center">
              <FaClipboardList className="mr-4 text-blue-800 text-4xl" /> Shipment Overview {/* Changed to text-blue-800 */}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-8 text-gray-700 text-lg">
              <div className="flex items-center bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <FaClipboardList className="text-gray-500 mr-4 text-2xl" />
                <div>
                  <strong className="block text-gray-900">Tracking ID:</strong> {shipment.id}
                </div>
              </div>
              <div className="flex items-center bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <FaTruck className="text-gray-500 mr-4 text-2xl" />
                <div>
                  <strong className="block text-gray-900">Carrier:</strong> {shipment.carrier}
                </div>
              </div>
              <div className="flex items-center bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <FaMapMarkerAlt className="text-gray-500 mr-4 text-2xl" />
                <div>
                  <strong className="block text-gray-900">Current Location:</strong> {shipment.currentLocation}
                </div>
              </div>
              <div className="flex items-center bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <FaInfoCircle className="text-gray-500 mr-4 text-2xl" />
                <div>
                  <strong className="block text-gray-900">Current Status:</strong> <span className={`font-semibold ${
                    shipment.status.toLowerCase() === 'delivered' ? 'text-green-600' :
                    shipment.status.toLowerCase() === 'delayed' ? 'text-red-600' :
                    'text-blue-800' // Changed to text-blue-800
                  }`}>{shipment.status}</span>
                </div>
              </div>
              <div className="flex items-center bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <FaCalendarAlt className="text-gray-500 mr-4 text-2xl" />
                <div>
                  <strong className="block text-gray-900">Estimated Delivery:</strong> {shipment.estimatedDelivery}
                </div>
              </div>
              <div className="flex items-center bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                {shipment.shipmentType === 'Truck' && <FaTruck className="text-gray-500 mr-4 text-2xl" />}
                {shipment.shipmentType === 'Air' && <FaPlane className="text-gray-500 mr-4 text-2xl" />}
                {shipment.shipmentType === 'Sea' && <FaShip className="text-gray-500 mr-4 text-2xl" />}
                {shipment.shipmentType === 'Rail' && <FaTrain className="text-gray-500 mr-4 text-2xl" />}
                {shipment.shipmentType === 'Parcel' && <FaBoxOpen className="text-gray-500 mr-4 text-2xl" />}
                {shipment.shipmentType === 'International' && <FaGlobeAmericas className="text-gray-500 mr-4 text-2xl" />}
                <div>
                  <strong className="block text-gray-900">Shipment Type:</strong> {shipment.shipmentType}
                </div>
              </div>
            </div>

            {/* Shipment Map */}
            <div className="mt-10 bg-white p-6 rounded-xl shadow-lg border border-gray-200">
              <h3 className="text-2xl font-bold text-gray-800 mb-5 flex items-center justify-center">
                <FaMapMarkerAlt className="mr-3 text-blue-800 text-3xl" /> Live Tracking Map {/* Changed to text-blue-800 */}
              </h3>
              <div className="h-96 w-full rounded-lg overflow-hidden border border-gray-300">
                   <Map
                   path={shipment.path}
                   shipmentType={shipment.shipmentType}
                   statusTimeline={shipment.statusTimeline}
                 />
              </div>
            </div>

            {/* Status Timeline */}
            <div className="mt-10 bg-white p-6 rounded-xl shadow-lg border border-gray-200">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center justify-center">
                <FaCalendarAlt className="mr-3 text-blue-800 text-3xl" /> Shipment History {/* Changed to text-blue-800 */}
              </h3>
              <div className="relative border-l-4 border-blue-300 pl-6 ml-2">
                {shipment.statusTimeline.map((item, index) => (
                  <div key={index} className="mb-8 flex items-start relative">
                    {/* Timeline dot */}
                    <div className={`absolute -left-8 top-0 flex items-center justify-center w-10 h-10 rounded-full shadow-md
                                   ${item.status.toLowerCase() === 'delivered' ? 'bg-green-600' :
                                     item.status.toLowerCase() === 'delayed' ? 'bg-red-600' :
                                     '' // Removed bg-blue-600 here to apply inline style
                                   }`}
                      style={
                        item.status.toLowerCase() !== 'delivered' && item.status.toLowerCase() !== 'delayed'
                          ? { background: 'linear-gradient(to right, #53b2fe, #065af3)' }
                          : {}
                      }
                    >
                      {getStatusIcon(item.status)}
                    </div>
                    <div className="flex-grow bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200 transition-all duration-300 hover:shadow-md">
                      <p className="text-sm text-gray-500 mb-1">{item.date}</p>
                      <p className="font-bold text-gray-800 text-lg mb-1">{item.status}</p>
                      <p className="text-sm text-gray-600">{item.location}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackPage;
