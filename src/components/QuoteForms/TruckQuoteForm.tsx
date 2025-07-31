// src/components/QuoteForms/TruckQuoteForm.tsx
import React, { useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaMapMarkerAlt, FaCalendarAlt, FaWeight, FaRulerCombined, FaTruck, FaBox, FaDollarSign, FaInfoCircle, FaBoxes, FaTag, FaTimesCircle, FaCheckCircle } from 'react-icons/fa';
import type { TruckFormData, QuoteFormHandle, ParsedVoiceCommand, AllFormData } from '../../types/QuoteFormHandle';
import { parseNumber } from '../../utils/parseNumber';

// Dummy data for Commodity
const truckCommodities = [
  { label: 'Garments', value: 'Garments' },
  { label: 'Pharmaceutical', value: 'Pharmaceutical' },
  { label: 'Engineering Goods', value: 'Engineering Goods' },
  { label: 'Auto Parts', value: 'Auto Parts' },
  { label: 'Machinery', value: 'Machinery' },
  { label: 'Handicrafts', value: 'Handicrafts' },
  { label: 'Leather Goods', value: 'Leather Goods' },
  { label: 'Carpets', value: 'Carpets' },
  { label: 'Fabric', value: 'Fabric' },
  { label: 'Other', value: 'Other' },
];

// Reverted to simpler data for Vehicle Type for dropdown
const vehicleTypes = [
  { label: 'Mini Truck - Chota Hathi', value: 'Mini Truck' },
  { label: 'Truck 19 FT', value: '19 ft Truck' },
  { label: 'Truck 14 FT', value: '14 ft Truck' },
  { label: 'Trailer 32 FT SXL', value: '32 ft SXL' },
  { label: 'Trailer 40 FT Open', value: 'Trailer' },
  { label: 'Truck 22 FT', value: '22 ft Truck' },
  { label: 'Truck 22 FT (Large)', value: '22 ft Truck (Large)' },
  { label: 'Truck Tata 407', value: 'Tata 407' },
  { label: 'Truck 6 Tyre', value: 'Truck 6 Tyre' },
  { label: 'Tata LPT BS6', value: 'Tata LPT BS6' },
  { label: 'Boss 1112 LE', value: 'Boss 1112 LE' },
];


interface TruckQuoteFormProps {
  prefillData?: ParsedVoiceCommand;
  showButtons?: boolean; // Added showButtons prop
}

