// src/components/QuoteForms/DoorToDoorQuoteForm.tsx
import React, { useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaCheckCircle } from 'react-icons/fa';
import { parseNumber } from '../../utils/parseNumber';
import type { DoorToDoorFormData, QuoteFormHandle, ParsedVoiceCommand, AllFormData } from '../../types/QuoteFormHandle';
import LocationAutocomplete from '../LocationAutocomplete';

const allCommodities = [
  { label: 'FAK (Freight of All Kinds)', value: 'FAK (Freight of All Kinds)' },
  { label: 'Batteries', value: 'Batteries' },
  { label: 'Chemicals', value: 'Chemicals' },
  { label: 'Electronic Goods', value: 'Electronic Goods' },
  { label: 'Fabrics', value: 'Fabrics' },
  { label: 'Fruits & Vegetables', value: 'Fruits & Vegetables' },
  { label: 'Garments', value: 'Garments' },
  { label: 'Handicrafts', value: 'Handicrafts' },
  { label: 'Leather Goods', value: 'Leather Goods' },
  { label: 'Machinery', value: 'Machinery' },
  { label: 'Meat & Seafood', value: 'Meat & Seafood' },
  { label: 'Miscellaneous', value: 'Miscellaneous' },
  { label: 'Pharmaceuticals', value: 'Pharmaceuticals' },
  { label: 'Spare Parts', value: 'Spare Parts' },
  { label: 'Vehicles', value: 'Vehicles' },
  { label: 'Other', value: 'Other' },
];

interface DoorToDoorQuoteFormProps {
  prefillData?: ParsedVoiceCommand;
  showButtons?: boolean;
}

