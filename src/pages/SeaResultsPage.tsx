// src/pages/SeaResultsPage.tsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaShip, FaInfoCircle, FaArrowLeft, FaClock, FaRupeeSign, FaCube, FaMapMarkerAlt, FaCalendarAlt, FaCheckCircle, FaTimesCircle, FaWeight, FaLeaf, FaBolt, FaStar, FaFire, FaChevronRight } from 'react-icons/fa';
import type { SeaFormData } from '../types/QuoteFormHandle';
import { rateCardsAPI } from '../services/api';

interface SeaServiceOffer {
  id: string;
  serviceProvider: string;
  carrier: string;
  originPort: string;
  destinationPort: string;
  departureDate: string;
  transitTime: string;
  price: number;
  originalPrice?: number;
  surgeMultiplier?: number;
  surgeReason?: string;
  isDynamicPrice?: boolean;
  containerSize?: string;
  includedServices: {
    pickup: boolean;
    originClearance: boolean;
    freight: boolean;
    destinationClearance: boolean;
    delivery: boolean;
  };
  loadType: 'LCL' | 'FCL';
  features: string[];
  status: 'Available' | 'Limited' | 'Full';
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

const SeaResultsPage: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const formData = location.state?.formData as SeaFormData | undefined;

  const [allOffers, setAllOffers] = useState<SeaServiceOffer[]>([]);
  const [filteredOffers, setFilteredOffers] = useState<SeaServiceOffer[]>([]);
  const [selectedTransitTimeFilter, setSelectedTransitTimeFilter] = useState<string>('');
  const [selectedCarrierFilter, setSelectedCarrierFilter] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState<'price' | 'transit' | 'carbon'>('price');