const TruckQuoteForm = forwardRef<QuoteFormHandle, TruckQuoteFormProps>(({ prefillData, showButtons = true }, ref) => {
  // State variables
  const [pickupPincode, setPickupPincode] = useState('');
  const [dropoffPincode, setDropoffPincode] = useState('');
  const [readyDate, setReadyDate] = useState<Date | null>(null); // Changed to Date object for DatePicker
  const [loadType, setLoadType] = useState<'PTL' | 'FTL' | ''>(''); // New state for PTL/FTL
  const [truckType, setTruckType] = useState<TruckFormData['truckType'] | ''>(''); // Renamed from truckType to truckBodyType
  const [vehicleType, setVehicleType] = useState<TruckFormData['vehicleType'] | ''>(''); // Specific vehicle type for FTL
  const [numberOfTrucks, setNumberOfTrucks] = useState<number | ''>('');
  const [cargoType, setCargoType] = useState(''); // Commodity
  const [totalWeight, setTotalWeight] = useState<number | ''>('');
  const [dimensions, setDimensions] = useState('');
  const [cargoValue, setCargoValue] = useState<number | ''>(''); // Product Declared Value
  const [hazardousCargo, setHazardousCargo] = useState(false);
  const [insuranceRequired, setInsuranceRequired] = useState(false);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [numberOfPieces, setNumberOfPieces] = useState<number | ''>(''); // New state for No. of Pieces

  // State for validation errors
  const [errors, setErrors] = useState<Partial<Record<keyof TruckFormData, string>>>({});
  // State for custom validation message box
  const [showValidationMessage, setShowValidationMessage] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');
  // State for success message
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');


  // Prefill data effect
  useEffect(() => {
    if (prefillData) {
      setPickupPincode(prefillData.pickupPincode || prefillData.origin || ''); // Map origin to pickupPincode
      setDropoffPincode(prefillData.dropoffPincode || prefillData.destination || ''); // Map destination to dropoffPincode
      setReadyDate(prefillData.readyDate ? new Date(prefillData.readyDate) : null); // Use Date object
      setLoadType(prefillData.loadType as 'PTL' | 'FTL' || ''); // Prefill loadType
      // Explicitly cast prefillData.vehicleType to the expected type
      setVehicleType((prefillData.vehicleType || '') as TruckFormData['vehicleType'] | '');
      setNumberOfTrucks(parseNumber(prefillData.numberOfTrucks) ?? ''); // Fixed: numberOfTrucks now exists on ParsedVoiceCommand
      setCargoType(prefillData.cargoType || '');
      setTotalWeight(parseNumber(prefillData.cargoWeight) ?? ''); // Map cargoWeight to totalWeight
      setDimensions(prefillData.cargoDimensions || '');
      setCargoValue(parseNumber(prefillData.productDeclaredValue) ?? ''); // Map productDeclaredValue to cargoValue
      setHazardousCargo(prefillData.hazardousCargo || false);
      setInsuranceRequired(prefillData.insuranceRequired || false);
      setSpecialInstructions(prefillData.specialInstructions || '');
      setNumberOfPieces(parseNumber(prefillData.numberOfPieces) ?? ''); // Prefill numberOfPieces
    }
  }, [prefillData]);

  // Helper for numeric input changes
  const handleNumericChange = (setter: React.Dispatch<React.SetStateAction<number | ''>>, fieldName: keyof TruckFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setter(value === '' ? '' : parseFloat(value));
      setErrors((prev) => ({ ...prev, [fieldName]: undefined }));
    }
  };

  // Validation logic
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof TruckFormData, string>> = {};

    if (!pickupPincode) newErrors.pickupPincode = 'Pickup Pincode is required.';
    if (!dropoffPincode) newErrors.dropoffPincode = 'Drop Off Pincode is required.';
    if (!readyDate) newErrors.readyDate = 'Pickup Date is required.';
    if (!loadType) newErrors.loadType = 'Load Type (PTL/FTL) is required.';

    const currentTotalWeight = parseNumber(totalWeight); // Calculate here for validation
    if (currentTotalWeight === undefined || currentTotalWeight <= 0) newErrors.totalWeight = 'Gross Weight is required and must be greater than 0.';

    const currentNumberOfPieces = parseNumber(numberOfPieces); // Calculate here for validation
    if (currentNumberOfPieces === undefined || currentNumberOfPieces <= 0) newErrors.numberOfPieces = 'No. of Pieces is required and must be greater than 0.';

    if (!cargoType) newErrors.cargoType = 'Commodity is required.';

    const currentNumberOfTrucks = parseNumber(numberOfTrucks); // Calculate here for validation
    if (currentNumberOfTrucks === undefined || currentNumberOfTrucks <= 0) {
      newErrors.numberOfTrucks = 'Number of Trucks is required and must be greater than 0.';
    }
    // For FTL, vehicleType must be selected
    if (loadType === 'FTL' && !vehicleType) {
      newErrors.vehicleType = 'Please select a specific vehicle type for Full Truck Load.';
    }

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
    const finalNumberOfPieces = parseNumber(numberOfPieces);
    const finalNumberOfTrucks = parseNumber(numberOfTrucks);

    // Construct formData
    const formData: TruckFormData = {
      bookingType: 'Truck',
      pickupPincode,
      dropoffPincode,
      readyDate: readyDate ? readyDate.toISOString().split('T')[0] : '', // Format date to YYYY-MM-DD
      loadType: loadType as 'PTL' | 'FTL',
      numberOfTrucks: finalNumberOfTrucks as number,
      cargoType,
      totalWeight: finalTotalWeight as number,
      numberOfPieces: finalNumberOfPieces as number,
      dimensions: dimensions || undefined,
      cargoValue: parseNumber(cargoValue), // Use parseNumber for optional values
      hazardousCargo,
      insuranceRequired,
      specialInstructions: specialInstructions || undefined,
      truckType: truckType === '' ? undefined : truckType, // Assign truck body type
      vehicleType: vehicleType === '' ? undefined : vehicleType, // Assign specific vehicle type
    };

    setSuccessMessage('Truck Freight quote data collected successfully.');
    setShowSuccessMessage(true);
    return formData;
  };

  // Reset logic (can be called internally or externally via ref)
  const resetForm = () => {
    setPickupPincode('');
    setDropoffPincode('');
    setReadyDate(null);
    setLoadType('');
    setTruckType('');
    setVehicleType('');
    setNumberOfTrucks('');
    setCargoType('');
    setTotalWeight('');
    setDimensions('');
    setCargoValue('');
    setHazardousCargo(false);
    setInsuranceRequired(false);
    setSpecialInstructions('');
    setNumberOfPieces('');
    setErrors({});
    setShowValidationMessage(false); // Clear message states
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
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Truck Freight Quote Details</h2>

      {/* Load Type Selection (PTL/FTL) */}
      <div className="mb-4">
        <label className="block text-lg font-medium text-gray-700 mb-2">Choose your load type<span className="text-red-500">*</span></label>
        <div className="flex space-x-4">
          <label
            className={`flex items-center justify-center flex-1 py-3 px-6 rounded-xl cursor-pointer transition-all duration-300 ease-in-out
                        ${loadType === 'PTL' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'}
                        ${errors.loadType ? 'border-orange-500 ring-orange-500 ring-2' : ''}`}
          >
            <input
              type="radio"
              name="loadType"
              value="PTL"
              checked={loadType === 'PTL'}
              onChange={() => { setLoadType('PTL'); setErrors((prev) => ({ ...prev, loadType: undefined })); }}
              className="hidden"
            />
            Partial Truck Load (PTL)
          </label>
          <label
            className={`flex items-center justify-center flex-1 py-3 px-6 rounded-xl cursor-pointer transition-all duration-300 ease-in-out
                        ${loadType === 'FTL' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'}
                        ${errors.loadType ? 'border-orange-500 ring-orange-500 ring-2' : ''}`}
          >
            <input
              type="radio"
              name="loadType"
              value="FTL"
              checked={loadType === 'FTL'}
              onChange={() => { setLoadType('FTL'); setErrors((prev) => ({ ...prev, loadType: undefined })); }}
              className="hidden"
            />
            Full Truck Load (FTL)
          </label>
        </div>
        {errors.loadType && <p className="mt-2 text-sm text-orange-600">{errors.loadType}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4"> {/* Adjusted grid layout */}
        {/* Pickup Pincode */}
        <div>
          <label htmlFor="pickupPincode" className="block text-sm font-medium text-gray-700 mb-1">Search your Pick Up Pincode<span className="text-red-500">*</span></label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaMapMarkerAlt className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="pickupPincode"
              className={`focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-3 py-2 sm:text-sm border-gray-300 rounded-md transition-all duration-200 ease-in-out ${errors.pickupPincode ? 'border-orange-500' : ''}`}
              placeholder="e.g., 600080"
              value={pickupPincode}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setPickupPincode(e.target.value); setErrors((prev) => ({ ...prev, pickupPincode: undefined })); }}
              required
            />
          </div>
          {errors.pickupPincode && <p className="mt-1 text-sm text-orange-600">{errors.pickupPincode}</p>}
        </div>

        {/* Drop Off Pincode */}
        <div>
          <label htmlFor="dropoffPincode" className="block text-sm font-medium text-gray-700 mb-1">Search your Drop Off Pincode<span className="text-red-500">*</span></label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaMapMarkerAlt className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="dropoffPincode"
              className={`focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-3 py-2 sm:text-sm border-gray-300 rounded-md transition-all duration-200 ease-in-out ${errors.dropoffPincode ? 'border-orange-500' : ''}`}
              placeholder="e.g., 522007"
              value={dropoffPincode}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setDropoffPincode(e.target.value); setErrors((prev) => ({ ...prev, dropoffPincode: undefined })); }}
              required
            />
          </div>
          {errors.dropoffPincode && <p className="mt-1 text-sm text-orange-600">{errors.dropoffPincode}</p>}
        </div>

        {/* Pickup Date */}
        <div>
          <label htmlFor="readyDate" className="block text-sm font-medium text-gray-700 mb-1">Select your Pickup Date<span className="text-red-500">*</span></label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
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
              className={`focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-3 py-2 sm:text-sm border-gray-300 rounded-md transition-all duration-200 ease-in-out ${errors.readyDate ? 'border-orange-500' : ''}`}
              required
            />
          </div>
          {errors.readyDate && <p className="mt-1 text-sm text-orange-600">{errors.readyDate}</p>}
        </div>

        {/* Gross Weight */}
        <div>
          <label htmlFor="totalWeight" className="block text-sm font-medium text-gray-700 mb-1">Enter your Gross Weight (Kgs)<span className="text-red-500">*</span></label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaWeight className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="number"
              id="totalWeight"
              className={`focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-3 py-2 sm:text-sm border-gray-300 rounded-md transition-all duration-200 ease-in-out ${errors.totalWeight ? 'border-orange-500' : ''}`}
              placeholder="e.g., 22"
              value={totalWeight}
              onChange={handleNumericChange(setTotalWeight, 'totalWeight')}
              min="0.01"
              step="0.01"
              required
            />
          </div>
          {errors.totalWeight && <p className="mt-1 text-sm text-orange-600">{errors.totalWeight}</p>}
        </div>

        {/* No. of Pieces */}
        <div>
          <label htmlFor="numberOfPieces" className="block text-sm font-medium text-gray-700 mb-1">Enter the No. of Pieces<span className="text-red-500">*</span></label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaBoxes className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="number"
              id="numberOfPieces"
              className={`focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-3 py-2 sm:text-sm border-gray-300 rounded-md transition-all duration-200 ease-in-out ${errors.numberOfPieces ? 'border-orange-500' : ''}`}
              placeholder="e.g., 1"
              value={numberOfPieces}
              onChange={handleNumericChange(setNumberOfPieces, 'numberOfPieces')}
              min="1"
              required
            />
          </div>
          {errors.numberOfPieces && <p className="mt-1 text-sm text-orange-600">{errors.numberOfPieces}</p>}
        </div>

        {/* Product Declared Value */}
        <div>
          <label htmlFor="cargoValue" className="block text-sm font-medium text-gray-700 mb-1">Enter your Product Declared Value (INR, Optional)</label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaDollarSign className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="number"
              id="cargoValue"
              className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-3 py-2 sm:text-sm border-gray-300 rounded-md transition-all duration-200 ease-in-out"
              placeholder="e.g., 22"
              value={cargoValue}
              onChange={handleNumericChange(setCargoValue, 'cargoValue')}
              min="0"
            />
          </div>
        </div>

        {/* Commodity (Cargo Type) */}
        <div>
          <label htmlFor="cargoType" className="block text-sm font-medium text-gray-700 mb-1">Select Commodity<span className="text-red-500">*</span></label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaTag className="h-5 w-5 text-gray-400" />
            </div>
            <select
              id="cargoType"
              className={`focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-3 py-2 sm:text-sm border-gray-300 rounded-md transition-all duration-200 ease-in-out ${errors.cargoType ? 'border-orange-500' : ''}`}
              value={cargoType}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => { setCargoType(e.target.value); setErrors((prev) => ({ ...prev, cargoType: undefined })); }}
              required
            >
              <option value="">Select Commodity</option>
              {truckCommodities.map((commodity) => (
                <option key={commodity.value} value={commodity.value}>{commodity.label}</option>
              ))}
            </select>
          </div>
          {errors.cargoType && <p className="mt-1 text-sm text-orange-600">{errors.cargoType}</p>}
        </div>

        {/* Truck Type (Body Type) - always shown for now, can be conditional later */}
        <div>
          <label htmlFor="truckType" className="block text-sm font-medium text-gray-700 mb-1">Truck Body Type</label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaTruck className="h-5 w-5 text-gray-400" />
            </div>
            <select
              id="truckType"
              className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-3 py-2 sm:text-sm border-gray-300 rounded-md transition-all duration-200 ease-in-out"
              value={truckType}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTruckType(e.target.value as TruckFormData['truckType'] | '')}
            >
              <option value="">Select Body Type</option>
              <option value="open">Open Body</option>
              <option value="closed">Closed Body</option>
              <option value="flatbed">Flatbed</option>
              <option value="reefer">Reefer (Refrigerated)</option>
            </select>
          </div>
        </div>

        {/* Number of Trucks */}
        <div>
          <label htmlFor="numberOfTrucks" className="block text-sm font-medium text-gray-700 mb-1">Number of Trucks<span className="text-red-500">*</span></label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaTruck className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="number"
              id="numberOfTrucks"
              className={`focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-3 py-2 sm:text-sm border-gray-300 rounded-md transition-all duration-200 ease-in-out ${errors.numberOfTrucks ? 'border-orange-500' : ''}`}
              placeholder="e.g., 1"
              value={numberOfTrucks}
              onChange={handleNumericChange(setNumberOfTrucks, 'numberOfTrucks')}
              min="1"
              required
            />
          </div>
          {errors.numberOfTrucks && <p className="mt-1 text-sm text-orange-600">{errors.numberOfTrucks}</p>}
        </div>

        {/* Dimensions */}
        <div>
          <label htmlFor="dimensions" className="block text-sm font-medium text-gray-700 mb-1">Dimensions (LxWxH in CM, Optional)</label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaRulerCombined className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="dimensions"
              className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-3 py-2 sm:text-sm border-gray-300 rounded-md transition-all duration-200 ease-in-out"
              placeholder="e.g., 300x200x200"
              value={dimensions}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDimensions(e.target.value)}
            />
          </div>
        </div>

        {/* Hazardous Cargo */}
        <div className="flex items-center mt-6">
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

        {/* Insurance Required */}
        <div className="flex items-center mt-6">
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

      {/* Vehicle Type Selection for FTL - now a dropdown */}
      {loadType === 'FTL' && (
        <div className="mt-6">
          <label htmlFor="vehicleTypeDropdown" className="block text-lg font-medium text-gray-700 mb-2">Select Specific Vehicle Type (Full Truck Load)<span className="text-red-500">*</span></label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaTruck className="h-5 w-5 text-gray-400" />
            </div>
            <select
              id="vehicleTypeDropdown"
              className={`focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-3 py-2 sm:text-sm border-gray-300 rounded-md transition-all duration-200 ease-in-out ${errors.vehicleType ? 'border-orange-500' : ''}`}
              value={vehicleType}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => { setVehicleType(e.target.value as TruckFormData['vehicleType'] | ''); setErrors((prev) => ({ ...prev, vehicleType: undefined })); }}
              required
            >
              <option value="">Select Vehicle Type</option>
              {vehicleTypes.map((type) => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
          {errors.vehicleType && <p className="mt-2 text-sm text-orange-600">{errors.vehicleType}</p>}
        </div>
      )}

      {/* Special Instructions - always full width */}
      <div className="col-span-full">
        <label htmlFor="specialInstructions" className="block text-sm font-medium text-gray-700 mb-1">Special Instructions (Optional)</label>
        <textarea
          id="specialInstructions"
          rows={3}
          className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 transition-all duration-200 ease-in-out"
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

export default TruckQuoteForm;