const DoorToDoorQuoteForm = forwardRef<QuoteFormHandle, DoorToDoorQuoteFormProps>(({ prefillData, showButtons = true }, ref) => {
  const navigate = useNavigate();
  const [originAddress, setOriginAddress] = useState('');
  const [destinationAddress, setDestinationAddress] = useState('');
  const [readyDate, setReadyDate] = useState<Date | null>(new Date());
  const [cargoType, setCargoType] = useState('FAK (Freight of All Kinds)');
  const [totalWeight, setTotalWeight] = useState<number | ''>('');
  const [dimensions, setDimensions] = useState('');
  const [cargoValue, setCargoValue] = useState<number | ''>('');
  const [hazardousCargo, setHazardousCargo] = useState<boolean | ''>('');
  const [insuranceRequired, setInsuranceRequired] = useState(false);
  const [hsCode, setHsCode] = useState('');
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [showValidationMessage, setShowValidationMessage] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  useEffect(() => {
    if (prefillData) {
      const pd = prefillData as any;
      setOriginAddress(pd.originAddress || prefillData.origin || '');
      setDestinationAddress(pd.destinationAddress || prefillData.destination || '');
      setReadyDate(prefillData.readyDate ? new Date(prefillData.readyDate) : new Date());
      setCargoType(prefillData.cargoType || 'FAK (Freight of All Kinds)');
      setTotalWeight(parseNumber(prefillData.cargoWeight) ?? '');
      setCargoValue(parseNumber(pd.cargoValue) ?? '');
      setHazardousCargo(prefillData.hazardousCargo ?? '');
      setInsuranceRequired(prefillData.insuranceRequired ?? false);
      setHsCode(pd.hsnCode || '');
    }
  }, [prefillData]);

  const resetForm = () => {
    setOriginAddress(''); setDestinationAddress(''); setReadyDate(new Date());
    setCargoType('FAK (Freight of All Kinds)'); setTotalWeight(''); setDimensions('');
    setCargoValue(''); setHazardousCargo(''); setInsuranceRequired(false); setHsCode('');
    setErrors({}); setShowValidationMessage(false); setShowSuccessMessage(false);
  };

  const handleSubmitLogic = (): AllFormData | null => {
    const newErrors: Partial<Record<string, string>> = {};
    if (!originAddress) newErrors.originAddress = 'Required.';
    if (!destinationAddress) newErrors.destinationAddress = 'Required.';
    if (!readyDate) newErrors.readyDate = 'Required.';
    if (!cargoType) newErrors.cargoType = 'Required.';
    const parsedWeight = parseNumber(totalWeight);
    if (!parsedWeight || parsedWeight <= 0) newErrors.totalWeight = 'Required.';
    if (!dimensions) newErrors.dimensions = 'Required.';
    const parsedCargoValue = parseNumber(cargoValue);
    if (!parsedCargoValue || parsedCargoValue <= 0) newErrors.cargoValue = 'Required.';
    if (hazardousCargo === '') newErrors.hazardousCargo = 'Required.';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) { setShowValidationMessage(true); return null; }

    const formData: DoorToDoorFormData = {
      bookingType: 'Door to Door', originAddress, destinationAddress,
      origin: originAddress, destination: destinationAddress,
      weight: parsedWeight as any, isDomestic: true,
      readyDate: readyDate ? readyDate.toISOString().split('T')[0] : '',
      cargoType, totalWeight: parsedWeight as number, dimensions,
      cargoValue: parsedCargoValue as number, hazardousCargo: hazardousCargo === true,
      insuranceRequired, hsCode: hsCode || undefined,
    };

    if (showButtons) navigate('/door-to-door-results', { state: { formData } });
    setShowSuccessMessage(true);
    return formData;
  };

  useImperativeHandle(ref, () => ({ submit: handleSubmitLogic, reset: resetForm }));

  const inputClass = (hasError: boolean) =>
    `block w-full px-3 py-2.5 text-sm bg-white border rounded-lg transition focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 disabled:bg-gray-50 disabled:text-gray-400 ${hasError ? 'border-orange-400 bg-orange-50/40' : 'border-gray-300'}`;

  return (
    <div className="space-y-4 p-5 bg-white rounded-xl shadow-md border border-gray-200 font-inter">

      {/* Row 1: Origin, Destination, Date, Cargo Type */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-3">
        <div>
          <LocationAutocomplete label="Origin Address" required value={originAddress}
            onChange={(v) => { setOriginAddress(v); setErrors(p => ({ ...p, originAddress: undefined })); }}
            placeholder="e.g., Chennai, Mumbai" locationType="city" />
          {errors.originAddress && <p className="mt-1 text-xs text-orange-600">{errors.originAddress}</p>}
        </div>
        <div>
          <LocationAutocomplete label="Destination Address" required value={destinationAddress}
            onChange={(v) => { setDestinationAddress(v); setErrors(p => ({ ...p, destinationAddress: undefined })); }}
            placeholder="e.g., Bangalore, Delhi" locationType="city" />
          {errors.destinationAddress && <p className="mt-1 text-xs text-orange-600">{errors.destinationAddress}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ready Date<span className="text-red-500">*</span></label>
          <DatePicker selected={readyDate}
            onChange={(date) => { setReadyDate(date); setErrors(p => ({ ...p, readyDate: undefined })); }}
            dateFormat="dd-MM-yyyy" placeholderText="DD-MM-YYYY"
            wrapperClassName="w-full" className={inputClass(!!errors.readyDate)} />
          {errors.readyDate && <p className="mt-1 text-xs text-orange-600">{errors.readyDate}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cargo Type<span className="text-red-500">*</span></label>
          <select className={inputClass(!!errors.cargoType)} value={cargoType}
            onChange={(e) => { setCargoType(e.target.value); setErrors(p => ({ ...p, cargoType: undefined })); }}>
            {allCommodities.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
          {errors.cargoType && <p className="mt-1 text-xs text-orange-600">{errors.cargoType}</p>}
        </div>
      </div>

      {/* Row 2: Weight, Dimensions, Cargo Value, HS Code */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Total Weight (KG)<span className="text-red-500">*</span></label>
          <input type="number" className={inputClass(!!errors.totalWeight)} placeholder="e.g., 500" value={totalWeight}
            onChange={(e) => { setTotalWeight(e.target.value === '' ? '' : Number(e.target.value)); setErrors(p => ({ ...p, totalWeight: undefined })); }} />
          {errors.totalWeight && <p className="mt-1 text-xs text-orange-600">{errors.totalWeight}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Dimensions (LxWxH cm)<span className="text-red-500">*</span></label>
          <input type="text" className={inputClass(!!errors.dimensions)} placeholder="e.g., 100x50x50" value={dimensions}
            onChange={(e) => { setDimensions(e.target.value); setErrors(p => ({ ...p, dimensions: undefined })); }} />
          {errors.dimensions && <p className="mt-1 text-xs text-orange-600">{errors.dimensions}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cargo Value (INR)<span className="text-red-500">*</span></label>
          <input type="number" className={inputClass(!!errors.cargoValue)} placeholder="e.g., 10000" value={cargoValue}
            onChange={(e) => { setCargoValue(e.target.value === '' ? '' : Number(e.target.value)); setErrors(p => ({ ...p, cargoValue: undefined })); }} />
          {errors.cargoValue && <p className="mt-1 text-xs text-orange-600">{errors.cargoValue}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">HS Code (Optional)</label>
          <input type="text" className={inputClass(false)} placeholder="e.g., 8517.62.00" value={hsCode}
            onChange={(e) => setHsCode(e.target.value)} />
        </div>
      </div>

      {/* Row 3: Hazardous + Insurance */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Hazardous Cargo<span className="text-red-500">*</span></label>
          <div className={`flex items-center gap-4 ${errors.hazardousCargo ? 'border border-orange-500 rounded p-1' : ''}`}>
            {[{ val: true, label: 'Yes' }, { val: false, label: 'No' }].map(opt => (
              <label key={String(opt.val)} className="flex items-center gap-1.5 text-sm text-gray-700 cursor-pointer">
                <input type="radio" checked={hazardousCargo === opt.val}
                  onChange={() => { setHazardousCargo(opt.val); setErrors(p => ({ ...p, hazardousCargo: undefined })); }}
                  className="h-4 w-4 text-blue-600" />
                {opt.label}
              </label>
            ))}
          </div>
          {errors.hazardousCargo && <p className="mt-1 text-xs text-orange-600">{errors.hazardousCargo}</p>}
        </div>
        <div className="flex items-end pb-1">
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input type="checkbox" checked={insuranceRequired} onChange={(e) => setInsuranceRequired(e.target.checked)}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
            Insurance Required
          </label>
        </div>
      </div>

      {showButtons && (
        <div className="flex justify-center mt-4">
          <button type="button" onClick={handleSubmitLogic}
            className="px-10 py-3 bg-brand-gradient text-white font-bold rounded-xl shadow-lg hover:opacity-90 transition">
            Get Quote
          </button>
        </div>
      )}

      {showValidationMessage && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full">
            <p className="text-gray-700 mb-4">Please fill in all required fields correctly.</p>
            <button onClick={() => setShowValidationMessage(false)} className="bg-brand-gradient text-white font-bold py-2 px-4 rounded-lg w-full">Got It</button>
          </div>
        </div>
      )}
      {showSuccessMessage && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full text-center">
            <FaCheckCircle className="text-green-500 text-4xl mx-auto mb-3" />
            <p className="text-gray-700 mb-4">Quote request submitted successfully.</p>
            <button onClick={() => setShowSuccessMessage(false)} className="bg-brand-gradient text-white font-bold py-2 px-4 rounded-lg w-full">OK</button>
          </div>
        </div>
      )}
    </div>
  );
});

export default DoorToDoorQuoteForm;
