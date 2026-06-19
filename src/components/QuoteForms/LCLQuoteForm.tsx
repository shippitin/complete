// src/components/QuoteForms/LCLQuoteForm.tsx
import React, { useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaCheckCircle } from 'react-icons/fa';
import type { LCLFormData, QuoteFormHandle, AllFormData, ParsedVoiceCommand } from '../../types/QuoteFormHandle';
import { parseNumber } from '../../utils/parseNumber';
import LocationAutocomplete from '../LocationAutocomplete';

interface LCLQuoteFormProps {
  prefillData?: ParsedVoiceCommand;
  showButtons?: boolean;
}

const LCLQuoteForm = forwardRef<QuoteFormHandle, LCLQuoteFormProps>(({ prefillData, showButtons = true }, ref) => {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [readyDate, setReadyDate] = useState<Date | null>(null);
  const [cargoType, setCargoType] = useState('');
  const [totalWeight, setTotalWeight] = useState<number | ''>('');
  const [totalVolume, setTotalVolume] = useState<number | ''>('');
  const [numberOfPackages, setNumberOfPackages] = useState<number | ''>('');
  const [dimensions, setDimensions] = useState('');
  const [cargoValue, setCargoValue] = useState<number | ''>('');
  const [hazardousCargo, setHazardousCargo] = useState(false);
  const [insuranceRequired, setInsuranceRequired] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof LCLFormData, string>>>({});
  const [showValidationMessage, setShowValidationMessage] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  useEffect(() => {
    if (prefillData) {
      const pd = prefillData as any;
      setOrigin(prefillData.origin || '');
      setDestination(prefillData.destination || '');
      setReadyDate(prefillData.readyDate ? new Date(prefillData.readyDate) : null);
      setCargoType(prefillData.cargoType || '');
      setTotalWeight(parseNumber(prefillData.cargoWeight) ?? '');
      setTotalVolume(parseNumber(pd.volumeCBM) ?? '');
      setNumberOfPackages(parseNumber(prefillData.numberOfPieces) ?? '');
      setCargoValue(parseNumber(pd.cargoValue) ?? '');
      setHazardousCargo(prefillData.hazardousCargo || false);
      setInsuranceRequired(prefillData.insuranceRequired || false);
    }
  }, [prefillData]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof LCLFormData, string>> = {};
    if (!origin) newErrors.origin = 'Required.';
    if (!destination) newErrors.destination = 'Required.';
    if (!readyDate) newErrors.readyDate = 'Required.';
    if (!cargoType) newErrors.cargoType = 'Required.';
    if (!parseNumber(totalWeight) || (parseNumber(totalWeight) as number) <= 0) newErrors.totalWeight = 'Required.';
    if (!parseNumber(totalVolume) || (parseNumber(totalVolume) as number) <= 0) newErrors.totalVolume = 'Required.';
    if (!parseNumber(numberOfPackages) || (parseNumber(numberOfPackages) as number) <= 0) newErrors.numberOfPackages = 'Required.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitLogic = (): AllFormData | null => {
    if (!validateForm()) { setShowValidationMessage(true); return null; }
    const formData: LCLFormData = {
      bookingType: 'LCL', origin, destination,
      readyDate: readyDate ? readyDate.toISOString().split('T')[0] : '',
      cargoType, totalWeight: parseNumber(totalWeight) as number,
      totalVolume: parseNumber(totalVolume) as number,
      numberOfPackages: parseNumber(numberOfPackages) as number,
      dimensions: dimensions || undefined,
      cargoValue: parseNumber(cargoValue) ?? 0,
      hazardousCargo, insuranceRequired,
      weight: parseNumber(totalWeight) as any,
      date: readyDate ? readyDate.toISOString().split('T')[0] : '',
    };
    setShowSuccessMessage(true);
    return formData;
  };

  const resetForm = () => {
    setOrigin(''); setDestination(''); setReadyDate(null); setCargoType('');
    setTotalWeight(''); setTotalVolume(''); setNumberOfPackages(''); setDimensions('');
    setCargoValue(''); setHazardousCargo(false); setInsuranceRequired(false);
    setErrors({}); setShowValidationMessage(false); setShowSuccessMessage(false);
  };

  useImperativeHandle(ref, () => ({ submit: handleSubmitLogic, reset: resetForm }));

  const inputClass = (hasError: boolean) =>
    `block w-full pl-3 pr-3 py-2 sm:text-sm bg-transparent border-0 border-b focus:ring-0 focus:border-blue-500 ${hasError ? 'border-orange-500' : 'border-gray-300'}`;

  return (
    <div className="space-y-4 p-5 bg-white rounded-xl shadow-md border border-gray-200 font-inter">

      {/* Row 1: Origin, Destination, Date, Cargo Type */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-3">
        <div>
          <LocationAutocomplete label="Origin City/Port" required value={origin}
            onChange={(v) => { setOrigin(v); setErrors(p => ({ ...p, origin: undefined })); }}
            placeholder="e.g., Chennai Port, Shanghai" locationType="seaport" />
          {errors.origin && <p className="mt-1 text-xs text-orange-600">{errors.origin}</p>}
        </div>
        <div>
          <LocationAutocomplete label="Destination City/Port" required value={destination}
            onChange={(v) => { setDestination(v); setErrors(p => ({ ...p, destination: undefined })); }}
            placeholder="e.g., JNPT, Hamburg" locationType="seaport" />
          {errors.destination && <p className="mt-1 text-xs text-orange-600">{errors.destination}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ready Date<span className="text-red-500">*</span></label>
          <DatePicker selected={readyDate}
            onChange={(date) => { setReadyDate(date); setErrors(p => ({ ...p, readyDate: undefined })); }}
            dateFormat="dd-MM-yyyy" placeholderText="DD-MM-YYYY"
            className={inputClass(!!errors.readyDate)} />
          {errors.readyDate && <p className="mt-1 text-xs text-orange-600">{errors.readyDate}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cargo Type<span className="text-red-500">*</span></label>
          <input type="text" className={inputClass(!!errors.cargoType)} placeholder="e.g., Consumer Goods" value={cargoType}
            onChange={(e) => { setCargoType(e.target.value); setErrors(p => ({ ...p, cargoType: undefined })); }} />
          {errors.cargoType && <p className="mt-1 text-xs text-orange-600">{errors.cargoType}</p>}
        </div>
      </div>

      {/* Row 2: Weight, Volume, Packages, Dimensions + checkboxes */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Total Weight (KG)<span className="text-red-500">*</span></label>
          <input type="number" className={inputClass(!!errors.totalWeight)} placeholder="e.g., 500" value={totalWeight}
            onChange={(e) => { setTotalWeight(e.target.value === '' ? '' : Number(e.target.value)); setErrors(p => ({ ...p, totalWeight: undefined })); }} />
          {errors.totalWeight && <p className="mt-1 text-xs text-orange-600">{errors.totalWeight}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Total Volume (CBM)<span className="text-red-500">*</span></label>
          <input type="number" className={inputClass(!!errors.totalVolume)} placeholder="e.g., 2.5" value={totalVolume}
            onChange={(e) => { setTotalVolume(e.target.value === '' ? '' : Number(e.target.value)); setErrors(p => ({ ...p, totalVolume: undefined })); }} />
          {errors.totalVolume && <p className="mt-1 text-xs text-orange-600">{errors.totalVolume}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">No. of Packages<span className="text-red-500">*</span></label>
          <input type="number" className={inputClass(!!errors.numberOfPackages)} placeholder="e.g., 10" value={numberOfPackages}
            onChange={(e) => { setNumberOfPackages(e.target.value === '' ? '' : Number(e.target.value)); setErrors(p => ({ ...p, numberOfPackages: undefined })); }} />
          {errors.numberOfPackages && <p className="mt-1 text-xs text-orange-600">{errors.numberOfPackages}</p>}
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

export default LCLQuoteForm;