  const generateDummyOffers = (data: SeaFormData): SeaServiceOffer[] => {
    const totalCalculatedPrice = data.shipmentMode === 'LCL'
      ? (data.totalWeight || 0) * 150 + (data.volumeCBM || 0) * 5000
      : (data.numberOfContainers || 0) * 100000;
    const departureDate = new Date(data.readyDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    return [
      { id: 'SEA-001', serviceProvider: 'Maersk Line', carrier: 'Maersk Line', originPort: data.originPort || data.originCity || 'N/A', destinationPort: data.destinationPort || data.destinationCity || 'N/A', departureDate, transitTime: '25-30 Days', price: Math.round(totalCalculatedPrice * 1.1), containerSize: data.containerType, includedServices: { pickup: false, originClearance: true, freight: true, destinationClearance: false, delivery: false }, loadType: data.shipmentMode, features: ['Direct Route', 'GPS Tracking'], status: 'Available', badge: 'most_popular', carbonKg: 2840 },
      { id: 'SEA-002', serviceProvider: 'MSC Shipping', carrier: 'MSC Shipping', originPort: data.originPort || data.originCity || 'N/A', destinationPort: data.destinationPort || data.destinationCity || 'N/A', departureDate, transitTime: '30-35 Days', price: Math.round(totalCalculatedPrice * 0.95), containerSize: data.containerType, includedServices: { pickup: false, originClearance: true, freight: true, destinationClearance: false, delivery: false }, loadType: data.shipmentMode, features: ['Economical', 'Reliable Schedule'], status: 'Available', badge: 'best_value', carbonKg: 2650 },
      { id: 'SEA-003', serviceProvider: 'CMA CGM', carrier: 'CMA CGM', originPort: data.originPort || data.originCity || 'N/A', destinationPort: data.destinationPort || data.destinationCity || 'N/A', departureDate, transitTime: '20-25 Days', price: Math.round(totalCalculatedPrice * 1.2), containerSize: data.containerType, includedServices: { pickup: true, originClearance: true, freight: true, destinationClearance: true, delivery: true }, loadType: data.shipmentMode, features: ['Express', 'Door to Door'], status: 'Limited', badge: 'fastest', carbonKg: 3100 },
    ];
  };

  useEffect(() => {
    if (!formData) { navigate('/sea-booking'); return; }
    (async () => {
      setLoading(true);
      try {
        const response = await rateCardsAPI.search({
          serviceType: 'Sea',
          origin: formData.originPort || formData.originCity || '',
          destination: formData.destinationPort || formData.destinationCity || '',
          numberOfContainers: formData.numberOfContainers,
          containerType: formData.containerType,
        });
        if (response.data.data.length > 0) {
          const badges: Array<'best_value' | 'fastest' | 'most_popular' | null> = ['most_popular', 'best_value', 'fastest', null, null];
          const offers: SeaServiceOffer[] = response.data.data.map((r: any, i: number) => ({
            id: r.id, serviceProvider: r.carrier, carrier: r.carrier,
            originPort: r.origin, destinationPort: r.destination,
            departureDate: new Date().toLocaleDateString('en-IN'),
            transitTime: r.transitTime, price: r.totalPrice,
            originalPrice: r.originalPrice, surgeMultiplier: r.surgeMultiplier,
            surgeReason: r.surgeReason, isDynamicPrice: r.isDynamicPrice,
            containerSize: r.containerType || formData.containerType,
            includedServices: { pickup: false, originClearance: true, freight: true, destinationClearance: false, delivery: false },
            loadType: formData.shipmentMode, features: ['GPS Tracking', 'Online Booking'],
            status: 'Available' as const, badge: badges[i] || null,
            carbonKg: Math.round(2000 + Math.random() * 1500),
          }));
          setAllOffers(offers); setFilteredOffers(offers);
        } else {
          const dummy = generateDummyOffers(formData);
          setAllOffers(dummy); setFilteredOffers(dummy);
        }
      } catch { const dummy = generateDummyOffers(formData); setAllOffers(dummy); setFilteredOffers(dummy); }
      finally { setLoading(false); }
    })();
  }, [formData, navigate]);

  useEffect(() => {
    let current = [...allOffers];
    if (selectedTransitTimeFilter) current = current.filter(o => o.transitTime === selectedTransitTimeFilter);
    if (selectedCarrierFilter) current = current.filter(o => o.carrier === selectedCarrierFilter);
    if (sortBy === 'price') current.sort((a, b) => a.price - b.price);
    if (sortBy === 'transit') current.sort((a, b) => parseInt(a.transitTime) - parseInt(b.transitTime));
    if (sortBy === 'carbon') current.sort((a, b) => (a.carbonKg || 0) - (b.carbonKg || 0));
    setFilteredOffers(current);
  }, [selectedTransitTimeFilter, selectedCarrierFilter, sortBy, allOffers]);

  const handleBookNow = (offer: SeaServiceOffer) => {
    navigate('/sea-booking-details', {
      state: {
        selectedResult: {
          id: offer.id, serviceName: offer.serviceProvider, carrier: offer.carrier,
          originPort: offer.originPort, destinationPort: offer.destinationPort,
          departureDate: offer.departureDate, transitTime: offer.transitTime,
          price: offer.price, containerSize: offer.containerSize || '',
          features: offer.features, status: offer.status,
        },
        originalFormData: formData,
      }
    });
  };

  if (!formData) return null;

  const uniqueCarriers = Array.from(new Set(allOffers.map(o => o.carrier)));
  const uniqueTransitTimes = Array.from(new Set(allOffers.map(o => o.transitTime)));

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Sticky top bar */}
      <div className="sticky top-16 z-30 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-5 text-sm">
            <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-gray-400 hover:text-blue-600 transition font-medium">
              <FaArrowLeft className="text-xs" /> Back
            </button>
            <div className="h-4 w-px bg-gray-200"></div>
            <div className="flex items-center gap-2 text-gray-700">
              <FaMapMarkerAlt className="text-blue-400 text-xs" />
              <span className="font-semibold">{formData.originPort || formData.originCity}</span>
              <span className="text-gray-300">→</span>
              <span className="font-semibold">{formData.destinationPort || formData.destinationCity}</span>
            </div>
            <div className="hidden md:flex items-center gap-1.5 text-gray-400">
              <FaCube className="text-xs" />
              <span>{formData.shipmentMode} · {formData.totalWeight} Kgs</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Sort:</span>
            {[{ key: 'price', label: 'Price' }, { key: 'transit', label: 'Transit' }, { key: 'carbon', label: '🌿 Carbon' }].map(s => (
              <button key={s.key} onClick={() => setSortBy(s.key as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${sortBy === s.key ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-6">

          {/* Sidebar */}
          <aside className="hidden lg:block w-52 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-36">
              <h3 className="font-bold text-gray-700 text-sm mb-4">Filter Results</h3>
              <div className="space-y-5">
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Carrier</p>
                  <div className="space-y-1">
                    <button onClick={() => setSelectedCarrierFilter('')} className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${!selectedCarrierFilter ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}>All Carriers</button>
                    {uniqueCarriers.map(c => <button key={c} onClick={() => setSelectedCarrierFilter(c)} className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${selectedCarrierFilter === c ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}>{c}</button>)}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Transit Time</p>
                  <div className="space-y-1">
                    <button onClick={() => setSelectedTransitTimeFilter('')} className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${!selectedTransitTimeFilter ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}>Any Duration</button>
                    {uniqueTransitTimes.map(t => <button key={t} onClick={() => setSelectedTransitTimeFilter(t)} className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${selectedTransitTimeFilter === t ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}>{t}</button>)}
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Results */}
          <div className="flex-1 min-w-0">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-gray-800">Sea Freight Quotes</h1>
                <p className="text-sm text-gray-400 mt-0.5">{filteredOffers.length} options · AI-updated pricing</p>
              </div>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1,2,3].map(i => (
                  <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
                    <div className="flex justify-between">
                      <div className="space-y-3 flex-1"><div className="h-5 bg-gray-100 rounded w-1/3"></div><div className="h-4 bg-gray-100 rounded w-1/2"></div></div>
                      <div className="space-y-3 w-32"><div className="h-8 bg-gray-100 rounded"></div><div className="h-10 bg-gray-100 rounded"></div></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredOffers.length > 0 ? (
              <div className="space-y-4">
                {filteredOffers.map((offer) => {
                  const badgeConfig = getBadgeConfig(offer.badge);
                  const isSurge = offer.isDynamicPrice && offer.surgeMultiplier && offer.surgeMultiplier > 1;
                  const isDiscount = offer.surgeMultiplier && offer.surgeMultiplier < 1;

                  return (
                    <div key={offer.id} className={`bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden`} style={badgeConfig ? { borderLeft: `4px solid ${offer.badge === 'best_value' ? '#fbbf24' : offer.badge === 'fastest' ? '#38bdf8' : '#fb7185'}` } : {}}>

                      <div className="px-6 pt-5 pb-0 flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                            <FaShip className="text-blue-500 text-sm" />
                          </div>
                          <div>
                            <h3 className="text-base font-bold text-gray-800">{offer.serviceProvider}</h3>
                            <p className="text-xs text-gray-400">JOB ID: {offer.id.slice(0,8).toUpperCase()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap justify-end">
                          {badgeConfig && (
                            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${badgeConfig.pill}`}>
                              {badgeConfig.label}
                            </span>
                          )}
                          {isSurge && (
                            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-600 flex items-center gap-1">
                              <FaFire className="text-xs" /> {offer.surgeMultiplier}x surge
                            </span>
                          )}
                          {isDiscount && (
                            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-green-50 border border-green-200 text-green-600">
                              ↓ {Math.round((1 - (offer.surgeMultiplier || 1)) * 100)}% off
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="p-6">
                        {/* Details grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
                          <div><p className="text-xs text-gray-400 mb-0.5">FROM</p><p className="text-sm font-bold text-gray-800">{offer.originPort}</p></div>
                          <div><p className="text-xs text-gray-400 mb-0.5">TO</p><p className="text-sm font-bold text-gray-800">{offer.destinationPort}</p></div>
                          <div><p className="text-xs text-gray-400 mb-0.5">TRANSIT</p><p className="text-sm font-semibold text-gray-700 flex items-center gap-1"><FaClock className="text-gray-300 text-xs" />{offer.transitTime}</p></div>
                          <div><p className="text-xs text-gray-400 mb-0.5">CO₂ FOOTPRINT</p><p className="text-sm font-semibold text-emerald-600 flex items-center gap-1"><FaLeaf className="text-xs" />{offer.carbonKg?.toLocaleString()} kg</p></div>
                        </div>

                        {/* Services row */}
                        <div className="flex flex-wrap gap-2 mb-5">
                          {[
                            { label: 'Pickup', active: offer.includedServices.pickup },
                            { label: 'Origin Clearance', active: offer.includedServices.originClearance },
                            { label: 'Freight', active: offer.includedServices.freight },
                            { label: 'Dest. Clearance', active: offer.includedServices.destinationClearance },
                            { label: 'Delivery', active: offer.includedServices.delivery },
                          ].map(s => (
                            <span key={s.label} className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${s.active ? 'bg-blue-50 text-blue-700' : 'bg-gray-50 text-gray-300 line-through'}`}>
                              {s.active ? <FaCheckCircle className="text-blue-400 text-xs" /> : <FaTimesCircle className="text-gray-200 text-xs" />}
                              {s.label}
                            </span>
                          ))}
                        </div>

                        {/* Bottom: surge reason + price + CTA */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-gray-50">
                          <div>
                            {offer.surgeReason && (
                              <p className="text-xs text-orange-500 flex items-center gap-1 mb-1">
                                <FaFire className="text-xs" /> {offer.surgeReason}
                              </p>
                            )}
                            <p className="text-xs text-gray-400">{formData.shipmentMode} · {formData.numberOfContainers || 1} container{(formData.numberOfContainers || 1) > 1 ? 's' : ''}</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              {offer.originalPrice && offer.originalPrice !== offer.price && (
                                <p className="text-xs text-gray-400 line-through">₹{offer.originalPrice.toLocaleString('en-IN')}</p>
                              )}
                              <p className="text-2xl font-black text-gray-900 flex items-center gap-1">
                                <FaRupeeSign className="text-lg text-blue-500" />{offer.price.toLocaleString('en-IN')}
                              </p>
                            </div>
                            <button onClick={() => handleBookNow(offer)}
                              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 whitespace-nowrap text-sm">
                              Book Now <FaChevronRight className="text-xs" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                <FaShip className="text-gray-200 text-5xl mx-auto mb-4" />
                <p className="text-gray-500 font-semibold">No offers found.</p>
                <button onClick={() => navigate(-1)} className="mt-4 text-blue-600 text-sm hover:underline">Modify search</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeaResultsPage;
