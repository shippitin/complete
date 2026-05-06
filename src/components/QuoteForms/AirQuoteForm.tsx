// src/components/QuoteForms/AirQuoteForm.tsx
import React, { useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaCheckCircle } from 'react-icons/fa';
import type { AirFormData, QuoteFormHandle, ParsedVoiceCommand, AllFormData } from '../../types/QuoteFormHandle';
import { parseNumber } from '../../utils/parseNumber';
import LocationAutocomplete from '../LocationAutocomplete';

type ActivityTypeLiteral = 'Airport to Airport' | 'Airport to Door' | 'Door to Airport' | 'Door to Door';
const validActivityTypes: ActivityTypeLiteral[] = ['Airport to Airport', 'Airport to Door', 'Door to Airport', 'Door to Door'];

const commodityCategories = [
  { label: 'General Cargo', value: 'General Cargo' },
  { label: 'Perishable Goods', value: 'Perishable Goods' },
  { label: 'Hazardous Materials', value: 'Hazardous Materials' },
  { label: 'Live Animals', value: 'Live Animals' },
];

const commodities: { [key: string]: { label: string; value: string }[] } = {
  'General Cargo': [{ label: 'Electronics', value: 'Electronics' }, { label: 'Textiles', value: 'Textiles' }, { label: 'Machinery Parts', value: 'Machinery Parts' }],
  'Perishable Goods': [{ label: 'Fruits & Vegetables', value: 'Fruits & Vegetables' }, { label: 'Flowers', value: 'Flowers' }, { label: 'Pharmaceuticals', value: 'Pharmaceuticals' }],
  'Hazardous Materials': [{ label: 'Chemicals', value: 'Chemicals' }, { label: 'Batteries', value: 'Batteries' }],
  'Live Animals': [{ label: 'Pets', value: 'Pets' }, { label: 'Livestock', value: 'Livestock' }],
};

const hsnCodes = [
  { label: 'Select HSN Code', value: '' },
  { label: '8517 - Telephones', value: '8517' },
  { label: '6103 - Men\'s suits, ensembles', value: '6103' },
  { label: '3004 - Medicaments', value: '3004' },
];

interface AirQuoteFormProps {
  prefillData?: ParsedVoiceCommand;
  showButtons?: boolean;
}

