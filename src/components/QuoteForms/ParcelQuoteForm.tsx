// src/components/QuoteForms/ParcelQuoteForm.tsx
import React, { useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaCheckCircle } from 'react-icons/fa';
import type { ParcelFormData, QuoteFormHandle, ParsedVoiceCommand, AllFormData } from '../../types/QuoteFormHandle';
import { parseNumber } from '../../utils/parseNumber';
import LocationAutocomplete from '../LocationAutocomplete';

interface ParcelQuoteFormProps {
  prefillData?: ParsedVoiceCommand;
  showButtons?: boolean;
}

const ParcelQuoteForm = forwardRef<QuoteFormHandle, ParcelQuoteFormProps>(({ prefillData, showButtons = true }, ref) => {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [readyDate, setReadyDate] = useState<Date | null>(null);
  const [isDomestic, setIsDomestic] = useState<boolean | ''>('');
  const [parcelCount, setParcelCount] = useState<number | ''>('');
  const [totalWeight, setTotalWeight] = useState<number | ''>('');
  const [cargoType, setCargoType] = useState('');
  const [parcelLength, setParcelLength] = useState<number | ''>('');
  const [parcelWidth, setParcelWidth] = useState<number | ''>('');
  const [parcelHeight, setParcelHeight] = useState<number | ''>('');
  const [volumetricWeight, setVolumetricWeight] = useState<number | ''>('');
  const [cargoValue, setCargoValue] = useState<number | ''>('');
  const [hazardousCargo, setHazardousCargo] = useState(false);
  const [insuranceRequired, setInsuranceRequired] = useState(false);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [errors, setErrors] = useState<Partial<Record<keyof ParcelFormData, string>>>({});
  const [showValidationMessage, setShowValidationMessage] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  useEffect(() => {
    if (prefillData) {
      const pd = prefillData as any;
      if (typeof prefillData.isDomestic === 'boolean') setIsDomestic(prefillData.isDomestic);
      else if (prefillData.isDomestic === 'true') setIsDomestic(true);
      else if (prefillData.isDomestic === 'false') setIsDomestic(false);
      setOrigin(prefillData.origin || pd.originPincode || '');
      setDestination(prefillData.destination || pd.destinationPincode || '');
      setReadyDate(prefillData.readyDate ? new Date(prefillData.readyDate) : null);
      setParcelCount(parseNumber(pd.parcelCount) ?? parseNumber(prefillData.numberOfPieces) ?? '');
      setTotalWeight(parseNumber(prefillData.cargoWeight) ?? parseNumber(pd.totalWeight) ?? '');
      setCargoType(prefillData.cargoType || prefillData.commodity || '');
      setParcelLength(parseNumber(pd.parcelLength) ?? '');
      setParcelWidth(parseNumber(pd.parcelWidth) ?? '');
      setParcelHeight(parseNumber(pd.parcelHeight) ?? '');
      setVolumetricWeight(parseNumber(pd.volumetricWeight) ?? '');
      setCargoValue(parseNumber(pd.cargoValue) ?? '');
      setHazardousCargo(prefillData.hazardousCargo || false);
      setInsuranceRequired(prefillData.insuranceRequired || false);
      setSpecialInstructions(prefillData.specialInstructions || '');
    }
  }, [prefillData]);

  const handleNumericChange = (setter: React.Dispatch<React.SetStateAction<number | ''>>, fieldName: keyof ParcelFormData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (value === '' || /^\d*\.?\d*$/.test(value)) {
        setter(value === '' ? '' : parseFloat(value));
        setErrors(prev => ({ ...prev, [fieldName]: undefined }));
      }
    };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ParcelFormData, string>> = {};
    if (isDomestic === '') newErrors.isDomestic = 'Required.';
    if (!origin) newErrors.origin = 'Required.';
    if (!destination) newErrors.destination = 'Required.';
    if (!readyDate) newErrors.readyDate = 'Required.';
    if (!parseNumber(parcelCount) || (parseNumber(parcelCount) as number) <= 0) newErrors.parcelCount = 'Required.';
    if (!parseNumber(totalWeight) || (parseNumber(totalWeight) as number) <= 0) newErrors.totalWeight = 'Required.';
    if (!cargoType) newErrors.cargoType = 'Required.';
    if (!parseNumber(parcelLength) || (parseNumber(parcelLength) as number) <= 0) newErrors.parcelLength = 'Required.';
    if (!parseNumber(parcelWidth) || (parseNumber(parcelWidth) as number) <= 0) newErrors.parcelWidth = 'Required.';
    if (!parseNumber(parcelHeight) || (parseNumber(parcelHeight) as number) <= 0) newErrors.parcelHeight = 'Required.';
    if (!parseNumber(volumetricWeight) || (parseNumber(volumetricWeight) as number) <= 0) newErrors.volumetricWeight = 'Required.';
    if (!parseNumber(cargoValue) || (parseNumber(cargoValue) as number) <= 0) newErrors.cargoValue = 'Required.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitLogic = (): AllFormData | null => {
    if (!validateForm()) {
      setValidationMessage('Please fill in all required fields correctly.');
      setShowValidationMessage(true);
      return null;
    }
    const fl = parseNumber(parcelLength);
    const fwidth = parseNumber(parcelWidth);
    const fh = parseNumber(parcelHeight);
    const formData: ParcelFormData = {
      bookingType: 'Parcel', origin, destination,
      readyDate: readyDate ? readyDate.toISOString().split('T')[0] : '',
      isDomestic: isDomestic as boolean,
      courierMode: 'NON',
      parcelCount: parseNumber(parcelCount) as number,
      totalWeight: parseNumber(totalWeight) as number,
      cargoType,
      parcelLength: fl as number,
      parcelWidth: fwidth as number,
      parcelHeight: fh as number,
      volumetricWeight: parseNumber(volumetricWeight) as number,
      cargoValue: parseNumber(cargoValue) as number,
      hazardousCargo, insuranceRequired,
      specialInstructions: specialInstructions || undefined,
      dimensions: `${fl}x${fwidth}x${fh}`,
    };
    setShowSuccessMessage(true);
    return formData;
  };

  const resetForm = () => {
    setOrigin(''); setDestination(''); setReadyDate(null); setIsDomestic('');
    setParcelCount(''); setTotalWeight(''); setCargoType(''); setParcelLength('');
    setParcelWidth(''); setParcelHeight(''); setVolumetricWeight(''); setCargoValue('');
    setHazardousCargo(false); setInsuranceRequired(false); setSpecialInstructions('');
    setErrors({}); setShowValidationMessage(false); setShowSuccessMessage(false);
  };

  useImperativeHandle(ref, () => ({ submit: handleSubmitLogic, reset: resetForm }));

  const inputClass = (hasError: boolean) =>
    `block w-full px-3 py-2.5 text-sm bg-white border rounded-lg transition focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 disabled:bg-gray-50 disabled:text-gray-400 ${hasError ? 'border-orange-400 bg-orange-50/40' : 'border-gray-300'}`;

  return (
    <div className="space-y-4 p-5 bg-white rounded-xl shadow-md border border-gray-200 font-inter">

      {/* Row 0: Shipment Type */}
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Shipment Type<span className="text-red-500">*</span></label>
        <div className="flex gap-2">
          {[{ val: true, label: 'Domestic' }, { val: false, label: 'International' }].map(opt => (
            <button key={String(opt.val)} type="button"
              onClick={() => { setIsDomestic(opt.val); setErrors(p => ({ ...p, isDomestic: undefined })); }}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${isDomestic === opt.val ? 'bg-blue-100 text-blue-800 border border-blue-200' : 'bg-gray-100 text-gray-700 hover:bg-blue-50 border border-gray-300'} ${errors.isDomestic ? 'ring-1 ring-orange-500' : ''}`}>
              {opt.label}
            </button>
          ))}
        </div>
        {errors.isDomestic && <p className="text-xs text-orange-600">{errors.isDomestic}</p>}
      </div>

      {/* Row 1: Origin, Destination, Date, Parcel Count */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-3">
        <div>
          <LocationAutocomplete label="Origin" required value={origin}
            onChange={(v) => { setOrigin(v); setErrors(p => ({ ...p, origin: undefined })); }}
            placeholder="e.g., Delhi, Mumbai" locationType="city" />
          {errors.origin && <p className="mt-1 text-xs text-orange-600">{errors.origin}</p>}
        </div>
        <div>
          <LocationAutocomplete label="Destination" required value={destination}
            onChange={(v) => { setDestination(v); setErrors(p => ({ ...p, destination: undefined })); }}
            placeholder="e.g., Bangalore, Pune" locationType="city" />
          {errors.destination && <p className="mt-1 text-xs text-orange-600">{errors.destination}</p>}
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
          <label className="block text-sm font-medium text-gray-700 mb-1">No. of Parcels<span className="text-red-500">*</span></label>
          <input type="text" className={inputClass(!!errors.parcelCount)} placeholder="e.g., 1" value={parcelCount}
            onChange={handleNumericChange(setParcelCount, 'parcelCount')} />
          {errors.parcelCount && <p className="mt-1 text-xs text-orange-600">{errors.parcelCount}</p>}
        </div>
      </div>

      {/* Row 2: Weight, Cargo Type, Vol Weight, Cargo Value */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Total Weight (KG)<span className="text-red-500">*</span></label>
          <input type="text" className={inputClass(!!errors.totalWeight)} placeholder="e.g., 5" value={totalWeight}
            onChange={handleNumericChange(setTotalWeight, 'totalWeight')} />
          {errors.totalWeight && <p className="mt-1 text-xs text-orange-600">{errors.totalWeight}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cargo Type<span className="text-red-500">*</span></label>
          <input type="text" className={inputClass(!!errors.cargoType)} placeholder="e.g., Documents" value={cargoType}
            onChange={(e) => { setCargoType(e.target.value); setErrors(p => ({ ...p, cargoType: undefined })); }} />
          {errors.cargoType && <p className="mt-1 text-xs text-orange-600">{errors.cargoType}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Volumetric Weight (KG)<span className="text-red-500">*</span></label>
          <input type="text" className={inputClass(!!errors.volumetricWeight)} placeholder="e.g., 2.5" value={volumetricWeight}
            onChange={handleNumericChange(setVolumetricWeight, 'volumetricWeight')} />
          {errors.volumetricWeight && <p className="mt-1 text-xs text-orange-600">{errors.volumetricWeight}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cargo Value (INR)<span className="text-red-500">*</span></label>
          <input type="text" className={inputClass(!!errors.cargoValue)} placeholder="e.g., 1000" value={cargoValue}
            onChange={handleNumericChange(setCargoValue, 'cargoValue')} />
          {errors.cargoValue && <p className="mt-1 text-xs text-orange-600">{errors.cargoValue}</p>}
        </div>
      </div>

      {/* Row 3: L x W x H + checkboxes */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Length (CM)<span className="text-red-500">*</span></label>
          <input type="text" className={inputClass(!!errors.parcelLength)} placeholder="e.g., 30" value={parcelLength}
            onChange={handleNumericChange(setParcelLength, 'parcelLength')} />
          {errors.parcelLength && <p className="mt-1 text-xs text-orange-600">{errors.parcelLength}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Width (CM)<span className="text-red-500">*</span></label>
          <input type="text" className={inputClass(!!errors.parcelWidth)} placeholder="e.g., 20" value={parcelWidth}
            onChange={handleNumericChange(setParcelWidth, 'parcelWidth')} />
          {errors.parcelWidth && <p className="mt-1 text-xs text-orange-600">{errors.parcelWidth}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Height (CM)<span className="text-red-500">*</span></label>
          <input type="text" className={inputClass(!!errors.parcelHeight)} placeholder="e.g., 15" value={parcelHeight}
            onChange={handleNumericChange(setParcelHeight, 'parcelHeight')} />
          {errors.parcelHeight && <p className="mt-1 text-xs text-orange-600">{errors.parcelHeight}</p>}
        </div>
        <div className="flex flex-col justify-end gap-2 pb-1">
          <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
            <input type="checkbox" checked={hazardousCargo} onChange={(e) => setHazardousCargo(e.target.checked)}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
            Hazardous Cargo
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
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
            <p className="text-gray-700 mb-4">{validationMessage}</p>
            <button onClick={() => setShowValidationMessage(false)}
              className="bg-brand-gradient text-white font-bold py-2 px-4 rounded-lg w-full">Got It</button>
          </div>
        </div>
      )}

      {showSuccessMessage && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full text-center">
            <FaCheckCircle className="text-green-500 text-4xl mx-auto mb-3" />
            <p className="text-gray-700 mb-4">Quote request submitted successfully.</p>
            <button onClick={() => setShowSuccessMessage(false)}
              className="bg-brand-gradient text-white font-bold py-2 px-4 rounded-lg w-full">OK</button>
          </div>
        </div>
      )}
    </div>
  );
});

export default ParcelQuoteForm;
