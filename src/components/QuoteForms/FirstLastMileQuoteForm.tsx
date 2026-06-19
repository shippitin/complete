// src/components/QuoteForms/FirstLastMileQuoteForm.tsx
import React, { useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaCheckCircle } from 'react-icons/fa';
import type { FirstLastMileFormData, QuoteFormHandle, ParsedVoiceCommand, AllFormData } from '../../types/QuoteFormHandle';
import { parseNumber } from '../../utils/parseNumber';
import LocationAutocomplete from '../LocationAutocomplete';

interface FirstLastMileQuoteFormProps {
  prefillData?: ParsedVoiceCommand;
  showButtons?: boolean;
}

const FirstLastMileQuoteForm = forwardRef<QuoteFormHandle, FirstLastMileQuoteFormProps>(({ prefillData, showButtons = true }, ref) => {
  const [serviceType, setServiceType] = useState<'first-mile' | 'last-mile' | ''>('');
  const [pickupLocation, setPickupLocation] = useState('');
  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [pickupDate, setPickupDate] = useState<Date | null>(null);
  const [deliveryDate, setDeliveryDate] = useState<Date | null>(null);
  const [cargoType, setCargoType] = useState('');
  const [totalWeight, setTotalWeight] = useState<number | ''>('');
  const [dimensions, setDimensions] = useState('');
  const [cargoValue, setCargoValue] = useState<number | ''>('');
  const [hazardousCargo, setHazardousCargo] = useState(false);
  const [insuranceRequired, setInsuranceRequired] = useState(false);
  const [vehicleTypeRequired, setVehicleTypeRequired] = useState('');
  const [errors, setErrors] = useState<Partial<Record<keyof FirstLastMileFormData, string>>>({});
  const [showValidationMessage, setShowValidationMessage] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  useEffect(() => {
    if (prefillData) {
      const pd = prefillData as any;
      setServiceType((prefillData.serviceType as any) || '');
      setPickupLocation(pd.pickupLocation || prefillData.origin || '');
      setDeliveryLocation(pd.deliveryLocation || prefillData.destination || '');
      setPickupDate(prefillData.readyDate ? new Date(prefillData.readyDate) : null);
      setCargoType(prefillData.cargoType || '');
      setTotalWeight(parseNumber(prefillData.cargoWeight) ?? '');
      setCargoValue(parseNumber(pd.cargoValue) ?? '');
      setHazardousCargo(prefillData.hazardousCargo || false);
      setInsuranceRequired(prefillData.insuranceRequired || false);
    }
  }, [prefillData]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FirstLastMileFormData, string>> = {};
    if (!serviceType) newErrors.serviceType = 'Required.';
    if (!pickupLocation) newErrors.pickupLocation = 'Required.';
    if (!deliveryLocation) newErrors.deliveryLocation = 'Required.';
    if (!pickupDate) newErrors.pickupDate = 'Required.';
    if (!cargoType) newErrors.cargoType = 'Required.';
    if (!parseNumber(totalWeight) || (parseNumber(totalWeight) as number) <= 0) newErrors.totalWeight = 'Required.';
    if (!parseNumber(cargoValue) || (parseNumber(cargoValue) as number) <= 0) newErrors.cargoValue = 'Required.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitLogic = (): AllFormData | null => {
    if (!validateForm()) { setShowValidationMessage(true); return null; }
    const formData: FirstLastMileFormData = {
      bookingType: 'First/Last Mile',
      serviceType: serviceType as FirstLastMileFormData['serviceType'],
      pickupLocation, deliveryLocation,
      pickupDate: pickupDate ? pickupDate.toISOString().split('T')[0] : '',
      deliveryDate: deliveryDate ? deliveryDate.toISOString().split('T')[0] : undefined,
      cargoType, totalWeight: parseNumber(totalWeight) as number,
      dimensions: dimensions || undefined,
      cargoValue: parseNumber(cargoValue) as number,
      hazardousCargo, insuranceRequired,
      vehicleTypeRequired: vehicleTypeRequired || undefined,
      readyDate: pickupDate ? pickupDate.toISOString().split('T')[0] : '',
      origin: pickupLocation, destination: deliveryLocation,
      date: pickupDate ? pickupDate.toISOString().split('T')[0] : '',
      weight: parseNumber(totalWeight) as any,
      hsCode: undefined, incoterms: undefined, numberOfPieces: undefined,
    vehicleType: (vehicleTypeRequired || 'Van') as FirstLastMileFormData['vehicleType'],
    };
    setShowSuccessMessage(true);
    return formData;
  };

  const resetForm = () => {
    setServiceType(''); setPickupLocation(''); setDeliveryLocation('');
    setPickupDate(null); setDeliveryDate(null); setCargoType('');
    setTotalWeight(''); setDimensions(''); setCargoValue('');
    setHazardousCargo(false); setInsuranceRequired(false); setVehicleTypeRequired('');
    setErrors({}); setShowValidationMessage(false); setShowSuccessMessage(false);
  };

  useImperativeHandle(ref, () => ({ submit: handleSubmitLogic, reset: resetForm }));

  const inputClass = (hasError: boolean) =>
    `block w-full pl-3 pr-3 py-2 sm:text-sm bg-transparent border-0 border-b focus:ring-0 focus:border-blue-500 ${hasError ? 'border-orange-500' : 'border-gray-300'}`;

  return (
    <div className="space-y-4 p-5 bg-white rounded-xl shadow-md border border-gray-200 font-inter">

      {/* Service Type toggle */}
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Service Type<span className="text-red-500">*</span></label>
        <div className="flex gap-2">
          {[{ val: 'first-mile', label: 'First Mile' }, { val: 'last-mile', label: 'Last Mile' }].map(opt => (
            <button key={opt.val} type="button"
              onClick={() => { setServiceType(opt.val as any); setErrors(p => ({ ...p, serviceType: undefined })); }}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${serviceType === opt.val ? 'bg-blue-100 text-blue-800 border border-blue-200' : 'bg-gray-100 text-gray-700 hover:bg-blue-50 border border-gray-300'} ${errors.serviceType ? 'ring-1 ring-orange-500' : ''}`}>
              {opt.label}
            </button>
          ))}
        </div>
        {errors.serviceType && <p className="text-xs text-orange-600">{errors.serviceType}</p>}
      </div>

      {/* Row 1: Pickup, Delivery, Pickup Date, Delivery Date */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-3">
        <div>
          <LocationAutocomplete label="Pickup Location" required value={pickupLocation}
            onChange={(v) => { setPickupLocation(v); setErrors(p => ({ ...p, pickupLocation: undefined })); }}
            placeholder="e.g., Delhi, Mumbai" locationType="city" />
          {errors.pickupLocation && <p className="mt-1 text-xs text-orange-600">{errors.pickupLocation}</p>}
        </div>
        <div>
          <LocationAutocomplete label="Delivery Location" required value={deliveryLocation}
            onChange={(v) => { setDeliveryLocation(v); setErrors(p => ({ ...p, deliveryLocation: undefined })); }}
            placeholder="e.g., Bangalore, Pune" locationType="city" />
          {errors.deliveryLocation && <p className="mt-1 text-xs text-orange-600">{errors.deliveryLocation}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Date<span className="text-red-500">*</span></label>
          <DatePicker selected={pickupDate}
            onChange={(date) => { setPickupDate(date); setErrors(p => ({ ...p, pickupDate: undefined })); }}
            dateFormat="dd-MM-yyyy" placeholderText="DD-MM-YYYY"
            className={inputClass(!!errors.pickupDate)} />
          {errors.pickupDate && <p className="mt-1 text-xs text-orange-600">{errors.pickupDate}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Date (Optional)</label>
          <DatePicker selected={deliveryDate}
            onChange={(date) => { setDeliveryDate(date); }}
            dateFormat="dd-MM-yyyy" placeholderText="DD-MM-YYYY"
            className={inputClass(false)} />
        </div>
      </div>

      {/* Row 2: Cargo Type, Weight, Cargo Value, Vehicle Type + checkboxes */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cargo Type<span className="text-red-500">*</span></label>
          <input type="text" className={inputClass(!!errors.cargoType)} placeholder="e.g., Small packages" value={cargoType}
            onChange={(e) => { setCargoType(e.target.value); setErrors(p => ({ ...p, cargoType: undefined })); }} />
          {errors.cargoType && <p className="mt-1 text-xs text-orange-600">{errors.cargoType}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Total Weight (KG)<span className="text-red-500">*</span></label>
          <input type="number" className={inputClass(!!errors.totalWeight)} placeholder="e.g., 10" value={totalWeight}
            onChange={(e) => { setTotalWeight(e.target.value === '' ? '' : Number(e.target.value)); setErrors(p => ({ ...p, totalWeight: undefined })); }} />
          {errors.totalWeight && <p className="mt-1 text-xs text-orange-600">{errors.totalWeight}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cargo Value (INR)<span className="text-red-500">*</span></label>
          <input type="number" className={inputClass(!!errors.cargoValue)} placeholder="e.g., 5000" value={cargoValue}
            onChange={(e) => { setCargoValue(e.target.value === '' ? '' : Number(e.target.value)); setErrors(p => ({ ...p, cargoValue: undefined })); }} />
          {errors.cargoValue && <p className="mt-1 text-xs text-orange-600">{errors.cargoValue}</p>}
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

export default FirstLastMileQuoteForm;
