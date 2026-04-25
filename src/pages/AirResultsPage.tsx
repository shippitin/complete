// src/pages/AirResultsPage.tsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AirFormData } from '../types/QuoteFormHandle';
import { FaPlane, FaCalendarAlt, FaWeight, FaBoxes, FaTag, FaInfoCircle, FaCheckCircle, FaTimesCircle, FaMapMarkerAlt, FaClock, FaRupeeSign, FaBoxOpen, FaLeaf, FaFire, FaChevronRight, FaArrowLeft } from 'react-icons/fa';
import { rateCardsAPI } from '../services/api';

interface ServiceOffer {
  id: string;
  serviceProvider: string;
  transitTime: string;
  price: number;
  originalPrice?: number;
  surgeMultiplier?: number;
  surgeReason?: string;
  isDynamicPrice?: boolean;
  includedServices: { pickup: boolean; originClearance: boolean; freight: boolean; destinationClearance: boolean; delivery: boolean; };
  loadType: 'PTL' | 'FTL';
  slabs: string;
  badge?: 'best_value' | 'fastest' | 'most_popular' | null;
  carbonKg?: number;
}

const getBadgeConfig = (badge: string | null | undefined) => {
  switch (badge) {
    case 'best_value': return { label: '★ Best Value', pill: 'bg-amber-50 text-amber-700 border border-amber-200' };
    case 'fastest': return { label: '⚡ Fastest', pill: 'bg-sky-50 text-sky-700 border border-sky-200' };
    case 'most_popular': return { label: '🔥 Most Popular', pill: 'bg-rose-50 text-rose-700 border border-rose-200' };
    default: return null;
  }
};

const getBorderColor = (badge: string | null | undefined) => {
  switch (badge) {
    case 'best_value': return '#fbbf24';
    case 'fastest': return '#38bdf8';
    case 'most_popular': return '#fb7185';
    default: return 'transparent';
  }
};

const dummyOffers: ServiceOffer[] = [
  { id: 'AE-001', serviceProvider: 'Shippitin Express', transitTime: '3-4 days', price: 18290, includedServices: { pickup: true, originClearance: true, freight: true, destinationClearance: true, delivery: false }, loadType: 'PTL', slabs: 'Min', badge: 'most_popular', carbonKg: 1240 },
  { id: 'AE-002', serviceProvider: 'Global Freight Co.', transitTime: '2-3 days', price: 22500, includedServices: { pickup: true, originClearance: true, freight: true, destinationClearance: true, delivery: true }, loadType: 'FTL', slabs: '+45', badge: 'fastest', carbonKg: 1580 },
  { id: 'AE-003', serviceProvider: 'Sky Cargo Logistics', transitTime: '4-5 days', price: 15000, includedServices: { pickup: false, originClearance: true, freight: true, destinationClearance: false, delivery: false }, loadType: 'PTL', slabs: 'Normal', badge: 'best_value', carbonKg: 980 },
  { id: 'AE-004', serviceProvider: 'Fast Air Solutions', transitTime: '1-2 days', price: 28000, includedServices: { pickup: true, originClearance: true, freight: true, destinationClearance: true, delivery: true }, loadType: 'FTL', slabs: '+100', badge: null, carbonKg: 1820 },
];

