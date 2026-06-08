// src/pages/SeaResultsPage.tsx
// Freightos-style results: Best Value / Quickest / Cheapest / Greenest tabs at top
// Left sidebar filters: Price slider, Modes, Seller, Origin Port, Destination Port
// Quote cards with forwarder name, rating, transit, expiry, Select button
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  FaShip, FaArrowLeft, FaClock, FaRupeeSign, FaLeaf, FaStar, FaChevronRight,
  FaMapMarkerAlt, FaCube, FaFire, FaCheckCircle, FaTimesCircle, FaPencilAlt,
  FaCalendarAlt, FaFilter,
} from 'react-icons/fa';
import type { SeaFormData } from '../types/QuoteFormHandle';
import { rateCardsAPI } from '../services/api';

interface SeaOffer {
  id: string;
  forwarder: string;
  forwarderRating: number;
  forwarderReviews: number;
  carrier: string;
  originPort: string;
  destinationPort: string;
  transitDays: [number, number]; // [min, max]
  portToPortDays: [number, number];
  price: number;
  originalPrice?: number;
  containerSize?: string;
  loadType: 'LCL' | 'FCL';
  rateExpiry: string; // ISO date string
  carbonKg: number;
  status: 'Available' | 'Limited' | 'Full';
  tags: Array<'best_value' | 'quickest' | 'cheapest' | 'greenest' | 'top_provider'>;
  includedServices: {
    pickup: boolean;
    originClearance: boolean;
    freight: boolean;
    destinationClearance: boolean;
    delivery: boolean;
  };
}

type Tab = 'best_value' | 'quickest' | 'cheapest' | 'greenest';

const TAB_CONFIG: { key: Tab; label: string; sub: (offers: SeaOffer[]) => string }[] = [
  { key: 'best_value', label: 'Best value', sub: os => { const o = os.find(x => x.tags.includes('best_value')); return o ? `${o.transitDays[0]}-${o.transitDays[1]} days · ₹${o.price.toLocaleString('en-IN')}` : '—'; } },
  { key: 'quickest',   label: 'Quickest',   sub: os => { const o = os.find(x => x.tags.includes('quickest'));   return o ? `${o.transitDays[0]}-${o.transitDays[1]} days · ₹${o.price.toLocaleString('en-IN')}` : '—'; } },
  { key: 'cheapest',   label: 'Cheapest',   sub: os => { const o = os.find(x => x.tags.includes('cheapest'));   return o ? `${o.transitDays[0]}-${o.transitDays[1]} days · ₹${o.price.toLocaleString('en-IN')}` : '—'; } },
  { key: 'greenest',   label: 'Greenest',   sub: os => { const o = os.find(x => x.tags.includes('greenest'));   return o ? `${o.transitDays[0]}-${o.transitDays[1]} days · ₹${o.price.toLocaleString('en-IN')}` : '—'; } },
];

const STEPS = ['Search', 'Recommended Services', 'Results', 'Booking', 'Verification'];

const fmt = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;

