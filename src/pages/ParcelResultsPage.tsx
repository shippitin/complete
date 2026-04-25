// src/pages/ParcelResultsPage.tsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaBox, FaInfoCircle, FaArrowLeft, FaClock, FaRupeeSign, FaWeight, FaBoxes, FaMapMarkerAlt, FaCalendarAlt, FaGlobe, FaLeaf, FaFire, FaChevronRight } from 'react-icons/fa';
import type { ParcelFormData } from '../types/QuoteFormHandle';
import { rateCardsAPI } from '../services/api';

const getBorderColor = (badge: string | null | undefined) => {
  switch (badge) { case 'best_value': return '#fbbf24'; case 'fastest': return '#38bdf8'; case 'most_popular': return '#fb7185'; default: return 'transparent'; }
};
const getBadgeConfig = (badge: string | null | undefined) => {
  switch (badge) {
    case 'best_value': return { label: '★ Best Value', pill: 'bg-amber-50 text-amber-700 border border-amber-200' };
    case 'fastest': return { label: '⚡ Fastest', pill: 'bg-sky-50 text-sky-700 border border-sky-200' };
    case 'most_popular': return { label: '🔥 Most Popular', pill: 'bg-rose-50 text-rose-700 border border-rose-200' };
    default: return null;
  }
};

interface ParcelOffer {
  id: string; serviceProvider: string; origin: string; destination: string; pickupDate: string;
  transitTime: string; price: number; isDomestic: boolean; courierMode: 'DOC' | 'NON';
  parcelCount: number; totalWeight: number; cargoType: string; features: string[];
  status: 'Available' | 'Limited' | 'Full'; badge?: string | null; carbonKg?: number;
  surgeMultiplier?: number; surgeReason?: string; isDynamicPrice?: boolean;
}

const ParcelResultsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const formData = location.state?.formData as ParcelFormData | undefined;
  const [allOffers, setAllOffers] = useState<ParcelOffer[]>([]);
  const [filteredOffers, setFilteredOffers] = useState<ParcelOffer[]>([]);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState<'price' | 'transit' | 'carbon'>('price');

  const getDummyOffers = (data: ParcelFormData): ParcelOffer[] => {
    const basePricePerKG = data.isDomestic ? 100 : 300;
    const totalPrice = (data.totalWeight || 0) * basePricePerKG + (data.parcelCount || 0) * (data.courierMode === 'DOC' ? 50 : 150);
    const courierMode = data.courierMode as 'DOC' | 'NON';
    return [
      { id: 'PARCEL-A', serviceProvider: 'Zipaworld', origin: data.origin, destination: data.destination, pickupDate: data.readyDate, transitTime: data.isDomestic ? '2-4 Days' : '5-7 Days', price: Math.round(totalPrice * 1.1), isDomestic: data.isDomestic, courierMode, parcelCount: data.parcelCount, totalWeight: data.totalWeight, cargoType: data.cargoType, features: ['Express', 'Tracking'], status: 'Available', badge: 'most_popular', carbonKg: 45 },
      { id: 'PARCEL-B', serviceProvider: 'Blue Dart', origin: data.origin, destination: data.destination, pickupDate: data.readyDate, transitTime: data.isDomestic ? '3-5 Days' : '6-8 Days', price: Math.round(totalPrice * 0.95), isDomestic: data.isDomestic, courierMode, parcelCount: data.parcelCount, totalWeight: data.totalWeight, cargoType: data.cargoType, features: ['Reliable', 'POD'], status: 'Available', badge: 'best_value', carbonKg: 38 },
      { id: 'PARCEL-C', serviceProvider: 'DTDC', origin: data.origin, destination: data.destination, pickupDate: data.readyDate, transitTime: data.isDomestic ? '1-2 Days' : '4-5 Days', price: Math.round(totalPrice * 0.9), isDomestic: data.isDomestic, courierMode, parcelCount: data.parcelCount, totalWeight: data.totalWeight, cargoType: data.cargoType, features: ['Economical'], status: 'Limited', badge: 'fastest', carbonKg: 30 },
    ];
  };

  useEffect(() => {
    if (!formData) { navigate('/parcel-booking'); return; }
    (async () => {
      setLoading(true);
      try {
        const response = await rateCardsAPI.search({ serviceType: 'Parcel', origin: formData.origin || '', destination: formData.destination || '', weight: formData.totalWeight });
        const badges = ['most_popular', 'best_value', 'fastest', null];
        const courierMode = formData.courierMode as 'DOC' | 'NON';
        if (response.data.data.length > 0) {
          const offers = response.data.data.map((r: any, i: number) => ({ id: r.id, serviceProvider: r.carrier, origin: r.origin, destination: r.destination, pickupDate: formData.readyDate, transitTime: r.transitTime, price: r.totalPrice, isDomestic: formData.isDomestic, courierMode, parcelCount: formData.parcelCount, totalWeight: formData.totalWeight, cargoType: formData.cargoType, features: ['Tracking'], status: 'Available' as const, badge: badges[i] || null, carbonKg: Math.round(20 + Math.random() * 50), surgeMultiplier: r.surgeMultiplier, surgeReason: r.surgeReason, isDynamicPrice: r.isDynamicPrice }));
          setAllOffers(offers); setFilteredOffers(offers);
        } else { const d = getDummyOffers(formData); setAllOffers(d); setFilteredOffers(d); }
      } catch { const d = getDummyOffers(formData); setAllOffers(d); setFilteredOffers(d); }
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

  if (!formData) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-16 z-30 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-5 text-sm">
            <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-gray-400 hover:text-blue-600 transition font-medium"><FaArrowLeft className="text-xs" /> Back</button>
            <div className="h-4 w-px bg-gray-200"></div>
            <div className="flex items-center gap-2 text-gray-700"><FaMapMarkerAlt className="text-blue-400 text-xs" /><span className="font-semibold">{formData.origin}</span><span className="text-gray-300">→</span><span className="font-semibold">{formData.destination}</span></div>
            <div className="hidden md:flex items-center gap-1.5 text-gray-400"><span>{formData.isDomestic ? 'Domestic' : 'International'} · {formData.totalWeight} Kgs</span></div>
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
        <div className="mb-5"><h1 className="text-xl font-bold text-gray-800">Parcel Delivery Quotes</h1><p className="text-sm text-gray-400 mt-0.5">{filteredOffers.length} options · AI-updated pricing</p></div>
        {loading ? <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse"><div className="h-5 bg-gray-100 rounded w-1/3 mb-3"></div></div>)}</div> : (
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
                        <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center"><FaBox className="text-blue-500 text-sm" /></div>
                        <div><h3 className="text-base font-bold text-gray-800">{offer.serviceProvider}</h3><p className="text-xs text-gray-400">JOB ID: {offer.id}</p></div>
                      </div>
                      <div className="flex items-center gap-2">
                        {badgeConfig && <span className={`text-xs font-semibold px-3 py-1 rounded-full ${badgeConfig.pill}`}>{badgeConfig.label}</span>}
                        {isSurge && <span className="text-xs font-semibold px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-600 flex items-center gap-1"><FaFire className="text-xs" />{offer.surgeMultiplier}x</span>}
                        {isDiscount && <span className="text-xs font-semibold px-3 py-1 rounded-full bg-green-50 border border-green-200 text-green-600">↓{Math.round((1-(offer.surgeMultiplier||1))*100)}% off</span>}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div><p className="text-xs text-gray-400 mb-0.5">ROUTE</p><p className="text-sm font-bold text-gray-800">{offer.origin} → {offer.destination}</p></div>
                      <div><p className="text-xs text-gray-400 mb-0.5">TRANSIT</p><p className="text-sm font-semibold text-gray-700 flex items-center gap-1"><FaClock className="text-gray-300 text-xs" />{offer.transitTime}</p></div>
                      <div><p className="text-xs text-gray-400 mb-0.5">WEIGHT</p><p className="text-sm font-semibold text-gray-700">{offer.totalWeight} Kgs · {offer.parcelCount} pcs</p></div>
                      <div><p className="text-xs text-gray-400 mb-0.5">CO₂</p><p className="text-sm font-semibold text-emerald-600 flex items-center gap-1"><FaLeaf className="text-xs" />{offer.carbonKg} kg</p></div>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {offer.features.map((f, i) => <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-medium">{f}</span>)}
                      <span className="text-xs px-2.5 py-1 rounded-full bg-gray-50 text-gray-500 font-medium">{offer.isDomestic ? '🇮🇳 Domestic' : '🌍 International'}</span>
                      <span className="text-xs px-2.5 py-1 rounded-full bg-gray-50 text-gray-500 font-medium">{offer.courierMode === 'DOC' ? '📄 Document' : '📦 Non-Document'}</span>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                      <div>{offer.surgeReason && <p className="text-xs text-orange-500 flex items-center gap-1"><FaFire className="text-xs" />{offer.surgeReason}</p>}</div>
                      <div className="flex items-center gap-4">
                        <p className="text-2xl font-black text-gray-900 flex items-center gap-1"><FaRupeeSign className="text-lg text-blue-500" />{offer.price.toLocaleString('en-IN')}</p>
                        <button onClick={() => navigate('/parcel-booking-details', { state: { selectedResult: offer, originalFormData: formData } })} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition text-sm whitespace-nowrap">
                          Book Now <FaChevronRight className="text-xs" />
                        </button>
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

export default ParcelResultsPage;
