// src/pages/TruckResultsPage.tsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaTruck, FaCalendarAlt, FaRupeeSign, FaChevronRight, FaArrowLeft, FaLeaf, FaFire, FaMapMarkerAlt, FaClock } from 'react-icons/fa';
import type { TruckFormData } from '../types/QuoteFormHandle';
import { rateCardsAPI } from '../services/api';

const getBorderColor = (badge: string | null | undefined) => {
  switch (badge) {
    case 'best_value': return '#fbbf24';
    case 'fastest': return '#38bdf8';
    case 'most_popular': return '#fb7185';
    default: return 'transparent';
  }
};

const getBadgeConfig = (badge: string | null | undefined) => {
  switch (badge) {
    case 'best_value': return { label: '★ Best Value', pill: 'bg-amber-50 text-amber-700 border border-amber-200' };
    case 'fastest': return { label: '⚡ Fastest', pill: 'bg-sky-50 text-sky-700 border border-sky-200' };
    case 'most_popular': return { label: '🔥 Most Popular', pill: 'bg-rose-50 text-rose-700 border border-rose-200' };
    default: return null;
  }
};

const TruckResultsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const formData = location.state?.formData as TruckFormData | undefined;
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState<'price' | 'transit' | 'carbon'>('price');

  const getDummyOffers = (data: TruckFormData) => [
    { id: 'TR-101', serviceProvider: 'Zipaworld', price: 45000, transitTime: '2-3 Days', type: 'Premium', vehicleType: '32ft MX Container', badge: 'most_popular', carbonKg: 420 },
    { id: 'TR-102', serviceProvider: 'Gati KWE', price: 42500, transitTime: '3-4 Days', type: 'Standard', vehicleType: '24ft Close Body', badge: 'best_value', carbonKg: 380 },
    { id: 'TR-103', serviceProvider: 'Delhivery', price: 39000, transitTime: '4-5 Days', type: 'Economy', vehicleType: '19ft Open Truck', badge: 'fastest', carbonKg: 310 },
  ];

  useEffect(() => {
    if (!formData) { navigate('/truck-booking'); return; }
    (async () => {
      setLoading(true);
      try {
        const response = await rateCardsAPI.search({ serviceType: 'Truck', origin: formData.pickupPincode || '', destination: formData.dropoffPincode || '', weight: formData.totalWeight });
        const badges = ['most_popular', 'best_value', 'fastest', null];
        if (response.data.data.length > 0) {
          setOffers(response.data.data.map((r: any, i: number) => ({ id: r.id, serviceProvider: r.carrier, price: r.totalPrice, transitTime: r.transitTime, type: 'Standard', vehicleType: 'Truck', badge: badges[i] || null, carbonKg: Math.round(200 + Math.random() * 400), surgeMultiplier: r.surgeMultiplier, surgeReason: r.surgeReason, isDynamicPrice: r.isDynamicPrice })));
        } else { setOffers(getDummyOffers(formData)); }
      } catch { setOffers(getDummyOffers(formData)); }
      finally { setLoading(false); }
    })();
  }, [formData, navigate]);

  useEffect(() => {
    let sorted = [...offers];
    if (sortBy === 'price') sorted.sort((a, b) => a.price - b.price);
    if (sortBy === 'transit') sorted.sort((a, b) => parseInt(a.transitTime) - parseInt(b.transitTime));
    if (sortBy === 'carbon') sorted.sort((a, b) => (a.carbonKg || 0) - (b.carbonKg || 0));
    setOffers(sorted);
  }, [sortBy]);

  if (!formData) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-16 z-30 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-5 text-sm">
            <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-gray-400 hover:text-blue-600 transition font-medium"><FaArrowLeft className="text-xs" /> Back</button>
            <div className="h-4 w-px bg-gray-200"></div>
            <div className="flex items-center gap-2 text-gray-700"><FaMapMarkerAlt className="text-blue-400 text-xs" /><span className="font-semibold">{formData.pickupPincode}</span><span className="text-gray-300">→</span><span className="font-semibold">{formData.dropoffPincode}</span></div>
            <div className="hidden md:flex items-center gap-1.5 text-gray-400"><span>{formData.loadType} · {formData.totalWeight} KG</span></div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Sort:</span>
            {[{ key: 'price', label: 'Price' }, { key: 'transit', label: 'Transit' }, { key: 'carbon', label: '🌿 Carbon' }].map(s => (
              <button key={s.key} onClick={() => setSortBy(s.key as any)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${sortBy === s.key ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{s.label}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-5"><h1 className="text-xl font-bold text-gray-800">Truck Freight Quotes</h1><p className="text-sm text-gray-400 mt-0.5">{offers.length} options · AI-updated pricing</p></div>

        {loading ? (
          <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse"><div className="h-5 bg-gray-100 rounded w-1/3 mb-3"></div><div className="h-4 bg-gray-100 rounded w-1/2"></div></div>)}</div>
        ) : (
          <div className="space-y-4">
            {offers.map(offer => {
              const badgeConfig = getBadgeConfig(offer.badge);
              const isSurge = offer.isDynamicPrice && offer.surgeMultiplier && offer.surgeMultiplier > 1;
              const isDiscount = offer.surgeMultiplier && offer.surgeMultiplier < 1;
              return (
                <div key={offer.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden" style={{ borderLeft: `4px solid ${getBorderColor(offer.badge)}` }}>
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center"><FaTruck className="text-blue-500" /></div>
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <h3 className="font-bold text-gray-800">{offer.serviceProvider}</h3>
                            {badgeConfig && <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${badgeConfig.pill}`}>{badgeConfig.label}</span>}
                            {isSurge && <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-orange-50 border border-orange-200 text-orange-600 flex items-center gap-1"><FaFire className="text-xs" />{offer.surgeMultiplier}x</span>}
                            {isDiscount && <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-green-50 border border-green-200 text-green-600">↓{Math.round((1-(offer.surgeMultiplier||1))*100)}% off</span>}
                          </div>
                          <p className="text-xs text-gray-400 font-mono">{offer.id}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-6">
                        <div className="text-center"><p className="text-xs text-gray-400 mb-0.5">TRANSIT</p><p className="text-sm font-semibold text-gray-700 flex items-center gap-1"><FaClock className="text-gray-300 text-xs" />{offer.transitTime}</p></div>
                        <div className="text-center"><p className="text-xs text-gray-400 mb-0.5">VEHICLE</p><p className="text-sm font-semibold text-gray-700">{offer.vehicleType}</p></div>
                        <div className="text-center"><p className="text-xs text-gray-400 mb-0.5">CO₂</p><p className="text-sm font-semibold text-emerald-600 flex items-center gap-1"><FaLeaf className="text-xs" />{offer.carbonKg} kg</p></div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-2xl font-black text-gray-900 flex items-center gap-1"><FaRupeeSign className="text-lg text-blue-500" />{offer.price.toLocaleString()}</p>
                            {offer.surgeReason && <p className="text-xs text-orange-500 flex items-center gap-1 justify-end"><FaFire className="text-xs" />{offer.surgeReason}</p>}
                          </div>
                          <button onClick={() => navigate('/truck-booking-details', { state: { selectedResult: offer, originalFormData: formData } })} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-5 rounded-xl transition text-sm whitespace-nowrap">
                            Book Now <FaChevronRight className="text-xs" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TruckResultsPage;
