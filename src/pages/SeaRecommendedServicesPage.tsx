// src/pages/SeaRecommendedServicesPage.tsx
// Step 2: Recommended Services — port charges, customs brokerage, insurance toggles
// Matches the Freightos "Recommended Services" step exactly
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaShip, FaPencilAlt } from 'react-icons/fa';
import type { SeaFormData } from '../types/QuoteFormHandle';

const STEPS = ['Search', 'Recommended Services', 'Results', 'Booking', 'Verification'];

const SeaRecommendedServicesPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const formData = location.state?.formData as SeaFormData | undefined;

  const [originPortCharges, setOriginPortCharges] = useState(false);
  const [destinationPortCharges, setDestinationPortCharges] = useState(false);
  const [customsBrokerage, setCustomsBrokerage] = useState(true);
  const [insurance, setInsurance] = useState(true);

  if (!formData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-500 mb-4">No search data found. Please go back and search.</p>
          <button onClick={() => navigate('/sea-booking')} className="text-blue-600 underline text-sm">Back to Search</button>
        </div>
      </div>
    );
  }

  const originLabel = formData.originPort || formData.originCity || '—';
  const destinationLabel = formData.destinationPort || formData.destinationCity || '—';
  const loadLabel = formData.shipmentMode === 'FCL'
    ? `${formData.numberOfContainers || 1} × ${formData.containerType || '40\''} container`
    : `LCL · ${formData.volumeCBM} CBM`;
  const goodsLabel = `${formData.commodity || 'FAK'} · ${formData.totalWeight} Kgs`;

  const handleConfirm = () => {
    navigate('/sea-results', {
      state: {
        formData: {
          ...formData,
          addOriginPortCharges: originPortCharges,
          addDestinationPortCharges: destinationPortCharges,
          addCustomsBrokerage: customsBrokerage,
          addInsurance: insurance,
        },
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── Step progress bar ── */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            {STEPS.map((step, idx) => {
              const stepNum = idx + 1;
              const isActive = stepNum === 2;
              const isDone = stepNum < 2;
              return (
                <React.Fragment key={step}>
                  <div className="flex flex-col items-center gap-1.5">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                      isDone
                        ? 'bg-blue-500 text-white'
                        : isActive
                        ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                        : 'bg-gray-200 text-gray-400'
                    }`}>
                      {stepNum}
                    </div>
                    <span className={`text-xs font-semibold whitespace-nowrap ${isActive ? 'text-gray-800' : isDone ? 'text-blue-500' : 'text-gray-400'}`}>
                      {step}
                    </span>
                  </div>
                  {idx < STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 mb-4 ${isDone ? 'bg-blue-400' : 'bg-gray-200'}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Search summary bar ── */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex flex-wrap gap-0 divide-x divide-gray-200 rounded-xl border border-gray-200 overflow-hidden text-sm bg-gray-50">
            {[
              { label: 'Origin', value: originLabel, icon: '📍' },
              { label: 'Destination', value: destinationLabel, icon: '📍' },
              { label: 'Load', value: loadLabel, icon: '📦' },
              { label: 'Goods', value: goodsLabel, icon: '🏷️' },
            ].map(f => (
              <div key={f.label} className="flex items-center gap-2 px-4 py-3 flex-1 min-w-[140px]">
                <div>
                  <p className="text-xs text-gray-400 font-medium">{f.label} <span className="text-green-500 ml-0.5">✓</span></p>
                  <p className="text-sm font-bold text-gray-800 mt-0.5 truncate">{f.value}</p>
                </div>
              </div>
            ))}
            <div className="flex items-center px-4">
              <button
                onClick={() => navigate(-1)}
                className="text-gray-400 hover:text-blue-500 transition"
                title="Edit search"
              >
                <FaPencilAlt className="text-sm" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="max-w-4xl mx-auto px-4 py-10">

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <FaShip className="text-blue-500" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Recommended Services</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                We've selected all the services you need to ship your goods from a{' '}
                <strong>{formData.activityType?.split(' to ')[0] || 'Port'}</strong> to a{' '}
                <strong>{formData.activityType?.split(' to ')[1] || 'Port'}</strong>. Please check and confirm before getting your results.
              </p>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">

            {/* Port Charges */}
            <div>
              <h2 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                Port Charges
                <span className="text-gray-400 cursor-help text-xs border border-gray-300 rounded-full w-4 h-4 inline-flex items-center justify-center font-bold">?</span>
              </h2>
              <div className="space-y-3">
                <label className="flex items-center justify-between gap-4 cursor-pointer">
                  <div>
                    <p className={`text-sm font-medium ${originPortCharges ? 'text-gray-800' : 'text-gray-500'}`}>
                      {originPortCharges ? 'Yes - Add origin charges' : 'No - My delivery agent will cover any supplier charges'}
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={originPortCharges}
                    onClick={() => setOriginPortCharges(!originPortCharges)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 focus:outline-none ${originPortCharges ? 'bg-blue-600' : 'bg-gray-300'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${originPortCharges ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </label>
                <label className="flex items-center justify-between gap-4 cursor-pointer">
                  <div>
                    <p className={`text-sm font-medium ${destinationPortCharges ? 'text-gray-800' : 'text-gray-500'}`}>
                      {destinationPortCharges ? 'Yes - Add destination charges' : 'No - My supplier will cover delivery agent charges'}
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={destinationPortCharges}
                    onClick={() => setDestinationPortCharges(!destinationPortCharges)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 focus:outline-none ${destinationPortCharges ? 'bg-blue-600' : 'bg-gray-300'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${destinationPortCharges ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </label>
              </div>
            </div>

            {/* Customs Brokerage */}
            <div>
              <h2 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                Customs brokerage
              </h2>
              <label className="flex items-center justify-between gap-4 cursor-pointer">
                <div>
                  <p className={`text-sm font-medium ${customsBrokerage ? 'text-gray-800' : 'text-gray-500'}`}>
                    {customsBrokerage ? 'Yes - I need customs brokerage' : 'No - I will handle customs myself'}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">CHA-assisted import/export documentation</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={customsBrokerage}
                  onClick={() => setCustomsBrokerage(!customsBrokerage)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 focus:outline-none ${customsBrokerage ? 'bg-blue-600' : 'bg-gray-300'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${customsBrokerage ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </label>
            </div>

            {/* Insurance */}
            <div className="md:col-span-2 border-t border-gray-100 pt-6">
              <h2 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                Insurance
                <span className="text-gray-400 cursor-help text-xs border border-gray-300 rounded-full w-4 h-4 inline-flex items-center justify-center font-bold">?</span>
              </h2>
              <label className="flex items-center justify-between gap-4 cursor-pointer">
                <div>
                  <p className={`text-sm font-medium ${insurance ? 'text-gray-800' : 'text-gray-500'}`}>
                    {insurance
                      ? 'Yes - (covers the combined value of goods and initial freight costs up to ₹4 Crore)'
                      : 'No - I will arrange my own insurance'}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">All-risk marine cargo insurance. 1% of declared goods value.</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={insurance}
                  onClick={() => setInsurance(!insurance)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 focus:outline-none ${insurance ? 'bg-blue-600' : 'bg-gray-300'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${insurance ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </label>
            </div>
          </div>

          {/* Confirm button */}
          <div className="mt-10 flex justify-end">
            <button
              type="button"
              onClick={handleConfirm}
              className="px-8 py-3.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95"
              style={{ background: 'linear-gradient(90deg, #1e40af, #2563eb)' }}
            >
              Confirm Services &amp; Get Results →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeaRecommendedServicesPage;
