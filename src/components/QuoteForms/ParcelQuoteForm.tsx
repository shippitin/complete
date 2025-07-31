// src/components/QuoteForms/ParcelQuoteForm.tsx
import React, { useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaMapMarkerAlt, FaCalendarAlt, FaWeight, FaRulerCombined, FaBox, FaDollarSign, FaFileInvoice, FaGlobe, FaBook, FaBoxes, FaInfoCircle, FaTimesCircle, FaCheckCircle } from 'react-icons/fa';
import type { ParcelFormData, QuoteFormHandle, ParsedVoiceCommand, AllFormData } from '../../types/QuoteFormHandle'; // Added AllFormData
import { parseNumber } from '../../utils/parseNumber';

interface ParcelQuoteFormProps {
  prefillData?: ParsedVoiceCommand;
  showButtons?: boolean; // Added showButtons prop for HeroSection.tsx
}

const ParcelQuoteForm = forwardRef<QuoteFormHandle, ParcelQuoteFormProps>(({ prefillData, showButtons = true }, ref) => {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [readyDate, setReadyDate] = useState<Date | null>(null);
  const [isDomestic, setIsDomestic] = useState<boolean | ''>('');
  const [courierMode, setCourierMode] = useState<'DOC' | 'NON' | ''>('');
  const [parcelCount, setParcelCount] = useState<number | ''>('');
  const [totalWeight, setTotalWeight] = useState<number | ''>('');
  const [cargoType, setCargoType] = useState('');
  // Individual dimensions for ParcelFormData
  const [parcelLength, setParcelLength] = useState<number | ''>('');
  const [parcelWidth, setParcelWidth] = useState<number | ''>('');
  const [parcelHeight, setParcelHeight] = useState<number | ''>('');
  const [volumetricWeight, setVolumetricWeight] = useState<number | ''>(''); // Required for ParcelFormData
  const [cargoValue, setCargoValue] = useState<number | ''>('');
  const [hazardousCargo, setHazardousCargo] = useState(false);
  const [insuranceRequired, setInsuranceRequired] = useState(false);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [dimensions, setDimensions] = useState(''); // Re-added dimensions state

  // State for validation errors
  const [errors, setErrors] = useState<Partial<Record<keyof ParcelFormData, string>>>({});
  // State for custom validation message box
  const [showValidationMessage, setShowValidationMessage] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');
  // State for success message
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (prefillData) {
      // Handle isDomestic prefill robustly
      if (typeof prefillData.isDomestic === 'boolean') {
        setIsDomestic(prefillData.isDomestic);
      } else if (prefillData.isDomestic === 'true') {
        setIsDomestic(true);
      } else if (prefillData.isDomestic === 'false') {
        setIsDomestic(false);
      } else {
        setIsDomestic('');
      }

      setCourierMode((prefillData.courierMode as 'DOC' | 'NON' || '') || '');
      setOrigin(prefillData.origin || prefillData.originPincode || ''); // Use origin or originPincode
      setDestination(prefillData.destination || prefillData.destinationPincode || ''); // Use destination or destinationPincode
      setReadyDate(prefillData.readyDate ? new Date(prefillData.readyDate) : (prefillData.date ? new Date(prefillData.date) : null));
      setParcelCount(parseNumber(prefillData.parcelCount) ?? parseNumber(prefillData.numberOfPieces) ?? ''); // parcelCount or numberOfPieces
      setTotalWeight(parseNumber(prefillData.cargoWeight) ?? parseNumber(prefillData.totalWeight) ?? ''); // cargoWeight or totalWeight
      setCargoType(prefillData.cargoType || prefillData.commodity || ''); // cargoType or commodity
      setParcelLength(parseNumber(prefillData.parcelLength) ?? '');
      setParcelWidth(parseNumber(prefillData.parcelWidth) ?? '');
      setParcelHeight(parseNumber(prefillData.parcelHeight) ?? '');
      setVolumetricWeight(parseNumber(prefillData.volumetricWeight) ?? ''); // Prefill volumetricWeight
      setCargoValue(parseNumber(prefillData.cargoValue) ?? parseNumber(prefillData.productDeclaredValue) ?? ''); // cargoValue or productDeclaredValue
      setHazardousCargo(prefillData.hazardousCargo || false);
      setInsuranceRequired(prefillData.insuranceRequired || false);
      setSpecialInstructions(prefillData.specialInstructions || prefillData.description || ''); // specialInstructions or description
      setDimensions(prefillData.cargoDimensions || ''); // Prefill dimensions state
    }
  }, [prefillData]);

  // Helper for numeric input changes with error clearing
  const handleNumericChange = (setter: React.Dispatch<React.SetStateAction<number | ''>>, fieldName: keyof ParcelFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setter(value === '' ? '' : parseFloat(value));
      setErrors((prev) => ({ ...prev, [fieldName]: undefined })); // Clear error on change
    }
  };

  // Validation logic
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ParcelFormData, string>> = {};

    if (isDomestic === '') newErrors.isDomestic = 'Domestic/International selection is required.';
    if (courierMode === '') newErrors.courierMode = 'Courier Mode (Document/Non-Document) is required.';
    if (!origin) newErrors.origin = 'Origin Address/City is required.';
    if (!destination) newErrors.destination = 'Destination Address/City is required.';
    if (!readyDate) newErrors.readyDate = 'Ready Date is required.';

    const finalParcelCount = parseNumber(parcelCount);
    if (finalParcelCount === undefined || finalParcelCount <= 0) newErrors.parcelCount = 'Number of Parcels is required and must be greater than 0.';

    const finalTotalWeight = parseNumber(totalWeight);
    if (finalTotalWeight === undefined || finalTotalWeight <= 0) newErrors.totalWeight = 'Total Weight is required and must be greater than 0.';

    if (!cargoType) newErrors.cargoType = 'Cargo Type is required.';

    const finalParcelLength = parseNumber(parcelLength);
    if (finalParcelLength === undefined || finalParcelLength <= 0) newErrors.parcelLength = 'Length is required and must be greater than 0.';

    const finalParcelWidth = parseNumber(parcelWidth);
    if (finalParcelWidth === undefined || finalParcelWidth <= 0) newErrors.parcelWidth = 'Width is required and must be greater than 0.';

    const finalParcelHeight = parseNumber(parcelHeight);
    if (finalParcelHeight === undefined || finalParcelHeight <= 0) newErrors.parcelHeight = 'Height is required and must be greater than 0.';

    const finalVolumetricWeight = parseNumber(volumetricWeight);
    if (finalVolumetricWeight === undefined || finalVolumetricWeight <= 0) newErrors.volumetricWeight = 'Volumetric Weight is required and must be greater than 0.';

    const finalCargoValue = parseNumber(cargoValue);
    if (finalCargoValue === undefined || finalCargoValue <= 0) newErrors.cargoValue = 'Cargo Value is required and must be greater than 0.'; // Cargo Value is required for ParcelFormData

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
    const finalParcelCount = parseNumber(parcelCount);
    const finalTotalWeight = parseNumber(totalWeight);
    const finalParcelLength = parseNumber(parcelLength);
    const finalParcelWidth = parseNumber(parcelWidth);
    const finalParcelHeight = parseNumber(parcelHeight);
    const finalVolumetricWeight = parseNumber(volumetricWeight);
    const finalCargoValue = parseNumber(cargoValue);

    const formData: ParcelFormData = {
      bookingType: 'Parcel',
      origin,
      destination,
      readyDate: readyDate ? readyDate.toISOString().split('T')[0] : '',
      isDomestic: isDomestic as boolean,
      courierMode: courierMode as 'DOC' | 'NON',
      parcelCount: finalParcelCount as number,
      totalWeight: finalTotalWeight as number,
      cargoType,
      parcelLength: finalParcelLength as number,
      parcelWidth: finalParcelWidth as number,
      parcelHeight: finalParcelHeight as number,
      volumetricWeight: finalVolumetricWeight as number,
      cargoValue: finalCargoValue as number, // Ensure it's a number
      hazardousCargo,
      insuranceRequired,
      specialInstructions: specialInstructions || undefined,
      // Dimensions in ParcelFormData is a string, combine from individual dimensions or use existing
      dimensions: dimensions || `${finalParcelLength}x${finalParcelWidth}x${finalParcelHeight}`,
    };

    setSuccessMessage('Parcel Freight quote data collected successfully.');
    setShowSuccessMessage(true);
    return formData;
  };

  // Reset logic (can be called internally or externally via ref)
  const resetForm = () => {
    setOrigin('');
    setDestination('');
    setReadyDate(null);
    setIsDomestic('');
    setCourierMode('');
    setParcelCount('');
    setTotalWeight('');
    setCargoType('');
    setParcelLength('');
    setParcelWidth('');
    setParcelHeight('');
    setVolumetricWeight('');
    setCargoValue('');
    setHazardousCargo(false);
    setInsuranceRequired(false);
    setSpecialInstructions('');
    setDimensions(''); // Reset dimensions state
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
    <div className="space-y-8 p-8 bg-white rounded-2xl shadow-xl border border-gray-100 font-inter">
      <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">Parcel Quote Details</h2>

      {/* Domestic/International Selection - Pill-like buttons */}
      <div className="mb-6">
        <label className="block text-xl font-semibold text-gray-800 mb-3">Is this a Domestic or International shipment?<span className="text-red-500">*</span></label>
        <div className="flex flex-col sm:flex-row gap-4">
          <label
            className={`flex items-center justify-center flex-1 py-3 px-6 rounded-full cursor-pointer transition-all duration-300 ease-in-out
                        ${isDomestic === true ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'}
                        ${errors.isDomestic ? 'border-orange-500 ring-orange-500 ring-2' : ''}`}
          >
            <input
              type="radio"
              name="isDomestic"
              value="true"
              checked={isDomestic === true}
              onChange={() => { setIsDomestic(true); setErrors((prev) => ({ ...prev, isDomestic: undefined })); }}
              className="hidden"
            />
            <FaGlobe className="mr-2 text-lg" /> <span className="text-base font-medium">Domestic</span>
          </label>
          <label
            className={`flex items-center justify-center flex-1 py-3 px-6 rounded-full cursor-pointer transition-all duration-300 ease-in-out
                        ${isDomestic === false ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'}
                        ${errors.isDomestic ? 'border-orange-500 ring-orange-500 ring-2' : ''}`}
          >
            <input
              type="radio"
              name="isDomestic"
              value="false"
              checked={isDomestic === false}
              onChange={() => { setIsDomestic(false); setErrors((prev) => ({ ...prev, isDomestic: undefined })); }}
              className="hidden"
            />
            <FaGlobe className="mr-2 text-lg" /> <span className="text-base font-medium">International</span>
          </label>
        </div>
        {errors.isDomestic && <p className="mt-2 text-sm text-orange-600">{errors.isDomestic}</p>}
      </div>

      {/* Courier Mode Selection - Classic Radio Buttons (conditional on isDomestic) */}
      {isDomestic !== '' && (
        <div className="mb-6">
          <label className="block text-xl font-semibold text-gray-800 mb-3">Choose your Courier Mode<span className="text-red-500">*</span></label>
          <div className={`flex flex-col sm:flex-row gap-4 ${errors.courierMode ? 'border-2 border-orange-500 rounded-lg p-3' : ''}`}> {/* Added border for error state around the group */}
            <label className="inline-flex items-center cursor-pointer text-gray-700 hover:text-blue-600 transition-colors duration-200">
              <input
                type="radio"
                name="courierMode"
                value="DOC"
                checked={courierMode === 'DOC'}
                onChange={() => { setCourierMode('DOC'); setErrors((prev) => ({ ...prev, courierMode: undefined })); }}
                className="form-radio h-5 w-5 text-blue-600 border-gray-300 focus:ring-blue-500 transition-colors duration-200"
              />
              <FaBook className="ml-3 mr-2 text-lg text-gray-600" /> <span className="text-base font-medium">Document</span>
            </label>
            <label className="inline-flex items-center cursor-pointer text-gray-700 hover:text-blue-600 transition-colors duration-200">
              <input
                type="radio"
                name="courierMode"
                value="NON"
                checked={courierMode === 'NON'}
                onChange={() => { setCourierMode('NON'); setErrors((prev) => ({ ...prev, courierMode: undefined })); }}
                className="form-radio h-5 w-5 text-blue-600 border-gray-300 focus:ring-blue-500 transition-colors duration-200"
              />
              <FaBoxes className="ml-3 mr-2 text-lg text-gray-600" /> <span className="text-base font-medium">Non Document</span>
            </label>
          </div>
          {errors.courierMode && <p className="mt-2 text-sm text-orange-600">{errors.courierMode}</p>}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
        {/* Origin */}
        <div>
          <label htmlFor="parcelOrigin" className="block text-base font-medium text-gray-700 mb-2">Origin Address/City<span className="text-red-500">*</span></label>
          <div className="relative rounded-lg shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FaMapMarkerAlt className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="parcelOrigin"
              className={`focus:ring-blue-500 focus:border-blue-500 block w-full pl-12 pr-4 py-3 sm:text-base border-gray-300 rounded-lg transition-all duration-200 ease-in-out ${errors.origin ? 'border-orange-500' : ''}`}
              placeholder="e.g., Your home, Delhi"
              value={origin}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setOrigin(e.target.value); setErrors((prev) => ({ ...prev, origin: undefined })); }}
              required
            />
          </div>
          {errors.origin && <p className="mt-1 text-sm text-orange-600">{errors.origin}</p>}
        </div>

        {/* Destination */}
        <div>
          <label htmlFor="parcelDestination" className="block text-base font-medium text-gray-700 mb-2">Destination Address/City<span className="text-red-500">*</span></label>
          <div className="relative rounded-lg shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FaMapMarkerAlt className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="parcelDestination"
              className={`focus:ring-blue-500 focus:border-blue-500 block w-full pl-12 pr-4 py-3 sm:text-base border-gray-300 rounded-lg transition-all duration-200 ease-in-out ${errors.destination ? 'border-orange-500' : ''}`}
              placeholder="e.g., Recipient's office, Bangalore"
              value={destination}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setDestination(e.target.value); setErrors((prev) => ({ ...prev, destination: undefined })); }}
              required
            />
          </div>
          {errors.destination && <p className="mt-1 text-sm text-orange-600">{errors.destination}</p>}
        </div>

        {/* Ready Date */}
        <div>
          <label htmlFor="parcelReadyDate" className="block text-base font-medium text-gray-700 mb-2">Ready Date<span className="text-red-500">*</span></label>
          <div className="relative rounded-lg shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FaCalendarAlt className="h-5 w-5 text-gray-400" />
            </div>
            <DatePicker
              selected={readyDate}
              onChange={(date: Date | null) => {
                setReadyDate(date);
                setErrors((prev) => ({ ...prev, readyDate: undefined }));
              }}
              dateFormat="dd-MM-yyyy"
              placeholderText="DD-MM-YYYY"
              className={`focus:ring-blue-500 focus:border-blue-500 block w-full pl-12 pr-4 py-3 sm:text-base border-gray-300 rounded-lg transition-all duration-200 ease-in-out ${errors.readyDate ? 'border-orange-500' : ''}`}
              required
            />
          </div>
          {errors.readyDate && <p className="mt-1 text-sm text-orange-600">{errors.readyDate}</p>}
        </div>

        {/* Parcel Count */}
        <div>
          <label htmlFor="parcelCount" className="block text-base font-medium text-gray-700 mb-2">Number of Parcels<span className="text-red-500">*</span></label>
          <div className="relative rounded-lg shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FaFileInvoice className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text" // Changed to text for handleNumericChange
              id="parcelCount"
              className={`focus:ring-blue-500 focus:border-blue-500 block w-full pl-12 pr-4 py-3 sm:text-base border-gray-300 rounded-lg transition-all duration-200 ease-in-out ${errors.parcelCount ? 'border-orange-500' : ''}`}
              placeholder="e.g., 1"
              value={parcelCount}
              onChange={handleNumericChange(setParcelCount, 'parcelCount')}
              required
            />
          </div>
          {errors.parcelCount && <p className="mt-1 text-sm text-orange-600">{errors.parcelCount}</p>}
        </div>

        {/* Total Weight */}
        <div>
          <label htmlFor="parcelTotalWeight" className="block text-base font-medium text-gray-700 mb-2">Total Weight (KG)<span className="text-red-500">*</span></label>
          <div className="relative rounded-lg shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FaWeight className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text" // Changed to text for handleNumericChange
              id="parcelTotalWeight"
              className={`focus:ring-blue-500 focus:border-blue-500 block w-full pl-12 pr-4 py-3 sm:text-base border-gray-300 rounded-lg transition-all duration-200 ease-in-out ${errors.totalWeight ? 'border-orange-500' : ''}`}
              placeholder="e.g., 5"
              value={totalWeight}
              onChange={handleNumericChange(setTotalWeight, 'totalWeight')}
              required
            />
          </div>
          {errors.totalWeight && <p className="mt-1 text-sm text-orange-600">{errors.totalWeight}</p>}
        </div>

        {/* Cargo Type */}
        <div>
          <label htmlFor="parcelCargoType" className="block text-base font-medium text-gray-700 mb-2">Cargo Type<span className="text-red-500">*</span></label>
          <div className="relative rounded-lg shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FaBox className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="parcelCargoType"
              className={`focus:ring-blue-500 focus:border-blue-500 block w-full pl-12 pr-4 py-3 sm:text-base border-gray-300 rounded-lg transition-all duration-200 ease-in-out ${errors.cargoType ? 'border-orange-500' : ''}`}
              placeholder="e.g., Documents, Small Electronics"
              value={cargoType}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setCargoType(e.target.value); setErrors((prev) => ({ ...prev, cargoType: undefined })); }}
              required
            />
          </div>
          {errors.cargoType && <p className="mt-1 text-sm text-orange-600">{errors.cargoType}</p>}
        </div>

        {/* Parcel Length */}
        <div>
          <label htmlFor="parcelLength" className="block text-base font-medium text-gray-700 mb-2">Length (CM)<span className="text-red-500">*</span></label>
          <div className="relative rounded-lg shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FaRulerCombined className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text" // Changed to text for handleNumericChange
              id="parcelLength"
              className={`focus:ring-blue-500 focus:border-blue-500 block w-full pl-12 pr-4 py-3 sm:text-base border-gray-300 rounded-lg transition-all duration-200 ease-in-out ${errors.parcelLength ? 'border-orange-500' : ''}`}
              placeholder="e.g., 30"
              value={parcelLength}
              onChange={handleNumericChange(setParcelLength, 'parcelLength')}
              required
            />
          </div>
          {errors.parcelLength && <p className="mt-1 text-sm text-orange-600">{errors.parcelLength}</p>}
        </div>

        {/* Parcel Width */}
        <div>
          <label htmlFor="parcelWidth" className="block text-base font-medium text-gray-700 mb-2">Width (CM)<span className="text-red-500">*</span></label>
          <div className="relative rounded-lg shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FaRulerCombined className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text" // Changed to text for handleNumericChange
              id="parcelWidth"
              className={`focus:ring-blue-500 focus:border-blue-500 block w-full pl-12 pr-4 py-3 sm:text-base border-gray-300 rounded-lg transition-all duration-200 ease-in-out ${errors.parcelWidth ? 'border-orange-500' : ''}`}
              placeholder="e.g., 20"
              value={parcelWidth}
              onChange={handleNumericChange(setParcelWidth, 'parcelWidth')}
              required
            />
          </div>
          {errors.parcelWidth && <p className="mt-1 text-sm text-orange-600">{errors.parcelWidth}</p>}
        </div>

        {/* Parcel Height */}
        <div>
          <label htmlFor="parcelHeight" className="block text-base font-medium text-gray-700 mb-2">Height (CM)<span className="text-red-500">*</span></label>
          <div className="relative rounded-lg shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FaRulerCombined className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text" // Changed to text for handleNumericChange
              id="parcelHeight"
              className={`focus:ring-blue-500 focus:border-blue-500 block w-full pl-12 pr-4 py-3 sm:text-base border-gray-300 rounded-lg transition-all duration-200 ease-in-out ${errors.parcelHeight ? 'border-orange-500' : ''}`}
              placeholder="e.g., 15"
              value={parcelHeight}
              onChange={handleNumericChange(setParcelHeight, 'parcelHeight')}
              required
            />
          </div>
          {errors.parcelHeight && <p className="mt-1 text-sm text-orange-600">{errors.parcelHeight}</p>}
        </div>

        {/* Volumetric Weight */}
        <div>
          <label htmlFor="volumetricWeight" className="block text-base font-medium text-gray-700 mb-2">Volumetric Weight (KG)<span className="text-red-500">*</span></label>
          <div className="relative rounded-lg shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FaWeight className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text" // Changed to text for handleNumericChange
              id="volumetricWeight"
              className={`focus:ring-blue-500 focus:border-blue-500 block w-full pl-12 pr-4 py-3 sm:text-base border-gray-300 rounded-lg transition-all duration-200 ease-in-out ${errors.volumetricWeight ? 'border-orange-500' : ''}`}
              placeholder="e.g., 2.5"
              value={volumetricWeight}
              onChange={handleNumericChange(setVolumetricWeight, 'volumetricWeight')}
              required
            />
          </div>
          {errors.volumetricWeight && <p className="mt-1 text-sm text-orange-600">{errors.volumetricWeight}</p>}
        </div>

        {/* Cargo Value */}
        <div>
          <label htmlFor="parcelCargoValue" className="block text-base font-medium text-gray-700 mb-2">Cargo Value (INR)<span className="text-red-500">*</span></label>
          <div className="relative rounded-lg shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FaDollarSign className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text" // Changed to text for handleNumericChange
              id="parcelCargoValue"
              className={`focus:ring-blue-500 focus:border-blue-500 block w-full pl-12 pr-4 py-3 sm:text-base border-gray-300 rounded-lg transition-all duration-200 ease-in-out ${errors.cargoValue ? 'border-orange-500' : ''}`}
              placeholder="e.g., 1000"
              value={cargoValue}
              onChange={handleNumericChange(setCargoValue, 'cargoValue')}
              required
            />
          </div>
          {errors.cargoValue && <p className="mt-1 text-sm text-orange-600">{errors.cargoValue}</p>}
        </div>

        {/* Hazardous Cargo */}
        <div className="flex items-center mt-6 col-span-1 md:col-span-2 lg:col-span-3">
          <input
            type="checkbox"
            id="parcelHazardousCargo"
            checked={hazardousCargo}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setHazardousCargo(e.target.checked)}
            className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="parcelHazardousCargo" className="ml-3 block text-base text-gray-900">
            Hazardous Cargo
          </label>
        </div>

        {/* Insurance Required */}
        <div className="flex items-center mt-6 col-span-1 md:col-span-2 lg:col-span-3">
          <input
            type="checkbox"
            id="parcelInsuranceRequired"
            checked={insuranceRequired}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInsuranceRequired(e.target.checked)}
            className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="parcelInsuranceRequired" className="ml-3 block text-base text-gray-900">
            Insurance Required
          </label>
        </div>
      </div>

      {/* Special Instructions - always full width */}
      <div className="col-span-full mt-6">
        <label htmlFor="parcelSpecialInstructions" className="block text-base font-medium text-gray-700 mb-2">Special Instructions (Optional)</label>
        <textarea
          id="parcelSpecialInstructions"
          rows={4}
          className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-base border-gray-300 rounded-lg p-3 transition-all duration-200 ease-in-out"
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

export default ParcelQuoteForm;
