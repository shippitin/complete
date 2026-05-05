// src/components/QuoteForms/CustomsQuoteForm.tsx
import React, { useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import { FaCheckCircle } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import type { CustomsFormData, QuoteFormHandle, ParsedVoiceCommand, AllFormData } from '../../types/QuoteFormHandle';
import LocationAutocomplete from '../LocationAutocomplete';

interface CustomsQuoteFormProps {
  prefillData?: ParsedVoiceCommand;
  showButtons?: boolean;
}

const CustomsQuoteForm = forwardRef<QuoteFormHandle, CustomsQuoteFormProps>(({ prefillData, showButtons = true }, ref) => {
  const [serviceType, setServiceType] = useState<'import' | 'export' | 'transit' | ''>('');
  const [cargoType, setCargoType] = useState('');
  const [cargoValue, setCargoValue] = useState<number | ''>('');
  const [hsCode, setHsCode] = useState('');
  const [countryOfOrigin, setCountryOfOrigin] = useState('');
  const [destinationPortICD, setDestinationPortICD] = useState('');
  const [readyDate, setReadyDate] = useState<Date | null>(null);
  const [incoterms, setIncoterms] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [errors, setErrors] = useState<Partial<Record<keyof CustomsFormData, string>>>({});
  const [showValidationMessage, setShowValidationMessage] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  useEffect(() => {
    if (prefillData) {
      const pd = prefillData as any;
      setServiceType((prefillData.serviceType as 'import' | 'export' | 'transit') || '');
      setCargoType(prefillData.cargoType || prefillData.commodity || '');
      setCargoValue(pd.cargoValue ? Number(pd.cargoValue) : '');
      setHsCode(pd.hsnCode || '');
      setCountryOfOrigin(pd.country || '');
      setDestinationPortICD(pd.destinationPort || pd.destinationCity || prefillData.destination || '');
      setReadyDate(prefillData.readyDate ? new Date(prefillData.readyDate) : null);
      setIncoterms(pd.incoterms || '');
      setSpecialInstructions(pd.specialInstructions || '');
    }
  }, [prefillData]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CustomsFormData, string>> = {};
    if (!serviceType) newErrors.serviceType = 'Required.';
    if (!cargoType) newErrors.cargoType = 'Required.';
    if (cargoValue === '' || Number(cargoValue) <= 0) newErrors.cargoValue = 'Required.';
    if (!hsCode) newErrors.hsCode = 'Required.';
    if (!countryOfOrigin) newErrors.countryOfOrigin = 'Required.';
    if (!destinationPortICD) newErrors.destinationPortICD = 'Required.';
    if (!readyDate) newErrors.readyDate = 'Required.';
    if (!incoterms) newErrors.incoterms = 'Required.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitLogic = (): AllFormData | null => {
    if (!validateForm()) { setShowValidationMessage(true); return null; }
    const formData: CustomsFormData = {
      bookingType: 'Customs', serviceType: serviceType as 'import' | 'export' | 'transit',
      cargoType, cargoValue: Number(cargoValue), hsCode, countryOfOrigin, destinationPortICD,
      readyDate: readyDate ? readyDate.toISOString().split('T')[0] : '',
      incoterms, specialInstructions, hazardousCargo: false, insuranceRequired: false,
      totalWeight: 0, documentType: '', country: undefined,
    };
    setShowSuccessMessage(true);
    return formData;
  };

  const resetForm = () => {
    setServiceType(''); setCargoType(''); setCargoValue(''); setHsCode('');
    setCountryOfOrigin(''); setDestinationPortICD(''); setReadyDate(null);
    setIncoterms(''); setSpecialInstructions(''); setErrors({});
    setShowValidationMessage(false); setShowSuccessMessage(false);
  };

  useImperativeHandle(ref, () => ({ submit: handleSubmitLogic, reset: resetForm }));

  const inputClass = (hasError: boolean) =>
    `block w-full pl-3 pr-3 py-2 sm:text-sm bg-transparent border-0 border-b focus:ring-0 focus:border-blue-500 ${hasError ? 'border-orange-500' : 'border-gray-300'}`;

  return (
    <div className="space-y-4 p-5 bg-white rounded-xl shadow-md border border-gray-200 font-inter">

      {/* Row 1: Country of Origin, Destination Port/ICD, Date, Service Type */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Country of Origin<span className="text-red-500">*</span></label>
          <input type="text" className={inputClass(!!errors.countryOfOrigin)} placeholder="e.g., China, USA" value={countryOfOrigin}
            onChange={(e) => { setCountryOfOrigin(e.target.value); setErrors(p => ({ ...p, countryOfOrigin: undefined })); }} />
          {errors.countryOfOrigin && <p className="mt-1 text-xs text-orange-600">{errors.countryOfOrigin}</p>}
        </div>
        <div>
          <LocationAutocomplete label="Destination Port/ICD" required value={destinationPortICD}
            onChange={(v) => { setDestinationPortICD(v); setErrors(p => ({ ...p, destinationPortICD: undefined })); }}
            placeholder="e.g., ICD Tughlakabad, JNPT" />
          {errors.destinationPortICD && <p className="mt-1 text-xs text-orange-600">{errors.destinationPortICD}</p>}
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Service Type<span className="text-red-500">*</span></label>
          <select className={inputClass(!!errors.serviceType)} value={serviceType}
            onChange={(e) => { setServiceType(e.target.value as any); setErrors(p => ({ ...p, serviceType: undefined })); }}>
            <option value="">Select Type</option>
            <option value="import">Import</option>
            <option value="export">Export</option>
            <option value="transit">Transit</option>
          </select>
          {errors.serviceType && <p className="mt-1 text-xs text-orange-600">{errors.serviceType}</p>}
        </div>
      </div>

      {/* Row 2: Cargo Type, Cargo Value, HS Code, Incoterms */}
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
          <label className="block text-sm font-medium text-gray-700 mb-1">HS Code<span className="text-red-500">*</span></label>
          <input type="text" className={inputClass(!!errors.hsCode)} placeholder="e.g., 8471.30.00" value={hsCode}
            onChange={(e) => { setHsCode(e.target.value); setErrors(p => ({ ...p, hsCode: undefined })); }} />
          {errors.hsCode && <p className="mt-1 text-xs text-orange-600">{errors.hsCode}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Incoterms<span className="text-red-500">*</span></label>
          <select className={inputClass(!!errors.incoterms)} value={incoterms}
            onChange={(e) => { setIncoterms(e.target.value); setErrors(p => ({ ...p, incoterms: undefined })); }}>
            <option value="">Select Incoterm</option>
            <option value="EXW">EXW</option>
            <option value="FOB">FOB</option>
            <option value="CIF">CIF</option>
            <option value="DDP">DDP</option>
            <option value="Other">Other</option>
          </select>
          {errors.incoterms && <p className="mt-1 text-xs text-orange-600">{errors.incoterms}</p>}
        </div>
      </div>

      {/* Row 3: Special Instructions */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Special Instructions (Optional)</label>
        <input type="text" className={inputClass(false)} placeholder="e.g., Fragile, temperature controlled..."
          value={specialInstructions} onChange={(e) => setSpecialInstructions(e.target.value)} />
      </div>

      {showButtons && (
        <div className="flex justify-center mt-4">
          <button type="button" onClick={handleSubmitLogic}
            className="px-10 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition">
            Get Quote
          </button>
        </div>
      )}

      {showValidationMessage && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full">
            <p className="text-gray-700 mb-4">Please fill in all required fields correctly.</p>
            <button onClick={() => setShowValidationMessage(false)}
              className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg w-full">Got It</button>
          </div>
        </div>
      )}

      {showSuccessMessage && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full text-center">
            <FaCheckCircle className="text-green-500 text-4xl mx-auto mb-3" />
            <p className="text-gray-700 mb-4">Quote request submitted successfully.</p>
            <button onClick={() => setShowSuccessMessage(false)}
              className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg w-full">OK</button>
          </div>
        </div>
      )}
    </div>
  );
});

export default CustomsQuoteForm;
