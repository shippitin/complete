// src/components/QuoteForms/CustomsQuoteForm.tsx
import React, { useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import { FaBox, FaDollarSign, FaInfoCircle, FaMapMarkerAlt, FaCalendarAlt, FaTimesCircle, FaCheckCircle } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import type { CustomsFormData, QuoteFormHandle, ParsedVoiceCommand, AllFormData } from '../../types/QuoteFormHandle'; // Corrected ParsedVoiceCommand import

interface CustomsQuoteFormProps {
  prefillData?: ParsedVoiceCommand;
  showButtons?: boolean; // Added showButtons prop
}

const CustomsQuoteForm = forwardRef<QuoteFormHandle, CustomsQuoteFormProps>(({ prefillData, showButtons = true }, ref) => {
  // State variables
  const [serviceType, setServiceType] = useState<'import' | 'export' | 'transit' | ''>('');
  const [cargoType, setCargoType] = useState('');
  const [cargoValue, setCargoValue] = useState<number | ''>('');
  const [hsCode, setHsCode] = useState('');
  const [countryOfOrigin, setCountryOfOrigin] = useState('');
  const [destinationPortICD, setDestinationPortICD] = useState('');
  const [readyDate, setReadyDate] = useState<Date | null>(null);
  const [incoterms, setIncoterms] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');

  // State for validation errors
  const [errors, setErrors] = useState<Partial<Record<keyof CustomsFormData, string>>>({});
  // State for custom validation message box
  const [showValidationMessage, setShowValidationMessage] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');
  // State for success message
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Prefill data effect
  useEffect(() => {
    if (prefillData) {
      setServiceType((prefillData.serviceType as 'import' | 'export' | 'transit') || '');
      // Use cargoType if available, otherwise commodity
      setCargoType(prefillData.cargoType || prefillData.commodity || '');
      // CORRECTED: Use prefillData.cargoValue
      setCargoValue(prefillData.cargoValue ? Number(prefillData.cargoValue) : '');
      // CORRECTED: Use prefillData.hsnCode
      setHsCode(prefillData.hsnCode || '');
      // CORRECTED: Use prefillData.country
      setCountryOfOrigin(prefillData.country || '');
      // Use destinationPort if available, otherwise destinationCity, then general destination
      setDestinationPortICD(prefillData.destinationPort || prefillData.destinationCity || prefillData.destination || '');
      // CORRECTED: Use prefillData.readyDate
      setReadyDate(prefillData.readyDate ? new Date(prefillData.readyDate) : null);
      setIncoterms(prefillData.incoterms || '');
      // CORRECTED: Use prefillData.specialInstructions or detailedDescriptionOfGoods
      setSpecialInstructions(prefillData.specialInstructions || prefillData.detailedDescriptionOfGoods || '');
    }
  }, [prefillData]);

  // Handle numeric input change
  const handleNumericChange = (setter: React.Dispatch<React.SetStateAction<number | ''>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setter(value === '' ? '' : parseFloat(value));
    }
    setErrors((prev) => ({ ...prev, cargoValue: undefined })); // Clear error on change
  };

  // Validation logic
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CustomsFormData, string>> = {};

    if (!serviceType) newErrors.serviceType = 'Service Type is required.';
    if (!cargoType) newErrors.cargoType = 'Cargo Type is required.';
    if (cargoValue === '' || Number(cargoValue) <= 0) newErrors.cargoValue = 'Cargo Value is required and must be greater than 0.';
    if (!hsCode) newErrors.hsCode = 'HS Code is required.';
    if (!countryOfOrigin) newErrors.countryOfOrigin = 'Country of Origin is required.';
    if (!destinationPortICD) newErrors.destinationPortICD = 'Destination Port/ICD is required.';
    if (!readyDate) newErrors.readyDate = 'Ready Date is required.';
    if (!incoterms) newErrors.incoterms = 'Incoterms is required.';

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

    const formData: CustomsFormData = {
      bookingType: 'Customs',
      serviceType: serviceType as 'import' | 'export' | 'transit',
      cargoType,
      cargoValue: Number(cargoValue),
      hsCode,
      countryOfOrigin,
      destinationPortICD,
      readyDate: readyDate ? readyDate.toISOString().split('T')[0] : '', // Format Date to string
      incoterms,
      specialInstructions,
      // Added missing required fields with default values as per CustomsFormData interface
      hazardousCargo: false, // Default to false if not collected in UI
      insuranceRequired: false, // Default to false if not collected in UI
      totalWeight: 0, // Default to 0 if not collected in UI
      // Properties specific to CustomsFormData but not collected in this UI can be undefined
      documentType: undefined,
      country: undefined, // This is already mapped to countryOfOrigin, so can be undefined here
      customsServiceType: undefined,
      // Removed properties that are not part of CustomsFormData, even if they are in BaseFormData
      // or other specific form data types (e.g., volumeCBM, containerType, numberOfContainers, etc.)
    };

    setSuccessMessage('Customs Clearance quote data collected successfully.');
    setShowSuccessMessage(true);
    return formData;
  };

  // Reset logic (can be called internally or externally via ref)
  const resetForm = () => {
    setServiceType('');
    setCargoType('');
    setCargoValue('');
    setHsCode('');
    setCountryOfOrigin('');
    setDestinationPortICD('');
    setReadyDate(null);
    setIncoterms('');
    setSpecialInstructions('');
    setErrors({}); // Clear errors
    setShowValidationMessage(false);
    setValidationMessage('');
    setShowSuccessMessage(false);
    setSuccessMessage('');
  };

  // Expose submit and reset via imperative handle
  useImperativeHandle(ref, () => ({
    submit: handleSubmitLogic,
    reset: resetForm,
  }));

  return (
    <div className="space-y-6 p-6 bg-white rounded-xl shadow-md border border-gray-200 font-inter">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Customs Clearance Quote Details</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
        {/* Service Type */}
        <div>
          <label htmlFor="customsServiceType" className="block text-sm font-medium text-gray-700 mb-1">Service Type<span className="text-red-500">*</span></label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-0 flex items-center pointer-events-none">
              <FaInfoCircle className="h-5 w-5 text-gray-400" />
            </div>
            <select
              id="customsServiceType"
              className={`block w-full pl-8 pr-3 py-2 sm:text-sm bg-transparent border-0 border-b border-gray-300 focus:ring-0 focus:border-blue-500 ${errors.serviceType ? 'border-orange-500' : ''}`}
              value={serviceType}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => { setServiceType(e.target.value as 'import' | 'export' | 'transit' | ''); setErrors((prev) => ({ ...prev, serviceType: undefined })); }}
              required
            >
              <option value="">Select Service Type</option>
              <option value="import">Import</option>
              <option value="export">Export</option>
              <option value="transit">Transit</option>
            </select>
          </div>
          {errors.serviceType && <p className="mt-1 text-sm text-orange-600">{errors.serviceType}</p>}
        </div>

        {/* Cargo Type */}
        <div>
          <label htmlFor="customsCargoType" className="block text-sm font-medium text-gray-700 mb-1">Cargo Type<span className="text-red-500">*</span></label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-0 flex items-center pointer-events-none">
              <FaBox className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="customsCargoType"
              className={`block w-full pl-8 pr-3 py-2 sm:text-sm bg-transparent border-0 border-b border-gray-300 focus:ring-0 focus:border-blue-500 ${errors.cargoType ? 'border-orange-500' : ''}`}
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
          <label htmlFor="customsCargoValue" className="block text-sm font-medium text-gray-700 mb-1">Cargo Value (INR)<span className="text-red-500">*</span></label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-0 flex items-center pointer-events-none">
              <FaDollarSign className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text" // Use text to allow partial numeric input
              id="customsCargoValue"
              className={`block w-full pl-8 pr-3 py-2 sm:text-sm bg-transparent border-0 border-b border-gray-300 focus:ring-0 focus:border-blue-500 ${errors.cargoValue ? 'border-orange-500' : ''}`}
              placeholder="e.g., 500000"
              value={cargoValue}
              onChange={handleNumericChange(setCargoValue)}
              required
            />
          </div>
          {errors.cargoValue && <p className="mt-1 text-sm text-orange-600">{errors.cargoValue}</p>}
        </div>

        {/* HS Code */}
        <div>
          <label htmlFor="hsCode" className="block text-sm font-medium text-gray-700 mb-1">HS Code (Harmonized System)<span className="text-red-500">*</span></label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-0 flex items-center pointer-events-none">
              <FaInfoCircle className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="hsCode"
              className={`block w-full pl-8 pr-3 py-2 sm:text-sm bg-transparent border-0 border-b border-gray-300 focus:ring-0 focus:border-blue-500 ${errors.hsCode ? 'border-orange-500' : ''}`}
              placeholder="e.g., 8471.30.00"
              value={hsCode}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setHsCode(e.target.value); setErrors((prev) => ({ ...prev, hsCode: undefined })); }}
              required
            />
          </div>
          {errors.hsCode && <p className="mt-1 text-sm text-orange-600">{errors.hsCode}</p>}
        </div>

        {/* Country of Origin */}
        <div>
          <label htmlFor="countryOfOrigin" className="block text-sm font-medium text-gray-700 mb-1">Country of Origin<span className="text-red-500">*</span></label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-0 flex items-center pointer-events-none">
              <FaMapMarkerAlt className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="countryOfOrigin"
              className={`block w-full pl-8 pr-3 py-2 sm:text-sm bg-transparent border-0 border-b border-gray-300 focus:ring-0 focus:border-blue-500 ${errors.countryOfOrigin ? 'border-orange-500' : ''}`}
              placeholder="e.g., China"
              value={countryOfOrigin}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setCountryOfOrigin(e.target.value); setErrors((prev) => ({ ...prev, countryOfOrigin: undefined })); }}
              required
            />
          </div>
          {errors.countryOfOrigin && <p className="mt-1 text-sm text-orange-600">{errors.countryOfOrigin}</p>}
        </div>

        {/* Destination Port/ICD */}
        <div>
          <label htmlFor="destinationPortICD" className="block text-sm font-medium text-gray-700 mb-1">Destination Port/ICD<span className="text-red-500">*</span></label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-0 flex items-center pointer-events-none">
              <FaMapMarkerAlt className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="destinationPortICD"
              className={`block w-full pl-8 pr-3 py-2 sm:text-sm bg-transparent border-0 border-b border-gray-300 focus:ring-0 focus:border-blue-500 ${errors.destinationPortICD ? 'border-orange-500' : ''}`}
              placeholder="e.g., ICD Tughlakabad, Delhi"
              value={destinationPortICD}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setDestinationPortICD(e.target.value); setErrors((prev) => ({ ...prev, destinationPortICD: undefined })); }}
              required
            />
          </div>
          {errors.destinationPortICD && <p className="mt-1 text-sm text-orange-600">{errors.destinationPortICD}</p>}
        </div>

        {/* Ready Date */}
        <div>
          <label htmlFor="customsReadyDate" className="block text-sm font-medium text-gray-700 mb-1">Ready Date<span className="text-red-500">*</span></label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-0 flex items-center pointer-events-none">
              <FaCalendarAlt className="h-5 w-5 text-gray-400" />
            </div>
            <DatePicker
              selected={readyDate}
              onChange={(date: Date | null) => { setReadyDate(date); setErrors((prev) => ({ ...prev, readyDate: undefined })); }}
              dateFormat="dd-MM-yyyy"
              placeholderText="DD-MM-YYYY"
              className={`block w-full pl-8 pr-3 py-2 sm:text-sm bg-transparent border-0 border-b border-gray-300 focus:ring-0 focus:border-blue-500 ${errors.readyDate ? 'border-orange-500' : ''}`}
              required
            />
          </div>
          {errors.readyDate && <p className="mt-1 text-sm text-orange-600">{errors.readyDate}</p>}
        </div>

        {/* Incoterms */}
        <div>
          <label htmlFor="customsIncoterms" className="block text-sm font-medium text-gray-700 mb-1">Incoterms<span className="text-red-500">*</span></label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-0 flex items-center pointer-events-none">
              <FaInfoCircle className="h-5 w-5 text-gray-400" />
            </div>
            <select
              id="customsIncoterms"
              className={`block w-full pl-8 pr-3 py-2 sm:text-sm bg-transparent border-0 border-b border-gray-300 focus:ring-0 focus:border-blue-500 ${errors.incoterms ? 'border-orange-500' : ''}`}
              value={incoterms}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => { setIncoterms(e.target.value); setErrors((prev) => ({ ...prev, incoterms: undefined })); }}
              required
            >
              <option value="">Select Incoterm</option>
              <option value="EXW">EXW (Ex Works)</option>
              <option value="FOB">FOB (Free On Board)</option>
              <option value="CIF">CIF (Cost, Insurance & Freight)</option>
              <option value="DDP">DDP (Delivered Duty Paid)</option>
              <option value="Other">Other</option>
            </select>
          </div>
          {errors.incoterms && <p className="mt-1 text-sm text-orange-600">{errors.incoterms}</p>}
        </div>
      </div>

      {/* Special Instructions - always full width */}
      <div className="col-span-full">
        <label htmlFor="customsSpecialInstructions" className="block text-sm font-medium text-gray-700 mb-1">Special Instructions (Optional)</label>
        <textarea
          id="customsSpecialInstructions"
          rows={3}
          className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2"
          placeholder="Provide any special handling instructions..."
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

export default CustomsQuoteForm;
