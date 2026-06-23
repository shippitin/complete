// src/components/QuoteForms/InsuranceQuoteForm.tsx
import React, { useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaCheckCircle } from 'react-icons/fa';
import type { InsuranceFormData, QuoteFormHandle, AllFormData, ParsedVoiceCommand } from '../../types/QuoteFormHandle';
import { parseNumber } from '../../utils/parseNumber';
import LocationAutocomplete from '../LocationAutocomplete';

interface InsuranceQuoteFormProps {
  prefillData?: ParsedVoiceCommand;
  showButtons?: boolean;
}

const InsuranceQuoteForm = forwardRef<QuoteFormHandle, InsuranceQuoteFormProps>(({ prefillData, showButtons = true }, ref) => {
  const [cargoType, setCargoType] = useState('');
  const [cargoValue, setCargoValue] = useState<number | ''>('');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [modeOfTransport, setModeOfTransport] = useState<'air' | 'sea' | 'road' | 'rail' | ''>('');
  const [policyType, setPolicyType] = useState<'all-risk' | 'fpa' | 'wa' | ''>('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [hazardousCargo, setHazardousCargo] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof InsuranceFormData, string>>>({});
  const [showValidationMessage, setShowValidationMessage] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  useEffect(() => {
    if (prefillData) {
      const pd = prefillData as any;
      setCargoType(prefillData.cargoType || prefillData.commodity || '');
      setCargoValue(parseNumber(pd.cargoValue) ?? '');
      setOrigin(prefillData.origin || '');
      setDestination(prefillData.destination || '');
      setModeOfTransport((pd.modeOfTransport as any) || '');
      setPolicyType((pd.policyType as any) || '');
      setStartDate(prefillData.readyDate ? new Date(prefillData.readyDate) : null);
      setHazardousCargo(prefillData.hazardousCargo || false);
    }
  }, [prefillData]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof InsuranceFormData, string>> = {};
    if (!origin) newErrors.origin = 'Required.';
    if (!destination) newErrors.destination = 'Required.';
    if (!cargoType) newErrors.cargoType = 'Required.';
    if (!parseNumber(cargoValue) || (parseNumber(cargoValue) as number) <= 0) newErrors.cargoValue = 'Required.';
    if (!modeOfTransport) newErrors.modeOfTransport = 'Required.';
    if (!policyType) newErrors.policyType = 'Required.';
    if (!startDate) newErrors.startDate = 'Required.';
    if (!endDate) newErrors.endDate = 'Required.';
    if (startDate && endDate && startDate > endDate) newErrors.endDate = 'End date cannot be before start date.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitLogic = (): AllFormData | null => {
    if (!validateForm()) { setShowValidationMessage(true); return null; }
    const finalCargoValue = parseNumber(cargoValue) as number;
    const formData: InsuranceFormData = {
      bookingType: 'Insurance', cargoType, cargoValue: finalCargoValue,
      origin, destination,
      modeOfTransport: modeOfTransport as InsuranceFormData['modeOfTransport'],
      policyType: policyType as InsuranceFormData['policyType'],
      startDate: startDate ? startDate.toISOString().split('T')[0] : '',
      endDate: endDate ? endDate.toISOString().split('T')[0] : '',
      hazardousCargo, insuranceRequired: true,
      readyDate: startDate ? startDate.toISOString().split('T')[0] : '',
      totalWeight: 0, dimensions: undefined,
      detailedDescriptionOfGoods: undefined, hsCode: undefined, incoterms: undefined,
      numberOfPieces: undefined, coverageType: '',
      insuranceValue: finalCargoValue, weight: 0 as any,
      date: startDate ? startDate.toISOString().split('T')[0] : '',
    };
    setShowSuccessMessage(true);
    return formData;
  };

  const resetForm = () => {
    setCargoType(''); setCargoValue(''); setOrigin(''); setDestination('');
    setModeOfTransport(''); setPolicyType(''); setStartDate(null); setEndDate(null);
    setHazardousCargo(false); setErrors({});
    setShowValidationMessage(false); setShowSuccessMessage(false);
  };

  useImperativeHandle(ref, () => ({ submit: handleSubmitLogic, reset: resetForm }));

  const inputClass = (hasError: boolean) =>
    `block w-full px-3 py-2.5 text-sm bg-white border rounded-lg transition focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 disabled:bg-gray-50 disabled:text-gray-400 ${hasError ? 'border-orange-400 bg-orange-50/40' : 'border-gray-300'}`;

  return (
    <div className="space-y-4 p-5 bg-white rounded-xl shadow-md border border-gray-200 font-inter">

      {/* Row 1: Origin, Destination, Start Date, End Date */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-3">
        <div>
          <LocationAutocomplete label="Origin" required value={origin}
            onChange={(v) => { setOrigin(v); setErrors(p => ({ ...p, origin: undefined })); }}
            placeholder="e.g., Mumbai, Chennai" />
          {errors.origin && <p className="mt-1 text-xs text-orange-600">{errors.origin}</p>}
        </div>
        <div>
          <LocationAutocomplete label="Destination" required value={destination}
            onChange={(v) => { setDestination(v); setErrors(p => ({ ...p, destination: undefined })); }}
            placeholder="e.g., Singapore, Dubai" />
          {errors.destination && <p className="mt-1 text-xs text-orange-600">{errors.destination}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Start Date<span className="text-red-500">*</span></label>
          <DatePicker selected={startDate}
            onChange={(date) => { setStartDate(date); setErrors(p => ({ ...p, startDate: undefined })); }}
            dateFormat="dd-MM-yyyy" placeholderText="DD-MM-YYYY"
            wrapperClassName="w-full" className={inputClass(!!errors.startDate)} />
          {errors.startDate && <p className="mt-1 text-xs text-orange-600">{errors.startDate}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">End Date<span className="text-red-500">*</span></label>
          <DatePicker selected={endDate}
            onChange={(date) => { setEndDate(date); setErrors(p => ({ ...p, endDate: undefined })); }}
            dateFormat="dd-MM-yyyy" placeholderText="DD-MM-YYYY"
            wrapperClassName="w-full" className={inputClass(!!errors.endDate)} />
          {errors.endDate && <p className="mt-1 text-xs text-orange-600">{errors.endDate}</p>}
        </div>
      </div>

      {/* Row 2: Cargo Type, Cargo Value, Mode, Policy Type + Hazardous */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cargo Type<span className="text-red-500">*</span></label>
          <input type="text" className={inputClass(!!errors.cargoType)} placeholder="e.g., Electronics" value={cargoType}
            onChange={(e) => { setCargoType(e.target.value); setErrors(p => ({ ...p, cargoType: undefined })); }} />
          {errors.cargoType && <p className="mt-1 text-xs text-orange-600">{errors.cargoType}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cargo Value (INR)<span className="text-red-500">*</span></label>
          <input type="number" className={inputClass(!!errors.cargoValue)} placeholder="e.g., 500000" value={cargoValue}
            onChange={(e) => { setCargoValue(e.target.value === '' ? '' : parseFloat(e.target.value)); setErrors(p => ({ ...p, cargoValue: undefined })); }} />
          {errors.cargoValue && <p className="mt-1 text-xs text-orange-600">{errors.cargoValue}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mode of Transport<span className="text-red-500">*</span></label>
          <select className={inputClass(!!errors.modeOfTransport)} value={modeOfTransport}
            onChange={(e) => { setModeOfTransport(e.target.value as any); setErrors(p => ({ ...p, modeOfTransport: undefined })); }}>
            <option value="">Select Mode</option>
            <option value="air">Air</option>
            <option value="sea">Sea</option>
            <option value="road">Road</option>
            <option value="rail">Rail</option>
          </select>
          {errors.modeOfTransport && <p className="mt-1 text-xs text-orange-600">{errors.modeOfTransport}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Policy Type<span className="text-red-500">*</span></label>
          <select className={inputClass(!!errors.policyType)} value={policyType}
            onChange={(e) => { setPolicyType(e.target.value as any); setErrors(p => ({ ...p, policyType: undefined })); }}>
            <option value="">Select Policy</option>
            <option value="all-risk">All Risk</option>
            <option value="fpa">FPA</option>
            <option value="wa">WA (With Average)</option>
          </select>
          {errors.policyType && <p className="mt-1 text-xs text-orange-600">{errors.policyType}</p>}
        </div>
      </div>

      {/* Hazardous checkbox */}
      <div className="flex items-center gap-2">
        <input type="checkbox" checked={hazardousCargo} onChange={(e) => setHazardousCargo(e.target.checked)}
          className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
        <label className="text-sm text-gray-700">Hazardous Cargo</label>
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

export default InsuranceQuoteForm;
