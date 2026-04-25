// src/pages/InsuranceResultsPage.tsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaShieldAlt, FaArrowLeft, FaRupeeSign, FaBox, FaWeightHanging, FaDollarSign, FaLeaf, FaFire, FaChevronRight } from 'react-icons/fa';
import type { InsuranceFormData } from '../types/QuoteFormHandle';

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

interface InsuranceResult {
  id: string; policyName: string; provider: string; coverageDetails: string;
  premium: number; features: string[]; status: 'Available' | 'Limited' | 'Full'; badge?: string | null;
}

const InsuranceResultsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const formData = location.state?.formData as InsuranceFormData | undefined;
  const [results, setResults] = useState<InsuranceResult[]>([]);

  useEffect(() => {
    if (!formData) { navigate('/insurance-booking'); return; }
    const base = 500; const vf = formData.insuranceValue ? formData.insuranceValue / 1000 : 1;
    const cf = formData.coverageType === 'All Risk' ? 1.5 : formData.coverageType === 'Named Perils' ? 1.0 : 0.7;
    setResults([
      { id: 'INS-001', policyName: 'Comprehensive Cargo Protection', provider: 'GlobalSure Insurance', coverageDetails: 'All risks of loss or damage from external causes.', premium: Math.round(base * vf * cf * 1.2), features: ['Door-to-Door', 'Quick Claims', '24/7 Support'], status: 'Available', badge: 'most_popular' },
      { id: 'INS-002', policyName: 'Standard Perils Policy', provider: 'Reliable Cargo Insurers', coverageDetails: 'Fire, collision, overturning.', premium: Math.round(base * vf * cf), features: ['Basic Coverage', 'Competitive Rates'], status: 'Available', badge: 'best_value' },
      { id: 'INS-003', policyName: 'Total Loss Only Policy', provider: 'Budget Shield Insurance', coverageDetails: 'Total loss of entire cargo only.', premium: Math.round(base * vf * cf * 0.8), features: ['Lowest Premium'], status: 'Limited', badge: 'fastest' },
    ]);
  }, [formData, navigate]);

  if (!formData) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-16 z-30 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-5 text-sm">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-gray-400 hover:text-blue-600 transition font-medium"><FaArrowLeft className="text-xs" /> Back</button>
          <div className="h-4 w-px bg-gray-200"></div>
          <span className="font-semibold text-gray-700">{formData.coverageType} · ₹{formData.insuranceValue?.toLocaleString('en-IN')}</span>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-5"><h1 className="text-xl font-bold text-gray-800">Cargo Insurance Quotes</h1><p className="text-sm text-gray-400 mt-0.5">{results.length} policies available</p></div>
        <div className="space-y-4">
          {results.map(result => {
            const badgeConfig = getBadgeConfig(result.badge);
            return (
              <div key={result.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden" style={{ borderLeft: `4px solid ${getBorderColor(result.badge)}` }}>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center"><FaShieldAlt className="text-green-600 text-sm" /></div>
                      <div><h3 className="text-base font-bold text-gray-800">{result.policyName}</h3><p className="text-xs text-gray-400">{result.provider}</p></div>
                    </div>
                    <div className="flex items-center gap-2">
                      {badgeConfig && <span className={`text-xs font-semibold px-3 py-1 rounded-full ${badgeConfig.pill}`}>{badgeConfig.label}</span>}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div><p className="text-xs text-gray-400 mb-0.5">CARGO TYPE</p><p className="text-sm font-bold text-gray-800">{formData.cargoType}</p></div>
                    <div><p className="text-xs text-gray-400 mb-0.5">INSURED VALUE</p><p className="text-sm font-semibold text-gray-700">₹{formData.insuranceValue?.toLocaleString('en-IN')}</p></div>
                    <div><p className="text-xs text-gray-400 mb-0.5">COVERAGE</p><p className="text-sm font-semibold text-gray-700">{formData.coverageType}</p></div>
                    <div><p className="text-xs text-gray-400 mb-0.5">COVERAGE DETAILS</p><p className="text-xs text-gray-600">{result.coverageDetails}</p></div>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {result.features.map((f, i) => <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-medium">{f}</span>)}
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                    <p className="text-xs text-gray-400">Insurance Premium</p>
                    <div className="flex items-center gap-4">
                      <p className="text-2xl font-black text-gray-900 flex items-center gap-1"><FaRupeeSign className="text-lg text-blue-500" />{result.premium.toLocaleString('en-IN')}</p>
                      <button onClick={() => navigate('/insurance-booking-details', { state: { selectedResult: result, originalFormData: formData } })} disabled={result.status === 'Full'} className={`flex items-center gap-2 font-bold py-3 px-6 rounded-xl transition text-sm whitespace-nowrap text-white ${result.status === 'Full' ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}>
                        {result.status === 'Full' ? 'Full' : 'Get Policy'} <FaChevronRight className="text-xs" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default InsuranceResultsPage;
