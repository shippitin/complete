// src/components/QuoteForms/DoorToDoorQuoteForm.tsx
import React, { useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaMapMarkerAlt, FaWeight, FaBox, FaCalendarAlt, FaRulerCombined, FaDollarSign, FaCode, FaTruckLoading, FaTag, FaTimesCircle, FaCheckCircle, FaInfoCircle } from 'react-icons/fa';
import { parseNumber } from '../../utils/parseNumber';
import type {
  DoorToDoorFormData,
  QuoteFormHandle,
  ParsedVoiceCommand,
  AllFormData // Import AllFormData
} from '../../types/QuoteFormHandle';

// Dummy data for ALL Commodities (can be shared across forms)
const allCommodities = [
  { label: 'FAK (Freight of All Kinds)', value: 'FAK (Freight of All Kinds)' },
  { label: 'Electronic Goods', value: 'Electronic Goods' },
  { label: 'Fabrics', value: 'Fabrics' },
  { label: 'Leather Goods', value: 'Leather Goods' },
  { label: 'Spare Parts', value: 'Spare Parts' },
  { label: 'Handicrafts', value: 'Handicrafts' },
  { label: 'Garments', value: 'Garments' },
  { label: 'Fruits & Vegetables', value: 'Fruits & Vegetables' },
  { label: 'Meat & Seafood', value: 'Meat & Seafood' },
  { label: 'Pharmaceuticals', value: 'Pharmaceuticals' },
  { label: 'Machinery', value: 'Machinery' },
  { label: 'Vehicles', value: 'Vehicles' },
  { label: 'Chemicals', value: 'Chemicals' },
  { label: 'Batteries', value: 'Batteries' },
  { label: 'Miscellaneous', value: 'Miscellaneous' },
  { label: 'Other', value: 'Other' },
].sort((a, b) => a.label.localeCompare(b.label));


interface DoorToDoorQuoteFormProps {
  prefillData?: ParsedVoiceCommand;
  showButtons?: boolean; // NEW PROP: controls visibility of internal search/reset buttons
}

