// src/pages/TrainRecommendedServicesPage.tsx
// Step 2 in rail flow — mirrors SeaRecommendedServicesPage exactly
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaTrain, FaPencilAlt } from 'react-icons/fa';
import type { AllFormData, TrainContainerFormData } from '../types/QuoteFormHandle';

const STEPS = ['Search', 'Recommended Services', 'Results', 'Booking', 'Verification'];

const formatServiceType = (st: string): string => {
  const map: Record<string, string> = {
    terminalToTerminal: 'Terminal to Terminal',
    doorToDoor:         'Door to Door',
    doorToTerminal:     'Door to Terminal',
    terminalToDoor:     'Terminal to Door',
    terminalToPort:     'Terminal to Port',
    doorToPort:         'Door to Port',
    portToTerminal:     'Port to Terminal',
    portToDoor:         'Port to Door',
  };
  return map[st] || st;
};

const TrainRecommendedServicesPage: React.FC = () => {
  const location = useLocation();
  const navigate  = useNavigate();
  const formData  = location.state?.formData as AllFormData | undefined;

  // Derive serviceType early so we can use it for initial toggle state
  const serviceType = (formData as any)?.serviceType || 'terminalToTerminal';

  // Auto-enable first/last mile based on service type
  const autoFirstMile = ['doorToDoor', 'doorToTerminal', 'doorToPort'].includes(serviceType);
  const autoLastMile  = ['doorToDoor', 'terminalToDoor', 'portToDoor'].includes(serviceType);

  const [firstMile,    setFirstMile]    = useState(autoFirstMile);
  const [lastMile,     setLastMile]     = useState(autoLastMile);
  const [customs,      setCustoms]      = useState(false);
  const [insurance,    setInsurance]    = useState(true);

  if (!formData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-500 mb-4">No search data. Please go back and search.</p>
          <button onClick={() => navigate('/train-booking')} className="text-blue-600 underline text-sm">Back to Search</button>
        </div>
      </div>
    );
  }

  const cfd         = formData as TrainContainerFormData;
  const isDomestic  = cfd.isDomestic !== false;
  const originLabel = cfd.originStation || cfd.originTerminal || cfd.originAddress || '—';
  const destLabel   = cfd.destinationStation || cfd.destinationTerminal || cfd.destinationAddress || '—';
  const loadLabel   = cfd.bookingType === 'Train Container Booking'
    ? `${cfd.numberOfContainers || 1} × ${cfd.containerType || '20ft Standard'}`
    : cfd.bookingType === 'Train Goods Booking'
    ? `${(formData as any).numberOfWagons || 1} wagon(s) · ${formData.totalWeight} KG`
    : `${(formData as any).parcelCount || 1} parcel(s) · ${formData.totalWeight} KG`;
  const goodsLabel  = `${formData.cargoType || 'FAK'} · ${formData.totalWeight} KG`;

  const handleConfirm = () => {
    navigate('/train-results', {
      state: {
        formData: {
          ...formData,
          // Only a door origin/destination can have first/last-mile trucking.
          addFirstMile:  autoFirstMile && firstMile,
          addLastMile:   autoLastMile  && lastMile,
          addCustoms:    customs,
          addInsurance:  insurance,
        },
      },
    });
  };

  const Toggle = ({
    value, onChange, disabled = false,
  }: { value: boolean; onChange: (v: boolean) => void; disabled?: boolean }) => (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      disabled={disabled}
      onClick={() => { if (!disabled) onChange(!value); }}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 focus:outline-none ${disabled ? 'bg-gray-200 cursor-not-allowed' : value ? 'bg-blue-600' : 'bg-gray-300'}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${value ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* Step bar */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            {STEPS.map((step, idx) => {
              const stepNum = idx + 1;
              const isActive = stepNum === 2;
              const isDone   = stepNum < 2;
              return (
                <React.Fragment key={step}>
                  <div className="flex flex-col items-center gap-1.5">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                      isDone ? 'bg-blue-500 text-white' : isActive ? 'bg-blue-600 text-white ring-4 ring-blue-100' : 'bg-gray-200 text-gray-400'
                    }`}>{stepNum}</div>
                    <span className={`text-xs font-semibold whitespace-nowrap ${isActive ? 'text-gray-800' : isDone ? 'text-blue-500' : 'text-gray-400'}`}>{step}</span>
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

      {/* Search summary bar */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-stretch divide-y sm:divide-y-0 sm:divide-x divide-gray-200 rounded-xl border border-gray-200 overflow-hidden text-sm bg-gray-50">
            {[
              { label: 'Origin',      value: originLabel },
              { label: 'Destination', value: destLabel   },
              { label: 'Load',        value: loadLabel   },
              { label: 'Goods',       value: goodsLabel  },
            ].map(f => {
              const clean = String(f.value).replace(/,?\s*India$/i, '');
              return (
                <div key={f.label} className="px-4 py-2.5 flex-1 min-w-0">
                  <p className="text-[11px] text-gray-400 font-medium">{f.label} <span className="text-green-500">✓</span></p>
                  <p className="text-sm font-bold text-gray-800 mt-0.5 truncate" title={clean}>{clean}</p>
                </div>
              );
            })}
            <div className="flex items-center justify-end sm:justify-center px-4 py-2 sm:py-0 flex-shrink-0">
              <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-blue-500 transition" title="Edit search">
                <FaPencilAlt className="text-sm" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <FaTrain className="text-blue-500" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Recommended Services</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                We've selected all the services you need to ship your goods from a{' '}
                <strong>{formatServiceType(serviceType).split(' to ')[0]}</strong> to a{' '}
                <strong>{formatServiceType(serviceType).split(' to ')[1]}</strong>. Please check and confirm before getting your results.
              </p>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">

            {/* First Mile — only when the service has a door origin */}
            <div className={autoFirstMile ? '' : 'opacity-60'}>
              <h2 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                First Mile Pickup
                <span className="text-gray-400 text-xs border border-gray-300 rounded-full w-4 h-4 inline-flex items-center justify-center font-bold cursor-help">?</span>
              </h2>
              <label className={`flex items-center justify-between gap-4 ${autoFirstMile ? 'cursor-pointer' : 'cursor-not-allowed'}`}>
                <p className={`text-sm font-medium ${!autoFirstMile ? 'text-gray-400' : firstMile ? 'text-gray-800' : 'text-gray-500'}`}>
                  {!autoFirstMile
                    ? 'Not applicable — your origin is a terminal'
                    : firstMile ? 'Yes - Add first mile pickup to terminal' : 'No - I will deliver to the terminal myself'}
                </p>
                <Toggle value={autoFirstMile && firstMile} onChange={setFirstMile} disabled={!autoFirstMile} />
              </label>
            </div>

            {/* Last Mile — only when the service has a door destination */}
            <div className={autoLastMile ? '' : 'opacity-60'}>
              <h2 className="text-sm font-bold text-gray-700 mb-3">Last Mile Delivery</h2>
              <label className={`flex items-center justify-between gap-4 ${autoLastMile ? 'cursor-pointer' : 'cursor-not-allowed'}`}>
                <p className={`text-sm font-medium ${!autoLastMile ? 'text-gray-400' : lastMile ? 'text-gray-800' : 'text-gray-500'}`}>
                  {!autoLastMile
                    ? 'Not applicable — your destination is a terminal'
                    : lastMile ? 'Yes - Add last mile delivery from terminal' : 'No - Receiver will collect from terminal'}
                </p>
                <Toggle value={autoLastMile && lastMile} onChange={setLastMile} disabled={!autoLastMile} />
              </label>
            </div>

            {/* Customs — only for international */}
            {!isDomestic && (
              <div>
                <h2 className="text-sm font-bold text-gray-700 mb-3">Customs Clearance</h2>
                <label className="flex items-center justify-between gap-4 cursor-pointer">
                  <div>
                    <p className={`text-sm font-medium ${customs ? 'text-gray-800' : 'text-gray-500'}`}>
                      {customs ? 'Yes - I need customs clearance assistance' : 'No - I will handle customs myself'}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">CHA-assisted import/export documentation</p>
                  </div>
                  <Toggle value={customs} onChange={setCustoms} />
                </label>
              </div>
            )}

            {/* Insurance */}
            <div className={`${isDomestic ? 'md:col-span-2' : ''} border-t border-gray-100 pt-6`}>
              <h2 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                Insurance
                <span className="text-gray-400 text-xs border border-gray-300 rounded-full w-4 h-4 inline-flex items-center justify-center font-bold cursor-help">?</span>
              </h2>
              <label className="flex items-center justify-between gap-4 cursor-pointer">
                <div>
                  <p className={`text-sm font-medium ${insurance ? 'text-gray-800' : 'text-gray-500'}`}>
                    {insurance
                      ? 'Yes - (covers the combined value of goods and initial freight costs up to ₹4 Crore)'
                      : 'No - I will arrange my own insurance'}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">All-risk cargo insurance. 1% of declared goods value.</p>
                </div>
                <Toggle value={insurance} onChange={setInsurance} />
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

export default TrainRecommendedServicesPage;
  