import React, { useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaCheckCircle } from 'react-icons/fa';
import type { TruckFormData, QuoteFormHandle, ParsedVoiceCommand } from '../../types/QuoteFormHandle';
import { parseNumber } from '../../utils/parseNumber';
import LocationAutocomplete from '../LocationAutocomplete';

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
  const [pickupPincode, setPickupPincode] = useState('');
  const [dropoffPincode, setDropoffPincode] = useState('');
  const [readyDate, setReadyDate] = useState<Date | null>(null);
  const [loadType, setLoadType] = useState<'PTL' | 'FTL' | ''>('');
  const [totalWeight, setTotalWeight] = useState<number | ''>('');
  const [numberOfPieces, setNumberOfPieces] = useState<number | ''>('');
  const [cargoType, setCargoType] = useState('');
  const [numberOfTrucks, setNumberOfTrucks] = useState<number | ''>(1);
  const [hazardousCargo, setHazardousCargo] = useState(false);
  const [insuranceRequired, setInsuranceRequired] = useState(false);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const inputClass = `block w-full px-3 py-2.5 text-sm bg-white border border-gray-300 rounded-lg transition focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 disabled:bg-gray-50 disabled:text-gray-400`;

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

  useImperativeHandle(ref, () => ({
    submit: () => {
      const data: TruckFormData = {
        bookingType: 'Truck', pickupPincode, dropoffPincode,
        readyDate: readyDate ? readyDate.toISOString() : '',
        loadType: loadType as 'PTL' | 'FTL',
        totalWeight: Number(totalWeight),
        numberOfPieces: Number(numberOfPieces),
        cargoType, hazardousCargo, cargoValue: 0,
        numberOfTrucks: Number(numberOfTrucks) || 1,
        insuranceRequired,
        specialInstructions: specialInstructions || undefined,
      };
      setShowSuccessMessage(true);
      return data;
    },
    reset: () => {
      setPickupPincode(''); setDropoffPincode(''); setReadyDate(null);
      setLoadType(''); setTotalWeight(''); setNumberOfPieces('');
      setCargoType(''); setHazardousCargo(false);
      setInsuranceRequired(false); setNumberOfTrucks(1); setSpecialInstructions('');
    }
  }));

  return (
    <div className="space-y-4 p-5 bg-white rounded-xl shadow-md border border-gray-200 font-inter">

      {/* Load Type toggle */}
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Load Type<span className="text-red-500">*</span></label>
        <div className="flex gap-2">
          {(['PTL', 'FTL'] as const).map((type) => (
            <button key={type} type="button" onClick={() => setLoadType(type)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${loadType === type ? 'bg-blue-100 text-blue-800 border border-blue-200' : 'bg-gray-100 text-gray-700 hover:bg-blue-50 border border-gray-300'}`}>
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Row 1: Origin, Destination, Date, Weight */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-3">
        <div>
          <LocationAutocomplete label="Origin (City / Pincode)*" value={pickupPincode}
            onChange={(v) => setPickupPincode(v)}
            placeholder="e.g., Guntur, 522007" locationType="city" />
        </div>
        <div>
          <LocationAutocomplete label="Destination (City / Pincode)*" value={dropoffPincode}
            onChange={(v) => setDropoffPincode(v)}
            placeholder="e.g., Chennai, 600080" locationType="city" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Date<span className="text-red-500">*</span></label>
          <DatePicker selected={readyDate} onChange={(date) => setReadyDate(date)}
            dateFormat="dd-MM-yyyy" wrapperClassName="w-full" className={inputClass} placeholderText="Select Date" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Total Weight (Kgs)<span className="text-red-500">*</span></label>
          <input type="number" className={inputClass} placeholder="e.g., 2000" value={totalWeight}
            onChange={(e) => setTotalWeight(e.target.value === '' ? '' : Number(e.target.value))} />
        </div>
      </div>

      {/* Row 2: Pieces, Commodity, Trucks, Checkboxes */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">No. of Pieces<span className="text-red-500">*</span></label>
          <input type="number" className={inputClass} placeholder="e.g., 1" value={numberOfPieces}
            onChange={(e) => setNumberOfPieces(e.target.value === '' ? '' : Number(e.target.value))} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Select Commodity<span className="text-red-500">*</span></label>
          <select className={inputClass} value={cargoType} onChange={(e) => setCargoType(e.target.value)}>
            <option value="">Select Category</option>
            {truckCommodities.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">No. of Trucks<span className="text-red-500">*</span></label>
          <input type="number" className={inputClass} placeholder="1" value={numberOfTrucks}
            onChange={(e) => setNumberOfTrucks(e.target.value === '' ? '' : Number(e.target.value))} />
        </div>
        <div className="flex flex-col justify-end gap-2 pb-1">
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input type="checkbox" checked={hazardousCargo} onChange={(e) => setHazardousCargo(e.target.checked)} className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
            Hazardous Cargo
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input type="checkbox" checked={insuranceRequired} onChange={(e) => setInsuranceRequired(e.target.checked)} className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
            Insurance Required
          </label>
        </div>
      </div>

      {/* Special Instructions */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Special Instructions (Optional)</label>
        <input type="text" className={inputClass} placeholder="e.g., Keep dry, Handle with care..."
          value={specialInstructions} onChange={(e) => setSpecialInstructions(e.target.value)} />
      </div>

      {showButtons && (
        <div className="flex justify-center mt-4">
          <button type="button" onClick={() => setShowSuccessMessage(true)}
            className="px-10 py-3 bg-brand-gradient text-white font-bold rounded-xl shadow-lg hover:opacity-90 transition">
            Get Quote
          </button>
        </div>
      )}

      {showSuccessMessage && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl max-w-sm w-full shadow-2xl text-center">
            <FaCheckCircle className="text-green-500 text-5xl mx-auto mb-4" />
            <p className="text-gray-600 mb-6">Quote request submitted successfully.</p>
            <button className="w-full py-3 bg-brand-gradient text-white rounded-lg font-bold"
              onClick={() => setShowSuccessMessage(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
});

export default TruckQuoteForm;