const DoorToDoorQuoteForm = forwardRef<QuoteFormHandle, DoorToDoorQuoteFormProps>(({ prefillData, showButtons = true }, ref) => {
  const navigate = useNavigate(); // Initialize useNavigate

  const [originAddress, setOriginAddress] = useState('');
  const [destinationAddress, setDestinationAddress] = useState('');
  const [readyDate, setReadyDate] = useState<Date | null>(new Date());
  const [cargoType, setCargoType] = useState('FAK (Freight of All Kinds)');
  const [totalWeight, setTotalWeight] = useState<number | ''>('');
  const [dimensions, setDimensions] = useState('');
  const [cargoValue, setCargoValue] = useState<number | ''>('');
  const [hazardousCargo, setHazardousCargo] = useState<boolean | ''>('');
  const [insuranceRequired, setInsuranceRequired] = useState(false);
  const [detailedDescriptionOfGoods, setDetailedDescriptionOfGoods] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [hsCode, setHsCode] = useState('');

  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [showValidationMessage, setShowValidationMessage] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Effect to prefill data based on ParsedVoiceCommand
  useEffect(() => {
    if (prefillData && (prefillData.service === 'Door to Door' || prefillData.service === 'home' || prefillData.service === 'quote')) {
      setOriginAddress(prefillData.originAddress || prefillData.origin || '');
      setDestinationAddress(prefillData.destinationAddress || prefillData.destination || '');
      setReadyDate(prefillData.readyDate ? new Date(prefillData.readyDate) : new Date());
      setCargoType(prefillData.cargoType || prefillData.commodity || 'FAK (Freight of All Kinds)');
      setTotalWeight(parseNumber(prefillData.cargoWeight) ?? '');
      setDimensions(prefillData.cargoDimensions || '');
      setCargoValue(parseNumber(prefillData.cargoValue || prefillData.productDeclaredValue) ?? '');
      setHazardousCargo(prefillData.hazardousCargo ?? '');
      setInsuranceRequired(prefillData.insuranceRequired ?? false);
      setDetailedDescriptionOfGoods(prefillData.detailedDescriptionOfGoods || '');
      setSpecialInstructions(prefillData.specialInstructions || '');
      setHsCode(prefillData.hsnCode || '');
    }
  }, [prefillData]);

  const resetForm = () => {
    setOriginAddress('');
    setDestinationAddress('');
    setReadyDate(new Date());
    setCargoType('FAK (Freight of All Kinds)');
    setTotalWeight('');
    setDimensions('');
    setCargoValue('');
    setHazardousCargo('');
    setInsuranceRequired(false);
    setDetailedDescriptionOfGoods('');
    setSpecialInstructions('');
    setHsCode('');
    setErrors({});
    setShowValidationMessage(false);
    setValidationMessage('');
    setShowSuccessMessage(false);
    setSuccessMessage('');
  };

  const handleSubmitLogic = (): AllFormData | null => { // Explicitly return AllFormData | null
    const newErrors: Partial<Record<string, string>> = {};

    if (!originAddress) newErrors.originAddress = 'Origin address is required.';
    if (!destinationAddress) newErrors.destinationAddress = 'Destination address is required.';
    if (!readyDate) newErrors.readyDate = 'Ready Date is required.';
    if (!cargoType) newErrors.cargoType = 'Cargo Type is required.';
    const parsedWeight = parseNumber(totalWeight);
    if (parsedWeight === undefined || parsedWeight <= 0) newErrors.totalWeight = 'Total Weight is required and must be greater than 0.';
    if (!dimensions) newErrors.dimensions = 'Dimensions are required.';
    const parsedCargoValue = parseNumber(cargoValue);
    if (parsedCargoValue === undefined || parsedCargoValue <= 0) newErrors.cargoValue = 'Cargo Value is required and must be greater than 0.';
    if (hazardousCargo === '') newErrors.hazardousCargo = 'Hazardous Cargo selection is required.';

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      setValidationMessage('Please fill in all required fields correctly.');
      setShowValidationMessage(true);
      return null;
    }

    const formData: DoorToDoorFormData = {
      bookingType: 'Door to Door',
      originAddress,
      destinationAddress,
      readyDate: readyDate ? readyDate.toISOString().split('T')[0] : '',
      cargoType,
      totalWeight: parsedWeight as number,
      dimensions,
      cargoValue: parsedCargoValue as number,
      hazardousCargo: hazardousCargo === true,
      insuranceRequired,
      detailedDescriptionOfGoods: detailedDescriptionOfGoods || undefined,
      specialInstructions: specialInstructions || undefined,
      hsCode: hsCode || undefined,
    };

    // If showButtons is true (i.e., on standalone page), then navigate directly
    // Otherwise (when embedded in HeroSection), just return the data.
    if (showButtons) {
      navigate('/door-to-door-results', { state: { formData } });
      setSuccessMessage('Search initiated. Redirecting to results...');
      setShowSuccessMessage(true);
    } else {
      setSuccessMessage('Form data collected successfully.');
      setShowSuccessMessage(true);
    }
    return formData; // Always return formData for HeroSection to use
  };

  useImperativeHandle(ref, () => ({
    submit: handleSubmitLogic,
    reset: resetForm,
  }));

  return (
    <div className="p-6 bg-white shadow-md rounded-xl border border-gray-200 font-inter">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Door to Door Booking Details</h2>
      <form className="space-y-6 mt-4" onSubmit={(e) => e.preventDefault()}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          {/* Origin Address */}
          <div>
            <label htmlFor="originAddress" className="block text-sm font-medium text-gray-700 mb-1">Origin Address<span className="text-red-500">*</span></label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-0 flex items-center pointer-events-none">
                <FaMapMarkerAlt className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="originAddress"
                className={`block w-full pl-8 pr-3 py-2 sm:text-sm bg-transparent border-0 border-b border-gray-300 focus:ring-0 focus:border-blue-500 ${errors.originAddress ? 'border-orange-500' : ''}`}
                placeholder="Enter origin address"
                value={originAddress}
                onChange={(e) => { setOriginAddress(e.target.value); setErrors((prev) => ({ ...prev, originAddress: undefined })); }}
                required
              />
            </div>
            {errors.originAddress && <p className="mt-1 text-sm text-orange-600">{errors.originAddress}</p>}
          </div>

          {/* Destination Address */}
          <div>
            <label htmlFor="destinationAddress" className="block text-sm font-medium text-gray-700 mb-1">Destination Address<span className="text-red-500">*</span></label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-0 flex items-center pointer-events-none">
                <FaMapMarkerAlt className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="destinationAddress"
                className={`block w-full pl-8 pr-3 py-2 sm:text-sm bg-transparent border-0 border-b border-gray-300 focus:ring-0 focus:border-blue-500 ${errors.destinationAddress ? 'border-orange-500' : ''}`}
                placeholder="Enter destination address"
                value={destinationAddress}
                onChange={(e) => { setDestinationAddress(e.target.value); setErrors((prev) => ({ ...prev, destinationAddress: undefined })); }}
                required
              />
            </div>
            {errors.destinationAddress && <p className="mt-1 text-sm text-orange-600">{errors.destinationAddress}</p>}
          </div>

          {/* Ready Date */}
          <div>
            <label htmlFor="readyDate" className="block text-sm font-medium text-gray-700 mb-1">Ready Date<span className="text-red-500">*</span></label>
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
                dateFormat="dd/MM/yyyy"
                placeholderText="DD/MM/YYYY"
                className={`block w-full pl-8 pr-3 py-2 sm:text-sm bg-transparent border-0 border-b border-gray-300 focus:ring-0 focus:border-blue-500 ${errors.readyDate ? 'border-orange-500' : ''}`}
                required
              />
            </div>
            {errors.readyDate && <p className="mt-1 text-sm text-orange-600">{errors.readyDate}</p>}
          </div>

          {/* Cargo Type */}
          <div>
            <label htmlFor="cargoType" className="block text-sm font-medium text-gray-700 mb-1">Cargo Type<span className="text-red-500">*</span></label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-0 flex items-center pointer-events-none">
                <FaBox className="h-5 w-5 text-gray-400" />
              </div>
              <select
                id="cargoType"
                className={`block w-full pl-8 pr-3 py-2 sm:text-sm bg-transparent border-0 border-b border-gray-300 focus:ring-0 focus:border-blue-500 ${errors.cargoType ? 'border-orange-500' : ''}`}
                value={cargoType}
                onChange={(e) => { setCargoType(e.target.value); setErrors((prev) => ({ ...prev, cargoType: undefined })); }}
                required
              >
                <option value="">Select Cargo Type</option>
                {allCommodities.map((item) => (
                  <option key={item.value} value={item.value}>{item.label}</option>
                ))}
              </select>
            </div>
            {errors.cargoType && <p className="mt-1 text-sm text-orange-600">{errors.cargoType}</p>}
          </div>

          {/* Total Weight (KG) */}
          <div>
            <label htmlFor="totalWeight" className="block text-sm font-medium text-gray-700 mb-1">Total Weight (KG)<span className="text-red-500">*</span></label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-0 flex items-center pointer-events-none">
                <FaWeight className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="number"
                id="totalWeight"
                className={`block w-full pl-8 pr-3 py-2 sm:text-sm bg-transparent border-0 border-b border-gray-300 focus:ring-0 focus:border-blue-500 ${errors.totalWeight ? 'border-orange-500' : ''}`}
                placeholder="e.g., 500"
                value={totalWeight}
                onChange={(e) => { setTotalWeight(e.target.value === '' ? '' : Number(e.target.value)); setErrors((prev) => ({ ...prev, totalWeight: undefined })); }}
                min="0.01"
                step="0.01"
                required
              />
            </div>
            {errors.totalWeight && <p className="mt-1 text-sm text-orange-600">{errors.totalWeight}</p>}
          </div>

          {/* Dimensions (LxWxH cm) */}
          <div>
            <label htmlFor="dimensions" className="block text-sm font-medium text-gray-700 mb-1">Dimensions (LxWxH cm)<span className="text-red-500">*</span></label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-0 flex items-center pointer-events-none">
                <FaRulerCombined className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="dimensions"
                className={`block w-full pl-8 pr-3 py-2 sm:text-sm bg-transparent border-0 border-b border-gray-300 focus:ring-0 focus:border-blue-500 ${errors.dimensions ? 'border-orange-500' : ''}`}
                placeholder="e.g., 100x50x50"
                value={dimensions}
                onChange={(e) => { setDimensions(e.target.value); setErrors((prev) => ({ ...prev, dimensions: undefined })); }}
                required
              />
            </div>
            {errors.dimensions && <p className="mt-1 text-sm text-orange-600">{errors.dimensions}</p>}
          </div>

          {/* Cargo Value */}
          <div>
            <label htmlFor="cargoValue" className="block text-sm font-medium text-gray-700 mb-1">Cargo Value<span className="text-red-500">*</span></label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-0 flex items-center pointer-events-none">
                <FaDollarSign className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="number"
                id="cargoValue"
                className={`block w-full pl-8 pr-3 py-2 sm:text-sm bg-transparent border-0 border-b border-gray-300 focus:ring-0 focus:border-blue-500 ${errors.cargoValue ? 'border-orange-500' : ''}`}
                placeholder="e.g., 10000"
                value={cargoValue}
                onChange={(e) => { setCargoValue(e.target.value === '' ? '' : Number(e.target.value)); setErrors((prev) => ({ ...prev, cargoValue: undefined })); }}
                min="0"
                required
              />
            </div>
            {errors.cargoValue && <p className="mt-1 text-sm text-orange-600">{errors.cargoValue}</p>}
          </div>

          {/* Hazardous Cargo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hazardous Cargo<span className="text-red-500">*</span></label>
            <div className={`flex items-center space-x-4 ${errors.hazardousCargo ? 'border border-orange-500 rounded-md p-2' : ''}`}>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="hazardousYes"
                  name="hazardousCargo"
                  checked={hazardousCargo === true}
                  onChange={() => { setHazardousCargo(true); setErrors((prev) => ({ ...prev, hazardousCargo: undefined })); }}
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <label htmlFor="hazardousYes" className="ml-2 block text-sm text-gray-900">
                  Yes
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="hazardousNo"
                  name="hazardousCargo"
                  checked={hazardousCargo === false}
                  onChange={() => { setHazardousCargo(false); setErrors((prev) => ({ ...prev, hazardousCargo: undefined })); }}
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <label htmlFor="hazardousNo" className="ml-2 block text-sm text-gray-900">
                  No
                </label>
              </div>
            </div>
            {errors.hazardousCargo && <p className="mt-1 text-sm text-orange-600">{errors.hazardousCargo}</p>}
          </div>

          {/* Insurance Required */}
          <div className="flex items-center mt-2">
            <input
              type="checkbox"
              id="insuranceRequired"
              checked={insuranceRequired}
              onChange={(e) => setInsuranceRequired(e.target.checked)}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="insuranceRequired" className="ml-2 block text-sm text-gray-900">
              Insurance Required
            </label>
          </div>

          {/* Detailed Description of Goods */}
          <div className="md:col-span-2">
            <label htmlFor="detailedDescriptionOfGoods" className="block text-sm font-medium text-gray-700 mb-1">Detailed Description of Goods</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-0 flex items-center pointer-events-none">
                <FaBox className="h-5 w-5 text-gray-400" />
              </div>
              <textarea
                id="detailedDescriptionOfGoods"
                rows={1}
                className="block w-full pl-8 pr-3 py-2 sm:text-sm bg-transparent border-0 border-b border-gray-300 focus:ring-0 focus:border-blue-500 resize-none"
                placeholder="e.g., 10 boxes of electronic components"
                value={detailedDescriptionOfGoods}
                onChange={(e) => setDetailedDescriptionOfGoods(e.target.value)}
              ></textarea>
            </div>
          </div>

          {/* HS Code */}
          <div>
            <label htmlFor="hsCode" className="block text-sm font-medium text-gray-700 mb-1">HS Code (Optional)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-0 flex items-center pointer-events-none">
                <FaCode className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="hsCode"
                className="block w-full pl-8 pr-3 py-2 sm:text-sm bg-transparent border-0 border-b border-gray-300 focus:ring-0 focus:border-blue-500"
                placeholder="e.g., 8517.62.00"
                value={hsCode}
                onChange={(e) => setHsCode(e.target.value)}
              />
            </div>
          </div>

          {/* Special Instructions */}
          <div>
            <label htmlFor="specialInstructions" className="block text-sm font-medium text-gray-700 mb-1">Special Instructions</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-0 flex items-center pointer-events-none">
                <FaTruckLoading className="h-5 w-5 text-gray-400" />
              </div>
              <textarea
                id="specialInstructions"
                rows={1}
                className="block w-full pl-8 pr-3 py-2 sm:text-sm bg-transparent border-0 border-b border-gray-300 focus:ring-0 focus:border-blue-500 resize-none"
                placeholder="e.g., Deliver only to authorized personnel"
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
              ></textarea>
            </div>
          </div>
        </div>

        {/* Action Buttons - Render ONLY if showButtons prop is true */}
        {showButtons && (
          <div className="flex justify-center space-x-4 mt-8">
            <button
              type="button" // IMPORTANT: Set type="button" to prevent default form submission
              onClick={handleSubmitLogic} // Call the core logic directly
              className="px-8 py-4 bg-blue-600 text-white font-bold text-xl rounded-xl shadow-lg hover:bg-blue-700 transition duration-300 transform hover:scale-105"
            >
              Search Quotes
            </button>
            <button
              type="button" // IMPORTANT: Set type="button"
              onClick={resetForm}
              className="px-8 py-4 bg-gray-300 text-gray-800 font-bold text-xl rounded-xl shadow-lg hover:bg-gray-400 transition duration-300 transform hover:scale-105"
            >
              Reset Form
            </button>
          </div>
        )}
      </form>

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

export default DoorToDoorQuoteForm;
