// src/pages/QuoteFormPage.tsx
import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaInfoCircle, FaSearch } from 'react-icons/fa';

// Import all individual quote form components (excluding train forms)
import TruckQuoteForm from '../components/QuoteForms/TruckQuoteForm';
import AirQuoteForm from '../components/QuoteForms/AirQuoteForm';
import SeaQuoteForm from '../components/QuoteForms/SeaQuoteForm';
import DoorToDoorQuoteForm from '../components/QuoteForms/DoorToDoorQuoteForm';
import LCLQuoteForm from '../components/QuoteForms/LCLQuoteForm';
import CustomsQuoteForm from '../components/QuoteForms/CustomsQuoteForm';
import InsuranceQuoteForm from '../components/QuoteForms/InsuranceQuoteForm';
import FirstLastMileQuoteForm from '../components/QuoteForms/FirstLastMileQuoteForm';
import ParcelQuoteForm from '../components/QuoteForms/ParcelQuoteForm';

// Import types
import type { QuoteFormHandle } from '../types/QuoteFormHandle';
import type { ParsedVoiceCommand } from '../components/VoiceAssistant';

interface QuoteFormPageProps {
  activeService: string; // The currently selected service (e.g., 'Truck', 'Air')
  prefillData?: ParsedVoiceCommand; // Prop to receive pre-fill data from voice commands
}

const QuoteFormPage: React.FC<QuoteFormPageProps> = ({ activeService, prefillData }) => {
  const formRef = useRef<QuoteFormHandle>(null); // Generic ref for the currently active form
  const navigate = useNavigate();

  // Determine which form to render based on activeService
  const renderForm = () => {
    switch (activeService) {
      case 'Truck':
        return <TruckQuoteForm ref={formRef} prefillData={prefillData} />;
      case 'Air':
        return <AirQuoteForm ref={formRef} prefillData={prefillData} />;
      case 'Sea':
        return <SeaQuoteForm ref={formRef} prefillData={prefillData} />;
      case 'Door to Door':
        return <DoorToDoorQuoteForm ref={formRef} prefillData={prefillData} />;
      case 'LCL':
        return <LCLQuoteForm ref={formRef} prefillData={prefillData} />;
      case 'Parcel': // Generic Parcel
        return <ParcelQuoteForm ref={formRef} prefillData={prefillData} />;
      case 'Customs':
        return <CustomsQuoteForm ref={formRef} prefillData={prefillData} />;
      case 'Insurance':
        return <InsuranceQuoteForm ref={formRef} prefillData={prefillData} />;
      case 'First/Last Mile':
        return <FirstLastMileQuoteForm ref={formRef} prefillData={prefillData} />;
      default:
        // This case should ideally not be hit if routing is correct,
        // but provides a fallback message.
        return (
          <div className="text-center p-8 bg-white rounded-xl shadow-md">
            <FaInfoCircle className="text-blue-500 text-5xl mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800">Please select a service to get a quote.</h3>
            <p className="text-gray-600 mt-2">You can use the the navigation menu or the voice assistant.</p>
          </div>
        );
    }
  };

  const handleSubmit = () => {
    if (formRef.current) {
      const formData = formRef.current.submit();
      if (formData) {
        console.log('Form Data Submitted:', formData);
        // Navigate based on bookingType
        switch (formData.bookingType) {
          // Train booking types are now handled by TrainBookingPage,
          // so they should not appear here.
          case 'Air':
            navigate('/air-results', { state: { formData } });
            break;
          case 'Sea':
            navigate('/sea-results', { state: { formData } });
            break;
          case 'Truck':
            navigate('/truck-results', { state: { formData } });
            break;
          case 'Door to Door':
            navigate('/door-to-door-results', { state: { formData } });
            break;
          case 'LCL':
            navigate('/lcl-results', { state: { formData } });
            break;
          case 'Parcel':
            navigate('/parcel-results', { state: { formData } });
            break;
          case 'Customs':
            navigate('/customs-results', { state: { formData } });
            break;
          case 'Insurance':
            navigate('/insurance-results', { state: { formData } });
            break;
          case 'First/Last Mile':
            navigate('/first-last-mile-results', { state: { formData } });
            break;
          default:
            console.warn('Unknown booking type, navigating to a generic summary or home.');
            navigate('/booking-summary', { state: { formData } });
            break;
        }
      }
    }
  };

  const handleReset = () => {
    if (formRef.current) {
      formRef.current.reset();
    }
  };

  // Dynamically set the title based on the active service
  const pageTitle = activeService ? `${activeService} Quote` : 'Get a Quote';

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white p-6 rounded-t-2xl">
          <h1 className="text-3xl font-bold text-center">{pageTitle}</h1>
        </div>

        <div className="p-6">
          {renderForm()}

          {activeService && ( // Only show buttons if a service is selected
            <div className="flex justify-center gap-4 mt-8">
              <button
                onClick={handleSubmit}
                className="px-8 py-3 bg-green-600 text-white font-bold rounded-full shadow-lg hover:bg-green-700 transition duration-300 transform hover:scale-105 flex items-center"
              >
                <FaSearch className="mr-2" /> Search Quotes
              </button>
              <button
                onClick={handleReset}
                className="px-8 py-3 bg-gray-300 text-gray-800 font-bold rounded-full shadow-lg hover:bg-gray-400 transition duration-300 transform hover:scale-105"
              >
                Reset Form
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuoteFormPage;