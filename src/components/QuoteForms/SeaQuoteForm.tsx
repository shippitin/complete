// src/components/QuoteForms/SeaQuoteForm.tsx
import React, { useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaMapMarkerAlt, FaCalendarAlt, FaWeight, FaBox, FaBoxes, FaTag, FaCube, FaTimesCircle, FaCheckCircle, FaInfoCircle } from 'react-icons/fa'; // Corrected: FaInfoCircle import
import type { SeaFormData, QuoteFormHandle, ParsedVoiceCommand, AllFormData } from '../../types/QuoteFormHandle'; // Import AllFormData
import { parseNumber } from '../../utils/parseNumber';

// Define the allowed activity types for validation and state
type ActivityTypeLiteral = 'Port to Port' | 'Door to Door' | 'Door to Port' | 'Port to Door';
const validActivityTypes: ActivityTypeLiteral[] = ['Port to Port', 'Door to Door', 'Door to Port', 'Port to Door'];

type ShipmentModeLiteral = 'LCL' | 'FCL';
const validShipmentModes: ShipmentModeLiteral[] = ['LCL', 'FCL'];

// Dummy data for ALL Commodities
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

// Define container types for the dropdown
const containerTypes = [
  { label: 'ALL', value: 'ALL' },
  { label: '20ft Standard', value: '20ft Standard' },
  { label: '40ft Standard', value: '40ft Standard' },
  { label: '40ft High Cube', value: '40ft High Cube' },
  { label: '40ft Open Top High', value: '40ft Open Top High' },
];

interface SeaQuoteFormProps {
  prefillData?: ParsedVoiceCommand;
  showButtons?: boolean; // NEW PROP: controls visibility of internal search/reset buttons
}

