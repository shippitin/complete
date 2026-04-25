// src/pages/DoorToDoorResultsPage.tsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaHome, FaInfoCircle, FaArrowLeft, FaTag, FaClock, FaRupeeSign, FaTruckMoving, FaKey } from 'react-icons/fa';
import type { DoorToDoorFormData } from '../types/QuoteFormHandle';
import { rateCardsAPI } from '../services/api';

interface DoorToDoorServiceResult {
  id: string;
  serviceName: string;
  carrier: string;
  transitTime: string;
  price: number;
  features: string[];
  status: 'Available' | 'Limited' | 'Full';
  isSpecialOffer?: boolean;
  specialOfferText?: string;
}

const DoorToDoorResultsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const formData = location.state?.formData as DoorToDoorFormData | undefined;
  const [results, setResults] = useState<DoorToDoorServiceResult[]>([]);
  const [loading, setLoading] = useState(false);

  const handleBackToForm = () => navigate('/', { state: { activeTab: 'Door to Door' } });

  const getDummyResults = (data: DoorToDoorFormData): DoorToDoorServiceResult[] => {
    const basePrice = 5000;
    const parsedWeight = Number(data.weight);
    const effectiveWeight = parsedWeight > 0 ? parsedWeight : 100;
    const weightFactor = effectiveWeight / 100;
    const distanceFactor = 1.5;
    return [
      { id: 'D2D-001', serviceName: 'Express Doorstep Delivery', carrier: 'FastFreight Logistics', transitTime: '2-3 Days', price: Math.round(basePrice * weightFactor * distanceFactor * 1.2), features: ['Real-time Tracking', 'Dedicated Vehicle', 'Priority Handling'], status: 'Available', isSpecialOffer: true, specialOfferText: 'Get 5% off on all express Door to Door booking this month!' },
      { id: 'D2D-002', serviceName: 'Standard Door to Door', carrier: 'Reliable Carriers Pvt. Ltd.', transitTime: '4-6 Days', price: Math.round(basePrice * weightFactor * distanceFactor), features: ['Economical', 'Standard Tracking'], status: 'Available' },
      { id: 'D2D-003', serviceName: 'Economy Ground Service', carrier: 'Budget Freight Solutions', transitTime: '7-10 Days', price: Math.round(basePrice * weightFactor * distanceFactor * 0.8), features: ['Cost-Effective', 'Bulk Shipments'], status: 'Limited' },
      { id: 'D2D-004', serviceName: 'Premium Express (Full)', carrier: 'Top Tier Logistics', transitTime: '1-2 Days', price: Math.round(basePrice * weightFactor * distanceFactor * 1.5), features: ['Urgent Delivery', 'White Glove Service'], status: 'Full' },
    ];
  };

  useEffect(() => {
    if (!formData) return;

    (async () => {
      setLoading(true);
      try {
        const response = await rateCardsAPI.search({
          serviceType: 'DoorToDoor',
          origin: formData.origin || '',
          destination: formData.destination || '',
          weight: Number(formData.weight),
        });

        if (response.data.data.length > 0) {
          const mapped: DoorToDoorServiceResult[] = response.data.data.map((r: any) => ({
            id: r.id,
            serviceName: r.carrier,
            carrier: r.carrier,
            transitTime: r.transitTime,
            price: r.totalPrice,
            features: ['Real-time Tracking', 'GPS'],
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
  }, [formData]);

  if (!formData) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 flex flex-col items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center border border-gray-100">
          <FaInfoCircle className="text-red-500 text-6xl mb-4 mx-auto" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No Door to Door booking data found.</h2>
          <p className="text-gray-600 mb-6">Please go back and submit a quote from the form.</p>
          <button onClick={handleBackToForm} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full shadow-md transition duration-300">
            <FaArrowLeft className="inline-block mr-2" /> Back to Form
          </button>
        </div>
      </div>
    );
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Available': return 'bg-green-100 text-green-700';
      case 'Limited': return 'bg-yellow-100 text-yellow-700';
      case 'Full': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handleBookNow = (result: DoorToDoorServiceResult) => {
    // Get logged in user details
    const userStr = localStorage.getItem('shippitin_user');
    const user = userStr ? JSON.parse(userStr) : {};

    navigate('/booking-confirmation', {
      state: {
        bookingDetails: {
          selectedResult: {
            id: result.id,
            serviceName: result.serviceName,
            origin: formData.origin,
            destination: formData.destination,
            transitTime: result.transitTime,
            price: result.price,
            features: result.features,
            carrier: result.carrier,
            status: result.status,
            bookingType: 'Door to Door',
            cargoType: formData.cargoType,
            weight: formData.weight,
            hazardousCargo: formData.hazardousCargo,
            readyDate: formData.readyDate,
            isDomestic: formData.isDomestic,
          },
          originalFormData: formData,
          contactDetails: {
            fullName: user.full_name || '',
            email: user.email || '',
            phone: user.phone || '',
            companyName: user.company_name || '',
            gstin: '',
            kycDocType: '',
            specialInstructions: '',
          },
          bookingDate: new Date().toLocaleDateString('en-IN'),
          bookingTime: new Date().toLocaleTimeString('en-IN'),
          bookingId: `D2D-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`,
          finalAmount: result.price,
        }
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-100">
        <div className="flex items-center text-gray-800 font-bold text-2xl mb-6">
          <FaHome className="text-4xl mr-3 text-blue-600" />
          Door to Door Service Results
        </div>
        <p className="text-gray-600 text-lg mb-8">
          Showing services for: <span className="font-semibold">{formData.cargoType || 'Any Cargo'}</span> from <span className="font-semibold">{formData.origin}</span> to <span className="font-semibold">{formData.destination}</span> on <span className="font-semibold">{formData.readyDate}</span>.
        </p>

        <div className="bg-blue-400 text-white rounded-lg p-3 mb-8 flex items-center shadow-md">
          <FaTag className="text-white text-2xl mr-3" />
          <p className="text-sm font-medium">Get 5% off on all express Door to Door booking this month.</p>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-500 text-lg">Fetching best rates...</p>
          </div>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {results.map(result => (
              <div key={result.id} className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center">
                      <FaTruckMoving className="text-blue-600 mr-2 text-xl" /> {result.serviceName}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(result.status)}`}>{result.status}</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-3 ml-8">Provided by: <span className="font-medium">{result.carrier}</span></p>
                  <div className="space-y-2 mb-4 text-gray-700">
                    <div className="flex items-center"><FaClock className="text-gray-500 mr-2 text-sm" /><span className="text-sm">Estimated Transit Time: <span className="font-semibold">{result.transitTime}</span></span></div>
                    <div className="flex items-center"><FaTruckMoving className="text-gray-500 mr-2 text-sm" /><span className="text-sm">Service Type: Door to Door</span></div>
                    {result.features.length > 0 && (
                      <div className="flex items-start">
                        <FaKey className="text-gray-500 mr-2 text-sm mt-1" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-700">Key Features:</p>
                          <ul className="list-disc list-inside text-xs text-gray-600 ml-2">
                            {result.features.map((feature, index) => <li key={index}>{feature}</li>)}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center">
                  <div className="flex items-center">
                    <FaRupeeSign className="text-xl text-gray-700 mr-1" />
                    <span className="text-2xl font-bold text-gray-900">{result.price === 0 ? 'Price on Request' : result.price.toLocaleString('en-IN')}</span>
                  </div>
                  <button
                    onClick={() => handleBookNow(result)}
                    disabled={result.status === 'Full'}
                    className={`py-2 px-6 rounded-md text-white font-semibold text-base shadow-sm transition duration-300 ${result.status === 'Full' ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-400 hover:bg-blue-500'}`}
                  >
                    {result.status === 'Full' ? 'Fully Booked' : 'Book Now'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-lg border border-gray-100">
            <FaInfoCircle className="text-5xl mb-4 mx-auto text-gray-400" />
            <p className="text-xl font-semibold">No Door to Door services found for your criteria.</p>
            <button onClick={handleBackToForm} className="mt-6 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-full shadow transition">
              <FaArrowLeft className="inline-block mr-2" /> Go Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoorToDoorResultsPage;
