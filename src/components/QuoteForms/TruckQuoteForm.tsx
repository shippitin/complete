import React, { useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { 
  FaMapMarkerAlt, FaCalendarAlt, FaWeight, FaTruck, 
  FaBoxes, FaTag, FaTimesCircle, FaCheckCircle, 
  FaDollarSign, FaRulerCombined 
} from 'react-icons/fa';
import type { TruckFormData, QuoteFormHandle, ParsedVoiceCommand, AllFormData } from '../../types/QuoteFormHandle';
import { parseNumber } from '../../utils/parseNumber';

const truckCommodities = [
  { label: 'Garments', value: 'Garments' },
  { label: 'Pharmaceutical', value: 'Pharmaceutical' },
  { label: 'Engineering Goods', value: 'Engineering Goods' },
  { label: 'Auto Parts', value: 'Auto Parts' },
  { label: 'Machinery', value: 'Machinery' },
  { label: 'Handicrafts', value: 'Handicrafts' },
  { label: 'Leather Goods', value: 'Leather Goods' },
  { label: 'Carpets', value: 'Carpets' },
  { label: 'Fabric', value: 'Fabric' },
  { label: 'Other', value: 'Other' },
];

const TruckQuoteForm = forwardRef<QuoteFormHandle, { prefillData?: ParsedVoiceCommand; showButtons?: boolean }>(({ prefillData, showButtons = true }, ref) => {
  // --- Form State ---
  const [pickupPincode, setPickupPincode] = useState('');
  const [dropoffPincode, setDropoffPincode] = useState('');
  const [readyDate, setReadyDate] = useState<Date | null>(null);
  const [loadType, setLoadType] = useState<'PTL' | 'FTL' | ''>('');
  const [totalWeight, setTotalWeight] = useState<number | ''>('');
  const [numberOfPieces, setNumberOfPieces] = useState<number | ''>('');
  const [cargoValue, setCargoValue] = useState<number | ''>('');
  const [cargoType, setCargoType] = useState('');
  const [numberOfTrucks, setNumberOfTrucks] = useState<number | ''>(1);
  const [hazardousCargo, setHazardousCargo] = useState(false);
  const [insuranceRequired, setInsuranceRequired] = useState(false);
  const [specialInstructions, setSpecialInstructions] = useState('');

  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // --- Design Tokens (Sea Freight Style) ---
  const labelClass = "block text-sm font-semibold text-gray-800 mb-2";
  const inputClass = "w-full pl-9 pr-3 py-2 border-b border-gray-300 focus:border-blue-600 focus:outline-none transition-colors bg-transparent text-gray-700 placeholder-gray-400 text-sm";
  const iconClass = "absolute left-0 bottom-3 text-gray-500 text-base";

  useEffect(() => {
    if (prefillData) {
      setPickupPincode(prefillData.pickupPincode || prefillData.origin || '');
      setDropoffPincode(prefillData.dropoffPincode || prefillData.destination || '');
      setLoadType((prefillData.loadType as 'PTL' | 'FTL') || '');
      setReadyDate(prefillData.readyDate ? new Date(prefillData.readyDate) : null);
      
      const pWeight = parseNumber(prefillData.cargoWeight || prefillData.totalWeight);
      setTotalWeight(typeof pWeight === 'number' ? pWeight : '');

      const pPieces = parseNumber(prefillData.numberOfPieces);
      setNumberOfPieces(typeof pPieces === 'number' ? pPieces : '');

      setCargoType(prefillData.cargoType || prefillData.commodity || '');
      setInsuranceRequired(!!prefillData.insuranceRequired);
    }
  }, [prefillData]);

  // --- Handle Logic for Parent Component ---
  useImperativeHandle(ref, () => ({
    submit: () => {
      // Constructing the object to match TruckFormData exactly
      const data: TruckFormData = {
        bookingType: 'Truck',
        pickupPincode,
        dropoffPincode,
        readyDate: readyDate ? readyDate.toISOString() : '',
        loadType: loadType as 'PTL' | 'FTL',
        totalWeight: Number(totalWeight),
        numberOfPieces: Number(numberOfPieces),
        cargoType,
        hazardousCargo,
        cargoValue: Number(cargoValue) || 0,
        numberOfTrucks: Number(numberOfTrucks) || 1, // Fix: Added missing property
        insuranceRequired: insuranceRequired,        // Fix: Added missing property
        specialInstructions: specialInstructions || undefined
      };
      setShowSuccessMessage(true);
      return data;
    },
    reset: () => {
      setPickupPincode(''); setDropoffPincode(''); setReadyDate(null);
      setLoadType(''); setTotalWeight(''); setNumberOfPieces('');
      setCargoType(''); setCargoValue(''); setHazardousCargo(false);
      setInsuranceRequired(false); setNumberOfTrucks(1); setSpecialInstructions('');
    }
  }));

  return (
    <div className="p-6 bg-white rounded-lg font-inter">
      {/* 1. Capsule Load Type Toggle */}
      <div className="mb-10">
        <label className={labelClass}>Choose your load type*</label>
        <div className="inline-flex p-1 bg-gray-100 rounded-full border border-gray-200">
          {(['PTL', 'FTL'] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setLoadType(type)}
              className={`px-8 py-2 rounded-full text-xs font-bold transition-all duration-200 ${
                loadType === type 
                  ? 'bg-blue-100 text-blue-700 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Form Grid (Underline Style) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-10">
        <div className="relative">
          <label className={labelClass}>Origin Pincode*</label>
          <div className="relative">
            <FaMapMarkerAlt className={iconClass} />
            <input type="text" className={inputClass} placeholder="e.g., 600080" value={pickupPincode} onChange={(e) => setPickupPincode(e.target.value)} />
          </div>
        </div>

        <div className="relative">
          <label className={labelClass}>Destination Pincode*</label>
          <div className="relative">
            <FaMapMarkerAlt className={iconClass} />
            <input type="text" className={inputClass} placeholder="e.g., 522007" value={dropoffPincode} onChange={(e) => setDropoffPincode(e.target.value)} />
          </div>
        </div>

        <div className="relative">
          <label className={labelClass}>Pickup Date*</label>
          <div className="relative">
            <FaCalendarAlt className={iconClass} />
            <DatePicker 
              selected={readyDate} 
              onChange={(date) => setReadyDate(date)} 
              dateFormat="dd-MM-yyyy" 
              className={inputClass} 
              placeholderText="Select Date" 
            />
          </div>
        </div>

        <div className="relative">
          <label className={labelClass}>Total Weight (Kgs)*</label>
          <div className="relative">
            <FaWeight className={iconClass} />
            <input type="number" className={inputClass} placeholder="e.g., 2000" value={totalWeight} onChange={(e) => setTotalWeight(e.target.value === '' ? '' : Number(e.target.value))} />
          </div>
        </div>

        <div className="relative">
          <label className={labelClass}>No. of Pieces*</label>
          <div className="relative">
            <FaBoxes className={iconClass} />
            <input type="number" className={inputClass} placeholder="e.g., 1" value={numberOfPieces} onChange={(e) => setNumberOfPieces(e.target.value === '' ? '' : Number(e.target.value))} />
          </div>
        </div>

        <div className="relative">
          <label className={labelClass}>Select Commodity*</label>
          <div className="relative">
            <FaTag className={iconClass} />
            <select className={`${inputClass} appearance-none`} value={cargoType} onChange={(e) => setCargoType(e.target.value)}>
              <option value="">Select Category</option>
              {truckCommodities.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
        </div>

        <div className="relative">
          <label className={labelClass}>No. of Trucks*</label>
          <div className="relative">
            <FaTruck className={iconClass} />
            <input type="number" className={inputClass} placeholder="1" value={numberOfTrucks} onChange={(e) => setNumberOfTrucks(e.target.value === '' ? '' : Number(e.target.value))} />
          </div>
        </div>

        {/* Hazardous & Insurance Checkboxes */}
        <div className="flex flex-col space-y-3 pt-4">
          <label className="flex items-center space-x-3 cursor-pointer group">
            <input type="checkbox" className="w-4 h-4 border-gray-300 rounded text-blue-600 focus:ring-blue-500" checked={hazardousCargo} onChange={(e) => setHazardousCargo(e.target.checked)} />
            <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">Hazardous Cargo</span>
          </label>
          <label className="flex items-center space-x-3 cursor-pointer group">
            <input type="checkbox" className="w-4 h-4 border-gray-300 rounded text-blue-600 focus:ring-blue-500" checked={insuranceRequired} onChange={(e) => setInsuranceRequired(e.target.checked)} />
            <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">Insurance Required</span>
          </label>
        </div>
      </div>

      {/* 3. Special Instructions Underline */}
      <div className="mt-12">
        <label className={labelClass}>Special Instructions (Optional)</label>
        <textarea 
          className="w-full py-2 border-b border-gray-300 focus:border-blue-600 focus:outline-none transition-colors bg-transparent text-sm resize-none" 
          placeholder="e.g., Keep dry, Handle with care..." 
          rows={1}
          value={specialInstructions}
          onChange={(e) => setSpecialInstructions(e.target.value)}
        />
      </div>

      {showButtons && (
        <div className="flex justify-end mt-12">
          <button 
            type="button" 
            onClick={() => setShowSuccessMessage(true)} 
            className="px-10 py-2.5 bg-blue-600 text-white font-bold rounded-lg shadow-sm hover:bg-blue-700 transition transform hover:scale-105"
          >
            Get Quote
          </button>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessMessage && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl max-w-sm w-full shadow-2xl text-center">
            <FaCheckCircle className="text-green-500 text-5xl mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">Success</h3>
            <p className="text-gray-600 mb-6">Quote request submitted successfully.</p>
            <button className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold" onClick={() => setShowSuccessMessage(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
});

export default TruckQuoteForm;