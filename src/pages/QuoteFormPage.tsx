// src/pages/QuoteFormPage.tsx
import React, { useRef, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaInfoCircle, FaSearch, FaTag } from 'react-icons/fa';

// Import all individual quote form components
import TruckQuoteForm from '../components/QuoteForms/TruckQuoteForm';
import AirQuoteForm from '../components/QuoteForms/AirQuoteForm';
import SeaQuoteForm from '../components/QuoteForms/SeaQuoteForm';
import DoorToDoorQuoteForm from '../components/QuoteForms/DoorToDoorQuoteForm';
import LCLQuoteForm from '../components/QuoteForms/LCLQuoteForm';
import CustomsQuoteForm from '../components/QuoteForms/CustomsQuoteForm';
import InsuranceQuoteForm from '../components/QuoteForms/InsuranceQuoteForm';
import FirstLastMileQuoteForm from '../components/QuoteForms/FirstLastMileQuoteForm';
import ParcelQuoteForm from '../components/QuoteForms/ParcelQuoteForm';

// --- TYPE FIX ---
// Explicitly import as types to avoid "Value vs Type" conflicts
import type { QuoteFormHandle, ParsedVoiceCommand } from '../types/QuoteFormHandle';

interface QuoteFormPageProps {
  activeService: string;
  prefillData?: ParsedVoiceCommand;
}

const QuoteFormPage: React.FC<QuoteFormPageProps> = ({ activeService, prefillData }) => {
  const formRef = useRef<QuoteFormHandle>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Logic to merge Voice Assistant data with Offers Page promo codes
  const mergedPrefillData = useMemo(() => {
    const appliedPromo = location.state?.appliedPromo;
    
    if (!appliedPromo && !prefillData) return undefined;

    return {
      ...(prefillData || {}),
      promoCode: appliedPromo || prefillData?.promoCode 
    } as ParsedVoiceCommand;
  }, [location.state, prefillData]);

  const renderForm = () => {
    switch (activeService) {
      case 'Truck': return <TruckQuoteForm ref={formRef} prefillData={mergedPrefillData} />;
      case 'Air': return <AirQuoteForm ref={formRef} prefillData={mergedPrefillData} />;
      case 'Sea': return <SeaQuoteForm ref={formRef} prefillData={mergedPrefillData} />;
      case 'Door to Door': return <DoorToDoorQuoteForm ref={formRef} prefillData={mergedPrefillData} />;
      case 'LCL': return <LCLQuoteForm ref={formRef} prefillData={mergedPrefillData} />;
      case 'Parcel': return <ParcelQuoteForm ref={formRef} prefillData={mergedPrefillData} />;
      case 'Customs': return <CustomsQuoteForm ref={formRef} prefillData={mergedPrefillData} />;
      case 'Insurance': return <InsuranceQuoteForm ref={formRef} prefillData={mergedPrefillData} />;
      case 'First/Last Mile': return <FirstLastMileQuoteForm ref={formRef} prefillData={mergedPrefillData} />;
      default:
        return (
          <div className="text-center p-8 bg-white rounded-xl shadow-md border border-gray-100">
            <FaInfoCircle className="text-blue-500 text-5xl mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800">Select a service to proceed.</h3>
          </div>
        );
    }
  };

  const handleSubmit = () => {
    if (formRef.current) {
      const formData = formRef.current.submit();
      if (formData) {
        const routeMap: Record<string, string> = {
          'Air': '/air-results',
          'Sea': '/sea-results',
          'Truck': '/truck-results',
          'Door to Door': '/door-to-door-results',
          'LCL': '/lcl-results',
          'Parcel': '/parcel-results',
          'Customs': '/customs-results',
          'Insurance': '/insurance-results',
          'First/Last Mile': '/first-last-mile-results'
        };
        const target = routeMap[formData.bookingType] || '/booking-summary';
        navigate(target, { state: { formData } });
      }
    }
  };

  const handleReset = () => formRef.current?.reset();

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100">
        <div className="bg-slate-900 text-white p-8 relative">
          <h1 className="text-3xl font-black italic tracking-tighter uppercase">
            {activeService ? `${activeService} Quote` : 'Get a Quote'}
          </h1>
          <p className="text-slate-400 text-[10px] font-bold tracking-widest uppercase mt-1">Shippitin Logistics Engine v2.0</p>
        </div>

        <div className="p-8">
          {location.state?.appliedPromo && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center text-emerald-700 animate-in fade-in slide-in-from-top-4 duration-500">
              <FaTag className="mr-3" />
              <span className="text-xs font-black uppercase tracking-tight">Voucher Applied: {location.state.appliedPromo}</span>
            </div>
          )}

          {renderForm()}

          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-12">
            <button onClick={handleSubmit} className="px-10 py-4 bg-blue-600 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center">
              <FaSearch className="mr-2" /> Search Quotes
            </button>
            <button onClick={handleReset} className="px-10 py-4 bg-slate-100 text-slate-500 font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-slate-200 transition-all">
              Reset Form
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuoteFormPage;