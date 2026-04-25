// src/pages/LCLResultsPage.tsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaBoxes, FaInfoCircle, FaArrowLeft, FaClock, FaRupeeSign, FaWarehouse, FaCalendarAlt, FaLeaf, FaFire, FaChevronRight, FaMapMarkerAlt } from 'react-icons/fa';
import type { LCLFormData } from '../types/QuoteFormHandle';
import { rateCardsAPI } from '../services/api';

interface LCLServiceResult {
  id: string; serviceName: string; carrier: string; originWarehouse: string; destinationWarehouse: string;
  readyDate: string; transitTime: string; price: number; dimensions: string; features: string[];
  status: 'Available' | 'Limited' | 'Full'; badge?: 'best_value' | 'fastest' | 'most_popular' | null; carbonKg?: number;
  surgeMultiplier?: number; surgeReason?: string; isDynamicPrice?: boolean;
}

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

const LCLResultsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const formData = location.state?.formData as LCLFormData | undefined;
  const [results, setResults] = useState<LCLServiceResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState<'price' | 'transit' | 'carbon'>('price');

  const getDummyResults = (data: LCLFormData): LCLServiceResult[] => {
    const basePrice = 15000; const weightFactor = data.weight ? data.weight / 500 : 1;
    const readyDate = new Date(data.date || '').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    return [
      { id: 'LCL-001', serviceName: 'LCL Express Consolidation', carrier: 'Global Freight Forwarders', originWarehouse: data.origin || 'N/A', destinationWarehouse: data.destination || 'N/A', readyDate, transitTime: '15-20 Days', price: Math.round(basePrice * weightFactor * 1.2), dimensions: data.dimensions || 'N/A', features: ['Weekly Departures', 'Online Tracking'], status: 'Available', badge: 'most_popular', carbonKg: 1840 },
      { id: 'LCL-002', serviceName: 'Standard LCL Service', carrier: 'Ocean Connect Logistics', originWarehouse: data.origin || 'N/A', destinationWarehouse: data.destination || 'N/A', readyDate, transitTime: '25-30 Days', price: Math.round(basePrice * weightFactor), dimensions: data.dimensions || 'N/A', features: ['Cost-Effective', 'Reliable'], status: 'Available', badge: 'best_value', carbonKg: 1620 },
      { id: 'LCL-003', serviceName: 'Economy LCL Solution', carrier: 'Budget Cargo Solutions', originWarehouse: data.origin || 'N/A', destinationWarehouse: data.destination || 'N/A', readyDate, transitTime: '12-15 Days', price: Math.round(basePrice * weightFactor * 0.8), dimensions: data.dimensions || 'N/A', features: ['Maximum Savings'], status: 'Limited', badge: 'fastest', carbonKg: 1380 },
    ];
  };

  useEffect(() => {
    if (!formData) { navigate('/lcl-booking'); return; }
    (async () => {
      setLoading(true);
      try {
        const response = await rateCardsAPI.search({ serviceType: 'LCL', origin: formData.origin || '', destination: formData.destination || '', weight: formData.weight });
        const badges: Array<'best_value' | 'fastest' | 'most_popular' | null> = ['most_popular', 'best_value', 'fastest', null];
        if (response.data.data.length > 0) {
          setResults(response.data.data.map((r: any, i: number) => ({ id: r.id, serviceName: r.carrier, carrier: r.carrier, originWarehouse: r.origin, destinationWarehouse: r.destination, readyDate: new Date(formData.date || '').toLocaleDateString('en-IN'), transitTime: r.transitTime, price: r.totalPrice, dimensions: formData.dimensions || 'N/A', features: ['Online Tracking'], status: 'Available' as const, badge: badges[i] || null, carbonKg: Math.round(1000 + Math.random() * 1000), surgeMultiplier: r.surgeMultiplier, surgeReason: r.surgeReason, isDynamicPrice: r.isDynamicPrice })));
        } else { setResults(getDummyResults(formData)); }
      } catch { setResults(getDummyResults(formData)); }
      finally { setLoading(false); }
    })();
  }, [formData, navigate]);

  useEffect(() => {
    setResults(prev => {
      const sorted = [...prev];
      if (sortBy === 'price') sorted.sort((a, b) => a.price - b.price);
      if (sortBy === 'transit') sorted.sort((a, b) => parseInt(a.transitTime) - parseInt(b.transitTime));
      if (sortBy === 'carbon') sorted.sort((a, b) => (a.carbonKg || 0) - (b.carbonKg || 0));
      return sorted;
    });
  }, [sortBy]);

  const handleBookNow = (result: LCLServiceResult) => navigate('/lcl-booking-details', { state: { selectedResult: result, originalFormData: formData } });

  if (!formData) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-16 z-30 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-5 text-sm">
            <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-gray-400 hover:text-blue-600 transition font-medium"><FaArrowLeft className="text-xs" /> Back</button>
            <div className="h-4 w-px bg-gray-200"></div>
            <div className="flex items-center gap-2 text-gray-700"><FaMapMarkerAlt className="text-blue-400 text-xs" /><span className="font-semibold">{formData.origin}</span><span className="text-gray-300">→</span><span className="font-semibold">{formData.destination}</span></div>
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
        <div className="mb-5"><h1 className="text-xl font-bold text-gray-800">LCL Freight Quotes</h1><p className="text-sm text-gray-400 mt-0.5">{results.length} options · AI-updated pricing</p></div>
        {loading ? <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse"><div className="h-5 bg-gray-100 rounded w-1/3 mb-3"></div></div>)}</div> : (
          <div className="space-y-4">
            {results.map(result => {
              const badgeConfig = getBadgeConfig(result.badge);
              const isSurge = result.isDynamicPrice && result.surgeMultiplier && result.surgeMultiplier > 1;
              const isDiscount = result.surgeMultiplier && result.surgeMultiplier < 1;
              return (
                <div key={result.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden" style={{ borderLeft: `4px solid ${getBorderColor(result.badge)}` }}>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-teal-50 rounded-xl flex items-center justify-center"><FaBoxes className="text-teal-500 text-sm" /></div>
                        <div><h3 className="text-base font-bold text-gray-800">{result.serviceName}</h3><p className="text-xs text-gray-400">{result.carrier}</p></div>
                      </div>
                      <div className="flex items-center gap-2">
                        {badgeConfig && <span className={`text-xs font-semibold px-3 py-1 rounded-full ${badgeConfig.pill}`}>{badgeConfig.label}</span>}
                        {isSurge && <span className="text-xs font-semibold px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-600 flex items-center gap-1"><FaFire className="text-xs" />{result.surgeMultiplier}x</span>}
                        {isDiscount && <span className="text-xs font-semibold px-3 py-1 rounded-full bg-green-50 border border-green-200 text-green-600">↓{Math.round((1-(result.surgeMultiplier||1))*100)}% off</span>}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div><p className="text-xs text-gray-400 mb-0.5">FROM</p><p className="text-sm font-bold text-gray-800">{result.originWarehouse}</p></div>
                      <div><p className="text-xs text-gray-400 mb-0.5">TO</p><p className="text-sm font-bold text-gray-800">{result.destinationWarehouse}</p></div>
                      <div><p className="text-xs text-gray-400 mb-0.5">TRANSIT</p><p className="text-sm font-semibold text-gray-700 flex items-center gap-1"><FaClock className="text-gray-300 text-xs" />{result.transitTime}</p></div>
                      <div><p className="text-xs text-gray-400 mb-0.5">CO₂</p><p className="text-sm font-semibold text-emerald-600 flex items-center gap-1"><FaLeaf className="text-xs" />{result.carbonKg?.toLocaleString()} kg</p></div>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                      <div>{result.surgeReason && <p className="text-xs text-orange-500 flex items-center gap-1"><FaFire className="text-xs" />{result.surgeReason}</p>}<p className="text-xs text-gray-400">{result.features.join(' · ')}</p></div>
                      <div className="flex items-center gap-4">
                        <p className="text-2xl font-black text-gray-900 flex items-center gap-1"><FaRupeeSign className="text-lg text-blue-500" />{result.price.toLocaleString('en-IN')}</p>
                        <button onClick={() => handleBookNow(result)} disabled={result.status === 'Full'} className={`flex items-center gap-2 font-bold py-3 px-6 rounded-xl transition text-sm whitespace-nowrap text-white ${result.status === 'Full' ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}>
                          {result.status === 'Full' ? 'Full' : 'Book Now'} <FaChevronRight className="text-xs" />
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

export default LCLResultsPage;
