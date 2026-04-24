// src/pages/InsuranceResultsPage.tsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaShieldAlt, FaInfoCircle, FaArrowLeft, FaRupeeSign, FaCalendarAlt, FaBox, FaWeightHanging, FaDollarSign } from 'react-icons/fa';
import type { InsuranceFormData } from '../types/QuoteFormHandle';
import { rateCardsAPI } from '../services/api';

interface InsuranceServiceResult {
  id: string;
  policyName: string;
  provider: string;
  coverageDetails: string;
  premium: number;
  features: string[];
  status: 'Available' | 'Limited' | 'Full';
}

const InsuranceResultsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const formData = location.state?.formData as InsuranceFormData | undefined;

  const [results, setResults] = useState<InsuranceServiceResult[]>([]);
  const [loading, setLoading] = useState(false);

  const getDummyResults = (data: InsuranceFormData): InsuranceServiceResult[] => {
    const basePremium = 500;
    const valueFactor = data.insuranceValue ? data.insuranceValue / 1000 : 1;
    const coverageFactor = data.coverageType === 'All Risk' ? 1.5 : (data.coverageType === 'Named Perils' ? 1.0 : 0.7);
    return [
      { id: 'INS-001', policyName: 'Comprehensive Cargo Protection', provider: 'GlobalSure Insurance', coverageDetails: 'Covers all risks of loss or damage from external causes.', premium: Math.round(basePremium * valueFactor * coverageFactor * 1.2), features: ['Door-to-Door Coverage', 'Quick Claim Processing', '24/7 Support'], status: 'Available' },
      { id: 'INS-002', policyName: 'Standard Perils Policy', provider: 'Reliable Cargo Insurers', coverageDetails: 'Covers specified perils like fire, collision, overturning.', premium: Math.round(basePremium * valueFactor * coverageFactor), features: ['Basic Coverage', 'Competitive Rates'], status: 'Available' },
      { id: 'INS-003', policyName: 'Total Loss Only Policy', provider: 'Budget Shield Insurance', coverageDetails: 'Covers only total loss of the entire cargo.', premium: Math.round(basePremium * valueFactor * coverageFactor * 0.8), features: ['Lowest Premium', 'Simple Coverage'], status: 'Limited' },
    ];
  };

  useEffect(() => {
    if (!formData) { navigate('/insurance-booking'); return; }
    setResults(getDummyResults(formData));
  }, [formData, navigate]);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Available': return 'bg-green-100 text-green-800';
      case 'Limited': return 'bg-yellow-100 text-yellow-800';
      case 'Full': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleBookNow = (result: InsuranceServiceResult) => {
    navigate('/insurance-booking-details', {
      state: { selectedResult: result, originalFormData: formData }
    });
  };

  if (!formData) return null;

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 flex flex-col items-center">
      <div className="w-full max-w-7xl bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-blue-600 text-white p-6 rounded-t-2xl flex items-center justify-between">
          <h1 className="text-3xl font-bold">Cargo Insurance Quotes</h1>
          <button onClick={() => navigate(-1)} className="flex items-center px-4 py-2 bg-blue-700 hover:bg-blue-800 rounded-full text-sm font-semibold transition">
            <FaArrowLeft className="mr-2" /> Back
          </button>
        </div>

        <div className="flex justify-around text-center p-6 border-b border-gray-200">
          <div className="flex-1 text-blue-600 font-bold"><div className="w-10 h-10 mx-auto mb-2 rounded-full flex items-center justify-center border-2 border-blue-600 bg-blue-100">1</div>Search Results</div>
          <div className="flex-1 text-gray-400"><div className="w-10 h-10 mx-auto mb-2 rounded-full flex items-center justify-center border-2 border-gray-300 bg-gray-50">2</div>Booking Details</div>
          <div className="flex-1 text-gray-400"><div className="w-10 h-10 mx-auto mb-2 rounded-full flex items-center justify-center border-2 border-gray-300 bg-gray-50">3</div>Confirmation</div>
        </div>

        <div className="p-4 sm:p-6">
          {loading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
              <p className="text-gray-500">Fetching best rates...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {results.map(result => (
                <div key={result.id} className="bg-white p-6 rounded-2xl shadow-xl border border-gray-200 flex flex-col justify-between hover:shadow-2xl transition-all duration-300">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-gray-900 flex items-center"><FaShieldAlt className="text-lime-600 mr-2" />{result.policyName}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(result.status)}`}>{result.status}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-4 ml-8">{result.provider}</p>
                    <div className="grid grid-cols-2 gap-y-3 mb-6 text-gray-700">
                      <div className="flex items-center col-span-2"><FaBox className="text-gray-500 mr-3" /><div><p className="text-sm font-medium">Cargo Type:</p><p className="font-semibold">{formData.cargoType}</p></div></div>
                      <div className="flex items-center col-span-2"><FaWeightHanging className="text-gray-500 mr-3" /><div><p className="text-sm font-medium">Weight:</p><p className="font-semibold">{formData.weight} KG</p></div></div>
                      <div className="flex items-center col-span-2"><FaDollarSign className="text-gray-500 mr-3" /><div><p className="text-sm font-medium">Insured Value:</p><p className="font-semibold">₹{formData.insuranceValue?.toLocaleString('en-IN')}</p></div></div>
                      <div className="flex items-center col-span-2"><FaShieldAlt className="text-gray-500 mr-3" /><div><p className="text-sm font-medium">Coverage Type:</p><p className="font-semibold">{formData.coverageType}</p></div></div>
                      <div className="flex items-center col-span-2"><FaCalendarAlt className="text-gray-500 mr-3" /><div><p className="text-sm font-medium">Date:</p><p className="font-semibold">{formData.date}</p></div></div>
                      <div className="flex items-center col-span-2"><FaInfoCircle className="text-gray-500 mr-3" /><div><p className="text-sm font-medium">Coverage Details:</p><p className="font-semibold">{result.coverageDetails}</p></div></div>
                      <div className="flex items-center col-span-2"><FaInfoCircle className="text-gray-500 mr-3" /><div><p className="text-sm font-medium">Features:</p><p className="font-semibold">{result.features.join(', ')}</p></div></div>
                    </div>
                    <div className="flex justify-between items-center mt-4">
                      <span className="text-lg font-semibold text-gray-800">Insurance Premium</span>
                      <p className="text-3xl font-bold text-blue-800 flex items-center"><FaRupeeSign className="text-2xl mr-1" />{result.premium.toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                  <div className="mt-6">
                    <button onClick={() => handleBookNow(result)} disabled={result.status === 'Full'} className={`w-full py-3 px-6 rounded-full text-white font-bold text-lg shadow-lg transition duration-300 ${result.status === 'Full' ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-700 hover:bg-blue-800'}`}>
                      {result.status === 'Full' ? 'Fully Booked' : 'Book Now'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InsuranceResultsPage;
