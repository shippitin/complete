// src/pages/CustomsResultsPage.tsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaStamp, FaInfoCircle, FaArrowLeft, FaRupeeSign, FaGlobe, FaFileAlt, FaClock, FaLeaf, FaFire, FaChevronRight, FaMapMarkerAlt } from 'react-icons/fa';
import type { CustomsFormData } from '../types/QuoteFormHandle';
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

interface CustomsResult {
  id: string; serviceName: string; provider: string; estimatedTime: string; price: number;
  features: string[]; status: 'Available' | 'Limited' | 'Full'; badge?: string | null; carbonKg?: number;
  surgeMultiplier?: number; surgeReason?: string; isDynamicPrice?: boolean;
}

const CustomsResultsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const formData = location.state?.formData as CustomsFormData | undefined;
  const [results, setResults] = useState<CustomsResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState<'price' | 'transit'>('price');

  const getDummyResults = (data: CustomsFormData): CustomsResult[] => {
    const base = 25000;
    const f = data.documentType === 'Import Declaration' ? 1.2 : 1.0;
    return [
      { id: 'CUST-001', serviceName: 'Express Customs Clearance', provider: 'Global Customs Solutions', estimatedTime: '1-2 Days', price: Math.round(base * f * 1.5), features: ['Priority Processing', 'Dedicated Agent', '24/7 Support'], status: 'Available', badge: 'fastest', carbonKg: 12 },
      { id: 'CUST-002', serviceName: 'Standard Customs Service', provider: 'Reliable Customs Brokers', estimatedTime: '3-5 Days', price: Math.round(base * f), features: ['Comprehensive Docs', 'Online Tracking'], status: 'Available', badge: 'most_popular', carbonKg: 8 },
      { id: 'CUST-003', serviceName: 'Economy Customs Filing', provider: 'Budget Clearance Hub', estimatedTime: '5-7 Days', price: Math.round(base * f * 0.7), features: ['Cost-Effective'], status: 'Limited', badge: 'best_value', carbonKg: 6 },
    ];
  };

  useEffect(() => {
    if (!formData) { navigate('/customs-booking'); return; }
    (async () => {
      setLoading(true);
      try {
        const response = await rateCardsAPI.search({ serviceType: 'Customs', origin: formData.country || '', destination: formData.country || '' });
        const badges = ['most_popular', 'best_value', 'fastest', null];
        if (response.data.data.length > 0) {
          setResults(response.data.data.map((r: any, i: number) => ({ id: r.id, serviceName: r.carrier, provider: r.carrier, estimatedTime: r.transitTime, price: r.totalPrice, features: ['Online Tracking'], status: 'Available' as const, badge: badges[i] || null, carbonKg: Math.round(5 + Math.random() * 15), surgeMultiplier: r.surgeMultiplier, surgeReason: r.surgeReason, isDynamicPrice: r.isDynamicPrice })));
        } else { setResults(getDummyResults(formData)); }
      } catch { setResults(getDummyResults(formData)); }
      finally { setLoading(false); }
    })();
  }, [formData, navigate]);

  if (!formData) return null;

  const sorted = [...results].sort((a, b) => sortBy === 'price' ? a.price - b.price : parseInt(a.estimatedTime) - parseInt(b.estimatedTime));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-16 z-30 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-5 text-sm">
            <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-gray-400 hover:text-blue-600 transition font-medium"><FaArrowLeft className="text-xs" /> Back</button>
            <div className="h-4 w-px bg-gray-200"></div>
            <div className="flex items-center gap-2 text-gray-700"><FaGlobe className="text-blue-400 text-xs" /><span className="font-semibold">{formData.documentType}</span><span className="text-gray-400">·</span><span className="font-semibold">{formData.country}</span></div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Sort:</span>
            {[{ key: 'price', label: 'Price' }, { key: 'transit', label: 'Transit' }].map(s => (
              <button key={s.key} onClick={() => setSortBy(s.key as any)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${sortBy === s.key ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{s.label}</button>
            ))}
          </div>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-5"><h1 className="text-xl font-bold text-gray-800">Customs Clearance Quotes</h1><p className="text-sm text-gray-400 mt-0.5">{sorted.length} options · AI-updated pricing</p></div>
        {loading ? <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse"><div className="h-5 bg-gray-100 rounded w-1/3 mb-3"></div></div>)}</div> : (
          <div className="space-y-4">
            {sorted.map(result => {
              const badgeConfig = getBadgeConfig(result.badge);
              const isSurge = result.isDynamicPrice && result.surgeMultiplier && result.surgeMultiplier > 1;
              return (
                <div key={result.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden" style={{ borderLeft: `4px solid ${getBorderColor(result.badge)}` }}>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-yellow-50 rounded-xl flex items-center justify-center"><FaStamp className="text-yellow-600 text-sm" /></div>
                        <div><h3 className="text-base font-bold text-gray-800">{result.serviceName}</h3><p className="text-xs text-gray-400">{result.provider}</p></div>
                      </div>
                      <div className="flex items-center gap-2">
                        {badgeConfig && <span className={`text-xs font-semibold px-3 py-1 rounded-full ${badgeConfig.pill}`}>{badgeConfig.label}</span>}
                        {isSurge && <span className="text-xs font-semibold px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-600 flex items-center gap-1"><FaFire className="text-xs" />{result.surgeMultiplier}x</span>}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div><p className="text-xs text-gray-400 mb-0.5">DOCUMENT</p><p className="text-sm font-bold text-gray-800">{formData.documentType}</p></div>
                      <div><p className="text-xs text-gray-400 mb-0.5">COUNTRY</p><p className="text-sm font-semibold text-gray-700">{formData.country}</p></div>
                      <div><p className="text-xs text-gray-400 mb-0.5">ESTIMATED TIME</p><p className="text-sm font-semibold text-gray-700 flex items-center gap-1"><FaClock className="text-gray-300 text-xs" />{result.estimatedTime}</p></div>
                      <div><p className="text-xs text-gray-400 mb-0.5">CO₂</p><p className="text-sm font-semibold text-emerald-600 flex items-center gap-1"><FaLeaf className="text-xs" />{result.carbonKg} kg</p></div>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {result.features.map((f, i) => <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-medium">{f}</span>)}
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                      <div>{result.surgeReason && <p className="text-xs text-orange-500 flex items-center gap-1"><FaFire className="text-xs" />{result.surgeReason}</p>}</div>
                      <div className="flex items-center gap-4">
                        <p className="text-2xl font-black text-gray-900 flex items-center gap-1"><FaRupeeSign className="text-lg text-blue-500" />{result.price.toLocaleString('en-IN')}</p>
                        <button onClick={() => navigate('/customs-booking-details', { state: { selectedResult: result, originalFormData: formData } })} disabled={result.status === 'Full'} className={`flex items-center gap-2 font-bold py-3 px-6 rounded-xl transition text-sm whitespace-nowrap text-white ${result.status === 'Full' ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}>
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

export default CustomsResultsPage;