const AirQuoteForm = forwardRef<QuoteFormHandle, AirQuoteFormProps>(({ prefillData, showButtons = true }, ref) => {
  const [originAirport, setOriginAirport] = useState('');
  const [originDoorCombined, setOriginDoorCombined] = useState('');
  const [destinationAirport, setDestinationAirport] = useState('');
  const [destinationDoorCombined, setDestinationDoorCombined] = useState('');
  const [readyDate, setReadyDate] = useState<Date | null>(null);
  const [totalWeight, setTotalWeight] = useState<number | ''>('');
  const [dimensions, setDimensions] = useState('');
  const [volumeWeight, setVolumeWeight] = useState<number | ''>('');
  const [numberOfPieces, setNumberOfPieces] = useState<number | ''>('');
  const [commodityCategory, setCommodityCategory] = useState('');
  const [commodity, setCommodity] = useState('');
  const [hsnCode, setHsnCode] = useState('');
  const [hazardousCargo, setHazardousCargo] = useState(false);
  const [insuranceRequired, setInsuranceRequired] = useState(false);
  const [activityType, setActivityType] = useState<ActivityTypeLiteral | ''>('');
  const [errors, setErrors] = useState<Partial<Record<keyof AirFormData, string>>>({});
  const [showValidationMessage, setShowValidationMessage] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const resetAll = () => {
    setOriginAirport(''); setOriginDoorCombined(''); setDestinationAirport(''); setDestinationDoorCombined('');
    setReadyDate(null); setTotalWeight(''); setDimensions(''); setVolumeWeight(''); setNumberOfPieces('');
    setCommodityCategory(''); setCommodity(''); setHsnCode(''); setHazardousCargo(false); setInsuranceRequired(false);
    setActivityType(''); setErrors({}); setShowValidationMessage(false); setShowSuccessMessage(false);
  };

  useEffect(() => {
    if (prefillData) {
      const parsed = prefillData.activityType && validActivityTypes.includes(prefillData.activityType as ActivityTypeLiteral) ? prefillData.activityType as ActivityTypeLiteral : '';
      setActivityType(parsed);
      const pd = prefillData as any;
      setOriginAirport(pd.originAirport || prefillData.origin || '');
      setDestinationAirport(pd.destinationAirport || prefillData.destination || '');
      setOriginDoorCombined([pd.originCity, pd.originAddress].filter(Boolean).join(', ') || '');
      setDestinationDoorCombined([pd.destinationCity, pd.destinationAddress].filter(Boolean).join(', ') || '');
      setReadyDate(prefillData.readyDate ? new Date(prefillData.readyDate) : null);
      setTotalWeight(parseNumber(prefillData.cargoWeight) ?? '');
      setDimensions(pd.cargoDimensions || '');
      setVolumeWeight(parseNumber(pd.volumetricWeight) ?? '');
      setNumberOfPieces(parseNumber(prefillData.numberOfPieces) ?? '');
      setCommodityCategory(pd.commodityCategory || '');
      setCommodity(prefillData.commodity || prefillData.cargoType || '');
      setHsnCode(pd.hsnCode || '');
      setHazardousCargo(prefillData.hazardousCargo || false);
      setInsuranceRequired(prefillData.insuranceRequired || false);
    }
  }, [prefillData]);

  const handleSubmitLogic = (): AllFormData | null => {
    const newErrors: Partial<Record<keyof AirFormData, string>> = {};
    if (!activityType) newErrors.activityType = 'Activity Type is required.';
    if (!readyDate) newErrors.readyDate = 'Clearance Date is required.';

    if (activityType === 'Airport to Airport' || activityType === 'Airport to Door') {
      if (!originAirport) newErrors.originAirport = 'Origin Airport is required.';
    } else if (activityType === 'Door to Airport' || activityType === 'Door to Door') {
      if (!originDoorCombined) newErrors.originCity = 'Origin (City/Address) is required.';
      if (!originAirport) newErrors.originAirport = 'Origin Airport is required.';
    }

    if (activityType === 'Airport to Airport' || activityType === 'Door to Airport') {
      if (!destinationAirport) newErrors.destinationAirport = 'Destination Airport is required.';
    } else if (activityType === 'Airport to Door' || activityType === 'Door to Door') {
      if (!destinationAirport) newErrors.destinationAirport = 'Destination Airport is required.';
      if (!destinationDoorCombined) newErrors.destinationCity = 'Destination (City/Address) is required.';
    }

    const finalTotalWeight = parseNumber(totalWeight);
    if (finalTotalWeight === undefined || finalTotalWeight <= 0) newErrors.totalWeight = 'Gross Weight is required.';
    const finalNumberOfPieces = parseNumber(numberOfPieces);
    if (finalNumberOfPieces === undefined || finalNumberOfPieces <= 0) newErrors.numberOfPieces = 'No. of Pieces is required.';
    const finalVolumeWeight = parseNumber(volumeWeight);
    if (finalVolumeWeight === undefined || finalVolumeWeight <= 0) newErrors.volumeWeight = 'Volume Weight is required.';
    if (!commodityCategory) newErrors.commodityCategory = 'Commodity Category is required.';
    if (!commodity) newErrors.commodity = 'Commodity is required.';

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) { setValidationMessage('Please fill in all required fields correctly.'); setShowValidationMessage(true); return null; }

    const formData: AirFormData = {
      bookingType: 'Air', destinationAirport, readyDate: readyDate ? readyDate.toISOString().split('T')[0] : '',
      activityType: activityType as ActivityTypeLiteral, totalWeight: finalTotalWeight as number,
      numberOfPieces: finalNumberOfPieces as number, volumeWeight: finalVolumeWeight as number,
      commodityCategory, commodity, cargoType: commodity, hsCode: hsnCode || undefined,
      hazardousCargo, insuranceRequired, dimensions: dimensions || undefined,
      originAirport: undefined, originCity: undefined, originAddress: undefined,
      destinationCity: undefined, destinationAddress: undefined, cargoValue: undefined, specialInstructions: undefined,
    };

    if (activityType === 'Airport to Airport' || activityType === 'Airport to Door') { formData.originAirport = originAirport; }
    else if (activityType === 'Door to Airport' || activityType === 'Door to Door') { formData.originCity = originDoorCombined; formData.originAirport = originAirport; }
    if (activityType === 'Airport to Door' || activityType === 'Door to Door') { formData.destinationCity = destinationDoorCombined; }

    setSuccessMessage('Air Freight quote data collected successfully.');
    setShowSuccessMessage(true);
    return formData;
  };

  useImperativeHandle(ref, () => ({ submit: handleSubmitLogic, reset: resetAll }));

  const inputClass = (hasError: boolean) =>
    `block w-full pl-3 pr-3 py-2 sm:text-sm bg-transparent border-0 border-b focus:ring-0 focus:border-blue-500 ${hasError ? 'border-orange-500' : 'border-gray-300'}`;

  const renderDatePicker = () => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Clearance Date<span className="text-red-500">*</span></label>
      <DatePicker selected={readyDate} onChange={(date) => { setReadyDate(date); setErrors(p => ({ ...p, readyDate: undefined })); }}
        dateFormat="dd-MM-yyyy" placeholderText="DD-MM-YYYY" className={inputClass(!!errors.readyDate)} />
      {errors.readyDate && <p className="mt-1 text-sm text-orange-600">{errors.readyDate}</p>}
    </div>
  );

  return (
    <div className="space-y-4 p-5 bg-white rounded-xl shadow-md border border-gray-200 font-inter">

      {/* Activity Type */}
      <div>
        <div className={`grid grid-cols-2 sm:grid-cols-4 gap-2 ${errors.activityType ? 'border-2 border-orange-500 rounded-lg p-1' : ''}`}>
          {validActivityTypes.map(type => (
            <button key={type} type="button"
              onClick={() => { setActivityType(type); resetAll(); setActivityType(type); setErrors(p => ({ ...p, activityType: undefined })); }}
              className={`flex items-center justify-center px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${activityType === type ? 'bg-blue-100 text-blue-800 border border-blue-200' : 'bg-gray-100 text-gray-700 hover:bg-blue-50 border border-gray-300'}`}>
              {type}
            </button>
          ))}
        </div>
        {errors.activityType && <p className="mt-1 text-sm text-orange-600">{errors.activityType}</p>}
      </div>

      {activityType === 'Airport to Airport' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-3">
          <div>
            <LocationAutocomplete label="Origin Airport" required value={originAirport}
              onChange={(v) => { setOriginAirport(v); setErrors(p => ({ ...p, originAirport: undefined })); }}
              placeholder="e.g., Chennai Airport, MAA" locationType="airport" />
            {errors.originAirport && <p className="mt-1 text-sm text-orange-600">{errors.originAirport}</p>}
          </div>
          <div>
            <LocationAutocomplete label="Destination Airport" required value={destinationAirport}
              onChange={(v) => { setDestinationAirport(v); setErrors(p => ({ ...p, destinationAirport: undefined })); }}
              placeholder="e.g., JFK New York, JFK" locationType="airport" />
            {errors.destinationAirport && <p className="mt-1 text-sm text-orange-600">{errors.destinationAirport}</p>}
          </div>
          {renderDatePicker()}
        </div>
      )}

      {activityType === 'Airport to Door' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-3">
          <div>
            <LocationAutocomplete label="Origin Airport" required value={originAirport}
              onChange={(v) => { setOriginAirport(v); setErrors(p => ({ ...p, originAirport: undefined })); }}
              placeholder="e.g., Mumbai Airport, BOM" locationType="airport" />
            {errors.originAirport && <p className="mt-1 text-sm text-orange-600">{errors.originAirport}</p>}
          </div>
          <div>
            <LocationAutocomplete label="Destination (City/Address)" required value={destinationDoorCombined}
              onChange={(v) => { setDestinationDoorCombined(v); setErrors(p => ({ ...p, destinationCity: undefined })); }}
              placeholder="e.g., New York, London" locationType="city" />
            {errors.destinationCity && <p className="mt-1 text-sm text-orange-600">{errors.destinationCity}</p>}
          </div>
          <div>
            <LocationAutocomplete label="Destination Airport" required value={destinationAirport}
              onChange={(v) => { setDestinationAirport(v); setErrors(p => ({ ...p, destinationAirport: undefined })); }}
              placeholder="e.g., JFK New York, JFK" locationType="airport" />
            {errors.destinationAirport && <p className="mt-1 text-sm text-orange-600">{errors.destinationAirport}</p>}
          </div>
          {renderDatePicker()}
        </div>
      )}

      {activityType === 'Door to Airport' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-3">
          <div>
            <LocationAutocomplete label="Origin (City/Address)" required value={originDoorCombined}
              onChange={(v) => { setOriginDoorCombined(v); setErrors(p => ({ ...p, originCity: undefined })); }}
              placeholder="e.g., Chennai, Bangalore" locationType="city" />
            {errors.originCity && <p className="mt-1 text-sm text-orange-600">{errors.originCity}</p>}
          </div>
          <div>
            <LocationAutocomplete label="Origin Airport" required value={originAirport}
              onChange={(v) => { setOriginAirport(v); setErrors(p => ({ ...p, originAirport: undefined })); }}
              placeholder="e.g., Chennai Airport, MAA" locationType="airport" />
            {errors.originAirport && <p className="mt-1 text-sm text-orange-600">{errors.originAirport}</p>}
          </div>
          <div>
            <LocationAutocomplete label="Destination Airport" required value={destinationAirport}
              onChange={(v) => { setDestinationAirport(v); setErrors(p => ({ ...p, destinationAirport: undefined })); }}
              placeholder="e.g., Dubai Airport, DXB" locationType="airport" />
            {errors.destinationAirport && <p className="mt-1 text-sm text-orange-600">{errors.destinationAirport}</p>}
          </div>
          {renderDatePicker()}
        </div>
      )}

      {activityType === 'Door to Door' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-3">
            <div>
              <LocationAutocomplete label="Origin (City/Address)" required value={originDoorCombined}
                onChange={(v) => { setOriginDoorCombined(v); setErrors(p => ({ ...p, originCity: undefined })); }}
                placeholder="e.g., Chennai, Hyderabad" locationType="city" />
              {errors.originCity && <p className="mt-1 text-sm text-orange-600">{errors.originCity}</p>}
            </div>
            <div>
              <LocationAutocomplete label="Origin Airport" required value={originAirport}
                onChange={(v) => { setOriginAirport(v); setErrors(p => ({ ...p, originAirport: undefined })); }}
                placeholder="e.g., Chennai Airport, MAA" locationType="airport" />
              {errors.originAirport && <p className="mt-1 text-sm text-orange-600">{errors.originAirport}</p>}
            </div>
            <div>
              <LocationAutocomplete label="Destination (City/Address)" required value={destinationDoorCombined}
                onChange={(v) => { setDestinationDoorCombined(v); setErrors(p => ({ ...p, destinationCity: undefined })); }}
                placeholder="e.g., London, Singapore" locationType="city" />
              {errors.destinationCity && <p className="mt-1 text-sm text-orange-600">{errors.destinationCity}</p>}
            </div>
            <div>
              <LocationAutocomplete label="Destination Airport" required value={destinationAirport}
                onChange={(v) => { setDestinationAirport(v); setErrors(p => ({ ...p, destinationAirport: undefined })); }}
                placeholder="e.g., Heathrow, LHR" locationType="airport" />
              {errors.destinationAirport && <p className="mt-1 text-sm text-orange-600">{errors.destinationAirport}</p>}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-3">
            {renderDatePicker()}
          </div>
        </>
      )}

      {/* Weight fields */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Gross Weight (Kgs)<span className="text-red-500">*</span></label>
          <input type="number" className={inputClass(!!errors.totalWeight)} placeholder="e.g., 100" value={totalWeight}
            onChange={(e) => { setTotalWeight(e.target.value === '' ? '' : Number(e.target.value)); setErrors(p => ({ ...p, totalWeight: undefined })); }} />
          {errors.totalWeight && <p className="mt-1 text-sm text-orange-600">{errors.totalWeight}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">No. of Pieces<span className="text-red-500">*</span></label>
          <input type="number" className={inputClass(!!errors.numberOfPieces)} placeholder="e.g., 1" value={numberOfPieces}
            onChange={(e) => { setNumberOfPieces(e.target.value === '' ? '' : Number(e.target.value)); setErrors(p => ({ ...p, numberOfPieces: undefined })); }} />
          {errors.numberOfPieces && <p className="mt-1 text-sm text-orange-600">{errors.numberOfPieces}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Volume Weight (Kgs)<span className="text-red-500">*</span></label>
          <input type="number" className={inputClass(!!errors.volumeWeight)} placeholder="e.g., 50" value={volumeWeight}
            onChange={(e) => { setVolumeWeight(e.target.value === '' ? '' : Number(e.target.value)); setErrors(p => ({ ...p, volumeWeight: undefined })); }} />
          {errors.volumeWeight && <p className="mt-1 text-sm text-orange-600">{errors.volumeWeight}</p>}
        </div>
      </div>

      {/* Commodity fields */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Commodity Category<span className="text-red-500">*</span></label>
          <select className={inputClass(!!errors.commodityCategory)} value={commodityCategory}
            onChange={(e) => { setCommodityCategory(e.target.value); setCommodity(''); setErrors(p => ({ ...p, commodityCategory: undefined })); }}>
            <option value="">Select Category</option>
            {commodityCategories.map(cat => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
          </select>
          {errors.commodityCategory && <p className="mt-1 text-sm text-orange-600">{errors.commodityCategory}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Commodity<span className="text-red-500">*</span></label>
          <select className={inputClass(!!errors.commodity)} value={commodity} disabled={!commodityCategory}
            onChange={(e) => { setCommodity(e.target.value); setErrors(p => ({ ...p, commodity: undefined })); }}>
            <option value="">Select Commodity</option>
            {commodityCategory && commodities[commodityCategory]?.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
          {errors.commodity && <p className="mt-1 text-sm text-orange-600">{errors.commodity}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">HSN Code (Optional)</label>
          <select className={inputClass(false)} value={hsnCode} onChange={(e) => setHsnCode(e.target.value)}>
            {hsnCodes.map(code => <option key={code.value} value={code.value}>{code.label}</option>)}
          </select>
        </div>
      </div>

      {/* Checkboxes */}
      <div className="flex flex-wrap items-center gap-6">
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input type="checkbox" checked={hazardousCargo} onChange={(e) => setHazardousCargo(e.target.checked)} className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
          Hazardous Cargo
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input type="checkbox" checked={insuranceRequired} onChange={(e) => setInsuranceRequired(e.target.checked)} className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
          Insurance Required
        </label>
      </div>

      {showButtons && (
        <div className="flex justify-center space-x-4 mt-6">
          <button type="button" onClick={handleSubmitLogic} className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition">Search Quotes</button>
          <button type="button" onClick={resetAll} className="px-8 py-3 bg-gray-200 text-gray-800 font-bold rounded-xl hover:bg-gray-300 transition">Reset</button>
        </div>
      )}

      {showValidationMessage && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full">
            <p className="text-gray-700 mb-4">{validationMessage}</p>
            <button onClick={() => setShowValidationMessage(false)} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg w-full">Got It</button>
          </div>
        </div>
      )}

      {showSuccessMessage && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full text-center">
            <FaCheckCircle className="text-green-500 text-4xl mx-auto mb-3" />
            <p className="text-gray-700 mb-4">{successMessage}</p>
            <button onClick={() => setShowSuccessMessage(false)} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg w-full">OK</button>
          </div>
        </div>
      )}
    </div>
  );
});

export default AirQuoteForm;
