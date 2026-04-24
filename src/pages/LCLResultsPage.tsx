// src/pages/LCLResultsPage.tsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaBoxes, FaInfoCircle, FaArrowLeft, FaClock, FaRupeeSign, FaWarehouse, FaCalendarAlt } from 'react-icons/fa';
import type { LCLFormData } from '../types/QuoteFormHandle';
import { rateCardsAPI } from '../services/api';

interface LCLServiceResult {
  id: string;
  serviceName: string;
  carrier: string;
  originWarehouse: string;
  destinationWarehouse: string;
  readyDate: string;
  transitTime: string;
  price: number;
  dimensions: string;
  features: string[];
  status: 'Available' | 'Limited' | 'Full';
}

const LCLResultsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const formData = location.state?.formData as LCLFormData | undefined;

  const [results, setResults] = useState<LCLServiceResult[]>([]);
  const [loading, setLoading] = useState(false);

  const getDummyResults = (data: LCLFormData): LCLServiceResult[] => {
    const basePrice = 15000;
    const weightFactor = data.weight ? data.weight / 500 : 1;
    const readyDate = new Date(data.date || '').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    return [
      { id: 'LCL-001', serviceName: 'LCL Express Consolidation', carrier: 'Global Freight Forwarders', originWarehouse: data.origin || 'N/A', destinationWarehouse: data.destination || 'N/A', readyDate, transitTime: '15-20 Days', price: Math.round(basePrice * weightFactor * 1.2), dimensions: data.dimensions || 'N/A', features: ['Weekly Departures', 'Door-to-Port Option', 'Online Tracking'], status: 'Available' },
      { id: 'LCL-002', serviceName: 'Standard LCL Service', carrier: 'Ocean Connect Logistics', originWarehouse: data.origin || 'N/A', destinationWarehouse: data.destination || 'N/A', readyDate, transitTime: '25-30 Days', price: Math.round(basePrice * weightFactor), dimensions: data.dimensions || 'N/A', features: ['Cost-Effective', 'Reliable Schedule'], status: 'Available' },
      { id: 'LCL-003', serviceName: 'Economy LCL Solution', carrier: 'Budget Cargo Solutions', originWarehouse: data.origin || 'N/A', destinationWarehouse: data.destination || 'N/A', readyDate, transitTime: '35-40 Days', price: Math.round(basePrice * weightFactor * 0.8), dimensions: data.dimensions || 'N/A', features: ['Maximum Savings', 'Consolidated Shipments'], status: 'Limited' },
    ];
  };

  useEffect(() => {
    if (!formData) { navigate('/lcl-booking'); return; }

    (async () => {
      setLoading(true);
      try {
        const response = await rateCardsAPI.search({
          serviceType: 'LCL',
          origin: formData.origin || '',
          destination: formData.destination || '',
          weight: formData.weight,
        });

        if (response.data.data.length > 0) {
          const mapped: LCLServiceResult[] = response.data.data.map((r: any) => ({
            id: r.id,
            serviceName: r.carrier,
            carrier: r.carrier,
            originWarehouse: r.origin,
            destinationWarehouse: r.destination,
            readyDate: new Date(formData.date || '').toLocaleDateString('en-IN'),
            transitTime: r.transitTime,
            price: r.totalPrice,
            dimensions: formData.dimensions || 'N/A',
            features: ['GPS Tracking', 'Online Booking'],
            status: 'Available' as const,
          }));
          setResults(mapped);
        } else {
          setResults(getDummyResults(formData));
        }
      } catch (error) {
        setResults(getDummyResults(formData));
      } finally {
        setLoading(false);
      }
    })();
  }, [formData, navigate]);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Available': return 'bg-green-100 text-green-800';
      case 'Limited': return 'bg-yellow-100 text-yellow-800';
      case 'Full': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleBookNow = (result: LCLServiceResult) => {
    navigate('/lcl-booking-details', {
      state: { selectedResult: result, originalFormData: formData }
    });
  };

  if (!formData) return null;

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 flex flex-col items-center">
      <div className="w-full max-w-7xl bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-blue-600 text-white p-6 rounded-t-2xl flex items-center justify-between">
          <h1 className="text-3xl font-bold">LCL Freight Booking Results</h1>
          <button onClick={() => navigate(-1)} className="flex items-center px-4 py-2 bg-blue-700 hover:bg-blue-800 rounded-full text-sm font-semibold transition">
            <FaArrowLeft className="mr-2" /> Back
          </button>
        </div>

        <div className="flex justify-around text-center p-6 border-b border-gray-200">
          <div className="flex-1 text-blue-600 font-bold">
            <div className="w-10 h-10 mx-auto mb-2 rounded-full flex items-center justify-center border-2 border-blue-600 bg-blue-100">1</div>
            Search Results
          </div>
          <div className="flex-1 text-gray-400">
            <div className="w-10 h-10 mx-auto mb-2 rounded-full flex items-center justify-center border-2 border-gray-300 bg-gray-50">2</div>
            Booking Details
          </div>
          <div className="flex-1 text-gray-400">
            <div className="w-10 h-10 mx-auto mb-2 rounded-full flex items-center justify-center border-2 border-gray-300 bg-gray-50">3</div>
            Payment & Confirmation
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {loading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
              <p className="text-gray-500 text-lg">Fetching best rates...</p>
            </div>
          ) : results.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {results.map(result => (
                <div key={result.id} className="bg-white p-6 rounded-2xl shadow-xl border border-gray-200 flex flex-col justify-between hover:shadow-2xl transition-all duration-300">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-gray-900 flex items-center">
                        <FaBoxes className="text-teal-600 mr-2" /> {result.serviceName}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(result.status)}`}>{result.status}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-4 ml-8">{result.carrier}</p>
                    <div className="grid grid-cols-2 gap-y-3 mb-6 text-gray-700">
                      <div className="flex items-center"><FaWarehouse className="text-gray-500 mr-3" /><div><p className="text-sm font-medium">Origin:</p><p className="font-semibold">{result.originWarehouse}</p></div></div>
                      <div className="flex items-center"><FaWarehouse className="text-gray-500 mr-3" /><div><p className="text-sm font-medium">Destination:</p><p className="font-semibold">{result.destinationWarehouse}</p></div></div>
                      <div className="flex items-center col-span-2"><FaCalendarAlt className="text-gray-500 mr-3" /><div><p className="text-sm font-medium">Ready Date:</p><p className="font-semibold">{result.readyDate}</p></div></div>
                      <div className="flex items-center col-span-2"><FaClock className="text-gray-500 mr-3" /><div><p className="text-sm font-medium">Transit Time:</p><p className="font-semibold">{result.transitTime}</p></div></div>
                      <div className="flex items-center col-span-2"><FaInfoCircle className="text-gray-500 mr-3" /><div><p className="text-sm font-medium">Features:</p><p className="font-semibold">{result.features.join(', ')}</p></div></div>
                    </div>
                    <div className="flex justify-between items-center mt-4">
                      <span className="text-lg font-semibold text-gray-800">LCL Freight</span>
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
              <FaInfoCircle className="text-5xl mb-4 mx-auto text-gray-400" />
              <p className="text-xl font-semibold">No LCL freight services found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LCLResultsPage;