const AirResultsPage: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const formData = location.state?.formData as AirFormData | undefined;

  const [allOffers, setAllOffers] = useState<ServiceOffer[]>([]);
  const [filteredOffers, setFilteredOffers] = useState<ServiceOffer[]>([]);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState<'price' | 'transit' | 'carbon'>('price');

  useEffect(() => {
    if (!formData) { navigate('/air-booking'); return; }
    (async () => {
      setLoading(true);
      try {
        const response = await rateCardsAPI.search({ serviceType: 'Air', origin: formData.originAirport || formData.originCity || '', destination: formData.destinationAirport || formData.destinationCity || '', weight: formData.totalWeight });
        if (response.data.data.length > 0) {
          const badges: Array<'best_value' | 'fastest' | 'most_popular' | null> = ['most_popular', 'best_value', 'fastest', null];
          const offers: ServiceOffer[] = response.data.data.map((r: any, i: number) => ({
            id: r.id, serviceProvider: r.carrier, transitTime: r.transitTime, price: r.totalPrice,
            originalPrice: r.originalPrice, surgeMultiplier: r.surgeMultiplier, surgeReason: r.surgeReason, isDynamicPrice: r.isDynamicPrice,
            includedServices: { pickup: true, originClearance: true, freight: true, destinationClearance: true, delivery: false },
            loadType: 'PTL' as const, slabs: 'Normal', badge: badges[i] || null, carbonKg: Math.round(800 + Math.random() * 1200),
          }));
          setAllOffers(offers); setFilteredOffers(offers);
        } else { setAllOffers(dummyOffers); setFilteredOffers(dummyOffers); }
      } catch { setAllOffers(dummyOffers); setFilteredOffers(dummyOffers); }
      finally { setLoading(false); }
    })();
  }, [formData, navigate]);

  useEffect(() => {
    let current = [...allOffers];
    if (sortBy === 'price') current.sort((a, b) => a.price - b.price);
    if (sortBy === 'transit') current.sort((a, b) => parseInt(a.transitTime) - parseInt(b.transitTime));
    if (sortBy === 'carbon') current.sort((a, b) => (a.carbonKg || 0) - (b.carbonKg || 0));
    setFilteredOffers(current);
  }, [sortBy, allOffers]);

  const handleBookNow = (offer: ServiceOffer) => {
    navigate('/air-booking-details', {
      state: {
        selectedResult: { id: offer.id, serviceName: offer.serviceProvider, carrier: offer.serviceProvider, originAirport: formData?.originAirport || '', destinationAirport: formData?.destinationAirport || '', departureDate: formData?.readyDate || '', transitTime: offer.transitTime, price: offer.price, cargoType: formData?.commodity || 'General', features: [], status: 'Available' },
        originalFormData: formData,
      }
    });
  };

  if (!formData) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-16 z-30 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-5 text-sm">
            <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-gray-400 hover:text-blue-600 transition font-medium"><FaArrowLeft className="text-xs" /> Back</button>
            <div className="h-4 w-px bg-gray-200"></div>
            <div className="flex items-center gap-2 text-gray-700"><FaMapMarkerAlt className="text-blue-400 text-xs" /><span className="font-semibold">{formData.originAirport || formData.originCity}</span><span className="text-gray-300">→</span><span className="font-semibold">{formData.destinationAirport || formData.destinationCity}</span></div>
            <div className="hidden md:flex items-center gap-1.5 text-gray-400"><FaWeight className="text-xs" /><span>{formData.totalWeight} Kgs · {formData.numberOfPieces} pcs</span></div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Sort:</span>
            {[{ key: 'price', label: 'Price' }, { key: 'transit', label: 'Transit' }, { key: 'carbon', label: '🌿 Carbon' }].map(s => (
              <button key={s.key} onClick={() => setSortBy(s.key as any)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${sortBy === s.key ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{s.label}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-5"><h1 className="text-xl font-bold text-gray-800">Air Freight Quotes</h1><p className="text-sm text-gray-400 mt-0.5">{filteredOffers.length} options · AI-updated pricing</p></div>

        {loading ? (
          <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse"><div className="h-5 bg-gray-100 rounded w-1/3 mb-3"></div><div className="h-4 bg-gray-100 rounded w-1/2"></div></div>)}</div>
        ) : (
          <div className="space-y-4">
            {filteredOffers.map(offer => {
              const badgeConfig = getBadgeConfig(offer.badge);
              const isSurge = offer.isDynamicPrice && offer.surgeMultiplier && offer.surgeMultiplier > 1;
              const isDiscount = offer.surgeMultiplier && offer.surgeMultiplier < 1;
              return (
                <div key={offer.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden" style={{ borderLeft: `4px solid ${getBorderColor(offer.badge)}` }}>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center"><FaPlane className="text-blue-500 text-sm" /></div>
                        <div><h3 className="text-base font-bold text-gray-800">{offer.serviceProvider}</h3><p className="text-xs text-gray-400">JOB ID: {offer.id.slice(0,8).toUpperCase()}</p></div>
                      </div>
                      <div className="flex items-center gap-2">
                        {badgeConfig && <span className={`text-xs font-semibold px-3 py-1 rounded-full ${badgeConfig.pill}`}>{badgeConfig.label}</span>}
                        {isSurge && <span className="text-xs font-semibold px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-600 flex items-center gap-1"><FaFire className="text-xs" />{offer.surgeMultiplier}x</span>}
                        {isDiscount && <span className="text-xs font-semibold px-3 py-1 rounded-full bg-green-50 border border-green-200 text-green-600">↓{Math.round((1-(offer.surgeMultiplier||1))*100)}% off</span>}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div><p className="text-xs text-gray-400 mb-0.5">TRANSIT</p><p className="text-sm font-semibold text-gray-700 flex items-center gap-1"><FaClock className="text-gray-300 text-xs" />{offer.transitTime}</p></div>
                      <div><p className="text-xs text-gray-400 mb-0.5">LOAD TYPE</p><p className="text-sm font-semibold text-gray-700">{offer.loadType}</p></div>
                      <div><p className="text-xs text-gray-400 mb-0.5">WEIGHT</p><p className="text-sm font-semibold text-gray-700">{formData.totalWeight} Kgs</p></div>
                      <div><p className="text-xs text-gray-400 mb-0.5">CO₂ FOOTPRINT</p><p className="text-sm font-semibold text-emerald-600 flex items-center gap-1"><FaLeaf className="text-xs" />{offer.carbonKg?.toLocaleString()} kg</p></div>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {[{ label: 'Pickup', active: offer.includedServices.pickup }, { label: 'Origin Clearance', active: offer.includedServices.originClearance }, { label: 'Freight', active: offer.includedServices.freight }, { label: 'Dest. Clearance', active: offer.includedServices.destinationClearance }, { label: 'Delivery', active: offer.includedServices.delivery }].map(s => (
                        <span key={s.label} className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${s.active ? 'bg-blue-50 text-blue-700' : 'bg-gray-50 text-gray-300 line-through'}`}>
                          {s.active ? <FaCheckCircle className="text-blue-400 text-xs" /> : <FaTimesCircle className="text-gray-200 text-xs" />}{s.label}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                      <div>{offer.surgeReason && <p className="text-xs text-orange-500 flex items-center gap-1"><FaFire className="text-xs" />{offer.surgeReason}</p>}<p className="text-xs text-gray-400">{formData.activityType}</p></div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          {offer.originalPrice && offer.originalPrice !== offer.price && <p className="text-xs text-gray-400 line-through">₹{offer.originalPrice.toLocaleString('en-IN')}</p>}
                          <p className="text-2xl font-black text-gray-900 flex items-center gap-1"><FaRupeeSign className="text-lg text-blue-500" />{offer.price.toLocaleString('en-IN')}</p>
                        </div>
                        <button onClick={() => handleBookNow(offer)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all text-sm whitespace-nowrap">Book Now <FaChevronRight className="text-xs" /></button>
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

export default AirResultsPage;
