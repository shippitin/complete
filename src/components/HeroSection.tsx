import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// Import QuoteForm components
import DoorToDoorQuoteForm from './QuoteForms/DoorToDoorQuoteForm';
import TruckQuoteForm from './QuoteForms/TruckQuoteForm';
import AirQuoteForm from './QuoteForms/AirQuoteForm';
import SeaQuoteForm from './QuoteForms/SeaQuoteForm';
import ParcelQuoteForm from './QuoteForms/ParcelQuoteForm';
import LCLQuoteForm from './QuoteForms/LCLQuoteForm';
import InsuranceQuoteForm from './QuoteForms/InsuranceQuoteForm';
import FirstLastMileQuoteForm from './QuoteForms/FirstLastMileQuoteForm';
import CustomsQuoteForm from './QuoteForms/CustomsQuoteForm';
import RailQuoteForm from './QuoteForms/RailQuoteForm'; 
import PortServicesQuoteForm from './QuoteForms/PortServicesQuoteForm'; // ADDED

// Correct Import Path for types
import type {
  QuoteFormHandle,
  AllFormData,
  TrainContainerFormData 
} from '../types/QuoteFormHandle';

import {
  FaHome,
  FaTrain,
  FaShip,
  FaPlane,
  FaTruck,
  FaBox,
  FaBoxes,
  FaStamp,
  FaDolly,
  FaHandshake,
  FaAnchor, // ADDED
} from "react-icons/fa";

interface TabProps {
  icon: React.ElementType;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const Tab: React.FC<TabProps> = ({ icon: Icon, label, isActive, onClick }) => (
  <div
    className={`flex flex-col items-center justify-center px-5 py-3 cursor-pointer rounded-xl
                ${isActive
                  ? 'bg-blue-200 text-black font-bold shadow-lg transform scale-105' 
                  : 'text-gray-700 hover:bg-blue-50 hover:text-blue-800'}
                transition-all duration-300 ease-in-out whitespace-nowrap flex-shrink-0`}
    onClick={onClick}
  >
    <Icon className={`text-2xl mb-1 ${isActive ? '' : 'text-gray-600'}`} />
    <span className="text-xs font-medium text-center">{label}</span>
  </div>
);

const HeroSection: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<string>('Rail'); 

  const formRefs = useRef<Record<string, QuoteFormHandle | null>>({
    'Door to Door': null,
    'Rail': null,
    'Sea': null,
    'Port Services': null, // ADDED
    'Air': null,
    'Truck': null,
    'LCL': null,
    'Parcel': null,
    'Customs': null,
    'Insurance': null,
    'First/Last Mile': null,
  });

  const navigate = useNavigate();

  const handleSearch = () => {
    let currentForm: QuoteFormHandle | null = null;
    let formData: AllFormData | null = null;
    let navigationPath: string | null = null;
    let displayComponent: string | null = null;

    currentForm = formRefs.current[activeTab];

    if (currentForm) {
      formData = currentForm.submit(); 

      if (formData) {
        console.log("HeroSection: Form Data Booking Type:", formData.bookingType);

        switch (formData.bookingType) {
          case 'Train Container Booking':
          case 'Train Goods Booking':
          case 'Train Parcel Booking':
            navigationPath = '/train-results';
            if (formData.bookingType === 'Train Container Booking') {
                displayComponent = (formData as TrainContainerFormData).isDomestic ? 'DomesticContainerResults' : 'InternationalContainerResults';
            } else if (formData.bookingType === 'Train Goods Booking') {
                displayComponent = 'GoodsResults';
            } else if (formData.bookingType === 'Train Parcel Booking') {
                displayComponent = 'ParcelResults';
            }
            break;
          case 'Door to Door':
            navigationPath = '/door-to-door-results';
            break;
          case 'Sea':
            navigationPath = '/sea-results';
            break;
          case 'Port Services': // ADDED
            navigationPath = '/port-results';
            break;
          case 'Air':
            navigationPath = '/air-results';
            break;
          case 'Truck':
            navigationPath = '/truck-results';
            break;
          case 'LCL':
            navigationPath = '/lcl-results';
            break;
          case 'Parcel':
            navigationPath = '/parcel-results';
            break;
          case 'Customs':
            navigationPath = '/customs-results';
            break;
          case 'Insurance':
            navigationPath = '/insurance-results';
            break;
          case 'First/Last Mile':
            navigationPath = '/first-last-mile-results'; 
            break;
          default:
            console.error(`Unknown booking type: ${formData && 'bookingType' in formData ? (formData as any).bookingType : 'unknown'}`);
            break;
        }

        if (navigationPath) {
          navigate(navigationPath, { state: { formData, displayComponent } });
        } else {
          console.error(`Navigation not configured for ${activeTab} with booking type ${formData.bookingType}.`);
        }
      }
    } else {
      console.warn(`Please fill in the required fields for the ${activeTab} form.`);
    }
  };

