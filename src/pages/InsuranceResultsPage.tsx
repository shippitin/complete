// src/pages/InsuranceResultsPage.tsx
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaShieldAlt, FaInfoCircle, FaArrowLeft, FaRupeeSign, FaCalendarAlt, FaBox, FaWeightHanging, FaDollarSign } from 'react-icons/fa';
import type { InsuranceFormData } from '../types/QuoteFormHandle';

// Define the structure for an Insurance service result
interface InsuranceServiceResult {
  id: string;
  policyName: string;
  provider: string;
  coverageDetails: string;
  premium: number;
  features: string[];
  status: 'Available' | 'Limited' | 'Full';
}

interface InsuranceResultsPageProps {
  // formData will be passed via location.state
}

const InsuranceResultsPage: React.FC<InsuranceResultsPageProps> = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const formData = location.state?.formData as InsuranceFormData | undefined; // Access formData from location.state

  // Function to go back to the QuoteFormPage
  const handleBackToForm = () => {
    navigate('/train-booking', { state: { activeService: 'Insurance' } }); // Navigate back to QuoteFormPage with Insurance selected
  };

  // Dummy data generation for Insurance services
  const generateDummyResults = (data: InsuranceFormData): InsuranceServiceResult[] => {
    const basePremium = 500; // Example base premium
    const valueFactor = data.insuranceValue ? data.insuranceValue / 1000 : 1; // Premium scales with insured value
    const coverageFactor = data.coverageType === 'All Risk' ? 1.5 : (data.coverageType === 'Named Perils' ? 1.0 : 0.7);

    return [
      {
        id: 'INS-001',
        policyName: 'Comprehensive Cargo Protection',
        provider: 'GlobalSure Insurance',
        coverageDetails: 'Covers all risks of loss or damage from external causes.',
        premium: basePremium * valueFactor * coverageFactor * 1.2, // Higher for comprehensive
        features: ['Door-to-Door Coverage', 'Quick Claim Processing', '24/7 Support'],
        status: 'Available',
      },
      {
        id: 'INS-002',
        policyName: 'Standard Perils Policy',
        provider: 'Reliable Cargo Insurers',
        coverageDetails: 'Covers specified perils like fire, collision, overturning.',
        premium: basePremium * valueFactor * coverageFactor,
        features: ['Basic Coverage', 'Competitive Rates'],
        status: 'Available',
      },
      {
        id: 'INS-003',
        policyName: 'Total Loss Only Policy',
        provider: 'Budget Shield Insurance',
        coverageDetails: 'Covers only total loss of the entire cargo.',
        premium: basePremium * valueFactor * coverageFactor * 0.8, // Cheapest
        features: ['Lowest Premium', 'Simple Coverage'],
        status: 'Limited',
      },
      {
        id: 'INS-004',
        policyName: 'High Value Goods Insurance (Full)',
        provider: 'Elite Risk Management',
        coverageDetails: 'Specialized coverage for high-value items, including theft.',
        premium: basePremium * valueFactor * coverageFactor * 1.5,
        features: ['Extended Coverage', 'High Claim Limits'],
        status: 'Full',
      },
    ];
  };

  if (!formData) {
    return (
      <div className="min-h-screen bg-gray-100 p-4 sm:p-6 flex flex-col items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center">
          <FaInfoCircle className="text-red-500 text-6xl mb-4 mx-auto" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No Insurance quote data found.</h2>
          <p className="text-gray-600 mb-6">Please go back and submit a quote from the form.</p>
          <button
            onClick={handleBackToForm}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full shadow-md transition duration-300"
          >
            <FaArrowLeft className="inline-block mr-2" /> Back to Form
          </button>
        </div>
      </div>
    );
  }

  const dummyResults = generateDummyResults(formData);

  const getStatusBadgeClass = (status: 'Available' | 'Limited' | 'Full') => {
    switch (status) {
      case 'Available': return 'bg-green-100 text-green-800';
      case 'Limited': return 'bg-yellow-100 text-yellow-800';
      case 'Full': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleBookNow = (result: InsuranceServiceResult) => {
    // Navigate to the new InsuranceBookingDetailsPage, passing selected result and original form data
    navigate(`/insurance-booking-details`, {
      state: {
        selectedResult: result,
        originalFormData: formData,
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 flex flex-col items-center">
      <div className="w-full max-w-7xl bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header for Results Page */}
        <div className="bg-blue-600 text-white p-6 rounded-t-2xl flex items-center justify-between">
          <h1 className="text-3xl font-bold">Cargo Insurance Quotes</h1>
          <button
            onClick={handleBackToForm}
            className="flex items-center px-4 py-2 bg-blue-700 hover:bg-blue-800 rounded-full text-sm font-semibold transition duration-200"
          >
            <FaArrowLeft className="mr-2" /> Back to Form
          </button>
        </div>

        {/* Step Indicators for the overall booking flow */}
        <div className="flex justify-around mb-8 text-center p-6 border-b border-gray-200 bg-white">
          <div className="flex-1 text-blue-600 font-bold">
            <div className="w-10 h-10 mx-auto mb-2 rounded-full flex items-center justify-center border-2 border-blue-600 bg-blue-100">
              1
            </div>
            Search Results
          </div>
          <div className="flex-1 text-gray-400">
            <div className="w-10 h-10 mx-auto mb-2 rounded-full flex items-center justify-center border-2 border-gray-300 bg-gray-50">
              2
            </div>
            Booking Details
          </div>
          <div className="flex-1 text-gray-400">
            <div className="w-10 h-10 mx-auto mb-2 rounded-full flex items-center justify-center border-2 border-gray-300 bg-gray-50">
              3
            </div>
            Payment & Confirmation
          </div>
        </div>

        {/* Main Content Area: Two Columns for Filters and Results */}
        <div className="flex flex-col md:flex-row gap-6 p-4 sm:p-6">
          {/* Left Column: Filters Sidebar (Placeholder) */}
          <div className="w-full md:w-1/4 bg-white rounded-xl shadow-md border border-gray-200 p-4">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <FaInfoCircle className="mr-2 text-blue-600" /> Insurance Filters
            </h2>
            <div className="space-y-4 text-gray-700">
              <p className="font-semibold">Filter options coming soon!</p>
              {/* Example filters for Insurance */}
              <div className="border-b border-gray-200 pb-4">
                <p className="font-semibold text-gray-700 mb-2">Premium Range</p>
                <input type="range" className="w-full accent-blue-600" />
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  <span>₹100</span>
                  <span>₹5,000+</span>
                </div>
              </div>
              <div className="border-b border-gray-200 pb-4">
                <p className="font-semibold text-gray-700 mb-2">Coverage Type</p>
                <label className="flex items-center text-gray-700">
                  <input type="checkbox" className="form-checkbox text-blue-600 rounded mr-2" />
                  <span>All Risk</span>
                </label>
                <label className="flex items-center text-gray-700 mt-1">
                  <input type="checkbox" className="form-checkbox text-blue-600 rounded mr-2" />
                  <span>Named Perils</span>
                </label>
                <label className="flex items-center text-gray-700 mt-1">
                  <input type="checkbox" className="form-checkbox text-blue-600 rounded mr-2" />
                  <span>Total Loss Only</span>
                </label>
              </div>
              <div>
                <p className="font-semibold text-gray-700 mb-2">Provider</p>
                <label className="flex items-center text-gray-700">
                  <input type="checkbox" className="form-checkbox text-blue-600 rounded mr-2" />
                  <span>GlobalSure Insurance</span>
                </label>
                <label className="flex items-center text-gray-700 mt-1">
                  <input type="checkbox" className="form-checkbox text-blue-600 rounded mr-2" />
                  <span>Reliable Cargo Insurers</span>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column: Results List */}
          <div className="w-full md:w-3/4">
            {dummyResults.length > 0 ? (
              <div className="grid grid-cols-1 gap-6"> {/* Single column layout for results cards */}
                {dummyResults.map((result) => (
                  <div key={result.id} className="bg-white p-6 rounded-2xl shadow-xl border border-gray-200 flex flex-col justify-between
                                                  hover:shadow-2xl hover:transform hover:scale-[1.01] transition-all duration-300 ease-in-out">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-gray-900 flex items-center">
                          <FaShieldAlt className="text-lime-600 mr-2" /> {result.policyName}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(result.status)}`}>
                          {result.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-4 ml-8">{result.provider}</p>

                      <div className="grid grid-cols-2 gap-y-3 mb-6 text-gray-700">
                        <div className="flex items-center col-span-2">
                          <FaBox className="text-gray-500 mr-3 text-lg" />
                          <div>
                            <p className="text-sm font-medium">Cargo Type:</p>
                            <p className="font-semibold">{formData.cargoType}</p>
                          </div>
                        </div>
                        <div className="flex items-center col-span-2">
                          <FaWeightHanging className="text-gray-500 mr-3 text-lg" />
                          <div>
                            <p className="text-sm font-medium">Weight:</p>
                            <p className="font-semibold">{formData.weight} KG</p>
                          </div>
                        </div>
                        <div className="flex items-center col-span-2">
                          <FaDollarSign className="text-gray-500 mr-3 text-lg" />
                          <div>
                            <p className="text-sm font-medium">Insured Value:</p>
                            <p className="font-semibold">${formData.insuranceValue.toLocaleString('en-US')}</p>
                          </div>
                        </div>
                        <div className="flex items-center col-span-2">
                          <FaShieldAlt className="text-gray-500 mr-3 text-lg" />
                          <div>
                            <p className="text-sm font-medium">Coverage Type:</p>
                            <p className="font-semibold">{formData.coverageType}</p>
                          </div>
                        </div>
                        <div className="flex items-center col-span-2">
                          <FaCalendarAlt className="text-gray-500 mr-3 text-lg" />
                          <div>
                            <p className="text-sm font-medium">Date:</p>
                            <p className="font-semibold">{formData.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center col-span-2">
                          <FaInfoCircle className="text-gray-500 mr-3 text-lg" />
                          <div>
                            <p className="text-sm font-medium">Coverage Details:</p>
                            <p className="font-semibold">{result.coverageDetails}</p>
                          </div>
                        </div>
                        <div className="flex items-center col-span-2">
                          <FaInfoCircle className="text-gray-500 mr-3 text-lg" />
                          <div>
                            <p className="text-sm font-medium">Features:</p>
                            <p className="font-semibold">{result.features.join(', ')}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center mt-4">
                        <div className="flex items-center">
                          <FaShieldAlt className="text-gray-500 mr-2 text-xl" />
                          <span className="text-lg font-semibold text-gray-800">Insurance Premium</span>
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-bold text-blue-800 flex items-center">
                            <FaRupeeSign className="text-2xl mr-1" />{result.premium.toLocaleString('en-IN')}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Book Now Button */}
                    <div className="mt-6">
                      <button
                        onClick={() => handleBookNow(result)}
                        className={`w-full py-3 px-6 rounded-full text-white font-bold text-lg shadow-lg transition duration-300 ease-in-out
                                    ${result.status === 'Full' ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-700 hover:bg-blue-800 transform hover:scale-105'}`}
                        disabled={result.status === 'Full'}
                      >
                        {result.status === 'Full' ? 'Fully Booked' : 'Book Now'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-gray-500">
                <FaInfoCircle className="text-5xl mb-4 mx-auto text-gray-400" />
                <p className="text-xl font-semibold">No Insurance policies found for your criteria.</p>
                <p className="mt-2">Please try adjusting your search parameters.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsuranceResultsPage;
