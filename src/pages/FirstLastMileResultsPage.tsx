// src/pages/FirstLastMileResultsPage.tsx
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaTruck, FaInfoCircle, FaArrowLeft, FaRupeeSign, FaCalendarAlt, FaBoxOpen, FaWeightHanging, FaRulerCombined, FaMapMarkerAlt } from 'react-icons/fa';
import type { FirstLastMileFormData } from '../types/QuoteFormHandle';

interface FirstLastMileServiceResult {
  id: string;
  serviceName: string;
  provider: string;
  estimatedTime: string;
  price: number;
  features: string[];
  status: 'Available' | 'Limited' | 'Full';
}

const FirstLastMileResultsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const formData = location.state?.formData as FirstLastMileFormData | undefined;

  const handleBackToForm = () => navigate('/first-last-mile-booking');

  const generateDummyResults = (data: FirstLastMileFormData): FirstLastMileServiceResult[] => {
    const basePricePerKg = 15;
    const cargoWeightCost = (data.weight || 0) * basePricePerKg;
    const dimensionsArray = (data.dimensions || '0x0x0').split('x').map(Number);
    const volumetricWeight = (dimensionsArray[0] * dimensionsArray[1] * dimensionsArray[2]) / 5000;
    const baseServiceCost = Math.max(cargoWeightCost, volumetricWeight * 0.5);
    const vehicleFactor: Record<string, number> = { "Van": 1.0, "Pickup Truck": 1.2, "Small Truck (e.g., Tata Ace)": 1.5, "Medium Truck (e.g., Eicher)": 1.8, "Large Truck (e.g., Ashok Leyland)": 2.2 };
    const finalPriceFactor = vehicleFactor[data.vehicleType] || 1.0;

    return [
      { id: 'FLM-001', serviceName: 'Standard Delivery', provider: 'Local Logistics Co.', estimatedTime: '4-6 hours', price: Math.round(baseServiceCost * finalPriceFactor), features: ['Real-time Tracking', 'Proof of Delivery'], status: 'Available' },
      { id: 'FLM-002', serviceName: 'Express Delivery', provider: 'Speedy Couriers', estimatedTime: '2-3 hours', price: Math.round(baseServiceCost * finalPriceFactor * 1.5), features: ['Priority Handling', 'SMS Updates'], status: 'Available' },
      { id: 'FLM-003', serviceName: 'Economy Delivery', provider: 'Budget Movers', estimatedTime: 'Next Day', price: Math.round(baseServiceCost * finalPriceFactor * 0.8), features: ['Basic Tracking'], status: 'Limited' },
    ];
  };

  if (!formData) {
    return (
      <div className="min-h-screen bg-gray-100 p-4 sm:p-6 flex flex-col items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center">
          <FaInfoCircle className="text-red-500 text-6xl mb-4 mx-auto" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No First/Last Mile quote data found.</h2>
          <p className="text-gray-600 mb-6">Please go back and submit a quote from the form.</p>
          <button onClick={handleBackToForm} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full shadow-md transition duration-300">
            <FaArrowLeft className="inline-block mr-2" /> Back to Form
          </button>
        </div>
      </div>
    );
  }

  const dummyResults = generateDummyResults(formData);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Available': return 'bg-green-100 text-green-800';
      case 'Limited': return 'bg-yellow-100 text-yellow-800';
      case 'Full': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleBookNow = (result: FirstLastMileServiceResult) => {
    navigate('/first-last-mile-booking-details', {
      state: {
        selectedResult: result,
        originalFormData: formData,
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 flex flex-col items-center">
      <div className="w-full max-w-7xl bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-blue-600 text-white p-6 rounded-t-2xl flex items-center justify-between">
          <h1 className="text-3xl font-bold">First/Last Mile Service Quotes</h1>
          <button onClick={handleBackToForm} className="flex items-center px-4 py-2 bg-blue-700 hover:bg-blue-800 rounded-full text-sm font-semibold transition duration-200">
            <FaArrowLeft className="mr-2" /> Back to Form
          </button>
        </div>

        <div className="flex justify-around mb-8 text-center p-6 border-b border-gray-200 bg-white">
          <div className="flex-1 text-blue-600 font-bold">
            <div className="w-10 h-10 mx-auto mb-2 rounded-full flex items-center justify-center border-2 border-blue-600 bg-blue-100">1</div>
            Search Results
          </div>
          <div className="flex-1 text-gray-400">
            <div className="w-10 h-10 mx-auto mb-2 rounded-full flex items-center justify-center border-2 border-gray-300 bg-gray-50">2</div>
            Contact & KYC Details
          </div>
          <div className="flex-1 text-gray-400">
            <div className="w-10 h-10 mx-auto mb-2 rounded-full flex items-center justify-center border-2 border-gray-300 bg-gray-50">3</div>
            Payment & Confirmation
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {dummyResults.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {dummyResults.map(result => (
                <div key={result.id} className="bg-white p-6 rounded-2xl shadow-xl border border-gray-200 flex flex-col justify-between hover:shadow-2xl transition-all duration-300">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-gray-900 flex items-center">
                        <FaTruck className="text-blue-600 mr-2" /> {result.serviceName}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(result.status)}`}>{result.status}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-4 ml-8">{result.provider}</p>
                    <div className="grid grid-cols-2 gap-y-3 mb-6 text-gray-700">
                      <div className="flex items-center col-span-2"><FaMapMarkerAlt className="text-gray-500 mr-3" /><div><p className="text-sm font-medium">Pickup:</p><p className="font-semibold">{formData.origin}</p></div></div>
                      <div className="flex items-center col-span-2"><FaMapMarkerAlt className="text-gray-500 mr-3" /><div><p className="text-sm font-medium">Delivery:</p><p className="font-semibold">{formData.destination}</p></div></div>
                      <div className="flex items-center col-span-2"><FaCalendarAlt className="text-gray-500 mr-3" /><div><p className="text-sm font-medium">Date:</p><p className="font-semibold">{formData.date}</p></div></div>
                      <div className="flex items-center col-span-2"><FaBoxOpen className="text-gray-500 mr-3" /><div><p className="text-sm font-medium">Cargo Type:</p><p className="font-semibold">{formData.cargoType}</p></div></div>
                      <div className="flex items-center col-span-2"><FaWeightHanging className="text-gray-500 mr-3" /><div><p className="text-sm font-medium">Weight:</p><p className="font-semibold">{formData.weight} KG</p></div></div>
                      <div className="flex items-center col-span-2"><FaRulerCombined className="text-gray-500 mr-3" /><div><p className="text-sm font-medium">Dimensions:</p><p className="font-semibold">{formData.dimensions} CM</p></div></div>
                      <div className="flex items-center col-span-2"><FaTruck className="text-gray-500 mr-3" /><div><p className="text-sm font-medium">Vehicle Type:</p><p className="font-semibold">{formData.vehicleType}</p></div></div>
                      <div className="flex items-center col-span-2"><FaInfoCircle className="text-gray-500 mr-3" /><div><p className="text-sm font-medium">Estimated Time:</p><p className="font-semibold">{result.estimatedTime}</p></div></div>
                    </div>
                    <div className="flex justify-between items-center mt-4">
                      <span className="text-lg font-semibold text-gray-800">Service Price</span>
                      <p className="text-3xl font-bold text-blue-800 flex items-center">
                        <FaRupeeSign className="text-2xl mr-1" />{result.price.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                  <div className="mt-6">
                    <button
                      onClick={() => handleBookNow(result)}
                      disabled={result.status === 'Full'}
                      className={`w-full py-3 px-6 rounded-full text-white font-bold text-lg shadow-lg transition duration-300 ${result.status === 'Full' ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-700 hover:bg-blue-800'}`}
                    >
                      {result.status === 'Full' ? 'Fully Booked' : 'Book Now'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-gray-500">
              <p className="text-xl font-semibold">No First/Last Mile services found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FirstLastMileResultsPage;