  const renderQuoteForm = () => {
    switch (activeTab) {
      case 'Door to Door': return <DoorToDoorQuoteForm ref={el => formRefs.current['Door to Door'] = el} showButtons={false} />;
      case 'Rail':
        return <RailQuoteForm ref={el => formRefs.current['Rail'] = el} showButtons={false} />; 
      case 'Sea': return <SeaQuoteForm ref={el => formRefs.current['Sea'] = el} showButtons={false} />;
      case 'Port Services': // ADDED
        return <PortServicesQuoteForm ref={el => formRefs.current['Port Services'] = el} showButtons={false} />;
      case 'Air': return <AirQuoteForm ref={el => formRefs.current['Air'] = el} showButtons={false} />;
      case 'Truck': return <TruckQuoteForm ref={el => formRefs.current['Truck'] = el} showButtons={false} />;
      case 'LCL': return <LCLQuoteForm ref={el => formRefs.current['LCL'] = el} showButtons={false} />;
      case 'Parcel': return <ParcelQuoteForm ref={el => formRefs.current['Parcel'] = el} showButtons={false} />;
      case 'Customs': return <CustomsQuoteForm ref={el => formRefs.current['Customs'] = el} showButtons={false} />;
      case 'Insurance': return <InsuranceQuoteForm ref={el => formRefs.current['Insurance'] = el} showButtons={false} />;
      case 'First/Last Mile': return <FirstLastMileQuoteForm ref={el => formRefs.current['First/Last Mile'] = el} showButtons={false} />;
      default:
        return <div className="text-center py-10 text-gray-400">Coming soon...</div>;
    }
  };

  return (
    <section className="w-full bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-2xl p-4 md:p-6 border border-gray-100 animate-fade-in">

          <nav className="flex flex-wrap justify-center sm:justify-between items-center px-2 sm:px-4 py-3 overflow-x-auto scrollbar-hide gap-2 mb-6">
            <Tab icon={FaTrain} label="Rail" isActive={activeTab === 'Rail'} onClick={() => setActiveTab('Rail')} />
            <Tab icon={FaShip} label="Sea" isActive={activeTab === 'Sea'} onClick={() => setActiveTab('Sea')} />
            {/* Added Port Services Tab */}
            <Tab icon={FaAnchor} label="Port Services" isActive={activeTab === 'Port Services'} onClick={() => setActiveTab('Port Services')} />
            <Tab icon={FaPlane} label="Air" isActive={activeTab === 'Air'} onClick={() => setActiveTab('Air')} />
            <Tab icon={FaTruck} label="Truck" isActive={activeTab === 'Truck'} onClick={() => setActiveTab('Truck')} />
            <Tab icon={FaBox} label="Parcel" isActive={activeTab === 'Parcel'} onClick={() => setActiveTab('Parcel')} />
            <Tab icon={FaStamp} label="Customs" isActive={activeTab === 'Customs'} onClick={() => setActiveTab('Customs')} />
            <Tab icon={FaHandshake} label="Insurance" isActive={activeTab === 'Insurance'} onClick={() => setActiveTab('Insurance')} />
            <Tab icon={FaBoxes} label="LCL" isActive={activeTab === 'LCL'} onClick={() => setActiveTab('LCL')} />
            <Tab icon={FaDolly} label="First/Last Mile" isActive={activeTab === 'First/Last Mile'} onClick={() => setActiveTab('First/Last Mile')} />
            <Tab icon={FaHome} label="Door to Door" isActive={activeTab === 'Door to Door'} onClick={() => setActiveTab('Door to Door')} />
          </nav>

          <div className="p-4 sm:p-6 bg-gray-50 rounded-lg border border-gray-100">
            {renderQuoteForm()}
          </div>

          <div className="text-center mt-8">
            <button
              onClick={handleSearch}
              className="text-white text-xl font-bold px-12 py-4 rounded-full shadow-md transition duration-300 transform hover:scale-105 animate-bounce-in"
              style={{
                background: 'linear-gradient(to right, #53b2fe, #065af3)',
                border: 'none',
              }}
            >
              SEARCH
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;