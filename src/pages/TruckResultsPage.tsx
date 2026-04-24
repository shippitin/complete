// src/pages/TruckResultsPage.tsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaTruck, FaCalendarAlt, FaRupeeSign, FaChevronRight } from 'react-icons/fa';
import type { TruckFormData } from '../types/QuoteFormHandle';
import { rateCardsAPI } from '../services/api';

const TruckResultsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const formData = location.state?.formData as TruckFormData | undefined;

  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const getDummyOffers = (data: TruckFormData) => [
    { id: 'TR-101', serviceProvider: 'Zipaworld', price: 45000, transitTime: '2-3 Days', type: 'Premium', pickupPincode: data.pickupPincode, dropoffPincode: data.dropoffPincode, pickupDate: data.readyDate, loadType: data.loadType, vehicleType: '32ft MX Container' },
    { id: 'TR-102', serviceProvider: 'Gati KWE', price: 42500, transitTime: '3-4 Days', type: 'Standard', pickupPincode: data.pickupPincode, dropoffPincode: data.dropoffPincode, pickupDate: data.readyDate, loadType: data.loadType, vehicleType: '24ft Close Body' },
    { id: 'TR-103', serviceProvider: 'Delhivery', price: 39000, transitTime: '4-5 Days', type: 'Economy', pickupPincode: data.pickupPincode, dropoffPincode: data.dropoffPincode, pickupDate: data.readyDate, loadType: data.loadType, vehicleType: '19ft Open Truck' },
  ];

  useEffect(() => {
    if (!formData) { navigate('/truck-booking'); return; }

    (async () => {
      setLoading(true);
      try {
        const response = await rateCardsAPI.search({
          serviceType: 'Truck',
          origin: formData.pickupPincode || '',
          destination: formData.dropoffPincode || '',
          weight: formData.totalWeight,
        });

        if (response.data.data.length > 0) {
          const mapped = response.data.data.map((r: any) => ({
            id: r.id,
            serviceProvider: r.carrier,
            price: r.totalPrice,
            transitTime: r.transitTime,
            type: 'Standard',
            pickupPincode: formData.pickupPincode,
            dropoffPincode: formData.dropoffPincode,
            pickupDate: formData.readyDate,
            loadType: formData.loadType,
            vehicleType: 'Truck',
          }));
          setOffers(mapped);
        } else {
          setOffers(getDummyOffers(formData));
        }
      } catch (error) {
        setOffers(getDummyOffers(formData));
      } finally {
        setLoading(false);
      }
    })();
  }, [formData, navigate]);

  const handleBookingRedirect = (offer: any) => {
    navigate('/truck-booking-details', {
      state: { selectedResult: offer, originalFormData: formData }
    });
  };

  if (!formData) return null;

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans text-[#333]">
      {/* Top Summary Bar */}
      <div className="bg-white border-b border-[#eaedf0] sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-8">
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Route</span>
              <span className="text-sm font-semibold text-[#111827]">{formData.pickupPincode} → {formData.dropoffPincode}</span>
            </div>
            <div className="flex flex-col border-l border-gray-200 pl-8">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Load</span>
              <span className="text-sm font-semibold text-[#111827]">{formData.loadType} | {formData.totalWeight} KG</span>
            </div>
            <div className="flex flex-col border-l border-gray-200 pl-8">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Date</span>
              <span className="text-sm font-semibold text-[#111827]">{formData.readyDate}</span>
            </div>
          </div>
          <button onClick={() => navigate('/truck-booking')} className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">
            Modify Search
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <h2 className="text-xl font-bold text-[#111827] mb-6">Available Trucking Rates</h2>

        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-500 text-lg">Fetching best rates...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {offers.map(offer => (
              <div key={offer.id} className="bg-white rounded-xl border border-[#eaedf0] p-6 hover:shadow-md transition-shadow group">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center space-x-4 min-w-[200px]">
                    <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                      <FaTruck size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-[#111827]">{offer.serviceProvider}</h3>
                      <span className="text-xs text-gray-500 font-mono uppercase">{offer.id}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-center">
                    <span className="text-[11px] font-bold text-gray-400 uppercase">Transit Time</span>
                    <span className="text-sm font-semibold text-[#374151] flex items-center">
                      <FaCalendarAlt className="mr-2 text-blue-400" /> {offer.transitTime}
                    </span>
                  </div>

                  <div className="hidden lg:block">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${offer.type === 'Premium' ? 'bg-purple-50 text-purple-600' : 'bg-gray-50 text-gray-600'}`}>
                      {offer.type}
                    </span>
                  </div>

                  <div className="flex items-center space-x-8">
                    <div className="text-right">
                      <span className="text-[11px] font-bold text-gray-400 uppercase block">Total Price</span>
                      <span className="text-2xl font-black text-[#111827] flex items-center justify-end">
                        <FaRupeeSign className="text-lg mr-1 text-blue-600" /> {offer.price.toLocaleString()}
                      </span>
                    </div>
                    <button
                      onClick={() => handleBookingRedirect(offer)}
                      className="bg-[#2563eb] text-white px-6 py-3 rounded-lg font-bold text-sm hover:bg-[#1d4ed8] flex items-center group-hover:translate-x-1 transition-all"
                    >
                      Book Now <FaChevronRight className="ml-2 text-[10px]" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TruckResultsPage;
