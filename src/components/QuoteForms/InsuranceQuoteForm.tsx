// src/components/QuoteForms/InsuranceQuoteForm.tsx
import React, { useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaBox, FaDollarSign, FaMapMarkerAlt, FaCalendarAlt, FaTruck, FaShip, FaPlane, FaTrain, FaInfoCircle, FaTimesCircle, FaCheckCircle } from 'react-icons/fa'; // Added FaTimesCircle, FaCheckCircle
import type { InsuranceFormData, QuoteFormHandle, AllFormData } from '../../types/QuoteFormHandle'; // Added AllFormData
import type { ParsedVoiceCommand } from '../../types/QuoteFormHandle'; // Corrected import path for ParsedVoiceCommand
import { parseNumber } from '../../utils/parseNumber';

interface InsuranceQuoteFormProps {
  prefillData?: ParsedVoiceCommand;
  showButtons?: boolean; // Added showButtons prop for HeroSection.tsx
}

const InsuranceQuoteForm = forwardRef<QuoteFormHandle, InsuranceQuoteFormProps>(({ prefillData, showButtons = true }, ref) => {
  const [cargoType, setCargoType] = useState('');
  const [cargoValue, setCargoValue] = useState<number | ''>('');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [modeOfTransport, setModeOfTransport] = useState<'air' | 'sea' | 'road' | 'rail' | ''>('');
  const [policyType, setPolicyType] = useState<'all-risk' | 'fpa' | 'wa' | ''>(''); // All-risk, FPA, WA
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [specialInstructions, setSpecialInstructions] = useState(''); // Renamed from specialConditions for consistency
  const [hazardousCargo, setHazardousCargo] = useState(false); // Added for consistency with BaseFormData
  const [insuranceRequired, setInsuranceRequired] = useState(false); // Added for consistency with BaseFormData

  // State for validation errors
  const [errors, setErrors] = useState<Partial<Record<keyof InsuranceFormData, string>>>({});
  // State for custom validation message box
  const [showValidationMessage, setShowValidationMessage] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');
  // State for success message
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (prefillData) {
      setCargoType(prefillData.cargoType || prefillData.commodity || '');
      setCargoValue(parseNumber(prefillData.cargoValue) ?? parseNumber(prefillData.productDeclaredValue) ?? '');
      setOrigin(prefillData.origin || '');
      setDestination(prefillData.destination || '');
      setModeOfTransport((prefillData.modeOfTransport as 'air' | 'sea' | 'road' | 'rail' || '') || '');
      setPolicyType((prefillData.policyType as 'all-risk' | 'fpa' | 'wa' || '') || '');
      setStartDate(prefillData.startDate ? new Date(prefillData.startDate) : (prefillData.readyDate ? new Date(prefillData.readyDate) : (prefillData.date ? new Date(prefillData.date) : null)));
      setEndDate(prefillData.endDate ? new Date(prefillData.endDate) : null);
      setSpecialInstructions(prefillData.specialInstructions || prefillData.description || prefillData.detailedDescriptionOfGoods || '');
      setHazardousCargo(prefillData.hazardousCargo || false);
      setInsuranceRequired(prefillData.insuranceRequired || false);
    }
  }, [prefillData]);

  // Helper for numeric input changes with error clearing
  const handleNumericChange = (setter: React.Dispatch<React.SetStateAction<number | ''>>, fieldName: keyof InsuranceFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setter(value === '' ? '' : parseFloat(value));
      setErrors((prev) => ({ ...prev, [fieldName]: undefined })); // Clear error on change
    }
  };

  // Validation logic
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof InsuranceFormData, string>> = {};

    if (!cargoType) newErrors.cargoType = 'Cargo Type is required.';
    const finalCargoValue = parseNumber(cargoValue);
    if (finalCargoValue === undefined || finalCargoValue <= 0) newErrors.cargoValue = 'Cargo Value is required and must be greater than 0.';
    if (!origin) newErrors.origin = 'Origin is required.';
    if (!destination) newErrors.destination = 'Destination is required.';
    if (!modeOfTransport) newErrors.modeOfTransport = 'Mode of Transport is required.';
    if (!policyType) newErrors.policyType = 'Policy Type is required.';
    if (!startDate) newErrors.startDate = 'Start Date is required.';
    if (!endDate) newErrors.endDate = 'End Date is required.';
    if (startDate && endDate && startDate > endDate) newErrors.endDate = 'End Date cannot be before Start Date.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit logic (can be called internally or externally via ref)
  const handleSubmitLogic = (): AllFormData | null => {
    if (!validateForm()) {
      setValidationMessage('Please fill in all required fields correctly.');
      setShowValidationMessage(true);
      return null;
    }

    const finalCargoValue = parseNumber(cargoValue);

    const formData: InsuranceFormData = {
      bookingType: 'Insurance',
      cargoType,
      cargoValue: finalCargoValue as number,
      origin,
      destination,
      modeOfTransport: modeOfTransport as InsuranceFormData['modeOfTransport'],
      policyType: policyType as InsuranceFormData['policyType'],
      startDate: startDate ? startDate.toISOString().split('T')[0] : '',
      endDate: endDate ? endDate.toISOString().split('T')[0] : '',
      specialInstructions: specialInstructions || undefined,
      hazardousCargo, // From state
      insuranceRequired, // From state
      readyDate: startDate ? startDate.toISOString().split('T')[0] : '', // Mapping startDate to readyDate for BaseFormData
      // Other BaseFormData fields not directly collected in this form, set to undefined or default
      totalWeight: 0, // Not collected, default to 0 or appropriate
      dimensions: undefined,
      detailedDescriptionOfGoods: specialInstructions || undefined,
      hsCode: undefined,
      incoterms: undefined,
      countryOfOrigin: undefined,
      numberOfPieces: undefined,
      coverageType: undefined, // Not collected in this form
    };

    setSuccessMessage('Insurance Quote data collected successfully.');
    setShowSuccessMessage(true);
    return formData;
  };

  // Reset logic (can be called internally or externally via ref)
  const resetForm = () => {
    setCargoType('');
    setCargoValue('');
    setOrigin('');
    setDestination('');
    setModeOfTransport('');
    setPolicyType('');
    setStartDate(null);
    setEndDate(null);
    setSpecialInstructions('');
    setHazardousCargo(false);
    setInsuranceRequired(false);
    setErrors({}); // Clear errors
    setShowValidationMessage(false);
    setValidationMessage('');
    setShowSuccessMessage(false);
    setSuccessMessage('');
  };

  useImperativeHandle(ref, () => ({
    submit: handleSubmitLogic,
    reset: resetForm,
  }));

  return (
    <div className="space-y-6 p-6 bg-white rounded-xl shadow-md border border-gray-200 font-inter">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Insurance Quote Details</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
        {/* Cargo Type */}
        <div>
          <label htmlFor="insuranceCargoType" className="block text-sm font-medium text-gray-700 mb-1">Cargo Type<span className="text-red-500">*</span></label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaBox className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="insuranceCargoType"
              className={`focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-2 ${errors.cargoType ? 'border-orange-500' : ''}`}
              placeholder="e.g., Electronics"
              value={cargoType}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setCargoType(e.target.value); setErrors((prev) => ({ ...prev, cargoType: undefined })); }}
              required
            />
          </div>
          {errors.cargoType && <p className="mt-1 text-sm text-orange-600">{errors.cargoType}</p>}
        </div>

        {/* Cargo Value */}
        <div>
          <label htmlFor="insuranceCargoValue" className="block text-sm font-medium text-gray-700 mb-1">Cargo Value (INR)<span className="text-red-500">*</span></label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaDollarSign className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text" // Use text for handleNumericChange
              id="insuranceCargoValue"
              className={`focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-2 ${errors.cargoValue ? 'border-orange-500' : ''}`}
              placeholder="e.g., 500000"
              value={cargoValue}
              onChange={handleNumericChange(setCargoValue, 'cargoValue')}
              required
            />
          </div>
          {errors.cargoValue && <p className="mt-1 text-sm text-orange-600">{errors.cargoValue}</p>}
        </div>

        {/* Origin */}
        <div>
          <label htmlFor="insuranceOrigin" className="block text-sm font-medium text-gray-700 mb-1">Origin<span className="text-red-500">*</span></label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaMapMarkerAlt className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="insuranceOrigin"
              className={`focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-2 ${errors.origin ? 'border-orange-500' : ''}`}
              placeholder="e.g., Mumbai"
              value={origin}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setOrigin(e.target.value); setErrors((prev) => ({ ...prev, origin: undefined })); }}
              required
            />
          </div>
          {errors.origin && <p className="mt-1 text-sm text-orange-600">{errors.origin}</p>}
        </div>

        {/* Destination */}
        <div>
          <label htmlFor="insuranceDestination" className="block text-sm font-medium text-gray-700 mb-1">Destination<span className="text-red-500">*</span></label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaMapMarkerAlt className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="insuranceDestination"
              className={`focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-2 ${errors.destination ? 'border-orange-500' : ''}`}
              placeholder="e.g., New York"
              value={destination}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setDestination(e.target.value); setErrors((prev) => ({ ...prev, destination: undefined })); }}
              required
            />
          </div>
          {errors.destination && <p className="mt-1 text-sm text-orange-600">{errors.destination}</p>}
        </div>

        {/* Mode of Transport */}
        <div>
          <label htmlFor="modeOfTransport" className="block text-sm font-medium text-gray-700 mb-1">Mode of Transport<span className="text-red-500">*</span></label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaInfoCircle className="h-5 w-5 text-gray-400" />
            </div>
            <select
              id="modeOfTransport"
              className={`focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-2 ${errors.modeOfTransport ? 'border-orange-500' : ''}`}
              value={modeOfTransport}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => { setModeOfTransport(e.target.value as 'air' | 'sea' | 'road' | 'rail' | ''); setErrors((prev) => ({ ...prev, modeOfTransport: undefined })); }}
              required
            >
              <option value="">Select Mode</option>
              <option value="air">Air</option>
              <option value="sea">Sea</option>
              <option value="road">Road</option>
              <option value="rail">Rail</option>
            </select>
          </div>
          {errors.modeOfTransport && <p className="mt-1 text-sm text-orange-600">{errors.modeOfTransport}</p>}
        </div>

        {/* Policy Type */}
        <div>
          <label htmlFor="policyType" className="block text-sm font-medium text-gray-700 mb-1">Policy Type<span className="text-red-500">*</span></label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaInfoCircle className="h-5 w-5 text-gray-400" />
            </div>
            <select
              id="policyType"
              className={`focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-2 ${errors.policyType ? 'border-orange-500' : ''}`}
              value={policyType}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => { setPolicyType(e.target.value as 'all-risk' | 'fpa' | 'wa' | ''); setErrors((prev) => ({ ...prev, policyType: undefined })); }}
              required
            >
              <option value="">Select Policy Type</option>
              <option value="all-risk">All Risk</option>
              <option value="fpa">FPA (Free from Particular Average)</option>
              <option value="wa">WA (With Average)</option>
            </select>
          </div>
          {errors.policyType && <p className="mt-1 text-sm text-orange-600">{errors.policyType}</p>}
        </div>

        {/* Start Date */}
        <div>
          <label htmlFor="insuranceStartDate" className="block text-sm font-medium text-gray-700 mb-1">Start Date<span className="text-red-500">*</span></label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaCalendarAlt className="h-5 w-5 text-gray-400" />
            </div>
            <DatePicker
              selected={startDate}
              onChange={(date: Date | null) => { setStartDate(date); setErrors((prev) => ({ ...prev, startDate: undefined })); }}
              dateFormat="dd-MM-yyyy"
              placeholderText="DD-MM-YYYY"
              className={`focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-2 ${errors.startDate ? 'border-orange-500' : ''}`}
              required
            />
          </div>
          {errors.startDate && <p className="mt-1 text-sm text-orange-600">{errors.startDate}</p>}
        </div>

        {/* End Date */}
        <div>
          <label htmlFor="insuranceEndDate" className="block text-sm font-medium text-gray-700 mb-1">End Date<span className="text-red-500">*</span></label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaCalendarAlt className="h-5 w-5 text-gray-400" />
            </div>
            <DatePicker
              selected={endDate}
              onChange={(date: Date | null) => { setEndDate(date); setErrors((prev) => ({ ...prev, endDate: undefined })); }}
              dateFormat="dd-MM-yyyy"
              placeholderText="DD-MM-YYYY"
              className={`focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-2 ${errors.endDate ? 'border-orange-500' : ''}`}
              required
            />
          </div>
          {errors.endDate && <p className="mt-1 text-sm text-orange-600">{errors.endDate}</p>}
        </div>

        {/* Hazardous Cargo */}
        <div className="flex items-center mt-6">
          <input
            type="checkbox"
            id="insuranceHazardousCargo"
            checked={hazardousCargo}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setHazardousCargo(e.target.checked)}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
          />
          <label htmlFor="insuranceHazardousCargo" className="ml-2 block text-sm text-gray-900">
            Hazardous Cargo
          </label>
        </div>

        {/* Insurance Required (Self-explanatory, but included for completeness if needed elsewhere) */}
        <div className="flex items-center mt-6">
          <input
            type="checkbox"
            id="insuranceRequired"
            checked={insuranceRequired}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInsuranceRequired(e.target.checked)}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
          />
          <label htmlFor="insuranceRequired" className="ml-2 block text-sm text-gray-900">
            Insurance Required (Self-Coverage)
          </label>
        </div>
      </div>

      {/* Special Instructions - always full width */}
      <div className="col-span-full mt-6">
        <label htmlFor="specialInstructions" className="block text-sm font-medium text-gray-700 mb-1">Special Instructions (Optional)</label>
        <textarea
          id="specialInstructions"
          rows={3}
          className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2"
          placeholder="e.g., Fragile goods, requires special handling"
          value={specialInstructions}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setSpecialInstructions(e.target.value)}
        ></textarea>
      </div>

      {/* Action Buttons - Render ONLY if showButtons prop is true */}
      {showButtons && (
        <div className="flex justify-center space-x-4 mt-8">
          <button
            type="button"
            onClick={handleSubmitLogic}
            className="px-8 py-4 bg-blue-600 text-white font-bold text-xl rounded-xl shadow-lg hover:bg-blue-700 transition duration-300 transform hover:scale-105"
          >
            Get Quote
          </button>
          <button
            type="button"
            onClick={resetForm}
            className="px-8 py-4 bg-gray-300 text-gray-800 font-bold text-xl rounded-xl shadow-lg hover:bg-gray-400 transition duration-300 transform hover:scale-105"
          >
            Reset Form
          </button>
        </div>
      )}

      {/* Custom Validation Message Box */}
      {showValidationMessage && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full relative">
            <button
              onClick={() => setShowValidationMessage(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              <FaTimesCircle className="h-6 w-6" />
            </button>
            <div className="flex items-center mb-4">
              <FaInfoCircle className="text-orange-500 h-8 w-8 mr-3" />
              <h4 className="text-xl font-bold text-gray-800">Validation Error</h4>
            </div>
            <p className="text-gray-700 mb-6">{validationMessage}</p>
            <button
              onClick={() => setShowValidationMessage(false)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md w-full"
            >
              Got It
            </button>
          </div>
        </div>
      )}

      {/* Custom Success Message Box */}
      {showSuccessMessage && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full relative">
            <button
              onClick={() => setShowSuccessMessage(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              <FaTimesCircle className="h-6 w-6" />
            </button>
            <div className="flex items-center mb-4">
              <FaCheckCircle className="text-green-500 h-8 w-8 mr-3" />
              <h4 className="text-xl font-bold text-gray-800">Success!</h4>
            </div>
            <p className="text-gray-700 mb-6">{successMessage}</p>
            <button
              onClick={() => setShowSuccessMessage(false)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md w-full"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

export default InsuranceQuoteForm;