const SeaQuoteForm = forwardRef<QuoteFormHandle, SeaQuoteFormProps>(({ prefillData, showButtons = true }, ref) => {
  const navigate = useNavigate(); // Initialize useNavigate

  // State variables
  const [activityType, setActivityType] = useState<ActivityTypeLiteral>('Port to Port'); // Default activity type
  const [shipmentMode, setShipmentMode] = useState<ShipmentModeLiteral>('FCL'); // Default shipment mode

  // Fields for Port to Port/Door to Port/Door to Door
  const [originPort, setOriginPort] = useState('');
  const [destinationPort, setDestinationPort] = useState('');

  // Consolidated fields for Door to Door (City/Pincode) and parts of Door to Port/Port to Door
  const [originCityPincode, setOriginCityPincode] = useState('');
  const [destinationCityPincode, setDestinationCityPincode] = useState('');

  // Individual fields for Door services (origin or destination) when not Door to Door
  const [originCity, setOriginCity] = useState('');
  const [originAddress, setOriginAddress] = useState('');
  const [originPincode, setOriginPincode] = useState('');

  const [destinationCity, setDestinationCity] = useState('');
  const [destinationAddress, setDestinationAddress] = useState('');
  const [destinationPincode, setDestinationPincode] = useState('');

  const [readyDate, setReadyDate] = useState<Date | null>(new Date());
  const [totalWeight, setTotalWeight] = useState<number | ''>('');
  const [hazardousCargo, setHazardousCargo] = useState(false);
  const [commodity, setCommodity] = useState('FAK (Freight of All Kinds)');

  // LCL specific fields
  const [numberOfPieces, setNumberOfPieces] = useState<number | ''>('');
  const [volumeCBM, setVolumeCBM] = useState<number | ''>('');

  // FCL specific fields
  const [fclContainerType, setFclContainerType] = useState<SeaFormData['containerType']>('ALL');
  const [fclNumberOfContainers, setFclNumberOfContainers] = useState<number | ''>(1);

  // State for validation errors
  const [errors, setErrors] = useState<Partial<Record<keyof SeaFormData, string>>>({});
  // State for custom validation message box
  const [showValidationMessage, setShowValidationMessage] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');
  // State for success message
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');


  // Resets all relevant fields when activity type changes
  const resetFieldsForActivityTypeChange = (newActivityType: ActivityTypeLiteral) => {
    // Reset all location-related fields
    setOriginPort('');
    setOriginCity('');
    setOriginAddress('');
    setOriginPincode('');
    setOriginCityPincode('');
    setDestinationPort('');
    setDestinationCity('');
    setDestinationAddress('');
    setDestinationPincode('');
    setDestinationCityPincode('');

    // Reset other common fields
    setReadyDate(new Date());
    setTotalWeight('');
    setHazardousCargo(false);
    setCommodity('FAK (Freight of All Kinds)');
    setNumberOfPieces('');
    setVolumeCBM('');
    setFclContainerType('ALL');
    setFclNumberOfContainers(1);
    setErrors({}); // Clear errors
    setShowValidationMessage(false); // Hide validation message on reset
    setValidationMessage('');
    setShowSuccessMessage(false); // Hide success message on reset
    setSuccessMessage('');
  };

  // Prefill data effect
  useEffect(() => {
    if (prefillData) {
      if (prefillData.activityType && validActivityTypes.includes(prefillData.activityType as ActivityTypeLiteral)) {
        setActivityType(prefillData.activityType as ActivityTypeLiteral);
      } else {
        setActivityType('Port to Port'); // Default if prefill is invalid
      }

      if (prefillData.shipmentMode && validShipmentModes.includes(prefillData.shipmentMode as ShipmentModeLiteral)) {
        setShipmentMode(prefillData.shipmentMode as ShipmentModeLiteral);
      } else {
        setShipmentMode('FCL'); // Default if prefill is invalid
      }

      // Prefill logic based on activity type
      if (prefillData.activityType === 'Door to Door') {
        const originParts = [prefillData.originCity, prefillData.originPincode].filter(Boolean).join(', ');
        setOriginCityPincode(originParts || prefillData.origin || '');

        const destinationParts = [prefillData.destinationCity, prefillData.destinationPincode].filter(Boolean).join(', ');
        setDestinationCityPincode(destinationParts || prefillData.destination || '');

        setOriginCity(''); setOriginAddress(''); setOriginPincode('');
        setDestinationCity(''); setDestinationAddress(''); setDestinationPincode('');
        setOriginPort(''); setDestinationPort('');
      } else if (prefillData.activityType === 'Port to Port') {
        setOriginPort(prefillData.origin || prefillData.originPort || ''); // Use origin or originPort
        setDestinationPort(prefillData.destination || prefillData.destinationPort || ''); // Use destination or destinationPort
        setOriginCity(''); setOriginAddress(''); setOriginPincode(''); setOriginCityPincode('');
        setDestinationCity(''); setDestinationAddress(''); setDestinationPincode(''); setDestinationCityPincode('');
      } else if (prefillData.activityType === 'Door to Port') {
        // For Door to Port, prefill originCityPincode
        const originParts = [prefillData.originCity, prefillData.originPincode].filter(Boolean).join(', ');
        setOriginCityPincode(originParts || prefillData.origin || ''); // Use consolidated for origin

        setDestinationPort(prefillData.destination || prefillData.destinationPort || ''); // Use destination or destinationPort for destination port

        // Clear other individual fields not used for D2P UI
        setOriginCity(''); setOriginAddress(''); setOriginPincode('');
        setDestinationCity(''); setDestinationAddress(''); setDestinationPincode(''); setDestinationCityPincode('');
        setOriginPort(''); // Origin is not a port
      } else if (prefillData.activityType === 'Port to Door') {
        setOriginPort(prefillData.origin || prefillData.originPort || ''); // Use origin or originPort for origin port

        // For Port to Door, prefill destinationCityPincode
        const destinationParts = [prefillData.destinationCity, prefillData.destinationPincode].filter(Boolean).join(', ');
        setDestinationCityPincode(destinationParts || prefillData.destination || ''); // Use consolidated for destination

        // Clear other individual fields not used for P2D UI
        setOriginCity(''); setOriginAddress(''); setOriginPincode(''); setOriginCityPincode('');
        setDestinationCity(''); setDestinationAddress(''); setDestinationPincode('');
        setDestinationPort(''); // Destination is not a port
      }

      setReadyDate(prefillData.readyDate ? new Date(prefillData.readyDate) : new Date());
      setTotalWeight(parseNumber(prefillData.cargoWeight) ?? '');
      setHazardousCargo(prefillData.hazardousCargo || false);
      setCommodity(prefillData.commodity || prefillData.cargoType || 'FAK (Freight of All Kinds)');

      setNumberOfPieces(parseNumber(prefillData.numberOfPieces) ?? '');
      setVolumeCBM(parseNumber(prefillData.volumetricWeight) ?? '');

      if (prefillData.containerType) {
        setFclContainerType(prefillData.containerType as SeaFormData['containerType']);
      } else {
        setFclContainerType('ALL');
      }
      setFclNumberOfContainers(parseNumber(prefillData.numberOfContainers) ?? 1);
    }
  }, [prefillData]);


  const handleSubmitLogic = (): AllFormData | null => { // Explicitly return AllFormData | null
    const newErrors: Partial<Record<keyof SeaFormData, string>> = {};

    if (!activityType) newErrors.activityType = 'Activity Type is required.';
    if (!shipmentMode) newErrors.shipmentMode = 'Shipment Mode is required.';
    if (!readyDate) newErrors.readyDate = 'Date is required.';

    // Conditional validation based on activity type
    if (activityType === 'Door to Door') {
      if (!originCityPincode) newErrors.originCity = 'Origin (City/Pincode) is required.';
      if (!destinationCityPincode) newErrors.destinationCity = 'Destination (City/Pincode) is required.';
    } else if (activityType === 'Port to Port') {
      if (!originPort) newErrors.originPort = 'Origin Port is required.';
      if (!destinationPort) newErrors.destinationPort = 'Destination Port is required.';
    } else if (activityType === 'Door to Port') {
      if (!originCityPincode) newErrors.originCity = 'Origin (City/Pincode) is required.';
      if (!destinationPort) newErrors.destinationPort = 'Destination Port is required.';
    } else if (activityType === 'Port to Door') {
      if (!originPort) newErrors.originPort = 'Origin Port is required.';
      if (!destinationCityPincode) newErrors.destinationCity = 'Destination (City/Pincode) is required.';
    }

    const finalTotalWeight = parseNumber(totalWeight);
    if (finalTotalWeight === undefined || finalTotalWeight <= 0) newErrors.totalWeight = 'Total Weight is required and must be greater than 0.';
    if (!commodity) newErrors.commodity = 'Commodity is required.';

    // LCL specific validation
    if (shipmentMode === 'LCL') {
      const finalNumberOfPieces = parseNumber(numberOfPieces);
      if (finalNumberOfPieces === undefined || finalNumberOfPieces <= 0) newErrors.numberOfPieces = 'Number of Pieces is required and must be greater than 0 for LCL.';
      const finalVolumeCBM = parseNumber(volumeCBM);
      if (finalVolumeCBM === undefined || finalVolumeCBM <= 0) newErrors.volumeCBM = 'Volume (CBM) is required and must be greater than 0 for LCL.';
    }

    // FCL specific validation
    if (shipmentMode === 'FCL') {
      if (!fclContainerType) newErrors.containerType = 'Container Type is required for FCL.';
      const finalFclNumberOfContainers = parseNumber(fclNumberOfContainers);
      if (finalFclNumberOfContainers === undefined || finalFclNumberOfContainers <= 0) {
        newErrors.numberOfContainers = 'Number of Containers is required and must be greater than 0 for FCL.';
      }
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      setValidationMessage('Please fill in all required fields correctly.');
      setShowValidationMessage(true);
      return null;
    }

    // Construct formData
    const formData: SeaFormData = {
      bookingType: 'Sea',
      activityType: activityType as ActivityTypeLiteral,
      shipmentMode: shipmentMode as ShipmentModeLiteral,
      readyDate: readyDate ? readyDate.toISOString().split('T')[0] : '',
      totalWeight: finalTotalWeight as number,
      commodity: commodity,
      cargoType: commodity, // Assigning commodity to cargoType to satisfy interface
      hazardousCargo,
      // Initialize all optional fields to undefined, then set conditionally
      originPort: undefined,
      originCity: undefined,
      originAddress: undefined,
      originPincode: undefined,
      destinationPort: undefined,
      destinationCity: undefined,
      destinationAddress: undefined,
      destinationPincode: undefined,
      dimensions: undefined,
      cargoValue: undefined,
      insuranceRequired: false,
      incoterms: undefined,
      hsCode: undefined,
      stuffingPoint: undefined,
      detailedDescriptionOfGoods: undefined,
      commodityCategory: '',
      numberOfPieces: undefined,
      volumeCBM: undefined,
      containerType: undefined,
      numberOfContainers: undefined,
    };

    // Conditionally assign fields based on activity type
    if (activityType === 'Port to Port') {
      formData.originPort = originPort;
      formData.destinationPort = destinationPort;
    } else if (activityType === 'Door to Port') {
      formData.originCity = originCityPincode;
      formData.destinationPort = destinationPort;
      formData.originPincode = undefined;
      formData.originAddress = undefined;
      formData.destinationCity = undefined;
      formData.destinationAddress = undefined;
      formData.destinationPincode = undefined;
      formData.originPort = undefined;
    } else if (activityType === 'Port to Door') {
      formData.originPort = originPort;
      formData.destinationCity = destinationCityPincode;
      formData.originCity = undefined;
      formData.originAddress = undefined;
      formData.originPincode = undefined;
      formData.destinationAddress = undefined;
      formData.destinationPincode = undefined;
      formData.destinationPort = undefined;
    } else if (activityType === 'Door to Door') {
      formData.originCity = originCityPincode;
      formData.destinationCity = destinationCityPincode;
      formData.originPincode = undefined;
      formData.originAddress = undefined;
      formData.destinationPincode = undefined;
      formData.destinationAddress = undefined;
      formData.originPort = undefined;
      formData.destinationPort = undefined;
    }

    // Add LCL specific fields
    if (shipmentMode === 'LCL') {
      formData.numberOfPieces = parseNumber(numberOfPieces);
      formData.volumeCBM = parseNumber(volumeCBM);
    }

    // Add FCL specific fields
    if (shipmentMode === 'FCL') {
      formData.containerType = fclContainerType === 'ALL' ? undefined : fclContainerType;
      formData.numberOfContainers = parseNumber(fclNumberOfContainers);
    }

    // If showButtons is true (i.e., on standalone page), then navigate directly
    // Otherwise (when embedded in HeroSection), just return the data.
    if (showButtons) {
      navigate('/sea-results', { state: { formData } });
      setSuccessMessage('Search initiated. Redirecting to results...');
      setShowSuccessMessage(true);
    } else {
      setSuccessMessage('Form data collected successfully.');
      setShowSuccessMessage(true);
    }
    return formData; // Always return formData for HeroSection to use
  };

  // Extracted reset logic into its own function
  const resetForm = () => {
    setActivityType('Port to Port');
    setShipmentMode('FCL');
    setOriginPort('');
    setDestinationPort('');
    setOriginCityPincode('');
    setDestinationCityPincode('');
    setOriginCity('');
    setOriginAddress('');
    setOriginPincode('');
    setDestinationCity('');
    setDestinationAddress('');
    setDestinationPincode('');
    setReadyDate(new Date());
    setTotalWeight('');
    setHazardousCargo(false);
    setCommodity('FAK (Freight of All Kinds)');
    setNumberOfPieces('');
    setVolumeCBM('');
    setFclContainerType('ALL');
    setFclNumberOfContainers(1);
    setErrors({});
    setShowValidationMessage(false);
    setValidationMessage('');
    setShowSuccessMessage(false);
    setSuccessMessage('');
  };

  useImperativeHandle(ref, () => {
    return {
      submit: () => { // Explicit arrow function for submit
        return handleSubmitLogic();
      },
      reset: () => { // Explicit arrow function for reset
        resetForm();
      }
    };
  });

  return (
    <div className="space-y-6 p-6 bg-white rounded-xl shadow-md border border-gray-200 font-inter">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Sea Freight</h2>

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
              {type}
            </button>
          ))}
        </div>
        {errors.activityType && <p className="mt-1 text-sm text-orange-600">{errors.activityType}</p>}
      </div>

      {/* Shipment Mode Selection as Buttons */}
      <div className="mb-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className={`col-span-1 ${errors.shipmentMode ? 'border-2 border-orange-500 rounded-lg p-1' : ''}`}>
            <div className="grid grid-cols-2 gap-2">
              <button
                key="FCL"
                type="button"
                onClick={() => {
                  setShipmentMode('FCL');
                  setErrors((prev) => ({ ...prev, shipmentMode: undefined }));
                  setNumberOfPieces(''); // Reset LCL specific field
                  setVolumeCBM(''); // Reset LCL specific field
                  setFclContainerType('ALL'); // Reset FCL container type to default 'ALL'
                  setFclNumberOfContainers(1); // Reset FCL number of containers to default 1
                }}
                className={`flex items-center justify-center px-2 py-1 rounded-lg text-xs font-medium transition-all duration-200 ease-in-out ${shipmentMode === 'FCL' ? 'bg-blue-100 text-blue-800 shadow-sm border border-blue-200' : 'bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-600 border border-gray-300'}`}
              >
                FCL
              </button>
              <button
                key="LCL"
                type="button"
                onClick={() => {
                  setShipmentMode('LCL');
                  setErrors((prev) => ({ ...prev, shipmentMode: undefined }));
                  setNumberOfPieces(''); // Reset LCL specific field
                  setVolumeCBM(''); // Reset LCL specific field
                  setFclContainerType(undefined); // Set to undefined instead of ''
                  setFclNumberOfContainers(''); // Reset FCL number of containers (not applicable for LCL)
                }}
                className={`flex items-center justify-center px-2 py-1 rounded-lg text-xs font-medium transition-all duration-200 ease-in-out ${shipmentMode === 'LCL' ? 'bg-blue-100 text-blue-800 shadow-sm border border-blue-200' : 'bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-600 border border-gray-300'}`}
              >
                LCL
              </button>
            </div>
            {errors.shipmentMode && <p className="mt-1 text-sm text-orange-600">{errors.shipmentMode}</p>}
          </div>
          <div className="col-span-3"></div>
        </div>
      </div>

      {/* Conditional Rendering of Fields based on Activity Type */}
      {activityType === 'Door to Door' ? (
        <>
          {/* Row 1: Origin (City/Pincode), Destination (City/Pincode), Container Type/No. of Pieces, Date */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-4">
            {/* Origin (City/Pincode) */}
            <div className="md:col-span-1">
              <label htmlFor="seaOriginCityPincode" className="block text-sm font-medium text-gray-700 mb-1">Origin (City/Pincode)<span className="text-red-500">*</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-0 flex items-center pointer-events-none">
                  <FaMapMarkerAlt className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="seaOriginCityPincode"
                  className={`block w-full pl-8 pr-3 py-2 sm:text-sm bg-transparent border-0 border-b border-gray-300 focus:ring-0 focus:border-blue-500 ${errors.originCity ? 'border-orange-500' : ''}`}
                  placeholder="e.g., Chennai, 600001"
                  value={originCityPincode}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setOriginCityPincode(e.target.value); setErrors((prev) => ({ ...prev, originCity: undefined })); }}
                  required
                />
              </div>
              {errors.originCity && <p className="mt-1 text-sm text-orange-600">{errors.originCity}</p>}
            </div>

            {/* Destination (City/Pincode) */}
            <div className="md:col-span-1">
              <label htmlFor="seaDestinationCityPincode" className="block text-sm font-medium text-gray-700 mb-1">Destination (City/Pincode)<span className="text-red-500">*</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-0 flex items-center pointer-events-none">
                  <FaMapMarkerAlt className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="seaDestinationCityPincode"
                  className={`block w-full pl-8 pr-3 py-2 sm:text-sm bg-transparent border-0 border-b border-gray-300 focus:ring-0 focus:border-blue-500 ${errors.destinationCity ? 'border-orange-500' : ''}`}
                  placeholder="e.g., Los Angeles, 90210"
                  value={destinationCityPincode}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setDestinationCityPincode(e.target.value); setErrors((prev) => ({ ...prev, destinationCity: undefined })); }}
                  required
                />
              </div>
              {errors.destinationCity && <p className="mt-1 text-sm text-orange-600">{errors.destinationCity}</p>}
            </div>

            {/* Conditional Cargo Unit Type (Container Type for FCL / No. of Pieces for LCL) */}
            {shipmentMode === 'FCL' && (
              <div className="md:col-span-1">
                <label htmlFor="fclContainerType" className="block text-sm font-medium text-gray-700 mb-1">Container Type<span className="text-red-500">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-0 flex items-center pointer-events-none">
                    <FaCube className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    id="fclContainerType"
                    className={`block w-full pl-8 pr-3 py-2 sm:text-sm bg-transparent border-0 border-b border-gray-300 focus:ring-0 focus:border-blue-500 ${errors.containerType ? 'border-orange-500' : ''}`}
                    value={fclContainerType}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => { setFclContainerType(e.target.value as SeaFormData['containerType']); setErrors((prev) => ({ ...prev, containerType: undefined })); }}
                    required
                  >
                    {containerTypes.map((type) => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
                {errors.containerType && <p className="mt-1 text-sm text-orange-600">{errors.containerType}</p>}
              </div>
            )}

            {shipmentMode === 'LCL' && (
              <div className="md:col-span-1">
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
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setNumberOfPieces(e.target.value === '' ? '' : Number(e.target.value)); setErrors((prev) => ({ ...prev, numberOfPieces: undefined })); }}
                    min="1"
                    required
                  />
                </div>
                {errors.numberOfPieces && <p className="mt-1 text-sm text-orange-600">{errors.numberOfPieces}</p>}
              </div>
            )}

            {/* Date Field */}
            <div className="md:col-span-1">
              <label htmlFor="seaReadyDate" className="block text-sm font-medium text-gray-700 mb-1">Date<span className="text-red-500">*</span></label>
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

          {/* Row 2: Total Weight, Number of Containers/Volume, Commodity, Hazardous Cargo */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-4">
            {/* Total Weight */}
            <div className="md:col-span-1">
              <label htmlFor="seaTotalWeight" className="block text-sm font-medium text-gray-700 mb-1">Total Weight (Kgs)<span className="text-red-500">*</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-0 flex items-center pointer-events-none">
                  <FaWeight className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="number"
                  id="seaTotalWeight"
                  className={`block w-full pl-8 pr-3 py-2 sm:text-sm bg-transparent border-0 border-b border-gray-300 focus:ring-0 focus:border-blue-500 ${errors.totalWeight ? 'border-orange-500' : ''}`}
                  placeholder="e.g., 20000"
                  value={totalWeight}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setTotalWeight(e.target.value === '' ? '' : Number(e.target.value)); setErrors((prev) => ({ ...prev, totalWeight: undefined })); }}
                  required
                />
              </div>
              {errors.totalWeight && <p className="mt-1 text-sm text-orange-600">{errors.totalWeight}</p>}
            </div>

            {/* Conditional Cargo Unit Count/Volume (Number of Containers for FCL / Volume (CBM) for LCL) */}
            {shipmentMode === 'FCL' && (
              <div className="md:col-span-1">
                <label htmlFor="fclNumberOfContainers" className="block text-sm font-medium text-gray-700 mb-1">Number of Containers<span className="text-red-500">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-0 flex items-center pointer-events-none">
                    <FaBoxes className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    id="fclNumberOfContainers"
                    className={`block w-full pl-8 pr-3 py-2 sm:text-sm bg-transparent border-0 border-b border-gray-300 focus:ring-0 focus:focus:border-blue-500 ${errors.numberOfContainers ? 'border-orange-500' : ''}`}
                    placeholder="e.g., 1"
                    value={fclNumberOfContainers}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setFclNumberOfContainers(e.target.value === '' ? '' : Number(e.target.value)); setErrors((prev) => ({ ...prev, numberOfContainers: undefined })); }}
                    min="1"
                    required
                  />
                </div>
                {errors.numberOfContainers && <p className="mt-1 text-sm text-orange-600">{errors.numberOfContainers}</p>}
              </div>
            )}

            {shipmentMode === 'LCL' && (
              <div className="md:col-span-1">
                <label htmlFor="volumeCBM" className="block text-sm font-medium text-gray-700 mb-1">Volume (CBM)<span className="text-red-500">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-0 flex items-center pointer-events-none">
                    <FaCube className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    id="volumeCBM"
                    className={`block w-full pl-8 pr-3 py-2 sm:text-sm bg-transparent border-0 border-b border-gray-300 focus:ring-0 focus:border-blue-500 ${errors.volumeCBM ? 'border-orange-500' : ''}`}
                    placeholder="e.g., 1.5"
                    value={volumeCBM}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setVolumeCBM(e.target.value === '' ? '' : Number(e.target.value)); setErrors((prev) => ({ ...prev, volumeCBM: undefined })); }}
                    step="0.01"
                    min="0.01"
                    required
                  />
                </div>
                {errors.volumeCBM && <p className="mt-1 text-sm text-orange-600">{errors.volumeCBM}</p>}
              </div>
            )}

            {/* Commodity */}
            <div className="md:col-span-1">
              <label htmlFor="commodity" className="block text-sm font-medium text-gray-700 mb-1">Select Commodity<span className="text-red-500">*</span></label>
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
                  required
                >
                  <option value="">Select Commodity</option>
                  {allCommodities.map((item) => (
                    <option key={item.value} value={item.value}>{item.label}</option>
                  ))}
                </select>
              </div>
              {errors.commodity && <p className="mt-1 text-sm text-orange-600">{errors.commodity}</p>}
            </div>

            {/* Hazardous Cargo */}
            <div className="flex items-center mt-2 md:col-span-1">
              <input
                type="checkbox"
                id="seaHazardousCargo"
                checked={hazardousCargo}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setHazardousCargo(e.target.checked)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="seaHazardousCargo" className="ml-2 block text-sm text-gray-900">
                Hazardous Cargo
              </label>
            </div>
          </div>
        </>
      ) : (
        // Existing layout for Port to Port, Port to Door, Door to Port
        <>
          {/* First Logical Row: Origin, Destination, Conditional Cargo Unit Type, Date */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-4">
            {/* Origin Fields */}
            {activityType === 'Port to Port' && (
              <div className="md:col-span-1">
                <label htmlFor="seaOriginPort" className="block text-sm font-medium text-gray-700 mb-1">Origin Port<span className="text-red-500">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-0 flex items-center pointer-events-none">
                    <FaMapMarkerAlt className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="seaOriginPort"
                    className={`block w-full pl-8 pr-3 py-2 sm:text-sm bg-transparent border-0 border-b border-gray-300 focus:ring-0 focus:border-blue-500 ${errors.originPort ? 'border-orange-500' : ''}`}
                    placeholder="e.g., INMAA, Chennai (India)"
                    value={originPort}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setOriginPort(e.target.value); setErrors((prev) => ({ ...prev, originPort: undefined })); }}
                    required
                  />
                </div>
                {errors.originPort && <p className="mt-1 text-sm text-orange-600">{errors.originPort}</p>}
              </div>
            )}
            {activityType === 'Door to Port' && (
              <div className="md:col-span-1">
                <label htmlFor="seaOriginCityPincode" className="block text-sm font-medium text-gray-700 mb-1">Origin (City/Pincode)<span className="text-red-500">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-0 flex items-center pointer-events-none">
                    <FaMapMarkerAlt className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="seaOriginCityPincode"
                    className={`block w-full pl-8 pr-3 py-2 sm:text-sm bg-transparent border-0 border-b border-gray-300 focus:ring-0 focus:border-blue-500 ${errors.originCity ? 'border-orange-500' : ''}`}
                    placeholder="e.g., Chennai, 600001"
                    value={originCityPincode}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setOriginCityPincode(e.target.value); setErrors((prev) => ({ ...prev, originCity: undefined })); }}
                    required
                  />
                </div>
                {errors.originCity && <p className="mt-1 text-sm text-orange-600">{errors.originCity}</p>}
              </div>
            )}
            {activityType === 'Port to Door' && (
              <div className="md:col-span-1">
                <label htmlFor="seaOriginPort" className="block text-sm font-medium text-gray-700 mb-1">Origin Port<span className="text-red-500">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-0 flex items-center pointer-events-none">
                    <FaMapMarkerAlt className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="seaOriginPort"
                    className={`block w-full pl-8 pr-3 py-2 sm:text-sm bg-transparent border-0 border-b border-gray-300 focus:ring-0 focus:border-blue-500 ${errors.originPort ? 'border-orange-500' : ''}`}
                    placeholder="e.g., INMAA, Chennai (India)"
                    value={originPort}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setOriginPort(e.target.value); setErrors((prev) => ({ ...prev, originPort: undefined })); }}
                    required
                  />
                </div>
                {errors.originPort && <p className="mt-1 text-sm text-orange-600">{errors.originPort}</p>}
              </div>
            )}


            {/* Destination Fields */}
            {activityType === 'Port to Port' && (
              <div className="md:col-span-1">
                <label htmlFor="seaDestinationPort" className="block text-sm font-medium text-gray-700 mb-1">Destination Port<span className="text-red-500">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-0 flex items-center pointer-events-none">
                    <FaMapMarkerAlt className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="seaDestinationPort"
                    className={`block w-full pl-8 pr-3 py-2 sm:text-sm bg-transparent border-0 border-b border-gray-300 focus:ring-0 focus:border-blue-500 ${errors.destinationPort ? 'border-orange-500' : ''}`}
                    placeholder="e.g., USLAX, Los Angeles (USA)"
                    value={destinationPort}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setDestinationPort(e.target.value); setErrors((prev) => ({ ...prev, destinationPort: undefined })); }}
                    required
                  />
                </div>
                {errors.destinationPort && <p className="mt-1 text-sm text-orange-600">{errors.destinationPort}</p>}
              </div>
            )}
            {activityType === 'Door to Port' && (
              <div className="md:col-span-1">
                <label htmlFor="seaDestinationPort" className="block text-sm font-medium text-gray-700 mb-1">Destination Port<span className="text-red-500">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-0 flex items-center pointer-events-none">
                    <FaMapMarkerAlt className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="seaDestinationPort"
                    className={`block w-full pl-8 pr-3 py-2 sm:text-sm bg-transparent border-0 border-b border-gray-300 focus:ring-0 focus:border-blue-500 ${errors.destinationPort ? 'border-orange-500' : ''}`}
                    placeholder="e.g., USLAX, Los Angeles (USA)"
                    value={destinationPort}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setDestinationPort(e.target.value); setErrors((prev) => ({ ...prev, destinationPort: undefined })); }}
                    required
                  />
                </div>
                {errors.destinationPort && <p className="mt-1 text-sm text-orange-600">{errors.destinationPort}</p>}
              </div>
            )}
            {activityType === 'Port to Door' && (
              <div className="md:col-span-1">
                <label htmlFor="seaDestinationCityPincode" className="block text-sm font-medium text-gray-700 mb-1">Destination (City/Pincode)<span className="text-red-500">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-0 flex items-center pointer-events-none">
                    <FaMapMarkerAlt className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="seaDestinationCityPincode"
                    className={`block w-full pl-8 pr-3 py-2 sm:text-sm bg-transparent border-0 border-b border-gray-300 focus:ring-0 focus:border-blue-500 ${errors.destinationCity ? 'border-orange-500' : ''}`}
                    placeholder="e.g., Los Angeles, 90210"
                    value={destinationCityPincode}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setDestinationCityPincode(e.target.value); setErrors((prev) => ({ ...prev, destinationCity: undefined })); }}
                    required
                  />
                </div>
                {errors.destinationCity && <p className="mt-1 text-sm text-orange-600">{errors.destinationCity}</p>}
              </div>
            )}

            {/* Conditional Cargo Unit Type (Container Type for FCL / No. of Pieces for LCL) */}
            {shipmentMode === 'FCL' && (
              <div className="md:col-span-1">
                <label htmlFor="fclContainerType" className="block text-sm font-medium text-gray-700 mb-1">Container Type<span className="text-red-500">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-0 flex items-center pointer-events-none">
                    <FaCube className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    id="fclContainerType"
                    className={`block w-full pl-8 pr-3 py-2 sm:text-sm bg-transparent border-0 border-b border-gray-300 focus:ring-0 focus:border-blue-500 ${errors.containerType ? 'border-orange-500' : ''}`}
                    value={fclContainerType}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => { setFclContainerType(e.target.value as SeaFormData['containerType']); setErrors((prev) => ({ ...prev, containerType: undefined })); }}
                    required
                  >
                    {containerTypes.map((type) => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
                {errors.containerType && <p className="mt-1 text-sm text-orange-600">{errors.containerType}</p>}
              </div>
            )}

            {shipmentMode === 'LCL' && (
              <div className="md:col-span-1">
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
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setNumberOfPieces(e.target.value === '' ? '' : Number(e.target.value)); setErrors((prev) => ({ ...prev, numberOfPieces: undefined })); }}
                    min="1"
                    required
                  />
                </div>
                {errors.numberOfPieces && <p className="mt-1 text-sm text-orange-600">{errors.numberOfPieces}</p>}
              </div>
            )}

            {/* Date Field */}
            <div className="md:col-span-1">
              <label htmlFor="seaReadyDate" className="block text-sm font-medium text-gray-700 mb-1">Date<span className="text-red-500">*</span></label>
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

          {/* Second Logical Row: Total Weight, Conditional Cargo Unit Count/Volume, Commodity, Hazardous Cargo */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-4">
            {/* Total Weight */}
            <div className="md:col-span-1">
              <label htmlFor="seaTotalWeight" className="block text-sm font-medium text-gray-700 mb-1">Total Weight (Kgs)<span className="text-red-500">*</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-0 flex items-center pointer-events-none">
                  <FaWeight className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="number"
                  id="seaTotalWeight"
                  className={`block w-full pl-8 pr-3 py-2 sm:text-sm bg-transparent border-0 border-b border-gray-300 focus:ring-0 focus:border-blue-500 ${errors.totalWeight ? 'border-orange-500' : ''}`}
                  placeholder="e.g., 20000"
                  value={totalWeight}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setTotalWeight(e.target.value === '' ? '' : Number(e.target.value)); setErrors((prev) => ({ ...prev, totalWeight: undefined })); }}
                  required
                />
              </div>
              {errors.totalWeight && <p className="mt-1 text-sm text-orange-600">{errors.totalWeight}</p>}
            </div>

            {/* Conditional Cargo Unit Count/Volume (Number of Containers for FCL / Volume (CBM) for LCL) */}
            {shipmentMode === 'FCL' && (
              <div className="md:col-span-1">
                <label htmlFor="fclNumberOfContainers" className="block text-sm font-medium text-gray-700 mb-1">Number of Containers<span className="text-red-500">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-0 flex items-center pointer-events-none">
                    <FaBoxes className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    id="fclNumberOfContainers"
                    className={`block w-full pl-8 pr-3 py-2 sm:text-sm bg-transparent border-0 border-b border-gray-300 focus:ring-0 focus:focus:border-blue-500 ${errors.numberOfContainers ? 'border-orange-500' : ''}`}
                    placeholder="e.g., 1"
                    value={fclNumberOfContainers}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setFclNumberOfContainers(e.target.value === '' ? '' : Number(e.target.value)); setErrors((prev) => ({ ...prev, numberOfContainers: undefined })); }}
                    min="1"
                    required
                  />
                </div>
                {errors.numberOfContainers && <p className="mt-1 text-sm text-orange-600">{errors.numberOfContainers}</p>}
              </div>
            )}

            {shipmentMode === 'LCL' && (
              <div className="md:col-span-1">
                <label htmlFor="volumeCBM" className="block text-sm font-medium text-gray-700 mb-1">Volume (CBM)<span className="text-red-500">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-0 flex items-center pointer-events-none">
                    <FaCube className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    id="volumeCBM"
                    className={`block w-full pl-8 pr-3 py-2 sm:text-sm bg-transparent border-0 border-b border-gray-300 focus:ring-0 focus:border-blue-500 ${errors.volumeCBM ? 'border-orange-500' : ''}`}
                    placeholder="e.g., 1.5"
                    value={volumeCBM}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setVolumeCBM(e.target.value === '' ? '' : Number(e.target.value)); setErrors((prev) => ({ ...prev, volumeCBM: undefined })); }}
                    step="0.01"
                    min="0.01"
                    required
                  />
                </div>
                {errors.volumeCBM && <p className="mt-1 text-sm text-orange-600">{errors.volumeCBM}</p>}
              </div>
            )}

            {/* Commodity */}
            <div className="md:col-span-1">
              <label htmlFor="commodity" className="block text-sm font-medium text-gray-700 mb-1">Select Commodity<span className="text-red-500">*</span></label>
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
                  required
                >
                  <option value="">Select Commodity</option>
                  {allCommodities.map((item) => (
                    <option key={item.value} value={item.value}>{item.label}</option>
                  ))}
                </select>
              </div>
              {errors.commodity && <p className="mt-1 text-sm text-orange-600">{errors.commodity}</p>}
            </div>

            {/* Hazardous Cargo */}
            <div className="flex items-center mt-2 md:col-span-1">
              <input
                type="checkbox"
                id="seaHazardousCargo"
                checked={hazardousCargo}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setHazardousCargo(e.target.checked)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="seaHazardousCargo" className="ml-2 block text-sm text-gray-900">
                Hazardous Cargo
              </label>
            </div>
          </div>
        </>
      )}

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
            onClick={resetForm} // Now correctly referencing the local resetForm function
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
              <FaInfoCircle className="text-orange-500 h-8 w-8 mr-3" /> {/* CORRECTED: FaInfoCircle here */}
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

export default SeaQuoteForm;