const generateMockOffers = (data: SeaFormData): SeaOffer[] => {
  const base = data.shipmentMode === 'FCL'
    ? (data.numberOfContainers || 1) * 95000
    : (data.volumeCBM || 1) * 6000;
  const expiry = new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString();
  return [
    {
      id: 'SEA-001', forwarder: 'Seabay International Freight Forwarding Ltd',
      forwarderRating: 4.5, forwarderReviews: 1884,
      carrier: 'Maersk', originPort: data.originPort || data.originCity || 'INMAA',
      destinationPort: data.destinationPort || data.destinationCity || 'SGSIN',
      transitDays: [28, 35], portToPortDays: [22, 28],
      price: Math.round(base * 1.05), containerSize: data.containerType,
      loadType: data.shipmentMode, rateExpiry: expiry, carbonKg: 2640,
      status: 'Available',
      tags: ['best_value', 'top_provider'],
      includedServices: { pickup: false, originClearance: true, freight: true, destinationClearance: false, delivery: false },
    },
    {
      id: 'SEA-002', forwarder: 'CMA CGM Logistics India Pvt Ltd',
      forwarderRating: 4.2, forwarderReviews: 942,
      carrier: 'CMA CGM', originPort: data.originPort || data.originCity || 'INMAA',
      destinationPort: data.destinationPort || data.destinationCity || 'SGSIN',
      transitDays: [20, 26], portToPortDays: [16, 22],
      price: Math.round(base * 1.22), containerSize: data.containerType,
      loadType: data.shipmentMode, rateExpiry: expiry, carbonKg: 3100,
      status: 'Limited',
      tags: ['quickest', 'top_provider'],
      includedServices: { pickup: true, originClearance: true, freight: true, destinationClearance: true, delivery: true },
    },
    {
      id: 'SEA-003', forwarder: 'MSC Freight Solutions',
      forwarderRating: 4.0, forwarderReviews: 614,
      carrier: 'MSC', originPort: data.originPort || data.originCity || 'INMAA',
      destinationPort: data.destinationPort || data.destinationCity || 'SGSIN',
      transitDays: [40, 50], portToPortDays: [34, 44],
      price: Math.round(base * 0.88), containerSize: data.containerType,
      loadType: data.shipmentMode, rateExpiry: expiry, carbonKg: 2310,
      status: 'Available',
      tags: ['cheapest', 'greenest'],
      includedServices: { pickup: false, originClearance: true, freight: true, destinationClearance: false, delivery: false },
    },
  ];
};

const SeaResultsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const formData = location.state?.formData as SeaFormData | undefined;

  const [allOffers, setAllOffers] = useState<SeaOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('best_value');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 0]);
  const [priceFilter, setPriceFilter] = useState<[number, number]>([0, Infinity]);
  const [sellerFilter, setSellerFilter] = useState('');
  const [originFilter, setOriginFilter] = useState('');
  const [destFilter, setDestFilter] = useState('');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    if (!formData) { navigate('/'); return; }
    setLoading(true);
    // Try API, fallback to mock
    rateCardsAPI.search({
      serviceType: 'Sea',
      origin: formData.originPort || formData.originCity || '',
      destination: formData.destinationPort || formData.destinationCity || '',
    }).then((res: any) => {
      const data = res?.data?.data;
      if (data && data.length > 0) {
        // map API response → SeaOffer shape (best effort)
        setAllOffers(generateMockOffers(formData)); // TODO: real mapping
      } else {
        setAllOffers(generateMockOffers(formData));
      }
    }).catch(() => {
      setAllOffers(generateMockOffers(formData));
    }).finally(() => {
      setLoading(false);
    });
  }, [formData]);

  useEffect(() => {
    if (allOffers.length === 0) return;
    const prices = allOffers.map(o => o.price);
    const mn = Math.min(...prices);
    const mx = Math.max(...prices);
    setPriceRange([mn, mx]);
    setPriceFilter([mn, mx]);
  }, [allOffers]);

  if (!formData) return null;

  // Tab-sorted list
  const sortedForTab = (tab: Tab): SeaOffer[] => {
    const list = [...allOffers].filter(o =>
      (sellerFilter ? o.forwarder === sellerFilter : true) &&
      (originFilter ? o.originPort === originFilter : true) &&
      (destFilter ? o.destinationPort === destFilter : true) &&
      o.price >= priceFilter[0] && o.price <= priceFilter[1]
    );
    if (tab === 'best_value') return list.sort((a, b) => (a.price / a.transitDays[0]) - (b.price / b.transitDays[0]));
    if (tab === 'quickest')   return list.sort((a, b) => a.transitDays[0] - b.transitDays[0]);
    if (tab === 'cheapest')   return list.sort((a, b) => a.price - b.price);
    if (tab === 'greenest')   return list.sort((a, b) => a.carbonKg - b.carbonKg);
    return list;
  };

  const displayOffers = sortedForTab(activeTab);
  // "top quote" = first result; rest go into "more quotes"
  const topOffer = displayOffers[0];
  const moreOffers = displayOffers.slice(1);

  const uniqueSellers = Array.from(new Set(allOffers.map(o => o.forwarder)));
  const uniqueOrigins = Array.from(new Set(allOffers.map(o => o.originPort)));
  const uniqueDests = Array.from(new Set(allOffers.map(o => o.destinationPort)));

  const originLabel = formData.originPort || formData.originCity || '—';
  const destinationLabel = formData.destinationPort || formData.destinationCity || '—';
  const loadLabel = formData.shipmentMode === 'FCL'
    ? `${formData.numberOfContainers || 1} × ${formData.containerType || '40\''} container`
    : `LCL · ${formData.volumeCBM} CBM`;
  const goodsLabel = `₹${(10000).toLocaleString('en-IN')} · ${formData.commodity || 'Goods are ready'}`;

  const handleSelect = (offer: SeaOffer) => {
    navigate('/sea-booking-details', {
      state: {
        selectedResult: {
          id: offer.id,
          serviceName: offer.forwarder,
          carrier: offer.carrier,
          originPort: offer.originPort,
          destinationPort: offer.destinationPort,
          departureDate: new Date().toLocaleDateString('en-IN'),
          transitTime: `${offer.transitDays[0]}-${offer.transitDays[1]} days`,
          price: offer.price,
          containerSize: offer.containerSize || '',
          features: [],
          status: offer.status,
        },
        originalFormData: formData,
      },
    });
  };

  const FiltersPanel = () => (
    <div className="space-y-5">
      {/* Price */}
      <div>
        <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Price</p>
        <p className="text-xs text-gray-400 mb-2">{fmt(priceFilter[0])} – {fmt(priceFilter[1])}</p>
        <input
          type="range"
          min={priceRange[0]}
          max={priceRange[1]}
          value={priceFilter[1]}
          onChange={e => setPriceFilter([priceFilter[0], Number(e.target.value)])}
          className="w-full accent-blue-600"
        />
      </div>
      {/* Modes */}
      <div>
        <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Modes</p>
        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
          <input type="checkbox" defaultChecked className="accent-blue-600 rounded" />
          {formData.shipmentMode} ({allOffers.length})
        </label>
      </div>
      {/* Seller */}
      <div>
        <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Seller</p>
        <div className="space-y-1.5">
          {uniqueSellers.map(s => (
            <label key={s} className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={sellerFilter === '' || sellerFilter === s}
                onChange={() => setSellerFilter(sellerFilter === s ? '' : s)}
                className="accent-blue-600 rounded"
              />
              <span className="truncate">{s.split(' ').slice(0, 2).join(' ')}… ({allOffers.filter(o => o.forwarder === s).length})</span>
            </label>
          ))}
        </div>
      </div>
      {/* Origin Port */}
      <div>
        <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Origin Port</p>
        {uniqueOrigins.map(p => (
          <label key={p} className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer mb-1">
            <input type="checkbox" checked={originFilter === '' || originFilter === p} onChange={() => setOriginFilter(originFilter === p ? '' : p)} className="accent-blue-600 rounded" />
            {p} ({allOffers.filter(o => o.originPort === p).length})
          </label>
        ))}
      </div>
      {/* Destination Port */}
      <div>
        <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Destination Port</p>
        {uniqueDests.map(p => (
          <label key={p} className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer mb-1">
            <input type="checkbox" checked={destFilter === '' || destFilter === p} onChange={() => setDestFilter(destFilter === p ? '' : p)} className="accent-blue-600 rounded" />
            {p} ({allOffers.filter(o => o.destinationPort === p).length})
          </label>
        ))}
      </div>
    </div>
  );

  const OfferCard = ({ offer, isTop }: { offer: SeaOffer; isTop?: boolean }) => {
    const tagLabels: Record<string, string> = {
      best_value: 'Best value',
      quickest: 'Quickest',
      cheapest: 'Cheapest',
      greenest: '🌿 Greenest',
      top_provider: 'Top Logistics Provider',
    };
    const expiryDate = new Date(offer.rateExpiry);
    const expiryStr = expiryDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden">
        <div className="p-6">
          {/* Tags row */}
          <div className="flex flex-wrap gap-2 mb-4">
            {offer.tags.filter(t => t !== 'top_provider').map(tag => (
              <span key={tag} className="text-xs font-semibold px-3 py-1 rounded-full" style={{
                background: tag === 'best_value' ? '#fef9c3' : tag === 'quickest' ? '#e0f2fe' : tag === 'cheapest' ? '#dcfce7' : '#d1fae5',
                color: tag === 'best_value' ? '#92400e' : tag === 'quickest' ? '#0369a1' : '#166534',
              }}>
                {tagLabels[tag]}
              </span>
            ))}
            {offer.tags.includes('top_provider') && (
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 text-blue-700">
                Top Logistics Provider
              </span>
            )}
          </div>

          {/* Route line */}
          <div className="flex items-center gap-3 mb-1">
            <FaShip className="text-gray-400 text-xs flex-shrink-0" />
            <span className="text-sm text-gray-600">
              Ocean · Est. <strong>{offer.transitDays[0]}-{offer.transitDays[1]} days</strong> ({offer.portToPortDays[0]}-{offer.portToPortDays[1]} days port-to-port)
            </span>
          </div>
          <div className="flex items-center gap-3 mb-1 text-sm text-gray-500">
            <FaMapMarkerAlt className="text-gray-300 text-xs flex-shrink-0" />
            {offer.originPort} — <FaShip className="text-gray-200 text-xs" /> — {offer.destinationPort}
          </div>

          {/* Forwarder + rating */}
          <div className="flex items-center gap-2 mt-3">
            <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold">
              {offer.forwarder[0]}
            </div>
            <span className="text-sm text-gray-700 font-medium">{offer.forwarder}</span>
            <span className="flex items-center gap-0.5 text-amber-500 text-xs font-bold">
              <FaStar className="text-xs" /> {offer.forwarderRating}
            </span>
            <span className="text-xs text-gray-400">({offer.forwarderReviews.toLocaleString()})</span>
          </div>

          {/* Services included */}
          <div className="flex flex-wrap gap-2 mt-4">
            {[
              { label: 'Pickup', active: offer.includedServices.pickup },
              { label: 'Origin Clearance', active: offer.includedServices.originClearance },
              { label: 'Freight', active: offer.includedServices.freight },
              { label: 'Dest. Clearance', active: offer.includedServices.destinationClearance },
              { label: 'Delivery', active: offer.includedServices.delivery },
            ].map(s => (
              <span key={s.label} className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium border ${
                s.active ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-gray-50 text-gray-300 border-gray-100 line-through'
              }`}>
                {s.label}
              </span>
            ))}
          </div>
        </div>

        {/* Price + CTA footer */}
        <div className="border-t border-gray-50 px-6 py-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <FaCalendarAlt className="text-xs" />
              Rate expires: {expiryStr} 03:59 PM (IST)
            </div>
            <div className="flex items-center gap-1 text-xs text-emerald-600 mt-1">
              <FaLeaf className="text-xs" /> {offer.carbonKg.toLocaleString()} kg CO₂ est.
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              {offer.originalPrice && offer.originalPrice !== offer.price && (
                <p className="text-xs text-gray-400 line-through">{fmt(offer.originalPrice)}</p>
              )}
              <p className="text-xl font-black text-gray-900">{fmt(offer.price)}<sup className="text-xs font-normal text-gray-400 ml-0.5">10</sup></p>
            </div>
            <button
              onClick={() => handleSelect(offer)}
              className="px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95"
              style={{ background: 'linear-gradient(90deg, #1e40af, #2563eb)' }}
            >
              Select
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── Step bar ── */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {STEPS.map((step, idx) => {
              const stepNum = idx + 1;
              const isActive = stepNum === 3;
              const isDone = stepNum < 3;
              return (
                <React.Fragment key={step}>
                  <div className="flex flex-col items-center gap-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      isDone ? 'bg-blue-500 text-white' : isActive ? 'bg-blue-600 text-white ring-4 ring-blue-100' : 'bg-gray-200 text-gray-400'
                    }`}>{stepNum}</div>
                    <span className={`text-xs font-semibold whitespace-nowrap hidden sm:block ${isActive ? 'text-gray-800' : isDone ? 'text-blue-500' : 'text-gray-400'}`}>{step}</span>
                  </div>
                  {idx < STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-2 mb-5 ${isDone ? 'bg-blue-400' : 'bg-gray-200'}`} />}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Search summary bar ── */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-3">
          <div className="flex flex-wrap gap-0 divide-x divide-gray-200 rounded-xl border border-gray-200 overflow-hidden text-sm bg-gray-50">
            {[
              { label: 'Origin', value: originLabel },
              { label: 'Destination', value: destinationLabel },
              { label: 'Load', value: loadLabel },
              { label: 'Goods', value: goodsLabel },
            ].map(f => (
              <div key={f.label} className="flex items-center gap-2 px-4 py-2.5 flex-1 min-w-[120px]">
                <div>
                  <p className="text-xs text-gray-400 font-medium">{f.label} <span className="text-green-500">✓</span></p>
                  <p className="text-sm font-bold text-gray-800 truncate">{f.value}</p>
                </div>
              </div>
            ))}
            <div className="flex items-center px-4">
              <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-blue-500 transition" title="Edit search">
                <FaPencilAlt className="text-sm" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tab bar ── */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex gap-0 overflow-x-auto">
            {TAB_CONFIG.map(tab => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex flex-col items-start px-5 py-3.5 text-left whitespace-nowrap border-b-2 transition-all text-sm ${
                    isActive
                      ? 'border-blue-600 text-blue-700 bg-blue-50/50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className={`font-bold ${isActive ? 'text-blue-700' : 'text-gray-700'}`}>{tab.label}</span>
                  <span className="text-xs text-gray-400 mt-0.5">{tab.sub(allOffers)}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex gap-6">

          {/* Left filters sidebar */}
          <aside className="hidden lg:block w-56 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-6">
              <h3 className="font-bold text-gray-700 text-sm mb-5">Filters</h3>
              <FiltersPanel />
            </div>
          </aside>

          {/* Results list */}
          <div className="flex-1 min-w-0">

            {/* Mobile filter toggle */}
            <button
              className="lg:hidden flex items-center gap-2 text-sm font-semibold text-blue-600 mb-4 bg-white border border-gray-200 rounded-xl px-4 py-2"
              onClick={() => setShowMobileFilters(!showMobileFilters)}
            >
              <FaFilter className="text-xs" /> Filters
            </button>
            {showMobileFilters && (
              <div className="lg:hidden bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
                <FiltersPanel />
              </div>
            )}

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
                    <div className="space-y-3">
                      <div className="h-5 bg-gray-100 rounded w-1/3"></div>
                      <div className="h-4 bg-gray-100 rounded w-2/3"></div>
                      <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : displayOffers.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                <FaShip className="text-gray-200 text-5xl mx-auto mb-4" />
                <p className="text-gray-500 font-semibold">No offers match your filters.</p>
                <button onClick={() => { setSellerFilter(''); setOriginFilter(''); setDestFilter(''); setPriceFilter(priceRange); }} className="mt-3 text-blue-600 text-sm hover:underline">
                  Clear filters
                </button>
              </div>
            ) : (
              <>
                {/* Top Quote */}
                {topOffer && (
                  <div className="mb-2">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                      1 Top Quote ({displayOffers.length} in total)
                    </p>
                    <OfferCard offer={topOffer} isTop />
                  </div>
                )}

                {/* More Quotes */}
                {moreOffers.length > 0 && (
                  <div className="mt-6">
                    <p className="text-sm font-semibold text-gray-500 mb-3">
                      {moreOffers.length} More Quote{moreOffers.length > 1 ? 's' : ''} from all providers
                    </p>
                    <div className="space-y-4">
                      {moreOffers.map(offer => (
                        <OfferCard key={offer.id} offer={offer} />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeaResultsPage;
