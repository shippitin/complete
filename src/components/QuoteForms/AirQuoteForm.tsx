// src/components/QuoteForms/AirQuoteForm.tsx
import React, { useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaMapMarkerAlt, FaCalendarAlt, FaWeight, FaPlane, FaBox, FaInfoCircle, FaBoxes, FaTag, FaTimesCircle, FaCheckCircle } from 'react-icons/fa';
import type { AirFormData, QuoteFormHandle, ParsedVoiceCommand, AllFormData } from '../../types/QuoteFormHandle';
import { parseNumber } from '../../utils/parseNumber';

// Define the allowed activity types for validation and state
type ActivityTypeLiteral = 'Airport to Airport' | 'Airport to Door' | 'Door to Airport' | 'Door to Door';
const validActivityTypes: ActivityTypeLiteral[] = ['Airport to Airport', 'Airport to Door', 'Door to Airport', 'Door to Door'];

// Dummy data for Commodity Category and Commodity
const commodityCategories = [
  { label: 'General Cargo', value: 'General Cargo' },
  { label: 'Perishable Goods', value: 'Perishable Goods' },
  { label: 'Hazardous Materials', value: 'Hazardous Materials' },
  { label: 'Live Animals', value: 'Live Animals' },
];

const commodities: { [key: string]: { label: string; value: string }[] } = {
  'General Cargo': [
    { label: 'Electronics', value: 'Electronics' },
    { label: 'Textiles', value: 'Textiles' },
    { label: 'Machinery Parts', value: 'Machinery Parts' },
  ],
  'Perishable Goods': [
    { label: 'Fruits & Vegetables', value: 'Fruits & Vegetables' },
    { label: 'Flowers', 'value': 'Flowers' },
    { label: 'Pharmaceuticals', value: 'Pharmaceuticals' },
  ],
  'Hazardous Materials': [
    { label: 'Chemicals', value: 'Chemicals' },
    { label: 'Batteries', value: 'Batteries' },
  ],
  'Live Animals': [
    { label: 'Pets', value: 'Pets' },
    { label: 'Livestock', value: 'Livestock' },
  ],
};

// Dummy HSN Codes for demonstration
const hsnCodes = [
  { label: '8517 - Telephones', value: '8517' },
  { label: '6103 - Men\'s suits, ensembles', value: '6103' },
  { label: '3004 - Medicaments', 'value': '3004' },
  { label: 'Select HSN Code', value: '' } // Added a default empty option for HSN
];


interface AirQuoteFormProps {
  prefillData?: ParsedVoiceCommand;
  showButtons?: boolean; // Added showButtons prop
}

