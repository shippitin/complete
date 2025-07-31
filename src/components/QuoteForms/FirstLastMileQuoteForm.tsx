// src/components/QuoteForms/FirstLastMileQuoteForm.tsx
import React, { useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaMapMarkerAlt, FaCalendarAlt, FaWeight, FaRulerCombined, FaBox, FaTruck, FaInfoCircle, FaTimesCircle, FaCheckCircle, FaDollarSign } from 'react-icons/fa'; // Added FaDollarSign, FaTimesCircle, FaCheckCircle
import type { FirstLastMileFormData, QuoteFormHandle, ParsedVoiceCommand, AllFormData } from '../../types/QuoteFormHandle'; // Added AllFormData
import { parseNumber } from '../../utils/parseNumber';

interface FirstLastMileQuoteFormProps {
  prefillData?: ParsedVoiceCommand;
  showButtons?: boolean; // Added showButtons prop for HeroSection.tsx
}

const FirstLastMileQuoteForm = forwardRef<QuoteFormHandle, FirstLastMileQuoteFormProps>(({ prefillData, showButtons = true }, ref) => {
  const [serviceType, setServiceType] = useState<'first-mile' | 'last-mile' | ''>(''); // First Mile, Last Mile
  const [pickupLocation, setPickupLocation] = useState(''); // Renamed from originAddress
  const [deliveryLocation, setDeliveryLocation] = useState(''); // Renamed from destinationAddress
  const [pickupDate, setPickupDate] = useState<Date | null>(null); // Changed to Date | null, renamed from readyDate
  const [deliveryDate, setDeliveryDate] = useState<Date | null>(null); // Added deliveryDate
  const [cargoType, setCargoType] = useState('');
  const [totalWeight, setTotalWeight] = useState<number | ''>(''); // Renamed from weight
  const [dimensions, setDimensions] = useState('');
  const [cargoValue, setCargoValue] = useState<number | ''>(''); // Added cargoValue
  const [hazardousCargo, setHazardousCargo] = useState(false); // Added hazardousCargo
  const [insuranceRequired, setInsuranceRequired] = useState(false); // Added insuranceRequired
  const [vehicleTypeRequired, setVehicleTypeRequired] = useState(''); // Added vehicleTypeRequired
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [deliveryInstructions, setDeliveryInstructions] = useState(''); // Added deliveryInstructions

  // State for validation errors
  const [errors, setErrors] = useState<Partial<Record<keyof FirstLastMileFormData, string>>>({});
  // State for custom validation message box
  const [showValidationMessage, setShowValidationMessage] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');
  // State for success message
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (prefillData) {
      setServiceType((prefillData.serviceType as 'first-mile' | 'last-mile' || '') || '');
      setPickupLocation(prefillData.pickupLocation || prefillData.originAddress || prefillData.origin || '');
      setDeliveryLocation(prefillData.deliveryLocation || prefillData.destinationAddress || prefillData.destination || '');
      setPickupDate(prefillData.pickupDate ? new Date(prefillData.pickupDate) : (prefillData.readyDate ? new Date(prefillData.readyDate) : (prefillData.date ? new Date(prefillData.date) : null)));
      setDeliveryDate(prefillData.deliveryDate ? new Date(prefillData.deliveryDate) : null);
      setCargoType(prefillData.cargoType || prefillData.commodity || '');
      setTotalWeight(parseNumber(prefillData.cargoWeight) ?? parseNumber(prefillData.totalWeight) ?? '');
      setDimensions(prefillData.cargoDimensions || prefillData.dimensions || '');
      setCargoValue(parseNumber(prefillData.cargoValue) ?? parseNumber(prefillData.productDeclaredValue) ?? '');
      setHazardousCargo(prefillData.hazardousCargo || false);
      setInsuranceRequired(prefillData.insuranceRequired || false);
      setVehicleTypeRequired(prefillData.vehicleTypeRequired || prefillData.vehicleType || '');
      setSpecialInstructions(prefillData.specialInstructions || prefillData.description || prefillData.detailedDescriptionOfGoods || '');
      setDeliveryInstructions(prefillData.deliveryInstructions || '');
    }
  }, [prefillData]);

  // Helper for numeric input changes with error clearing
  const handleNumericChange = (setter: React.Dispatch<React.SetStateAction<number | ''>>, fieldName: keyof FirstLastMileFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setter(value === '' ? '' : parseFloat(value));
      setErrors((prev) => ({ ...prev, [fieldName]: undefined })); // Clear error on change
    }
  };

  // Validation logic
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FirstLastMileFormData, string>> = {};

    if (!serviceType) newErrors.serviceType = 'Service Type is required.';
    if (!pickupLocation) newErrors.pickupLocation = 'Pickup Location is required.';
    if (!deliveryLocation) newErrors.deliveryLocation = 'Delivery Location is required.';
    if (!pickupDate) newErrors.pickupDate = 'Pickup Date is required.';
    if (!cargoType) newErrors.cargoType = 'Cargo Type is required.';

    const finalTotalWeight = parseNumber(totalWeight);
    if (finalTotalWeight === undefined || finalTotalWeight <= 0) newErrors.totalWeight = 'Total Weight is required and must be greater than 0.';

    const finalCargoValue = parseNumber(cargoValue);
    if (finalCargoValue === undefined || finalCargoValue <= 0) newErrors.cargoValue = 'Cargo Value is required and must be greater than 0.';

    if (deliveryDate && pickupDate && deliveryDate < pickupDate) {
      newErrors.deliveryDate = 'Delivery Date cannot be before Pickup Date.';
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

    const finalTotalWeight = parseNumber(totalWeight);
    const finalCargoValue = parseNumber(cargoValue);

    const formData: FirstLastMileFormData = {
      bookingType: 'First/Last Mile',
      serviceType: serviceType as FirstLastMileFormData['serviceType'],
      pickupLocation,
      deliveryLocation,
      pickupDate: pickupDate ? pickupDate.toISOString().split('T')[0] : '',
      deliveryDate: deliveryDate ? deliveryDate.toISOString().split('T')[0] : undefined,
      cargoType,
      totalWeight: finalTotalWeight as number,
      dimensions: dimensions || undefined,
      cargoValue: finalCargoValue as number,
      hazardousCargo,
      insuranceRequired,
      vehicleTypeRequired: vehicleTypeRequired || undefined,
      deliveryInstructions: deliveryInstructions || undefined,
      specialInstructions: specialInstructions || undefined, // Map to specialInstructions in BaseFormData
      readyDate: pickupDate ? pickupDate.toISOString().split('T')[0] : '', // Map pickupDate to readyDate for BaseFormData
      detailedDescriptionOfGoods: specialInstructions || undefined, // Map specialInstructions to detailedDescriptionOfGoods
      hsCode: undefined, // Not collected in this form
      incoterms: undefined, // Not collected in this form
      countryOfOrigin: undefined, // Not collected in this form
      numberOfPieces: undefined, // Not collected in this form
    };

    setSuccessMessage('First/Last Mile Quote data collected successfully.');
    setShowSuccessMessage(true);
    return formData;
  };

  // Reset logic (can be called internally or externally via ref)
  const resetForm = () => {
    setServiceType('');
    setPickupLocation('');
    setDeliveryLocation('');
    setPickupDate(null);
    setDeliveryDate(null);
    setCargoType('');
    setTotalWeight('');
    setDimensions('');
    setCargoValue('');
    setHazardousCargo(false);
    setInsuranceRequired(false);
    setVehicleTypeRequired('');
    setSpecialInstructions('');
    setDeliveryInstructions('');
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
      <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">First/Last Mile Quote Details</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
        {/* Service Type */}
        <div>
          <label htmlFor="flmServiceType" className="block text-sm font-medium text-gray-700 mb-1">Service Type<span className="text-red-500">*</span></label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaTruck className="h-5 w-5 text-gray-400" />
            </div>
            <select
              id="flmServiceType"
              className={`focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-2 ${errors.serviceType ? 'border-orange-500' : ''}`}
              value={serviceType}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => { setServiceType(e.target.value as 'first-mile' | 'last-mile' | ''); setErrors((prev) => ({ ...prev, serviceType: undefined })); }}
              required
            >
              <option value="">Select Service Type</option>
              <option value="first-mile">First Mile</option>
              <option value="last-mile">Last Mile</option>
            </select>
          </div>
          {errors.serviceType && <p className="mt-1 text-sm text-orange-600">{errors.serviceType}</p>}
        </div>

        {/* Pickup Location */}
        <div>
          <label htmlFor="flmPickupLocation" className="block text-sm font-medium text-gray-700 mb-1">Pickup Location<span className="text-red-500">*</span></label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaMapMarkerAlt className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="flmPickupLocation"
              className={`focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-2 ${errors.pickupLocation ? 'border-orange-500' : ''}`}
              placeholder="e.g., Warehouse A, Delhi"
              value={pickupLocation}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setPickupLocation(e.target.value); setErrors((prev) => ({ ...prev, pickupLocation: undefined })); }}
              required
            />
          </div>
          {errors.pickupLocation && <p className="mt-1 text-sm text-orange-600">{errors.pickupLocation}</p>}
        </div>

        {/* Delivery Location */}
        <div>
          <label htmlFor="flmDeliveryLocation" className="block text-sm font-medium text-gray-700 mb-1">Delivery Location<span className="text-red-500">*</span></label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaMapMarkerAlt className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="flmDeliveryLocation"
              className={`focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-2 ${errors.deliveryLocation ? 'border-orange-500' : ''}`}
              placeholder="e.g., Customer's home, Gurgaon"
              value={deliveryLocation}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setDeliveryLocation(e.target.value); setErrors((prev) => ({ ...prev, deliveryLocation: undefined })); }}
              required
            />
          </div>
          {errors.deliveryLocation && <p className="mt-1 text-sm text-orange-600">{errors.deliveryLocation}</p>}
        </div>

        {/* Pickup Date */}
        <div>
          <label htmlFor="flmPickupDate" className="block text-sm font-medium text-gray-700 mb-1">Pickup Date<span className="text-red-500">*</span></label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaCalendarAlt className="h-5 w-5 text-gray-400" />
            </div>
            <DatePicker
              selected={pickupDate}
              onChange={(date: Date | null) => { setPickupDate(date); setErrors((prev) => ({ ...prev, pickupDate: undefined })); }}
              dateFormat="dd-MM-yyyy"
              placeholderText="DD-MM-YYYY"
              className={`focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-2 ${errors.pickupDate ? 'border-orange-500' : ''}`}
              required
            />
          </div>
          {errors.pickupDate && <p className="mt-1 text-sm text-orange-600">{errors.pickupDate}</p>}
        </div>

        {/* Delivery Date (Optional) */}
        <div>
          <label htmlFor="flmDeliveryDate" className="block text-sm font-medium text-gray-700 mb-1">Delivery Date (Optional)</label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaCalendarAlt className="h-5 w-5 text-gray-400" />
            </div>
            <DatePicker
              selected={deliveryDate}
              onChange={(date: Date | null) => { setDeliveryDate(date); setErrors((prev) => ({ ...prev, deliveryDate: undefined })); }}
              dateFormat="dd-MM-yyyy"
              placeholderText="DD-MM-YYYY"
              className={`focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-2 ${errors.deliveryDate ? 'border-orange-500' : ''}`}
            />
          </div>
          {errors.deliveryDate && <p className="mt-1 text-sm text-orange-600">{errors.deliveryDate}</p>}
        </div>

        {/* Cargo Type */}
        <div>
          <label htmlFor="flmCargoType" className="block text-sm font-medium text-gray-700 mb-1">Cargo Type<span className="text-red-500">*</span></label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaBox className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="flmCargoType"
              className={`focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-2 ${errors.cargoType ? 'border-orange-500' : ''}`}
              placeholder="e.g., Small packages, Documents"
              value={cargoType}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setCargoType(e.target.value); setErrors((prev) => ({ ...prev, cargoType: undefined })); }}
              required
            />
          </div>
          {errors.cargoType && <p className="mt-1 text-sm text-orange-600">{errors.cargoType}</p>}
        </div>

        {/* Total Weight */}
        <div>
          <label htmlFor="flmTotalWeight" className="block text-sm font-medium text-gray-700 mb-1">Total Weight (KG)<span className="text-red-500">*</span></label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaWeight className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text" // Use text for handleNumericChange
              id="flmTotalWeight"
              className={`focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-2 ${errors.totalWeight ? 'border-orange-500' : ''}`}
              placeholder="e.g., 10"
              value={totalWeight}
              onChange={handleNumericChange(setTotalWeight, 'totalWeight')}
              required
            />
          </div>
          {errors.totalWeight && <p className="mt-1 text-sm text-orange-600">{errors.totalWeight}</p>}
        </div>

        {/* Dimensions (Optional) */}
        <div>
          <label htmlFor="flmDimensions" className="block text-sm font-medium text-gray-700 mb-1">Dimensions (LxWxH in CM, Optional)</label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaRulerCombined className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="flmDimensions"
              className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-2"
              placeholder="e.g., 40x30x20"
              value={dimensions}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDimensions(e.target.value)}
            />
          </div>
        </div>

        {/* Cargo Value */}
        <div>
          <label htmlFor="flmCargoValue" className="block text-sm font-medium text-gray-700 mb-1">Cargo Value (INR)<span className="text-red-500">*</span></label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaDollarSign className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text" // Use text for handleNumericChange
              id="flmCargoValue"
              className={`focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-2 ${errors.cargoValue ? 'border-orange-500' : ''}`}
              placeholder="e.g., 5000"
              value={cargoValue}
              onChange={handleNumericChange(setCargoValue, 'cargoValue')}
              required
            />
          </div>
          {errors.cargoValue && <p className="mt-1 text-sm text-orange-600">{errors.cargoValue}</p>}
        </div>

        {/* Hazardous Cargo */}
        <div className="flex items-center mt-6">
          <input
            type="checkbox"
            id="flmHazardousCargo"
            checked={hazardousCargo}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setHazardousCargo(e.target.checked)}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
          />
          <label htmlFor="flmHazardousCargo" className="ml-2 block text-sm text-gray-900">
            Hazardous Cargo
          </label>
        </div>

        {/* Insurance Required */}
        <div className="flex items-center mt-6">
          <input
            type="checkbox"
            id="flmInsuranceRequired"
            checked={insuranceRequired}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInsuranceRequired(e.target.checked)}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
          />
          <label htmlFor="flmInsuranceRequired" className="ml-2 block text-sm text-gray-900">
            Insurance Required
          </label>
        </div>

        {/* Vehicle Type Required (Optional) */}
        <div>
          <label htmlFor="flmVehicleTypeRequired" className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type Required (Optional)</label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaTruck className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="flmVehicleTypeRequired"
              className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-2"
              placeholder="e.g., Van, Mini Truck, Bike"
              value={vehicleTypeRequired}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVehicleTypeRequired(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Delivery Instructions (Optional) */}
      <div className="col-span-full mt-6">
        <label htmlFor="flmDeliveryInstructions" className="block text-sm font-medium text-gray-700 mb-1">Delivery Instructions (Optional)</label>
        <textarea
          id="flmDeliveryInstructions"
          rows={3}
          className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2"
          placeholder="e.g., Leave at reception, call before delivery"
          value={deliveryInstructions}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDeliveryInstructions(e.target.value)}
        ></textarea>
      </div>

      {/* Special Instructions (Optional) */}
      <div className="col-span-full mt-6">
        <label htmlFor="flmSpecialInstructions" className="block text-sm font-medium text-gray-700 mb-1">Special Instructions (Optional)</label>
        <textarea
          id="flmSpecialInstructions"
          rows={3}
          className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2"
          placeholder="Provide any other special handling instructions..."
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

export default FirstLastMileQuoteForm;
