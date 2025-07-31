// src/components/QuoteForms/LCLQuoteForm.tsx
import React, { useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaMapMarkerAlt, FaCalendarAlt, FaWeight, FaRulerCombined, FaBox, FaDollarSign, FaInfoCircle, FaTimesCircle, FaCheckCircle } from 'react-icons/fa';
import type { LCLFormData, QuoteFormHandle, AllFormData } from '../../types/QuoteFormHandle';
import type { ParsedVoiceCommand } from '../../types/QuoteFormHandle'; // Corrected import path for ParsedVoiceCommand
import { parseNumber } from '../../utils/parseNumber'; // Import parseNumber

interface LCLQuoteFormProps {
  prefillData?: ParsedVoiceCommand;
  showButtons?: boolean; // Added showButtons prop
}

const LCLQuoteForm = forwardRef<QuoteFormHandle, LCLQuoteFormProps>(({ prefillData, showButtons = true }, ref) => {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [readyDate, setReadyDate] = useState<Date | null>(null); // Changed to Date | null for DatePicker
  const [cargoType, setCargoType] = useState('');
  const [totalWeight, setTotalWeight] = useState<number | ''>('');
  const [totalVolume, setTotalVolume] = useState<number | ''>('');
  const [numberOfPackages, setNumberOfPackages] = useState<number | ''>('');
  const [dimensions, setDimensions] = useState('');
  const [cargoValue, setCargoValue] = useState<number | ''>('');
  const [hazardousCargo, setHazardousCargo] = useState(false);
  const [insuranceRequired, setInsuranceRequired] = useState(false);
  const [specialInstructions, setSpecialInstructions] = useState('');

  // State for validation errors
  const [errors, setErrors] = useState<Partial<Record<keyof LCLFormData, string>>>({});
  // State for custom validation message box
  const [showValidationMessage, setShowValidationMessage] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');
  // State for success message
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (prefillData) {
      setOrigin(prefillData.origin || '');
      setDestination(prefillData.destination || '');
      setReadyDate(prefillData.readyDate ? new Date(prefillData.readyDate) : null); // Corrected: Map prefillData.readyDate to Date object
      setCargoType(prefillData.cargoType || prefillData.commodity || ''); // Use cargoType or commodity
      setTotalWeight(parseNumber(prefillData.cargoWeight) ?? ''); // Use parseNumber
      setTotalVolume(parseNumber(prefillData.volumeCBM) ?? ''); // Corrected: Map volumeCBM to totalVolume
      setNumberOfPackages(parseNumber(prefillData.numberOfPieces) ?? ''); // Corrected: Map numberOfPieces to numberOfPackages
      setDimensions(prefillData.cargoDimensions || ''); // Map cargoDimensions
      setCargoValue(parseNumber(prefillData.cargoValue) ?? ''); // Use parseNumber
      setHazardousCargo(prefillData.hazardousCargo || false);
      setInsuranceRequired(prefillData.insuranceRequired || false);
      setSpecialInstructions(prefillData.specialInstructions || prefillData.description || ''); // Use specialInstructions or description
    }
  }, [prefillData]);

  // Helper for numeric input changes with error clearing
  const handleNumericChange = (setter: React.Dispatch<React.SetStateAction<number | ''>>, fieldName: keyof LCLFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setter(value === '' ? '' : parseFloat(value));
      setErrors((prev) => ({ ...prev, [fieldName]: undefined })); // Clear error on change
    }
  };

  // Validation logic
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof LCLFormData, string>> = {};

    if (!origin) newErrors.origin = 'Origin is required.';
    if (!destination) newErrors.destination = 'Destination is required.';
    if (!readyDate) newErrors.readyDate = 'Ready Date is required.';
    if (!cargoType) newErrors.cargoType = 'Cargo Type is required.';

    const currentTotalWeight = parseNumber(totalWeight);
    if (currentTotalWeight === undefined || currentTotalWeight <= 0) newErrors.totalWeight = 'Total Weight is required and must be greater than 0.';

    const currentTotalVolume = parseNumber(totalVolume);
    if (currentTotalVolume === undefined || currentTotalVolume <= 0) newErrors.totalVolume = 'Total Volume is required and must be greater than 0.';

    const currentNumberOfPackages = parseNumber(numberOfPackages);
    if (currentNumberOfPackages === undefined || currentNumberOfPackages <= 0) newErrors.numberOfPackages = 'Number of Packages is required and must be greater than 0.';

    // cargoValue is optional, so no validation here
    // if (cargoValue === '' || Number(cargoValue) <= 0) newErrors.cargoValue = 'Cargo Value is required and must be greater than 0.';

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

    // Recalculate these values right before constructing formData to ensure they are available
    const finalTotalWeight = parseNumber(totalWeight);
    const finalTotalVolume = parseNumber(totalVolume);
    const finalNumberOfPackages = parseNumber(numberOfPackages);

    const formData: LCLFormData = {
      bookingType: 'LCL',
      origin,
      destination,
      readyDate: readyDate ? readyDate.toISOString().split('T')[0] : '', // Format Date to string
      cargoType,
      totalWeight: finalTotalWeight as number,
      totalVolume: finalTotalVolume as number,
      numberOfPackages: finalNumberOfPackages as number,
      dimensions: dimensions || undefined,
      cargoValue: parseNumber(cargoValue) ?? 0, // Corrected: Ensure cargoValue is always a number, default to 0 if undefined
      hazardousCargo,
      insuranceRequired,
      specialInstructions: specialInstructions || undefined,
    };

    setSuccessMessage('LCL Freight quote data collected successfully.');
    setShowSuccessMessage(true);
    return formData;
  };

  // Reset logic (can be called internally or externally via ref)
  const resetForm = () => {
    setOrigin('');
    setDestination('');
    setReadyDate(null);
    setCargoType('');
    setTotalWeight('');
    setTotalVolume('');
    setNumberOfPackages('');
    setDimensions('');
    setCargoValue('');
    setHazardousCargo(false);
    setInsuranceRequired(false);
    setSpecialInstructions('');
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
      <h2 className="text-2xl font-bold text-gray-800 mb-4">LCL Freight Quote Details</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
        {/* Origin */}
        <div>
          <label htmlFor="lclOrigin" className="block text-sm font-medium text-gray-700 mb-1">Origin City/Port<span className="text-red-500">*</span></label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaMapMarkerAlt className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="lclOrigin"
              className={`focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-2 ${errors.origin ? 'border-orange-500' : ''}`}
              placeholder="e.g., Shanghai"
              value={origin}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setOrigin(e.target.value); setErrors((prev) => ({ ...prev, origin: undefined })); }}
              required
            />
          </div>
          {errors.origin && <p className="mt-1 text-sm text-orange-600">{errors.origin}</p>}
        </div>

        {/* Destination */}
        <div>
          <label htmlFor="lclDestination" className="block text-sm font-medium text-gray-700 mb-1">Destination City/Port<span className="text-red-500">*</span></label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaMapMarkerAlt className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="lclDestination"
              className={`focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-2 ${errors.destination ? 'border-orange-500' : ''}`}
              placeholder="e.g., Hamburg"
              value={destination}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setDestination(e.target.value); setErrors((prev) => ({ ...prev, destination: undefined })); }}
              required
            />
          </div>
          {errors.destination && <p className="mt-1 text-sm text-orange-600">{errors.destination}</p>}
        </div>

        {/* Ready Date */}
        <div>
          <label htmlFor="lclReadyDate" className="block text-sm font-medium text-gray-700 mb-1">Ready Date<span className="text-red-500">*</span></label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaCalendarAlt className="h-5 w-5 text-gray-400" />
            </div>
            <DatePicker
              selected={readyDate}
              onChange={(date: Date | null) => { setReadyDate(date); setErrors((prev) => ({ ...prev, readyDate: undefined })); }}
              dateFormat="dd-MM-yyyy"
              placeholderText="DD-MM-YYYY"
              className={`focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-2 ${errors.readyDate ? 'border-orange-500' : ''}`}
              required
            />
          </div>
          {errors.readyDate && <p className="mt-1 text-sm text-orange-600">{errors.readyDate}</p>}
        </div>

        {/* Cargo Type */}
        <div>
          <label htmlFor="lclCargoType" className="block text-sm font-medium text-gray-700 mb-1">Cargo Type<span className="text-red-500">*</span></label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaBox className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="lclCargoType"
              className={`focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-2 ${errors.cargoType ? 'border-orange-500' : ''}`}
              placeholder="e.g., Consumer Goods"
              value={cargoType}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setCargoType(e.target.value); setErrors((prev) => ({ ...prev, cargoType: undefined })); }}
              required
            />
          </div>
          {errors.cargoType && <p className="mt-1 text-sm text-orange-600">{errors.cargoType}</p>}
        </div>

        {/* Total Weight */}
        <div>
          <label htmlFor="lclTotalWeight" className="block text-sm font-medium text-gray-700 mb-1">Total Weight (KG)<span className="text-red-500">*</span></label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaWeight className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text" // Use text to allow partial numeric input
              id="lclTotalWeight"
              className={`focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-2 ${errors.totalWeight ? 'border-orange-500' : ''}`}
              placeholder="e.g., 500"
              value={totalWeight}
              onChange={handleNumericChange(setTotalWeight, 'totalWeight')}
              required
            />
          </div>
          {errors.totalWeight && <p className="mt-1 text-sm text-orange-600">{errors.totalWeight}</p>}
        </div>

        {/* Total Volume */}
        <div>
          <label htmlFor="lclTotalVolume" className="block text-sm font-medium text-gray-700 mb-1">Total Volume (CBM)<span className="text-red-500">*</span></label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaRulerCombined className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text" // Use text to allow partial numeric input
              id="lclTotalVolume"
              className={`focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-2 ${errors.totalVolume ? 'border-orange-500' : ''}`}
              placeholder="e.g., 2.5"
              value={totalVolume}
              onChange={handleNumericChange(setTotalVolume, 'totalVolume')}
              required
            />
          </div>
          {errors.totalVolume && <p className="mt-1 text-sm text-orange-600">{errors.totalVolume}</p>}
        </div>

        {/* Number of Packages */}
        <div>
          <label htmlFor="lclNumberOfPackages" className="block text-sm font-medium text-gray-700 mb-1">Number of Packages<span className="text-red-500">*</span></label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaBox className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text" // Use text to allow partial numeric input
              id="lclNumberOfPackages"
              className={`focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-2 ${errors.numberOfPackages ? 'border-orange-500' : ''}`}
              placeholder="e.g., 10"
              value={numberOfPackages}
              onChange={handleNumericChange(setNumberOfPackages, 'numberOfPackages')}
              required
            />
          </div>
          {errors.numberOfPackages && <p className="mt-1 text-sm text-orange-600">{errors.numberOfPackages}</p>}
        </div>

        {/* Dimensions */}
        <div>
          <label htmlFor="lclDimensions" className="block text-sm font-medium text-gray-700 mb-1">Dimensions (LxWxH in CM, Optional)</label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaRulerCombined className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="lclDimensions"
              className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-2"
              placeholder="e.g., 80x60x50 (per package)"
              value={dimensions}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDimensions(e.target.value)}
            />
          </div>
        </div>

        {/* Cargo Value */}
        <div>
          <label htmlFor="lclCargoValue" className="block text-sm font-medium text-gray-700 mb-1">Cargo Value (INR, Optional)</label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaDollarSign className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text" // Use text to allow partial numeric input
              id="lclCargoValue"
              className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-2"
              placeholder="e.g., 75000"
              value={cargoValue}
              onChange={handleNumericChange(setCargoValue, 'cargoValue')}
            />
          </div>
        </div>

        {/* Hazardous Cargo */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="lclHazardousCargo"
            checked={hazardousCargo}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setHazardousCargo(e.target.checked)}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
          />
          <label htmlFor="lclHazardousCargo" className="ml-2 block text-sm text-gray-900">
            Hazardous Cargo
          </label>
        </div>

        {/* Insurance Required */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="lclInsuranceRequired"
            checked={insuranceRequired}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInsuranceRequired(e.target.checked)}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
          />
          <label htmlFor="lclInsuranceRequired" className="ml-2 block text-sm text-gray-900">
            Insurance Required
          </label>
        </div>
      </div>

      {/* Special Instructions - always full width */}
      <div className="col-span-full">
        <label htmlFor="lclSpecialInstructions" className="block text-sm font-medium text-gray-700 mb-1">Special Instructions (Optional)</label>
        <textarea
          id="lclSpecialInstructions"
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

export default LCLQuoteForm;