const AirQuoteForm = forwardRef<QuoteFormHandle, AirQuoteFormProps>(({ prefillData, showButtons = true }, ref) => {
  // State variables
  const [originAirport, setOriginAirport] = useState('');
  // Consolidated field for Origin City/Address for Door services
  const [originDoorCombined, setOriginDoorCombined] = useState('');
  // Individual fields for internal logic/data mapping, not directly for UI input in consolidated view
  const [originCity, setOriginCity] = useState('');
  const [originAddress, setOriginAddress] = useState('');

  const [destinationAirport, setDestinationAirport] = useState('');
  // Consolidated field for Destination City/Address for Door services
  const [destinationDoorCombined, setDestinationDoorCombined] = useState('');
  // Individual fields for internal logic/data mapping
  const [destinationCity, setDestinationCity] = useState('');
  const [destinationAddress, setDestinationAddress] = useState('');

  const [readyDate, setReadyDate] = useState<Date | null>(null);
  const [totalWeight, setTotalWeight] = useState<number | ''>('');
  const [dimensions, setDimensions] = useState(''); // Not currently used in AirFormData, but kept for potential future use
  const [volumeWeight, setVolumeWeight] = useState<number | ''>('');
  const [numberOfPieces, setNumberOfPieces] = useState<number | ''>('');
  const [commodityCategory, setCommodityCategory] = useState('');
  const [commodity, setCommodity] = useState('');
  const [hsnCode, setHsnCode] = useState('');
  const [hazardousCargo, setHazardousCargo] = useState(false);
  const [insuranceRequired, setInsuranceRequired] = useState(false);
  const [activityType, setActivityType] = useState<ActivityTypeLiteral | ''>('');

  // State for validation errors
  const [errors, setErrors] = useState<Partial<Record<keyof AirFormData, string>>>({});
  // State for custom validation message box
  const [showValidationMessage, setShowValidationMessage] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');
  // State for success message
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');


  // Reset all relevant fields when activity type changes
  const resetFieldsForActivityTypeChange = (newActivityType: ActivityTypeLiteral | '') => {
    setOriginAirport('');
    setOriginDoorCombined('');
    setOriginCity(''); // Clear individual fields too
    setOriginAddress(''); // Clear individual fields too

    setDestinationAirport('');
    setDestinationDoorCombined('');
    setDestinationCity(''); // Clear individual fields too
    setDestinationAddress(''); // Corrected: setDestinationAddress

    setReadyDate(null);
    setTotalWeight('');
    setDimensions('');
    setVolumeWeight('');
    setNumberOfPieces('');
    setCommodityCategory('');
    setCommodity('');
    setHsnCode('');
    setHazardousCargo(false);
    setInsuranceRequired(false);
    setErrors({}); // Clear errors
    setShowValidationMessage(false); // Clear message states
    setValidationMessage('');
    setShowSuccessMessage(false);
    setSuccessMessage('');
  };

  // Prefill data effect
  useEffect(() => {
    if (prefillData) {
      const parsedActivityType = prefillData.activityType && validActivityTypes.includes(prefillData.activityType as ActivityTypeLiteral)
        ? (prefillData.activityType as ActivityTypeLiteral)
        : '';
      setActivityType(parsedActivityType);

      // Prefill origin fields based on activity type
      if (parsedActivityType === 'Door to Airport' || parsedActivityType === 'Door to Door') {
        const combinedOrigin = [prefillData.originCity, prefillData.originAddress].filter(Boolean).join(', ');
        setOriginDoorCombined(combinedOrigin || prefillData.origin || ''); // Use combined or general origin
        setOriginAirport(prefillData.originAirport || ''); // Use originAirport
        // Clear individual city/address as they are consolidated in UI
        setOriginCity('');
        setOriginAddress('');
      } else { // Airport to Airport or Airport to Door
        setOriginAirport(prefillData.origin || prefillData.originAirport || '');
        setOriginDoorCombined(''); // Clear consolidated field
        setOriginCity('');
        setOriginAddress('');
      }

      // Prefill destination fields based on activity type
      if (parsedActivityType === 'Airport to Door' || parsedActivityType === 'Door to Door') {
        const combinedDestination = [prefillData.destinationCity, prefillData.destinationAddress].filter(Boolean).join(', ');
        setDestinationDoorCombined(combinedDestination || prefillData.destination || ''); // Use combined or general destination
        setDestinationAirport(prefillData.destinationAirport || ''); // Use destinationAirport
        // Clear individual city/address as they are consolidated in UI
        setDestinationCity('');
        setDestinationAddress(''); // Corrected: setDestinationAddress
      } else { // Airport to Airport or Door to Airport
        setDestinationAirport(prefillData.destination || prefillData.destinationAirport || '');
        setDestinationDoorCombined(''); // Clear consolidated field
        setDestinationCity('');
        setDestinationAddress(''); // Corrected: setDestinationAddress
      }

      setReadyDate(prefillData.readyDate ? new Date(prefillData.readyDate) : null);

      setTotalWeight(parseNumber(prefillData.cargoWeight) ?? '');
      setDimensions(prefillData.cargoDimensions || '');
      setVolumeWeight(parseNumber(prefillData.volumetricWeight) ?? '');
      setNumberOfPieces(parseNumber(prefillData.numberOfPieces) ?? '');
      setCommodityCategory(prefillData.commodityCategory || '');
      setCommodity(prefillData.commodity || prefillData.cargoType || ''); // Use commodity or cargoType
      setHsnCode(prefillData.hsnCode || '');

      setHazardousCargo(prefillData.hazardousCargo || false);
      setInsuranceRequired(prefillData.insuranceRequired || false);
    }
  }, [prefillData]);


  const handleSubmitLogic = (): AllFormData | null => { // Moved function definition outside useImperativeHandle
    const newErrors: Partial<Record<keyof AirFormData, string>> = {};

    if (!activityType) newErrors.activityType = 'Activity Type is required.';
    if (!readyDate) newErrors.readyDate = 'Clearance Date is required.';

    // Conditional validation for origin fields
    if (activityType === 'Airport to Airport' || activityType === 'Airport to Door') {
      if (!originAirport) newErrors.originAirport = 'Origin Airport is required.';
    } else if (activityType === 'Door to Airport' || activityType === 'Door to Door') {
      if (!originDoorCombined) newErrors.originCity = 'Origin (City/Address) is required.'; // Use originCity error key for combined field
      if (!originAirport) newErrors.originAirport = 'Origin Airport is required.';
    }

    // Conditional validation for destination fields
    if (activityType === 'Airport to Airport' || activityType === 'Door to Airport') {
      if (!destinationAirport) newErrors.destinationAirport = 'Destination Airport is required.';
    } else if (activityType === 'Airport to Door' || activityType === 'Door to Door') {
      if (!destinationAirport) newErrors.destinationAirport = 'Destination Airport is required.';
      if (!destinationDoorCombined) newErrors.destinationCity = 'Destination (City/Address) is required.'; // Use destinationCity error key for combined field
    }


    const finalTotalWeight = parseNumber(totalWeight);
    if (finalTotalWeight === undefined || finalTotalWeight <= 0) newErrors.totalWeight = 'Gross Weight is required and must be greater than 0.';

    const finalNumberOfPieces = parseNumber(numberOfPieces);
    if (finalNumberOfPieces === undefined || finalNumberOfPieces <= 0) newErrors.numberOfPieces = 'No. of Pieces is required and must be greater than 0.';

    const finalVolumeWeight = parseNumber(volumeWeight);
    if (finalVolumeWeight === undefined || finalVolumeWeight <= 0) newErrors.volumeWeight = 'Volume Weight is required and must be greater than 0.';

    if (!commodityCategory) newErrors.commodityCategory = 'Commodity Category is required.';
    if (!commodity) newErrors.commodity = 'Commodity is required.';

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      setValidationMessage('Please fill in all required fields correctly.');
      setShowValidationMessage(true);
      return null;
    }

    // Construct formData
    const formData: AirFormData = {
      bookingType: 'Air',
      destinationAirport, // Always present
      readyDate: readyDate ? readyDate.toISOString().split('T')[0] : '',
      activityType: activityType as ActivityTypeLiteral,
      totalWeight: finalTotalWeight as number,
      numberOfPieces: finalNumberOfPieces as number,
      volumeWeight: finalVolumeWeight as number,
      commodityCategory,
      commodity,
      cargoType: commodity, // Corrected: Map commodity to cargoType as required by AirFormData
      hsCode: hsnCode || undefined, // Corrected: hsnCode to hsCode
      hazardousCargo,
      insuranceRequired,
      dimensions: dimensions || undefined, // Include dimensions if present
      // Initialize other optional fields to undefined
      originAirport: undefined,
      originCity: undefined,
      originAddress: undefined,
      destinationCity: undefined,
      destinationAddress: undefined,
      cargoValue: undefined, // Now explicitly part of AirFormData, but not set by UI
      specialInstructions: undefined, // Not in UI, but part of type
    };

    // Conditionally add origin fields based on activity type
    if (activityType === 'Airport to Airport' || activityType === 'Airport to Door') {
      formData.originAirport = originAirport;
      // Ensure city/address fields are undefined if not used for this activity type
      formData.originCity = undefined;
      formData.originAddress = undefined;
    } else if (activityType === 'Door to Airport' || activityType === 'Door to Door') {
      formData.originCity = originDoorCombined; // Store consolidated input here
      formData.originAirport = originAirport; // Keep airport separate
      // Ensure address field is undefined as it's part of consolidated city
      formData.originAddress = undefined;
    }

    // Conditionally add destination fields for door services
    if (activityType === 'Airport to Door' || activityType === 'Door to Door') {
      formData.destinationCity = destinationDoorCombined; // Store consolidated input here
      // Ensure address field is undefined as it's part of consolidated city
      formData.destinationAddress = undefined;
    } else {
      // Ensure city/address fields are undefined if not used for this activity type
      formData.destinationCity = undefined;
      formData.destinationAddress = undefined;
    }

    setSuccessMessage('Air Freight quote data collected successfully.');
    setShowSuccessMessage(true);
    return formData;
  };

  // Reset logic (can be called internally or externally via ref)
  const resetForm = () => { // Moved function definition outside useImperativeHandle
    // Reset all state variables
    setOriginAirport('');
    setOriginDoorCombined('');
    setOriginCity('');
    setOriginAddress('');
    setDestinationAirport('');
    setDestinationDoorCombined('');
    setDestinationCity('');
    setDestinationAddress(''); // Corrected: setDestinationAddress
    setReadyDate(null);
    setTotalWeight('');
    setDimensions('');
    setVolumeWeight('');
    setNumberOfPieces('');
    setCommodityCategory('');
    setCommodity('');
    setHsnCode('');
    setHazardousCargo(false);
    setInsuranceRequired(false);
    setActivityType('');
    setErrors({}); // Clear errors
    setShowValidationMessage(false); // Clear message states
    setValidationMessage('');
    setShowSuccessMessage(false);
    setSuccessMessage('');
  };

  useImperativeHandle(ref, () => ({
    submit: handleSubmitLogic, // Directly reference the function
    reset: resetForm,         // Directly reference the function
  }));

  return (
    <div className="space-y-4 p-5 bg-white rounded-xl shadow-md border border-gray-200 font-inter">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Air Freight</h2>

      {/* Activity Type Selection as Buttons */}
      <div className="mb-4">
        <div className={`grid grid-cols-2 sm:grid-cols-4 gap-2 ${errors.activityType ? 'border-2 border-orange-500 rounded-lg p-1' : ''}`}>
          {validActivityTypes.map((type: ActivityTypeLiteral) => (
            <button
              key={type}
              type="button"
              onClick={() => {
                setActivityType(type);
                resetFieldsForActivityTypeChange(type); // Reset fields when activity type changes
                setErrors((prev) => ({ ...prev, activityType: undefined }));
              }}
              className={`flex items-center justify-center px-3 py-1.5 rounded-lg text-sm font-medium text-center transition-all duration-200 ease-in-out ${activityType === type ? 'bg-blue-100 text-blue-800 shadow-sm border border-blue-200' : 'bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-600 border border-gray-300'}`}
            >
              {type} {/* Display the full activity type name */}
            </button>
          ))}
        </div>
        {errors.activityType && <p className="mt-1 text-sm text-orange-600">{errors.activityType}</p>}
      </div>

      {/* Render the dynamically selected origin/destination fields */}
      {activityType === 'Airport to Airport' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4 mb-4">
          {/* Origin Airport */}
          <div>
            <label htmlFor="originAirport" className="block text-sm font-medium text-gray-700 mb-1">Origin Airport<span className="text-red-500">*</span></label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-0 flex items-center pointer-events-none">
                <FaMapMarkerAlt className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="originAirport"
                className={`block w-full pl-8 pr-3 py-2 sm:text-sm bg-transparent border-0 border-b border-gray-300 focus:ring-0 focus:border-blue-500 ${errors.originAirport ? 'border-orange-500' : ''}`}
                placeholder="e.g., BOM, Mumbai (India)"
                value={originAirport}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setOriginAirport(e.target.value); setErrors((prev) => ({ ...prev, originAirport: undefined })); }}
                required
              />
            </div>
            {errors.originAirport && <p className="mt-1 text-sm text-orange-600">{errors.originAirport}</p>}
          </div>

          {/* Destination Airport */}
          <div>
            <label htmlFor="destinationAirport" className="block text-sm font-medium text-gray-700 mb-1">Destination Airport<span className="text-red-500">*</span></label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-0 flex items-center pointer-events-none">
                <FaMapMarkerAlt className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="destinationAirport"
                className={`block w-full pl-8 pr-3 py-2 sm:text-sm bg-transparent border-0 border-b border-gray-300 focus:ring-0 focus:border-blue-500 ${errors.destinationAirport ? 'border-orange-500' : ''}`}
                placeholder="e.g., JFK, New York (USA)"
                value={destinationAirport}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setDestinationAirport(e.target.value); setErrors((prev) => ({ ...prev, destinationAirport: undefined })); }}
                required
              />
            </div>
            {errors.destinationAirport && <p className="mt-1 text-sm text-orange-600">{errors.destinationAirport}</p>}
          </div>

          {/* Clearance Date */}
          <div>
            <label htmlFor="readyDate" className="block text-sm font-medium text-gray-700 mb-1">Clearance Date<span className="text-red-500">*</span></label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-0 flex items-center pointer-events-none">
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
                className={`block w-full pl-8 pr-3 py-2 sm:text-sm bg-transparent border-0 border-b border-gray-300 focus:ring-0 focus:border-blue-500 ${errors.readyDate ? 'border-orange-500' : ''}`}
                required
              />
            </div>
            {errors.readyDate && <p className="mt-1 text-sm text-orange-600">{errors.readyDate}</p>}
          </div>
        </div>
      )}

      {activityType === 'Airport to Door' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-4 mb-4">
            {/* Origin Airport */}
            <div>
              <label htmlFor="originAirport" className="block text-sm font-medium text-gray-700 mb-1">Origin Airport<span className="text-red-500">*</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-0 flex items-center pointer-events-none">
                  <FaMapMarkerAlt className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="originAirport"
                  className={`block w-full pl-8 pr-3 py-2 sm:text-sm bg-transparent border-0 border-b border-gray-300 focus:ring-0 focus:border-blue-500 ${errors.originAirport ? 'border-orange-500' : ''}`}
                  placeholder="e.g., BOM, Mumbai (India)"
                  value={originAirport}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setOriginAirport(e.target.value); setErrors((prev) => ({ ...prev, originAirport: undefined })); }}
                  required
                />
              </div>
              {errors.originAirport && <p className="mt-1 text-sm text-orange-600">{errors.originAirport}</p>}
            </div>

            {/* Destination (City/Address) */}
            <div>
              <label htmlFor="destinationDoorCombined" className="block text-sm font-medium text-gray-700 mb-1">Destination (City/Address)<span className="text-red-500">*</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-0 flex items-center pointer-events-none">
                  <FaMapMarkerAlt className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="destinationDoorCombined"
                  className={`block w-full pl-8 pr-3 py-2 sm:text-sm bg-transparent border-0 border-b border-gray-300 focus:ring-0 focus:border-blue-500 ${errors.destinationCity ? 'border-orange-500' : ''}`}
                  placeholder="e.g., New York, 123 Main St"
                  value={destinationDoorCombined}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setDestinationDoorCombined(e.target.value); setErrors((prev) => ({ ...prev, destinationCity: undefined })); }}
                  required
                />
              </div>
              {errors.destinationCity && <p className="mt-1 text-sm text-orange-600">{errors.destinationCity}</p>}
            </div>

            {/* Destination Airport */}
            <div>
              <label htmlFor="destinationAirport" className="block text-sm font-medium text-gray-700 mb-1">Destination Airport<span className="text-red-500">*</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-0 flex items-center pointer-events-none">
                  <FaMapMarkerAlt className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="destinationAirport"
                  className={`block w-full pl-8 pr-3 py-2 sm:text-sm bg-transparent border-0 border-b border-gray-300 focus:ring-0 focus:border-blue-500 ${errors.destinationAirport ? 'border-orange-500' : ''}`}
                  placeholder="e.g., JFK, New York (USA)"
                  value={destinationAirport}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setDestinationAirport(e.target.value); setErrors((prev) => ({ ...prev, destinationAirport: undefined })); }}
                  required
                />
              </div>
              {errors.destinationAirport && <p className="mt-1 text-sm text-orange-600">{errors.destinationAirport}</p>}
            </div>

            {/* Clearance Date */}
            <div>
              <label htmlFor="readyDate" className="block text-sm font-medium text-gray-700 mb-1">Clearance Date<span className="text-red-500">*</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-0 flex items-center pointer-events-none">
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
                  className={`block w-full pl-8 pr-3 py-2 sm:text-sm bg-transparent border-0 border-b border-gray-300 focus:ring-0 focus:border-blue-500 ${errors.readyDate ? 'border-orange-500' : ''}`}
                  required
                />
              </div>
              {errors.readyDate && <p className="mt-1 text-sm text-orange-600">{errors.readyDate}</p>}
            </div>
          </div>
        </>
      )}

      {activityType === 'Door to Airport' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-4 mb-4">
            {/* Origin (City/Address) */}
            <div>
              <label htmlFor="originDoorCombined" className="block text-sm font-medium text-gray-700 mb-1">Origin (City/Address)<span className="text-red-500">*</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-0 flex items-center pointer-events-none">
                  <FaMapMarkerAlt className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="originDoorCombined"
                  className={`block w-full pl-8 pr-3 py-2 sm:text-sm bg-transparent border-0 border-b border-gray-300 focus:ring-0 focus:border-blue-500 ${errors.originCity ? 'border-orange-500' : ''}`}
                  placeholder="e.g., Chennai, 123 Sample St"
                  value={originDoorCombined}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setOriginDoorCombined(e.target.value); setErrors((prev) => ({ ...prev, originCity: undefined })); }}
                  required
                />
              </div>
              {errors.originCity && <p className="mt-1 text-sm text-orange-600">{errors.originCity}</p>}
            </div>

            {/* Origin Airport */}
            <div>
              <label htmlFor="originAirport" className="block text-sm font-medium text-gray-700 mb-1">Origin Airport<span className="text-red-500">*</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-0 flex items-center pointer-events-none">
                  <FaMapMarkerAlt className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="originAirport"
                  className={`block w-full pl-8 pr-3 py-2 sm:text-sm bg-transparent border-0 border-b border-gray-300 focus:ring-0 focus:border-blue-500 ${errors.originAirport ? 'border-orange-500' : ''}`}
                  placeholder="e.g., MAA, Chennai (India)"
                  value={originAirport}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setOriginAirport(e.target.value); setErrors((prev) => ({ ...prev, originAirport: undefined })); }}
                  required
                />
              </div>
              {errors.originAirport && <p className="mt-1 text-sm text-orange-600">{errors.originAirport}</p>}
            </div>

            {/* Destination Airport */}
            <div>
              <label htmlFor="destinationAirport" className="block text-sm font-medium text-gray-700 mb-1">Destination Airport<span className="text-red-500">*</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-0 flex items-center pointer-events-none">
                  <FaMapMarkerAlt className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="destinationAirport"
                  className={`block w-full pl-8 pr-3 py-2 sm:text-sm bg-transparent border-0 border-b border-gray-300 focus:ring-0 focus:border-blue-500 ${errors.destinationAirport ? 'border-orange-500' : ''}`}
                  placeholder="e.g., JFK, New York (USA)"
                  value={destinationAirport}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setDestinationAirport(e.target.value); setErrors((prev) => ({ ...prev, destinationAirport: undefined })); }}
                  required
                />
              </div>
              {errors.destinationAirport && <p className="mt-1 text-sm text-orange-600">{errors.destinationAirport}</p>}
            </div>

            {/* Clearance Date */}
            <div>
              <label htmlFor="readyDate" className="block text-sm font-medium text-gray-700 mb-1">Clearance Date<span className="text-red-500">*</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-0 flex items-center pointer-events-none">
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
                  className={`block w-full pl-8 pr-3 py-2 sm:text-sm bg-transparent border-0 border-b border-gray-300 focus:ring-0 focus:border-blue-500 ${errors.readyDate ? 'border-orange-500' : ''}`}
                  required
                />
              </div>
              {errors.readyDate && <p className="mt-1 text-sm text-orange-600">{errors.readyDate}</p>}
            </div>
          </div>
        </>
      )}

      {activityType === 'Door to Door' && (
        <>
          {/* Row 1: Consolidated Origin, Origin Airport, Consolidated Destination, Destination Airport */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-4 mb-4">
            {/* Origin (City/Address) */}
            <div>
              <label htmlFor="originDoorCombined" className="block text-sm font-medium text-gray-700 mb-1">Origin (City/Address)<span className="text-red-500">*</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-0 flex items-center pointer-events-none">
                  <FaMapMarkerAlt className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="originDoorCombined"
                  className={`block w-full pl-8 pr-3 py-2 sm:text-sm bg-transparent border-0 border-b border-gray-300 focus:ring-0 focus:border-blue-500 ${errors.originCity ? 'border-orange-500' : ''}`}
                  placeholder="e.g., Chennai, 123 Sample St"
                  value={originDoorCombined}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setOriginDoorCombined(e.target.value); setErrors((prev) => ({ ...prev, originCity: undefined })); }}
                  required
                />
              </div>
              {errors.originCity && <p className="mt-1 text-sm text-orange-600">{errors.originCity}</p>}
            </div>

            {/* Origin Airport */}
            <div>
              <label htmlFor="originAirport" className="block text-sm font-medium text-gray-700 mb-1">Origin Airport<span className="text-red-500">*</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-0 flex items-center pointer-events-none">
                  <FaMapMarkerAlt className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="originAirport"
                  className={`block w-full pl-8 pr-3 py-2 sm:text-sm bg-transparent border-0 border-b border-gray-300 focus:ring-0 focus:border-blue-500 ${errors.originAirport ? 'border-orange-500' : ''}`}
                  placeholder="e.g., MAA, Chennai (India)"
                  value={originAirport}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setOriginAirport(e.target.value); setErrors((prev) => ({ ...prev, originAirport: undefined })); }}
                  required
                />
              </div>
              {errors.originAirport && <p className="mt-1 text-sm text-orange-600">{errors.originAirport}</p>}
            </div>

            {/* Destination (City/Address) */}
            <div>
              <label htmlFor="destinationDoorCombined" className="block text-sm font-medium text-gray-700 mb-1">Destination (City/Address)<span className="text-red-500">*</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-0 flex items-center pointer-events-none">
                  <FaMapMarkerAlt className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="destinationDoorCombined"
                  className={`block w-full pl-8 pr-3 py-2 sm:text-sm bg-transparent border-0 border-b border-gray-300 focus:ring-0 focus:border-blue-500 ${errors.destinationCity ? 'border-orange-500' : ''}`}
                  placeholder="e.g., New York, 123 Main St"
                  value={destinationDoorCombined}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setDestinationDoorCombined(e.target.value); setErrors((prev) => ({ ...prev, destinationCity: undefined })); }}
                  required
                />
              </div>
              {errors.destinationCity && <p className="mt-1 text-sm text-orange-600">{errors.destinationCity}</p>}
            </div>

            {/* Destination Airport */}
            <div>
              <label htmlFor="destinationAirport" className="block text-sm font-medium text-gray-700 mb-1">Destination Airport<span className="text-red-500">*</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-0 flex items-center pointer-events-none">
                  <FaMapMarkerAlt className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="destinationAirport"
                  className={`block w-full pl-8 pr-3 py-2 sm:text-sm bg-transparent border-0 border-b border-gray-300 focus:ring-0 focus:border-blue-500 ${errors.destinationAirport ? 'border-orange-500' : ''}`}
                  placeholder="e.g., JFK, New York (USA)"
                  value={destinationAirport}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setDestinationAirport(e.target.value); setErrors((prev) => ({ ...prev, destinationAirport: undefined })); }}
                  required
                />
              </div>
              {errors.destinationAirport && <p className="mt-1 text-sm text-orange-600">{errors.destinationAirport}</p>}
            </div>
          </div>

          {/* Row 2: Clearance Date */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-4 mb-4">
            {/* Clearance Date */}
            <div>
              <label htmlFor="readyDate" className="block text-sm font-medium text-gray-700 mb-1">Clearance Date<span className="text-red-500">*</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-0 flex items-center pointer-events-none">
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
                  className={`block w-full pl-8 pr-3 py-2 sm:text-sm bg-transparent border-0 border-b border-gray-300 focus:ring-0 focus:border-blue-500 ${errors.readyDate ? 'border-orange-500' : ''}`}
                  required
                />
              </div>
              {errors.readyDate && <p className="mt-1 text-sm text-orange-600">{errors.readyDate}</p>}
            </div>
          </div>
        </>
      )}

      {/* Gross Weight, No. of Pieces, Volume Weight - Common for all activity types */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4 mb-4">
        {/* Gross Weight */}
        <div>
          <label htmlFor="totalWeight" className="block text-sm font-medium text-gray-700 mb-1">Gross Weight (Kgs)<span className="text-red-500">*</span></label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-0 flex items-center pointer-events-none">
              <FaWeight className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="number"
              id="totalWeight"
              className={`block w-full pl-8 pr-3 py-2 sm:text-sm bg-transparent border-0 border-b border-gray-300 focus:ring-0 focus:border-blue-500 ${errors.totalWeight ? 'border-orange-500' : ''}`}
              placeholder="How much gross weight are you carrying?"
              value={totalWeight}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const value = e.target.value;
                setTotalWeight(value === '' ? '' : Number(value));
                setErrors((prev) => ({ ...prev, totalWeight: undefined }));
              }}
              required
            />
          </div>
          {errors.totalWeight && <p className="mt-1 text-sm text-orange-600">{errors.totalWeight}</p>}
        </div>

        {/* No. of Pieces */}
        <div>
          <label htmlFor="numberOfPieces" className="block text-sm font-medium text-gray-700 mb-1">No. of Pieces<span className="text-red-500">*</span></label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-0 flex items-center pointer-events-none">
              <FaBoxes className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="number"
              id="numberOfPieces"
              className={`block w-full pl-8 pr-3 py-2 sm:text-sm bg-transparent border-0 border-b border-gray-300 focus:ring-0 focus:border-blue-500 ${errors.numberOfPieces ? 'border-orange-500' : ''}`}
              placeholder="e.g., 1"
              value={numberOfPieces}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const value = e.target.value;
                setNumberOfPieces(value === '' ? '' : Number(value));
                setErrors((prev) => ({ ...prev, numberOfPieces: undefined }));
              }}
              required
            />
          </div>
          {errors.numberOfPieces && <p className="mt-1 text-sm text-orange-600">{errors.numberOfPieces}</p>}
        </div>

        {/* Volume Weight */}
        <div>
          <label htmlFor="volumeWeight" className="block text-sm font-medium text-gray-700 mb-1">Volume Weight (Kgs)<span className="text-red-500">*</span></label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-0 flex items-center pointer-events-none">
              <FaWeight className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="number"
              id="volumeWeight"
              className={`block w-full pl-8 pr-3 py-2 sm:text-sm bg-transparent border-0 border-b border-gray-300 focus:ring-0 focus:border-blue-500 ${errors.volumeWeight ? 'border-orange-500' : ''}`}
              placeholder="Volume Weight"
              value={volumeWeight}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const value = e.target.value;
                setVolumeWeight(value === '' ? '' : Number(value));
                setErrors((prev) => ({ ...prev, volumeWeight: undefined }));
              }}
              required
            />
          </div>
          {errors.volumeWeight && <p className="mt-1 text-sm text-orange-600">{errors.volumeWeight}</p>}
        </div>
      </div>

      {/* Commodity Category, Commodity, HSN Code */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4 mb-4">
        {/* Commodity Category */}
        <div>
          <label htmlFor="commodityCategory" className="block text-sm font-medium text-gray-700 mb-1">Commodity Category<span className="text-red-500">*</span></label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-0 flex items-center pointer-events-none">
              <FaTag className="h-5 w-5 text-gray-400" />
            </div>
            <select
              id="commodityCategory"
              className={`block w-full pl-8 pr-3 py-2 sm:text-sm bg-transparent border-0 border-b border-gray-300 focus:ring-0 focus:border-blue-500 ${errors.commodityCategory ? 'border-orange-500' : ''}`}
              value={commodityCategory}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                setCommodityCategory(e.target.value);
                setCommodity(''); // Reset commodity when category changes
                setErrors((prev) => ({ ...prev, commodityCategory: undefined }));
              }}
              required
            >
              <option value="">Select Category</option>
              {commodityCategories.map((cat) => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>
          {errors.commodityCategory && <p className="mt-1 text-sm text-orange-600">{errors.commodityCategory}</p>}
        </div>

        {/* Commodity */}
        <div>
          <label htmlFor="commodity" className="block text-sm font-medium text-gray-700 mb-1">Commodity<span className="text-red-500">*</span></label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-0 flex items-center pointer-events-none">
              <FaBox className="h-5 w-5 text-gray-400" />
            </div>
            <select
              id="commodity"
              className={`block w-full pl-8 pr-3 py-2 sm:text-sm bg-transparent border-0 border-b border-gray-300 focus:ring-0 focus:border-blue-500 ${errors.commodity ? 'border-orange-500' : ''}`}
              value={commodity}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                setCommodity(e.target.value);
                setErrors((prev) => ({ ...prev, commodity: undefined }));
              }}
              disabled={!commodityCategory} // Disable if no category selected
              required
            >
              <option value="">Select Commodity</option>
              {commodityCategory && commodities[commodityCategory]?.map((comm) => (
                <option key={comm.value} value={comm.value}>{comm.label}</option>
              ))}
            </select>
          </div>
          {errors.commodity && <p className="mt-1 text-sm text-orange-600">{errors.commodity}</p>}
        </div>

        {/* HSN Code (Optional) */}
        <div>
          <label htmlFor="hsnCode" className="block text-sm font-medium text-gray-700 mb-1">HSN Code (Optional)</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-0 flex items-center pointer-events-none">
              <FaInfoCircle className="h-5 w-5 text-gray-400" />
            </div>
            <select
              id="hsnCode"
              className="block w-full pl-8 pr-3 py-2 sm:text-sm bg-transparent border-0 border-b border-gray-300 focus:ring-0 focus:border-blue-500"
              value={hsnCode}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setHsnCode(e.target.value)}
            >
              {hsnCodes.map((code) => (
                <option key={code.value} value={code.value}>{code.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Hazardous Cargo & Insurance Required */}
      <div className="flex flex-wrap items-center space-x-6 mt-4">
        <div className="flex items-center mb-1 md:mb-0">
          <input
            type="checkbox"
            id="hazardousCargo"
            checked={hazardousCargo}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setHazardousCargo(e.target.checked)}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="hazardousCargo" className="ml-2 block text-sm text-gray-900">
            Hazardous Cargo
          </label>
        </div>

        <div className="flex items-center mb-1 md:mb-0">
          <input
            type="checkbox"
            id="insuranceRequired"
            checked={insuranceRequired}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInsuranceRequired(e.target.checked)}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="insuranceRequired" className="ml-2 block text-sm text-gray-900">
            Insurance Required
          </label>
        </div>
      </div>

      {/* Action Buttons - Render ONLY if showButtons prop is true */}
      {showButtons && (
        <div className="flex justify-center space-x-4 mt-8">
          <button
            type="button"
            onClick={handleSubmitLogic} // Corrected: Call handleSubmitLogic directly
            className="px-8 py-4 bg-blue-600 text-white font-bold text-xl rounded-xl shadow-lg hover:bg-blue-700 transition duration-300 transform hover:scale-105"
          >
            Search Quotes
          </button>
          <button
            type="button"
            onClick={resetForm} // Corrected: Call resetForm directly
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

export default AirQuoteForm;
