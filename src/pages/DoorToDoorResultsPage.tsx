// src/pages/DoorToDoorResultsPage.tsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaHome, FaArrowLeft, FaRupeeSign, FaLeaf, FaFire, FaChevronRight, FaMapMarkerAlt, FaClock, FaTruckMoving } from 'react-icons/fa';
import type { DoorToDoorFormData } from '../types/QuoteFormHandle';
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

interface D2DResult {
  id: string; serviceName: string; carrier: string; transitTime: string; price: number;
  features: string[]; status: 'Available' | 'Limited' | 'Full'; badge?: string | null; carbonKg?: number;
}

const DoorToDoorResultsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const formData = location.state?.formData as DoorToDoorFormData | undefined;
  const [results, setResults] = useState<D2DResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState<'price' | 'transit' | 'carbon'>('price');

  const getDummyResults = (data: DoorToDoorFormData): D2DResult[] => {
    const base = 5000; const wf = (Number(data.weight) > 0 ? Number(data.weight) : 100) / 100; const df = 1.5;
    return [
      { id: 'D2D-001', serviceName: 'Express Doorstep Delivery', carrier: 'FastFreight Logistics', transitTime: '2-3 Days', price: Math.round(base * wf * df * 1.2), features: ['Real-time Tracking', 'Dedicated Vehicle', 'Priority'], status: 'Available', badge: 'fastest', carbonKg: 85 },
      { id: 'D2D-002', serviceName: 'Standard Door to Door', carrier: 'Reliable Carriers Pvt. Ltd.', transitTime: '4-6 Days', price: Math.round(base * wf * df), features: ['Economical', 'Standard Tracking'], status: 'Available', badge: 'most_popular', carbonKg: 65 },
      { id: 'D2D-003', serviceName: 'Economy Ground Service', carrier: 'Budget Freight Solutions', transitTime: '7-10 Days', price: Math.round(base * wf * df * 0.8), features: ['Cost-Effective', 'Bulk Shipments'], status: 'Limited', badge: 'best_value', carbonKg: 52 },
    ];
  };

  useEffect(() => {
    if (!formData) return;
    (async () => {
      setLoading(true);
      try {
        const response = await rateCardsAPI.search({ serviceType: 'DoorToDoor', origin: formData.origin || '', destination: formData.destination || '', weight: Number(formData.weight) });
        const badges = ['fastest', 'most_popular', 'best_value', null];
        if (response.data.data.length > 0) {
          setResults(response.data.data.map((r: any, i: number) => ({ id: r.id, serviceName: r.carrier, carrier: r.carrier, transitTime: r.transitTime, price: r.totalPrice, features: ['Tracking', 'GPS'], status: 'Available' as const, badge: badges[i] || null, carbonKg: Math.round(40 + Math.random() * 60) })));
        } else { setResults(getDummyResults(formData)); }
      } catch { setResults(getDummyResults(formData)); }
      finally { setLoading(false); }
    })();
  }, [formData]);

  const handleBookNow = (result: D2DResult) => {
    const user = JSON.parse(localStorage.getItem('shippitin_user') || '{}');
    navigate('/booking-confirmation', {
      state: {
        bookingDetails: {
          selectedResult: { id: result.id, serviceName: result.serviceName, origin: formData?.origin, destination: formData?.destination, transitTime: result.transitTime, price: result.price, features: result.features, carrier: result.carrier, status: result.status, bookingType: 'Door to Door', cargoType: formData?.cargoType, weight: formData?.weight, readyDate: formData?.readyDate },
          originalFormData: formData,
          contactDetails: { fullName: user.full_name || '', email: user.email || '', phone: user.phone || '', companyName: user.company_name || '' },
          bookingDate: new Date().toLocaleDateString('en-IN'), bookingTime: new Date().toLocaleTimeString('en-IN'),
          bookingId: `D2D-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`, finalAmount: result.price,
        }
      }
    });
  };

  if (!formData) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <p className="text-gray-500 mb-4">No booking data found.</p>
        <button onClick={() => navigate('/')} className="text-blue-600 hover:underline text-sm">Back to Home</button>
      </div>
    </div>
  );

  const sorted = [...results].sort((a, b) => sortBy === 'price' ? a.price - b.price : sortBy === 'transit' ? parseInt(a.transitTime) - parseInt(b.transitTime) : (a.carbonKg || 0) - (b.carbonKg || 0));

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
        <div className="mb-2"><div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full px-3 py-1.5 text-xs font-semibold text-amber-700 mb-4">🎉 Get 5% off on express Door to Door bookings this month</div></div>
        <div className="mb-5"><h1 className="text-xl font-bold text-gray-800">Door to Door Quotes</h1><p className="text-sm text-gray-400 mt-0.5">{sorted.length} options for {formData.cargoType || 'General Cargo'} · AI-updated pricing</p></div>
        {loading ? <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse"><div className="h-5 bg-gray-100 rounded w-1/3 mb-3"></div></div>)}</div> : (
          <div className="space-y-4">
            {sorted.map(result => {
              const badgeConfig = getBadgeConfig(result.badge);
              return (
                <div key={result.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden" style={{ borderLeft: `4px solid ${getBorderColor(result.badge)}` }}>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center"><FaTruckMoving className="text-blue-500 text-sm" /></div>
                        <div><h3 className="text-base font-bold text-gray-800">{result.serviceName}</h3><p className="text-xs text-gray-400">{result.carrier}</p></div>
                      </div>
                      <div className="flex items-center gap-2">
                        {badgeConfig && <span className={`text-xs font-semibold px-3 py-1 rounded-full ${badgeConfig.pill}`}>{badgeConfig.label}</span>}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div><p className="text-xs text-gray-400 mb-0.5">FROM</p><p className="text-sm font-bold text-gray-800">{formData.origin}</p></div>
                      <div><p className="text-xs text-gray-400 mb-0.5">TO</p><p className="text-sm font-bold text-gray-800">{formData.destination}</p></div>
                      <div><p className="text-xs text-gray-400 mb-0.5">TRANSIT</p><p className="text-sm font-semibold text-gray-700 flex items-center gap-1"><FaClock className="text-gray-300 text-xs" />{result.transitTime}</p></div>
                      <div><p className="text-xs text-gray-400 mb-0.5">CO₂</p><p className="text-sm font-semibold text-emerald-600 flex items-center gap-1"><FaLeaf className="text-xs" />{result.carbonKg} kg</p></div>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {result.features.map((f, i) => <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-medium">{f}</span>)}
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                      <p className="text-xs text-gray-400">Door to Door · {formData.cargoType}</p>
                      <div className="flex items-center gap-4">
                        <p className="text-2xl font-black text-gray-900 flex items-center gap-1"><FaRupeeSign className="text-lg text-blue-500" />{result.price === 0 ? 'On Request' : result.price.toLocaleString('en-IN')}</p>
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

export default DoorToDoorResultsPage;
