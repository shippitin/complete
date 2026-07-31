import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

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
import PortServicesQuoteForm from './QuoteForms/PortServicesQuoteForm';

import type { QuoteFormHandle, TrainContainerFormData } from '../types/QuoteFormHandle';

import {
  FaHome, FaTrain, FaShip, FaPlane, FaTruck,
  FaBox, FaStamp, FaDolly, FaAnchor,
} from 'react-icons/fa';

const tabs = [
  { service: 'Rail',            label: 'Rail',            icon: FaTrain     },
  { service: 'Sea',             label: 'Sea',             icon: FaShip      },
  { service: 'Air',             label: 'Air',             icon: FaPlane     },
  { service: 'Truck',           label: 'Truck',           icon: FaTruck     },
  { service: 'Parcel',          label: 'Parcel',          icon: FaBox       },
  { service: 'Customs',         label: 'Customs',         icon: FaStamp     },
  { service: 'First/Last Mile', label: 'First/Last Mile', icon: FaDolly     },
  { service: 'Door to Door',    label: 'Door to Door',    icon: FaHome      },
  { service: 'Port Services',   label: 'Port Services',   icon: FaAnchor    },
];

interface TabProps {
  icon: React.ElementType;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const Tab: React.FC<TabProps> = ({ icon: Icon, label, isActive, onClick }) => (
  <div
    onClick={onClick}
    className={`
      flex flex-col items-center justify-center px-5 py-3 cursor-pointer rounded-xl select-none
      transition-all duration-300 ease-in-out whitespace-nowrap flex-shrink-0
      ${isActive
        ? 'bg-blue-100 text-black font-bold shadow-md transform scale-105'
        : 'text-gray-600 hover:bg-blue-50 hover:text-blue-800'
      }
    `}
  >
    <Icon className={`text-3xl mb-1 ${isActive ? 'text-blue-700' : 'text-gray-500'}`} />
    <span className="text-xs font-medium text-center">{label}</span>
  </div>
);

const HeroSection: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<string>('Rail');

  const formRefs = useRef<Record<string, QuoteFormHandle | null>>({
    'Door to Door': null, 'Rail': null, 'Sea': null, 'Port Services': null,
    'Air': null, 'Truck': null, 'LCL': null, 'Parcel': null,
    'Customs': null, 'Insurance': null, 'First/Last Mile': null,
  });

  const navigate = useNavigate();

  const handleSearch = async () => {
    const token = localStorage.getItem('shippitin_token');
    if (!token) { navigate('/login'); return; }

    const currentForm = formRefs.current[activeTab];
    let navigationPath: string | null = null;
    let displayComponent: string | null = null;

    if (currentForm) {
      const formData = await currentForm.submit();
      if (formData && !(formData instanceof Promise)) {
        switch (formData.bookingType) {
          case 'Train Container Booking':
          case 'Train Goods Booking':
          case 'Train Parcel Booking':
            // Recommended Services step removed — go straight to results.
            // (RailQuoteForm has already set the add-on defaults on formData.)
            navigationPath = '/train-results';
            if (formData.bookingType === 'Train Container Booking') {
              displayComponent = (formData as TrainContainerFormData).isDomestic
                ? 'DomesticContainerResults' : 'InternationalContainerResults';
            } else if (formData.bookingType === 'Train Goods Booking') {
              displayComponent = 'GoodsResults';
            } else {
              displayComponent = 'ParcelResults';
            }
            break;
          case 'Door to Door':    navigationPath = '/door-to-door-results'; break;
          case 'Sea':             navigationPath = '/sea-recommended-services'; break;
          case 'Port Services':   navigationPath = '/port-results'; break;
          case 'Air':             navigationPath = '/air-results'; break;
          case 'Truck':           navigationPath = '/truck-results'; break;
          case 'LCL':             navigationPath = '/lcl-results'; break;
          case 'Parcel':          navigationPath = '/parcel-results'; break;
          case 'Customs':         navigationPath = '/customs-results'; break;
          case 'Insurance':       navigationPath = '/insurance-results'; break;
          case 'First/Last Mile': navigationPath = '/first-last-mile-results'; break;
          default: break;
        }
        if (navigationPath) navigate(navigationPath, { state: { formData, displayComponent } });
      }
    }
  };

  const renderQuoteForm = () => {
    switch (activeTab) {
      case 'Door to Door':    return <DoorToDoorQuoteForm   ref={el => { formRefs.current['Door to Door']    = el; }} showButtons={false} />;
      case 'Rail':            return <RailQuoteForm          ref={el => { formRefs.current['Rail']            = el; }} showButtons={false} />;
      case 'Sea':             return <SeaQuoteForm           ref={el => { formRefs.current['Sea']             = el; }} showButtons={false} />;
      case 'Port Services':   return <PortServicesQuoteForm  ref={el => { formRefs.current['Port Services']   = el; }} showButtons={false} />;
      case 'Air':             return <AirQuoteForm           ref={el => { formRefs.current['Air']             = el; }} showButtons={false} />;
      case 'Truck':           return <TruckQuoteForm         ref={el => { formRefs.current['Truck']           = el; }} showButtons={false} />;
      case 'LCL':             return <LCLQuoteForm           ref={el => { formRefs.current['LCL']             = el; }} showButtons={false} />;
      case 'Parcel':          return <ParcelQuoteForm        ref={el => { formRefs.current['Parcel']          = el; }} showButtons={false} />;
      case 'Customs':         return <CustomsQuoteForm       ref={el => { formRefs.current['Customs']         = el; }} showButtons={false} />;
      case 'Insurance':       return <InsuranceQuoteForm     ref={el => { formRefs.current['Insurance']       = el; }} showButtons={false} />;
      case 'First/Last Mile': return <FirstLastMileQuoteForm ref={el => { formRefs.current['First/Last Mile'] = el; }} showButtons={false} />;
      default: return null;
    }
  };

  return (
    <section
      className="w-full py-6 px-4"
      style={{ background: 'linear-gradient(135deg, #dbeafe 0%, #ede9fe 50%, #fce7f3 100%)' }}
    >
      {/* Centered (even left/right gaps at any width). Width is tuned to ~1072px
          so the centered left edge lands under the logo's 2nd "P" — this stays
          true at any screen width because the box and logo center together. */}
      <div className="max-w-[1072px] mx-auto">

        {/* White tab strip */}
        <div
          className="bg-white px-4 py-3 flex flex-wrap justify-center sm:justify-between items-center gap-1"
          style={{ borderRadius: '16px 16px 16px 16px', borderBottom: '1px solid #e0e7ff' }}
        >
          {tabs.map(tab => (
            <Tab
              key={tab.service}
              icon={tab.icon}
              label={tab.label}
              isActive={activeTab === tab.service}
              onClick={() => setActiveTab(tab.service)}
            />
          ))}
        </div>

        {/* Form card */}
        <div
          className="pt-5 pb-5"
        >
          {renderQuoteForm()}

          <div className="flex justify-center mt-4">
            <button
              onClick={handleSearch}
              className="text-white text-base font-bold px-20 py-3.5 rounded-full transition-all duration-200 transform hover:scale-105 hover:shadow-xl"
              style={{ background: 'linear-gradient(to right, #53b2fe, #065af3)' }}
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
