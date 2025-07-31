// src/components/QuoteForms/RailQuoteForm.tsx
import React, { useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTrain, FaBoxOpen, FaBoxes, FaHome, FaGlobeAmericas, FaCalendarAlt, FaWeightHanging, FaCube, FaInfoCircle, FaRulerCombined, FaTag } from 'react-icons/fa'; // Re-added react-icons/fa import

// Import all necessary types from the centralized types file
import {
  QuoteFormHandle,
  TrainContainerFormData,
  TrainGoodsFormData,
  TrainParcelFormData,
  RailServiceType,
  ParsedVoiceCommand, // Import ParsedVoiceCommand directly
  BookingType // Also import BookingType if used in logic for service determination
} from '../../types/QuoteFormHandle'; // Adjust path as per your project structure

// --- Utility Function ---
const parseNumber = (value: string | number | undefined | null): number | undefined => {
  if (value === null || value === undefined || value === '') {
    return undefined;
  }
  const num = Number(value);
  return isNaN(num) ? undefined : num;
};

// --- Component Data Definitions (Constants) ---

// Define valid booking tabs for the form
type BookingTab = "container" | "parcel" | "goods";
const validBookingTabs: BookingTab[] = ["container", "parcel", "goods"];

// Define valid container modes for international/domestic
type ContainerMode = "domestic" | "international";
const validContainerModes: ContainerMode[] = ["domestic", "international"];

// Define valid rail service types (Terminal to Terminal, Door to Door, etc.)
// This should match RailServiceType from QuoteFormHandle.ts
const validRailServiceTypes: RailServiceType[] = ["terminalToTerminal", "doorToDoor", "doorToTerminal", "terminalToDoor"];

// List of all possible cargo commodities
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

// List of available container types - UPDATED: Removed 'ALL' option
const containerTypes = [
  { label: '20ft Standard', value: '20ft Standard' },
  { label: '20ft High Cube', value: '20ft High Cube' },
  { label: '20ft High Cube Reefer', value: '20ft High Cube Reefer' },
  { label: '40ft Standard', value: '40ft Standard' },
  { label: '40ft High Cube', value: '40ft High Cube' },
  { label: '40ft High Cube Reefer', value: '40ft High Cube Reefer' },
  { label: '40ft Open Top High', value: '40ft Open Top High' },
];

// List of available wagon types for goods transport
const wagonTypes = [
  { label: 'Open Wagon', value: 'Open Wagon' },
  { label: 'Covered Wagon', value: 'Covered Wagon' },
  { label: 'Flat Wagon', value: 'Flat Wagon' },
  { label: 'Hopper Wagon', value: 'Hopper Wagon' },
  { label: 'Other', value: 'Other' },
];

// Props interface for the RailQuoteForm component
interface RailQuoteFormProps {
  initialActiveService?: BookingTab;
  prefillData?: ParsedVoiceCommand; // Correctly uses the imported ParsedVoiceCommand
  showButtons?: boolean;
}

// RailQuoteForm component, forwarded ref to expose submit and reset methods
const RailQuoteForm = forwardRef<QuoteFormHandle, RailQuoteFormProps>(({ initialActiveService = "container", prefillData, showButtons = true }, ref) => {
  const navigate = useNavigate();

  // State to manage the currently active booking tab (Container, Parcel, Goods)
  const [activeTab, setActiveTab] = useState<BookingTab>(initialActiveService);

  // --- Container Booking States ---
  const [containerOriginTerminal, setContainerOriginTerminal] = useState('');
  const [containerDestinationTerminal, setContainerDestinationTerminal] = useState('');
  const [containerOriginAddress, setContainerOriginAddress] = useState('');
  const [containerDestinationAddress, setContainerDestinationAddress] = useState('');
  const [containerNumberOfContainers, setContainerNumberOfContainers] = useState<number | ''>(1);
  const [containerType, setContainerType] = useState(''); // Changed default from 'ALL' to ''
  const [containerTotalWeight, setContainerTotalWeight] = useState<number | ''>('');
  const [containerCommodity, setContainerCommodity] = useState('FAK (Freight of All Kinds)');
  const [containerMode, setContainerMode] = useState<ContainerMode>("domestic");
  const [containerHazardousCargo, setContainerHazardousCargo] = useState<boolean | ''>(false);
  const [containerDate, setContainerDate] = useState<Date | null>(new Date());
  const [containerServiceType, setContainerServiceType] = useState<RailServiceType | ''>('terminalToTerminal');

  // --- Goods Booking States ---
  const [goodsOriginTerminal, setGoodsOriginTerminal] = useState('');
  const [goodsDestinationTerminal, setGoodsDestinationTerminal] = useState('');
  const [goodsOriginAddress, setGoodsOriginAddress] = useState('');
  const [goodsDestinationAddress, setGoodsDestinationAddress] = useState('');
  const [goodsTotalWeight, setGoodsTotalWeight] = useState<number | ''>('');
  const [goodsCommodity, setGoodsCommodity] = useState('FAK (Freight of All Kinds)');
  const [goodsWagonType, setGoodsWagonType] = useState('');
  const [goodsNumberOfWagons, setGoodsNumberOfWagons] = useState<number | ''>(1);
  const [goodsHazardousCargo, setGoodsHazardousCargo] = useState<boolean | ''>(false);
  const [goodsDate, setGoodsDate] = useState<Date | null>(new Date());
  const [goodsServiceType, setGoodsServiceType] = useState<RailServiceType | ''>('terminalToTerminal');

  // --- Parcel Booking States ---
  const [parcelOriginTerminal, setParcelOriginTerminal] = useState('');
  const [parcelDestinationTerminal, setParcelDestinationTerminal] = useState('');
  const [parcelOriginAddress, setParcelOriginAddress] = useState('');
  const [parcelDestinationAddress, setParcelDestinationAddress] = useState('');
  const [parcelTotalWeight, setParcelTotalWeight] = useState<number | ''>('');
  const [parcelDimensions, setParcelDimensions] = useState('');
  const [parcelDetailedDescriptionOfGoods, setParcelDetailedDescriptionOfGoods] = useState('');
  const [parcelHazardousCargo, setParcelHazardousCargo] = useState<boolean | ''>(false);
  const [parcelDate, setParcelDate] = useState<Date | null>(new Date());
  const [parcelCount, setParcelCount] = useState<number | ''>(1);
  const [parcelServiceType, setParcelServiceType] = useState<RailServiceType | ''>('terminalToTerminal');

  // --- Validation and Message States ---
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [showValidationMessage, setShowValidationMessage] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Effect to set the initial active tab based on props
  useEffect(() => {
    if (initialActiveService && validBookingTabs.includes(initialActiveService)) {
      setActiveTab(initialActiveService);
    }
  }, [initialActiveService]);

  // Effect to prefill form data based on ParsedVoiceCommand prop
  useEffect(() => {
    if (prefillData) {
      let targetTab: BookingTab = activeTab;

      // Determine the target tab based on prefill data service type
      // Use BookingType from QuoteFormHandle.ts for comparison
      if (typeof prefillData.service === 'string') {
        if (prefillData.service === 'Train Container Booking' || (prefillData.service === 'Rail' && prefillData.containerType)) {
          targetTab = 'container';
        } else if (prefillData.service === 'Train Goods Booking' || (prefillData.service === 'Rail' && prefillData.wagonType)) {
          targetTab = 'goods';
        } else if (prefillData.service === 'Train Parcel Booking' || (prefillData.service === 'Rail' && prefillData.parcelCount)) {
          targetTab = 'parcel';
        }
      }

      setActiveTab(targetTab);

      // Handle isDomestic: Convert string "true"/"false" to boolean
      if (prefillData.isDomestic !== undefined) {
        const domesticValue = typeof prefillData.isDomestic === 'string'
          ? prefillData.isDomestic.toLowerCase() === 'true'
          : prefillData.isDomestic;
        setContainerMode(domesticValue ? 'domestic' : 'international');
      }

      // Prefill data for Container tab
      if (targetTab === 'container') {
        setContainerOriginTerminal(prefillData.originTerminal || prefillData.originStation || prefillData.origin || prefillData.originStationCity || '');
        setContainerDestinationTerminal(prefillData.destinationTerminal || prefillData.destinationStation || prefillData.destination || prefillData.destinationStationCity || '');
        setContainerOriginAddress(prefillData.originAddress || '');
        setContainerDestinationAddress(prefillData.destinationAddress || '');
        setContainerNumberOfContainers(parseNumber(prefillData.numberOfContainers) ?? 1);
        setContainerType(prefillData.containerType || ''); // Changed default from 'ALL' to ''
        setContainerTotalWeight(parseNumber(prefillData.cargoWeight) ?? parseNumber(prefillData.totalWeight) ?? '');
        setContainerCommodity(prefillData.commodity || prefillData.cargoType || 'FAK (Freight of All Kinds)');
        // containerMode already handled above for isDomestic
        setContainerHazardousCargo(prefillData.hazardousCargo ?? false);
        setContainerDate(prefillData.readyDate ? new Date(prefillData.readyDate) : (prefillData.date ? new Date(prefillData.date) : null));
        setContainerServiceType(prefillData.serviceType as RailServiceType || 'terminalToTerminal');
      }
      // Prefill data for Goods tab
      else if (targetTab === 'goods') {
        setGoodsOriginTerminal(prefillData.originTerminal || prefillData.originStation || prefillData.origin || prefillData.originStationCity || '');
        setGoodsDestinationTerminal(prefillData.destinationTerminal || prefillData.destinationStation || prefillData.destination || prefillData.destinationStationCity || '');
        setGoodsOriginAddress(prefillData.originAddress || '');
        setGoodsDestinationAddress(prefillData.destinationAddress || '');
        setGoodsTotalWeight(parseNumber(prefillData.cargoWeight) ?? parseNumber(prefillData.totalWeight) ?? '');
        setGoodsCommodity(prefillData.commodity || prefillData.cargoType || 'FAK (Freight of All Kinds)');
        setGoodsWagonType(prefillData.wagonType || '');
        setGoodsNumberOfWagons(parseNumber(prefillData.numberOfWagons) ?? 1);
        setGoodsHazardousCargo(prefillData.hazardousCargo ?? false);
        setGoodsDate(prefillData.readyDate ? new Date(prefillData.readyDate) : (prefillData.date ? new Date(prefillData.date) : null));
        setGoodsServiceType(prefillData.serviceType as RailServiceType || 'terminalToTerminal');
      }
      // Prefill data for Parcel tab
      else if (targetTab === 'parcel') {
        setParcelOriginTerminal(prefillData.originTerminal || prefillData.originStation || prefillData.origin || prefillData.originStationCity || '');
        setParcelDestinationTerminal(prefillData.destinationTerminal || prefillData.destinationStation || prefillData.destination || prefillData.destinationStationCity || '');
        setParcelOriginAddress(prefillData.originAddress || '');
        setParcelDestinationAddress(prefillData.destinationAddress || '');
        setParcelTotalWeight(parseNumber(prefillData.cargoWeight) ?? parseNumber(prefillData.totalWeight) ?? '');
        setParcelDimensions(prefillData.dimensions || prefillData.cargoDimensions || '');
        setParcelDetailedDescriptionOfGoods(prefillData.detailedDescriptionOfGoods || prefillData.description || '');
        setParcelHazardousCargo(prefillData.hazardousCargo ?? false);
        setParcelDate(prefillData.readyDate ? new Date(prefillData.readyDate) : (prefillData.date ? new Date(prefillData.date) : null));
        setParcelCount(parseNumber(prefillData.parcelCount) ?? 1);
        setParcelServiceType(prefillData.serviceType as RailServiceType || 'terminalToTerminal');
      }
    }
  }, [prefillData]);

  // Function to reset all form fields to their initial states
  const resetAllFields = () => {
    // Reset Container fields
    setContainerOriginTerminal('');
    setContainerDestinationTerminal('');
    setContainerOriginAddress('');
    setContainerDestinationAddress('');
    setContainerNumberOfContainers(1);
    setContainerType(''); // Reset to empty string
    setContainerTotalWeight('');
    setContainerCommodity('FAK (Freight of All Kinds)');
    setContainerMode("domestic");
    setContainerHazardousCargo(false);
    setContainerDate(new Date());
    setContainerServiceType('terminalToTerminal');

    // Reset Goods fields
    setGoodsOriginTerminal('');
    setGoodsDestinationTerminal('');
    setGoodsOriginAddress('');
    setGoodsDestinationAddress('');
    setGoodsTotalWeight('');
    setGoodsCommodity('FAK (Freight of All Kinds)');
    setGoodsWagonType('');
    setGoodsNumberOfWagons(1);
    setGoodsHazardousCargo(false);
    setGoodsDate(new Date());
    setGoodsServiceType('terminalToTerminal');

    // Reset Parcel fields
    setParcelOriginTerminal('');
    setParcelDestinationTerminal('');
    setParcelOriginAddress('');
    setParcelDestinationAddress('');
    setParcelTotalWeight('');
    setParcelDimensions('');
    setParcelDetailedDescriptionOfGoods('');
    setParcelHazardousCargo(false);
    setParcelDate(new Date());
    setParcelCount(1);
    setParcelServiceType('terminalToTerminal');

    // Clear all errors and messages
    setErrors({});
    setShowValidationMessage(false);
    setValidationMessage('');
    setShowSuccessMessage(false);
    setSuccessMessage('');
  };

  // Internal function to handle the form submission logic and construct the formData object
  const handleFormSubmissionLogic = (): TrainContainerFormData | TrainGoodsFormData | TrainParcelFormData | null => {
    const newErrors: Partial<Record<string, string>> = {};
    let formData: TrainContainerFormData | TrainGoodsFormData | TrainParcelFormData | null = null;

    // Logic for Container Booking submission
    if (activeTab === 'container') {
      if (!containerServiceType) {
        newErrors.serviceType = 'Service Type is required.';
      } else {
        let currentOriginStation: string | undefined;
        let currentDestinationStation: string | undefined;

        if (containerServiceType === 'doorToDoor' || containerServiceType === 'doorToTerminal') {
          if (!containerOriginAddress) newErrors.originAddress = 'Origin (City/Pincode) is required for this service type.';
          currentOriginStation = containerOriginAddress;
        } else if (containerServiceType === 'terminalToTerminal' || containerServiceType === 'terminalToDoor') {
          if (!containerOriginTerminal) newErrors.originTerminal = 'Origin Terminal is required for this service type.';
          currentOriginStation = containerOriginTerminal;
        }

        if (containerServiceType === 'doorToDoor' || containerServiceType === 'terminalToDoor') {
          if (!containerDestinationAddress) newErrors.destinationAddress = 'Destination (City/Pincode) is required for this service type.';
          currentDestinationStation = containerDestinationAddress;
        } else if (containerServiceType === 'terminalToTerminal' || containerServiceType === 'doorToTerminal') {
          if (!containerDestinationTerminal) newErrors.destinationTerminal = 'Destination Terminal is required for this service type.';
          currentDestinationStation = containerDestinationTerminal;
        }

        if (!currentOriginStation) newErrors.originStation = 'Origin station/address is required.';
        if (!currentDestinationStation) newErrors.destinationStation = 'Destination station/address is required.';
      }

      const numContainers = parseNumber(containerNumberOfContainers);
      if (numContainers === undefined || numContainers <= 0) newErrors.numberOfContainers = 'Number of Containers is required and must be greater than 0.';
      if (!containerType) newErrors.containerType = 'Container Type is required.'; // Now required as 'ALL' is removed
      const totalWeight = parseNumber(containerTotalWeight);
      if (totalWeight === undefined || totalWeight <= 0) newErrors.totalWeight = 'Weight is required and must be greater than 0.';
      if (!containerCommodity) newErrors.cargoType = 'Type of Goods is required.';
      if (containerHazardousCargo === '') newErrors.hazardousCargo = 'Hazardous Cargo selection is required.';
      if (!containerDate) newErrors.date = 'Date is required.';

      if (Object.keys(newErrors).length === 0) {
        formData = {
          bookingType: 'Train Container Booking',
          isDomestic: containerMode === 'domestic',
          originStation: (containerServiceType === 'doorToDoor' || containerServiceType === 'doorToTerminal') ? containerOriginAddress : containerOriginTerminal,
          destinationStation: (containerServiceType === 'doorToDoor' || containerServiceType === 'terminalToDoor') ? containerDestinationAddress : containerDestinationTerminal,
          originTerminal: (containerServiceType === 'terminalToTerminal' || containerServiceType === 'terminalToDoor') ? containerOriginTerminal : undefined,
          originAddress: (containerServiceType === 'doorToDoor' || containerServiceType === 'doorToTerminal') ? containerOriginAddress : undefined,
          destinationTerminal: (containerServiceType === 'terminalToTerminal' || containerServiceType === 'doorToTerminal') ? containerDestinationTerminal : undefined,
          destinationAddress: (containerServiceType === 'doorToDoor' || containerServiceType === 'terminalToDoor') ? containerDestinationAddress : undefined,
          containerType: containerType,
          numberOfContainers: numContainers as number,
          totalWeight: totalWeight as number,
          cargoType: containerCommodity,
          hazardousCargo: containerHazardousCargo === true,
          readyDate: containerDate ? containerDate.toISOString().split('T')[0] : '',
          cargoValue: 0, // Default value, consider making this an input if needed
          insuranceRequired: false, // Default value, consider making this an input if needed
          serviceType: containerServiceType as RailServiceType,
        } as TrainContainerFormData;
      }
    }
    // Logic for Goods Booking submission
    else if (activeTab === 'goods') {
      if (!goodsServiceType) {
        newErrors.serviceType = 'Service Type is required.';
      } else {
        let currentOriginStation: string | undefined;
        let currentDestinationStation: string | undefined;

        if (goodsServiceType === 'doorToDoor' || goodsServiceType === 'doorToTerminal') {
          if (!goodsOriginAddress) newErrors.originAddress = 'Origin (City/Pincode) is required for this service type.';
          currentOriginStation = goodsOriginAddress;
        } else if (goodsServiceType === 'terminalToTerminal' || goodsServiceType === 'terminalToDoor') {
          if (!goodsOriginTerminal) newErrors.originTerminal = 'Origin Terminal is required for this service type.';
          currentOriginStation = goodsOriginTerminal;
        }

        if (goodsServiceType === 'doorToDoor' || goodsServiceType === 'terminalToDoor') {
          if (!goodsDestinationAddress) newErrors.destinationAddress = 'Destination (City/Pincode) is required for this service type.';
          currentDestinationStation = goodsDestinationAddress;
        } else if (goodsServiceType === 'terminalToTerminal' || goodsServiceType === 'doorToTerminal') {
          if (!goodsDestinationTerminal) newErrors.destinationTerminal = 'Destination Terminal is required for this service type.';
          currentDestinationStation = goodsDestinationTerminal;
        }

        if (!currentOriginStation) newErrors.originStation = 'Origin station/address is required.';
        if (!currentDestinationStation) newErrors.destinationStation = 'Destination station/address is required.';
      }

      const totalWeight = parseNumber(goodsTotalWeight);
      if (totalWeight === undefined || totalWeight <= 0) newErrors.totalWeight = 'Weight in Tons is required and must be greater than 0.';
      if (!goodsCommodity) newErrors.cargoType = 'Type of Goods is required.';
      if (!goodsWagonType) newErrors.wagonType = 'Preferred Wagon Type is required.';
      const numWagons = parseNumber(goodsNumberOfWagons);
      if (numWagons === undefined || numWagons <= 0) newErrors.numberOfWagons = 'Number of Wagons is required and must be greater than 0.';
      if (goodsHazardousCargo === '') newErrors.hazardousCargo = 'Hazardous Cargo selection is required.';
      if (!goodsDate) newErrors.date = 'Date is required.';

      if (Object.keys(newErrors).length === 0) {
        formData = {
          bookingType: 'Train Goods Booking',
          isDomestic: true,
          originStation: (goodsServiceType === 'doorToDoor' || goodsServiceType === 'doorToTerminal') ? goodsOriginAddress : goodsOriginTerminal,
          destinationStation: (goodsServiceType === 'doorToDoor' || goodsServiceType === 'terminalToDoor') ? goodsDestinationAddress : goodsDestinationTerminal,
          originTerminal: (goodsServiceType === 'terminalToTerminal' || goodsServiceType === 'terminalToDoor') ? goodsOriginTerminal : undefined,
          originAddress: (goodsServiceType === 'doorToDoor' || goodsServiceType === 'doorToTerminal') ? goodsOriginAddress : undefined,
          destinationTerminal: (goodsServiceType === 'terminalToTerminal' || goodsServiceType === 'doorToTerminal') ? goodsDestinationTerminal : undefined,
          destinationAddress: (goodsServiceType === 'doorToDoor' || goodsServiceType === 'terminalToDoor') ? goodsDestinationAddress : undefined,
          totalWeight: totalWeight as number,
          cargoType: goodsCommodity,
          wagonType: goodsWagonType,
          numberOfWagons: numWagons as number,
          hazardousCargo: goodsHazardousCargo === true,
          readyDate: goodsDate ? goodsDate.toISOString().split('T')[0] : '',
          cargoValue: 0, // Default value
          insuranceRequired: false, // Default value
          serviceType: goodsServiceType as RailServiceType,
        } as TrainGoodsFormData;
      }
    }
    // Logic for Parcel Booking submission
    else if (activeTab === 'parcel') {
      if (!parcelServiceType) {
        newErrors.serviceType = 'Service Type is required.';
      } else {
        let currentOriginStation: string | undefined;
        let currentDestinationStation: string | undefined;

        if (parcelServiceType === 'doorToDoor' || parcelServiceType === 'doorToTerminal') {
          if (!parcelOriginAddress) newErrors.originAddress = 'Origin (City/Pincode) is required for this service type.';
          currentOriginStation = parcelOriginAddress;
        } else if (parcelServiceType === 'terminalToTerminal' || parcelServiceType === 'terminalToDoor') {
          if (!parcelOriginTerminal) newErrors.originTerminal = 'Origin Terminal is required for this service type.';
          currentOriginStation = parcelOriginTerminal;
        }

        if (parcelServiceType === 'doorToDoor' || parcelServiceType === 'terminalToDoor') {
          if (!parcelDestinationAddress) newErrors.destinationAddress = 'Destination (City/Pincode) is required for this service type.';
          currentDestinationStation = parcelDestinationAddress;
        } else if (parcelServiceType === 'terminalToTerminal' || parcelServiceType === 'doorToTerminal') {
          if (!parcelDestinationTerminal) newErrors.destinationTerminal = 'Destination Terminal is required for this service type.';
          currentDestinationStation = parcelDestinationTerminal;
        }

        if (!currentOriginStation) newErrors.originStation = 'Origin station/address is required.';
        if (!currentDestinationStation) newErrors.destinationStation = 'Destination station/address is required.';
      }

      const totalWeight = parseNumber(parcelTotalWeight);
      if (totalWeight === undefined || totalWeight <= 0) newErrors.totalWeight = 'Weight in kg is required and must be greater than 0.';
      if (!parcelDimensions) newErrors.dimensions = 'Dimensions are required.';
      if (!parcelDetailedDescriptionOfGoods) newErrors.detailedDescriptionOfGoods = 'Parcel Description is required.';
      const parsedParcelCount = parseNumber(parcelCount);
      if (parsedParcelCount === undefined || parsedParcelCount <= 0) newErrors.parcelCount = 'Parcel Count is required and must be greater than 0.';
      if (parcelHazardousCargo === '') newErrors.hazardousCargo = 'Hazardous selection is required.';
      if (!parcelDate) newErrors.date = 'Date is required.';

      if (Object.keys(newErrors).length === 0) {
        formData = {
          bookingType: 'Train Parcel Booking',
          isDomestic: true, // Assuming parcel bookings are domestic by default
          originStation: (parcelServiceType === 'doorToDoor' || parcelServiceType === 'doorToTerminal') ? parcelOriginAddress : parcelOriginTerminal,
          destinationStation: (parcelServiceType === 'doorToDoor' || parcelServiceType === 'terminalToDoor') ? parcelDestinationAddress : parcelDestinationTerminal,
          originTerminal: (parcelServiceType === 'terminalToTerminal' || parcelServiceType === 'terminalToDoor') ? parcelOriginTerminal : undefined,
          originAddress: (parcelServiceType === 'doorToDoor' || parcelServiceType === 'doorToTerminal') ? parcelOriginAddress : undefined,
          destinationTerminal: (parcelServiceType === 'terminalToTerminal' || parcelServiceType === 'doorToTerminal') ? parcelDestinationTerminal : undefined,
          destinationAddress: (parcelServiceType === 'doorToDoor' || parcelServiceType === 'terminalToDoor') ? parcelDestinationAddress : undefined,
          totalWeight: totalWeight as number,
          dimensions: parcelDimensions,
          detailedDescriptionOfGoods: parcelDetailedDescriptionOfGoods,
          parcelCount: parsedParcelCount as number,
          cargoType: 'Parcel', // Fixed cargo type for parcel booking
          hazardousCargo: parcelHazardousCargo === true,
          readyDate: parcelDate ? parcelDate.toISOString().split('T')[0] : '',
          cargoValue: 0, // Default value
          insuranceRequired: false, // Default value
          serviceType: parcelServiceType as RailServiceType,
        } as TrainParcelFormData;
      }
    }

    setErrors(newErrors); // Update errors state
    if (Object.keys(newErrors).length > 0) {
      setValidationMessage('Please fill in all required fields correctly.');
      setShowValidationMessage(true);
      return null; // Return null if there are validation errors
    }

    // If form is valid and buttons are shown, navigate to results
    if (showButtons && formData) {
      navigate('/train-results', { state: { formData: formData } });
      setSuccessMessage('Search initiated. Redirecting to results...');
      setShowSuccessMessage(true);
    } else if (formData) {
      // If form is valid but buttons are not shown, just set success message
      setSuccessMessage('Form data collected successfully.');
      setShowSuccessMessage(true);
    }
    return formData; // Return the constructed form data
  };

  // Expose submit and reset methods via useImperativeHandle for parent components
  useImperativeHandle(ref, () => ({
    submit: handleFormSubmissionLogic,
    reset: () => {
      resetAllFields();
    }
  }));

  // JSX for rendering the Container form
  const renderContainerForm = () => (
    <form className="space-y-6 mt-4" onSubmit={(e) => e.preventDefault()}>
      {/* Container Mode Selection (Domestic/International) */}
      <div className="mb-4">
        <div className="p-1 bg-gray-100 border border-gray-200 rounded-xl shadow-lg w-full">
          <div className="flex space-x-3 w-fit">
            {validContainerModes.map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setContainerMode(mode)}
                className={`flex items-center justify-center px-4 py-3 text-sm font-medium text-center transition-all duration-200 ease-in-out whitespace-nowrap
                  ${containerMode === mode
                    ? 'bg-blue-200 text-black font-bold shadow-sm rounded-xl'
                    : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-800 border border-gray-200 rounded-xl'
                  }`}
              >
                {mode === 'domestic' ? 'Domestic' : 'International'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Service Type for Container */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Service Type<span className="text-red-500">*</span></label>
        <div className={`p-1 rounded-lg w-full ${errors.serviceType ? 'border border-orange-500' : ''}`}>
          <div className="flex flex-wrap gap-3">
            {validRailServiceTypes.map((type) => (
              <div key={type} className="flex items-center">
                <input
                  type="radio"
                  id={`containerServiceType-${type}`}
                  name="containerServiceType"
                  value={type}
                  checked={containerServiceType === type}
                  onChange={() => { setContainerServiceType(type); setErrors((prev) => ({ ...prev, serviceType: undefined })); }}
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  required
                />
                <label htmlFor={`containerServiceType-${type}`} className="ml-2 block text-sm text-gray-900">
                  {type === 'terminalToTerminal' && 'Terminal to Terminal'}
                  {type === 'doorToDoor' && 'Door to Door'}
                  {type === 'doorToTerminal' && 'Door to Terminal'}
                  {type === 'terminalToDoor' && 'Terminal to Door'}
                </label>
              </div>
            ))}
          </div>
        </div>
        {errors.serviceType && <p className="mt-1 text-sm text-orange-600">{errors.serviceType}</p>}
      </div>

      {/* Line 1: Origin, Destination, Date, Container Type */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-4">
        {/* Origin Field - Conditional Rendering */}
        <div className="md:col-span-1">
          {(containerServiceType === 'doorToDoor' || containerServiceType === 'doorToTerminal') ? (
            <>
              <label htmlFor="containerOriginAddress" className="block text-sm font-medium text-gray-700 mb-1">Origin (City/Pincode)<span className="text-red-500">*</span></label>
              <div className="relative">
                <input
                  type="text"
                  id="containerOriginAddress"
                  className={`block w-full pl-3 pr-3 py-3 sm:text-sm bg-white border border-gray-200 rounded-lg shadow-sm focus:ring-0 focus:border-blue-500 ${errors.originAddress ? 'border-orange-500' : ''}`}
                  placeholder="e.g., Chennai, 600001"
                  value={containerOriginAddress}
                  onChange={(e) => { setContainerOriginAddress(e.target.value); setErrors((prev) => ({ ...prev, originAddress: undefined })); }}
                  required
                />
              </div>
              {errors.originAddress && <p className="mt-1 text-sm text-orange-600">{errors.originAddress}</p>}
            </>
          ) : (
            <>
              <label htmlFor="containerOriginTerminal" className="block text-sm font-medium text-gray-700 mb-1">Origin Terminal<span className="text-red-500">*</span></label>
              <div className="relative">
                <input
                  type="text"
                  id="containerOriginTerminal"
                  className={`block w-full pl-3 pr-3 py-3 sm:text-sm bg-white border border-gray-200 rounded-lg shadow-sm focus:ring-0 focus:border-blue-500 ${errors.originTerminal ? 'border-orange-500' : ''}`}
                  placeholder="e.g., Chennai ICD"
                  value={containerOriginTerminal}
                  onChange={(e) => { setContainerOriginTerminal(e.target.value); setErrors((prev) => ({ ...prev, originTerminal: undefined })); }}
                  required
                />
              </div>
              {errors.originTerminal && <p className="mt-1 text-sm text-orange-600">{errors.originTerminal}</p>}
            </>
          )}
        </div>

        {/* Destination Field - Conditional Rendering */}
        <div className="md:col-span-1">
          {(containerServiceType === 'doorToDoor' || containerServiceType === 'terminalToDoor') ? (
            <>
              <label htmlFor="containerDestinationAddress" className="block text-sm font-medium text-gray-700 mb-1">Destination (City/Pincode)<span className="text-red-500">*</span></label>
              <div className="relative">
                <input
                  type="text"
                  id="containerDestinationAddress"
                  className={`block w-full pl-3 pr-3 py-3 sm:text-sm bg-white border border-gray-200 rounded-lg shadow-sm focus:ring-0 focus:border-blue-500 ${errors.destinationAddress ? 'border-orange-500' : ''}`}
                  placeholder="e.g., Los Angeles, 90210"
                  value={containerDestinationAddress}
                  onChange={(e) => { setContainerDestinationAddress(e.target.value); setErrors((prev) => ({ ...prev, destinationAddress: undefined })); }}
                  required
                />
              </div>
              {errors.destinationAddress && <p className="mt-1 text-sm text-orange-600">{errors.destinationAddress}</p>}
            </>
          ) : (
            <>
              <label htmlFor="containerDestinationTerminal" className="block text-sm font-medium text-gray-700 mb-1">Destination Terminal<span className="text-red-500">*</span></label>
              <div className="relative">
                <input
                  type="text"
                  id="containerDestinationTerminal"
                  className={`block w-full pl-3 pr-3 py-3 sm:text-sm bg-white border border-gray-200 rounded-lg shadow-sm focus:ring-0 focus:border-blue-500 ${errors.destinationTerminal ? 'border-orange-500' : ''}`}
                  placeholder="e.g., New Delhi ICD"
                  value={containerDestinationTerminal}
                  onChange={(e) => { setContainerDestinationTerminal(e.target.value); setErrors((prev) => ({ ...prev, destinationTerminal: undefined })); }}
                  required
                />
              </div>
              {errors.destinationTerminal && <p className="mt-1 text-sm text-orange-600">{errors.destinationTerminal}</p>}
            </>
          )}
        </div>

        {/* Date */}
        <div className="md:col-span-1">
          <label htmlFor="containerDate" className="block text-sm font-medium text-gray-700 mb-1">Date<span className="text-red-500">*</span></label>
          <div className="relative">
            <input
              type="date" // Changed to native date input
              id="containerDate"
              value={containerDate ? containerDate.toISOString().split('T')[0] : ''} // Format date for input type="date"
              onChange={(e) => {
                setContainerDate(e.target.value ? new Date(e.target.value) : null);
                setErrors((prev) => ({ ...prev, date: undefined }));
              }}
              className={`block w-full pl-3 pr-3 py-3 sm:text-sm bg-white border border-gray-200 rounded-lg shadow-sm focus:ring-0 focus:border-blue-500 ${errors.date ? 'border-orange-500' : ''}`}
              required
            />
          </div>
          {errors.date && <p className="mt-1 text-sm text-orange-600">{errors.date}</p>}
        </div>

        {/* Container Type */}
        <div className="md:col-span-1">
          <label htmlFor="containerType" className="block text-sm font-medium text-gray-700 mb-1">Container Type<span className="text-red-500">*</span></label>
          <div className="relative">
            <select
              id="containerType"
              className={`block w-full pl-3 pr-3 py-3 sm:text-sm bg-white border border-gray-200 rounded-lg shadow-sm focus:ring-0 focus:border-blue-500 ${errors.containerType ? 'border-orange-500' : ''}`}
              value={containerType}
              onChange={(e) => { setContainerType(e.target.value); setErrors((prev) => ({ ...prev, containerType: undefined })); }}
              required
            >
              <option value="">Select Container Type</option> {/* Added placeholder option */}
              {containerTypes.map((type) => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
          {errors.containerType && <p className="mt-1 text-sm text-orange-600">{errors.containerType}</p>}
        </div>
      </div>

      {/* Line 2: Weight, Number of Containers, Cargo Type, Hazardous Cargo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-4">
        {/* Weight (KG) */}
        <div className="md:col-span-1">
          <label htmlFor="containerTotalWeight" className="block text-sm font-medium text-gray-700 mb-1">Weight (KG)<span className="text-red-500">*</span></label>
          <div className="relative">
            <input
              type="number"
              id="containerTotalWeight"
              className={`block w-full pl-3 pr-3 py-3 sm:text-sm bg-white border border-gray-200 rounded-lg shadow-sm focus:ring-0 focus:border-blue-500 ${errors.totalWeight ? 'border-orange-500' : ''}`}
              placeholder="e.g., 20000"
              value={containerTotalWeight}
              onChange={(e) => { setContainerTotalWeight(e.target.value === '' ? '' : Number(e.target.value)); setErrors((prev) => ({ ...prev, totalWeight: undefined })); }}
              required
            />
          </div>
          {errors.totalWeight && <p className="mt-1 text-sm text-orange-600">{errors.totalWeight}</p>}
        </div>

        {/* Number of Containers */}
        <div className="md:col-span-1">
          <label htmlFor="containerNumberOfContainers" className="block text-sm font-medium text-gray-700 mb-1">Number of Containers<span className="text-red-500">*</span></label>
          <div className="relative">
            <input
              type="number"
              id="containerNumberOfContainers"
              className={`block w-full pl-3 pr-3 py-3 sm:text-sm bg-white border border-gray-200 rounded-lg shadow-sm focus:ring-0 focus:border-blue-500 ${errors.numberOfContainers ? 'border-orange-500' : ''}`}
              placeholder="e.g., 2"
              value={containerNumberOfContainers}
              onChange={(e) => { setContainerNumberOfContainers(e.target.value === '' ? '' : Number(e.target.value)); setErrors((prev) => ({ ...prev, numberOfContainers: undefined })); }}
              min="1"
              required
            />
          </div>
          {errors.numberOfContainers && <p className="mt-1 text-sm text-orange-600">{errors.numberOfContainers}</p>}
        </div>

        {/* Cargo Type (Commodity) */}
        <div className="md:col-span-1">
          <label htmlFor="containerCommodity" className="block text-sm font-medium text-gray-700 mb-1">Cargo Type<span className="text-red-500">*</span></label>
          <div className="relative">
            <select
              id="containerCommodity"
              className={`block w-full pl-3 pr-3 py-3 sm:text-sm bg-white border border-gray-200 rounded-lg shadow-sm focus:ring-0 focus:border-blue-500 ${errors.cargoType ? 'border-orange-500' : ''}`}
              value={containerCommodity}
              onChange={(e) => { setContainerCommodity(e.target.value); setErrors((prev) => ({ ...prev, cargoType: undefined })); }}
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

        {/* Hazardous Cargo (Radio Buttons) */}
        <div className="md:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Hazardous Cargo<span className="text-red-500">*</span></label>
          <div className={`flex items-center space-x-4 p-2 rounded-md ${errors.hazardousCargo ? 'border border-orange-500' : ''}`}>
            <div className="flex items-center">
              <input
                type="radio"
                id="containerHazardousYes"
                name="containerHazardousCargo"
                checked={containerHazardousCargo === true}
                onChange={() => { setContainerHazardousCargo(true); setErrors((prev) => ({ ...prev, hazardousCargo: undefined })); }}
                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                required
              />
              <label htmlFor="containerHazardousYes" className="ml-2 block text-sm text-gray-900">
                Yes
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="radio"
                id="containerHazardousNo"
                name="containerHazardousCargo"
                checked={containerHazardousCargo === false}
                onChange={() => { setContainerHazardousCargo(false); setErrors((prev) => ({ ...prev, hazardousCargo: undefined })); }}
                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                required
              />
              <label htmlFor="containerHazardousNo" className="ml-2 block text-sm text-gray-900">
                No
              </label>
            </div>
          </div>
          {errors.hazardousCargo && <p className="mt-1 text-sm text-orange-600">{errors.hazardousCargo}</p>}
        </div>
      </div>
    </form>
  );

  // JSX for rendering the Goods form
  const renderGoodsForm = () => (
    <form className="space-y-6 mt-4" onSubmit={(e) => e.preventDefault()}>
      {/* Service Type for Goods */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Service Type<span className="text-red-500">*</span></label>
        <div className={`p-1 rounded-lg w-full ${errors.serviceType ? 'border border-orange-500' : ''}`}>
          <div className="flex flex-wrap gap-3">
            {validRailServiceTypes.map((type) => (
              <div key={type} className="flex items-center">
                <input
                  type="radio"
                  id={`goodsServiceType-${type}`}
                  name="goodsServiceType"
                  value={type}
                  checked={goodsServiceType === type}
                  onChange={() => { setGoodsServiceType(type); setErrors((prev) => ({ ...prev, serviceType: undefined })); }}
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  required
                />
                <label htmlFor={`goodsServiceType-${type}`} className="ml-2 block text-sm text-gray-900">
                  {type === 'terminalToTerminal' && 'Terminal to Terminal'}
                  {type === 'doorToDoor' && 'Door to Door'}
                  {type === 'doorToTerminal' && 'Door to Terminal'}
                  {type === 'terminalToDoor' && 'Terminal to Door'}
                </label>
              </div>
            ))}
          </div>
        </div>
        {errors.serviceType && <p className="mt-1 text-sm text-orange-600">{errors.serviceType}</p>}
      </div>

      {/* Line 1: Origin, Destination, Date, Preferred Wagon Type */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-4">
        {/* Origin Field - Conditional Rendering */}
        <div className="md:col-span-1">
          {(goodsServiceType === 'doorToDoor' || goodsServiceType === 'doorToTerminal') ? (
            <>
              <label htmlFor="goodsOriginAddress" className="block text-sm font-medium text-gray-700 mb-1">Origin (City/Pincode)<span className="text-red-500">*</span></label>
              <div className="relative">
                <input
                  type="text"
                  id="goodsOriginAddress"
                  className={`block w-full pl-3 pr-3 py-3 sm:text-sm bg-white border border-gray-200 rounded-lg shadow-sm focus:ring-0 focus:border-blue-500 ${errors.originAddress ? 'border-orange-500' : ''}`}
                  placeholder="e.g., New Delhi, 110001"
                  value={goodsOriginAddress}
                  onChange={(e) => { setGoodsOriginAddress(e.target.value); setErrors((prev) => ({ ...prev, originAddress: undefined })); }}
                  required
                />
              </div>
              {errors.originAddress && <p className="mt-1 text-sm text-orange-600">{errors.originAddress}</p>}
            </>
          ) : (
            <>
              <label htmlFor="goodsOriginTerminal" className="block text-sm font-medium text-gray-700 mb-1">Origin Terminal<span className="text-red-500">*</span></label>
              <div className="relative">
                <input
                  type="text"
                  id="goodsOriginTerminal"
                  className={`block w-full pl-3 pr-3 py-3 sm:text-sm bg-white border border-gray-200 rounded-lg shadow-sm focus:ring-0 focus:border-blue-500 ${errors.originTerminal ? 'border-orange-500' : ''}`}
                  placeholder="e.g., New Delhi"
                  value={goodsOriginTerminal}
                  onChange={(e) => { setGoodsOriginTerminal(e.target.value); setErrors((prev) => ({ ...prev, originTerminal: undefined })); }}
                  required
                />
              </div>
              {errors.originTerminal && <p className="mt-1 text-sm text-orange-600">{errors.originTerminal}</p>}
            </>
          )}
        </div>

        {/* Destination Field - Conditional Rendering */}
        <div className="md:col-span-1">
          {(goodsServiceType === 'doorToDoor' || goodsServiceType === 'terminalToDoor') ? (
            <>
              <label htmlFor="goodsDestinationAddress" className="block text-sm font-medium text-gray-700 mb-1">Destination (City/Pincode)<span className="text-red-500">*</span></label>
              <div className="relative">
                <input
                  type="text"
                  id="goodsDestinationAddress"
                  className={`block w-full pl-3 pr-3 py-3 sm:text-sm bg-white border border-gray-200 rounded-lg shadow-sm focus:ring-0 focus:border-blue-500 ${errors.destinationAddress ? 'border-orange-500' : ''}`}
                  placeholder="e.g., Mumbai, 400001"
                  value={goodsDestinationAddress}
                  onChange={(e) => { setGoodsDestinationAddress(e.target.value); setErrors((prev) => ({ ...prev, destinationAddress: undefined })); }}
                  required
                />
              </div>
              {errors.destinationAddress && <p className="mt-1 text-sm text-orange-600">{errors.destinationAddress}</p>}
            </>
          ) : (
            <>
              <label htmlFor="goodsDestinationTerminal" className="block text-sm font-medium text-gray-700 mb-1">Destination Terminal<span className="text-red-500">*</span></label>
              <div className="relative">
                <input
                  type="text"
                  id="goodsDestinationTerminal"
                  className={`block w-full pl-3 pr-3 py-3 sm:text-sm bg-white border border-gray-200 rounded-lg shadow-sm focus:ring-0 focus:border-blue-500 ${errors.destinationTerminal ? 'border-orange-500' : ''}`}
                  placeholder="e.g., Mumbai"
                  value={goodsDestinationTerminal}
                  onChange={(e) => { setGoodsDestinationTerminal(e.target.value); setErrors((prev) => ({ ...prev, destinationTerminal: undefined })); }}
                  required
                />
              </div>
              {errors.destinationTerminal && <p className="mt-1 text-sm text-orange-600">{errors.destinationTerminal}</p>}
            </>
          )}
        </div>

        {/* Date */}
        <div className="md:col-span-1">
          <label htmlFor="goodsDate" className="block text-sm font-medium text-gray-700 mb-1">Date<span className="text-red-500">*</span></label>
          <div className="relative">
            <input
              type="date" // Changed to native date input
              id="goodsDate"
              value={goodsDate ? goodsDate.toISOString().split('T')[0] : ''} // Format date for input type="date"
              onChange={(e) => {
                setGoodsDate(e.target.value ? new Date(e.target.value) : null);
                setErrors((prev) => ({ ...prev, date: undefined }));
              }}
              className={`block w-full pl-3 pr-3 py-3 sm:text-sm bg-white border border-gray-200 rounded-lg shadow-sm focus:ring-0 focus:border-blue-500 ${errors.date ? 'border-orange-500' : ''}`}
              required
            />
          </div>
          {errors.date && <p className="mt-1 text-sm text-orange-600">{errors.date}</p>}
        </div>

        {/* Preferred Wagon Type */}
        <div className="md:col-span-1">
          <label htmlFor="goodsWagonType" className="block text-sm font-medium text-gray-700 mb-1">Preferred Wagon Type<span className="text-red-500">*</span></label>
          <div className="relative">
            <select
              id="goodsWagonType"
              className={`block w-full pl-3 pr-3 py-3 sm:text-sm bg-white border border-gray-200 rounded-lg shadow-sm focus:ring-0 focus:border-blue-500 ${errors.wagonType ? 'border-orange-500' : ''}`}
              value={goodsWagonType}
              onChange={(e) => { setGoodsWagonType(e.target.value); setErrors((prev) => ({ ...prev, wagonType: undefined })); }}
              required
            >
              <option value="">Select Wagon Type</option>
              {wagonTypes.map((type) => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
          {errors.wagonType && <p className="mt-1 text-sm text-orange-600">{errors.wagonType}</p>}
        </div>
      </div>

      {/* Line 2: Total Weight, Number of Wagons, Cargo Type, Hazardous Cargo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-4">
        {/* Total Weight (in Tons) */}
        <div className="md:col-span-1">
          <label htmlFor="goodsTotalWeight" className="block text-sm font-medium text-gray-700 mb-1">Total Weight (Tons)<span className="text-red-500">*</span></label>
          <div className="relative">
            <input
              type="number"
              id="goodsTotalWeight"
              className={`block w-full pl-3 pr-3 py-3 sm:text-sm bg-white border border-gray-200 rounded-lg shadow-sm focus:ring-0 focus:border-blue-500 ${errors.totalWeight ? 'border-orange-500' : ''}`}
              placeholder="e.g., 50"
              value={goodsTotalWeight}
              onChange={(e) => { setGoodsTotalWeight(e.target.value === '' ? '' : Number(e.target.value)); setErrors((prev) => ({ ...prev, totalWeight: undefined })); }}
              min="0.01"
              step="0.01"
              required
            />
          </div>
          {errors.totalWeight && <p className="mt-1 text-sm text-orange-600">{errors.totalWeight}</p>}
        </div>

        {/* Number of Wagons */}
        <div className="md:col-span-1">
          <label htmlFor="goodsNumberOfWagons" className="block text-sm font-medium text-gray-700 mb-1">Number of Wagons<span className="text-red-500">*</span></label>
          <div className="relative">
            <input
              type="number"
              id="goodsNumberOfWagons"
              className={`block w-full pl-3 pr-3 py-3 sm:text-sm bg-white border border-gray-200 rounded-lg shadow-sm focus:ring-0 focus:border-blue-500 ${errors.numberOfWagons ? 'border-orange-500' : ''}`}
              placeholder="e.g., 1"
              value={goodsNumberOfWagons}
              onChange={(e) => { setGoodsNumberOfWagons(e.target.value === '' ? '' : Number(e.target.value)); setErrors((prev) => ({ ...prev, numberOfWagons: undefined })); }}
              min="1"
              required
            />
          </div>
          {errors.numberOfWagons && <p className="mt-1 text-sm text-orange-600">{errors.numberOfWagons}</p>}
        </div>

        {/* Cargo Type */}
        <div className="md:col-span-1">
          <label htmlFor="goodsCommodity" className="block text-sm font-medium text-gray-700 mb-1">Cargo Type<span className="text-red-500">*</span></label>
          <div className="relative">
            <select
              id="goodsCommodity"
              className={`block w-full pl-3 pr-3 py-3 sm:text-sm bg-white border border-gray-200 rounded-lg shadow-sm focus:ring-0 focus:border-blue-500 ${errors.cargoType ? 'border-orange-500' : ''}`}
              value={goodsCommodity}
              onChange={(e) => { setGoodsCommodity(e.target.value); setErrors((prev) => ({ ...prev, cargoType: undefined })); }}
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

        {/* Hazardous Cargo (Radio Buttons) */}
        <div className="md:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Hazardous Cargo<span className="text-red-500">*</span></label>
          <div className={`flex items-center space-x-4 p-2 rounded-md ${errors.hazardousCargo ? 'border border-orange-500' : ''}`}>
            <div className="flex items-center">
              <input
                type="radio"
                id="goodsHazardousYes"
                name="goodsHazardousCargo"
                checked={goodsHazardousCargo === true}
                onChange={() => { setGoodsHazardousCargo(true); setErrors((prev) => ({ ...prev, hazardousCargo: undefined })); }}
                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                required
              />
              <label htmlFor="goodsHazardousYes" className="ml-2 block text-sm text-gray-900">
                Yes
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="radio"
                id="goodsHazardousNo"
                name="goodsHazardousCargo"
                checked={goodsHazardousCargo === false}
                onChange={() => { setGoodsHazardousCargo(false); setErrors((prev) => ({ ...prev, hazardousCargo: undefined })); }}
                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                required
              />
              <label htmlFor="goodsHazardousNo" className="ml-2 block text-sm text-gray-900">
                No
              </label>
            </div>
          </div>
          {errors.hazardousCargo && <p className="mt-1 text-sm text-orange-600">{errors.hazardousCargo}</p>}
        </div>
      </div>
    </form>
  );

  // JSX for rendering the Parcel form
  const renderParcelForm = () => (
    <form className="space-y-6 mt-4" onSubmit={(e) => e.preventDefault()}>
      {/* Service Type for Parcel */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Service Type<span className="text-red-500">*</span></label>
        <div className={`p-1 rounded-lg w-full ${errors.serviceType ? 'border border-orange-500' : ''}`}>
          <div className="flex flex-wrap gap-3">
            {validRailServiceTypes.map((type) => (
              <div key={type} className="flex items-center">
                <input
                  type="radio"
                  id={`parcelServiceType-${type}`}
                  name="parcelServiceType"
                  value={type}
                  checked={parcelServiceType === type}
                  onChange={() => { setParcelServiceType(type); setErrors((prev) => ({ ...prev, serviceType: undefined })); }}
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  required
                />
                <label htmlFor={`parcelServiceType-${type}`} className="ml-2 block text-sm text-gray-900">
                  {type === 'terminalToTerminal' && 'Terminal to Terminal'}
                  {type === 'doorToDoor' && 'Door to Door'}
                  {type === 'doorToTerminal' && 'Door to Terminal'}
                  {type === 'terminalToDoor' && 'Terminal to Door'}
                </label>
              </div>
            ))}
          </div>
        </div>
        {errors.serviceType && <p className="mt-1 text-sm text-orange-600">{errors.serviceType}</p>}
      </div>

      {/* Line 1: Origin, Destination, Date, Dimensions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-4">
        {/* Origin Field - Conditional Rendering */}
        <div className="md:col-span-1">
          {(parcelServiceType === 'doorToDoor' || parcelServiceType === 'doorToTerminal') ? (
            <>
              <label htmlFor="parcelOriginAddress" className="block text-sm font-medium text-gray-700 mb-1">Origin (City/Pincode)<span className="text-red-500">*</span></label>
              <div className="relative">
                <input
                  type="text"
                  id="parcelOriginAddress"
                  className={`block w-full pl-3 pr-3 py-3 sm:text-sm bg-white border border-gray-200 rounded-lg shadow-sm focus:ring-0 focus:border-blue-500 ${errors.originAddress ? 'border-orange-500' : ''}`}
                  placeholder="e.g., New Delhi, 110001"
                  value={parcelOriginAddress}
                  onChange={(e) => { setParcelOriginAddress(e.target.value); setErrors((prev) => ({ ...prev, originAddress: undefined })); }}
                  required
                />
              </div>
              {errors.originAddress && <p className="mt-1 text-sm text-orange-600">{errors.originAddress}</p>}
            </>
          ) : (
            <>
              <label htmlFor="parcelOriginTerminal" className="block text-sm font-medium text-gray-700 mb-1">Origin Terminal<span className="text-red-500">*</span></label>
              <div className="relative">
                <input
                  type="text"
                  id="parcelOriginTerminal"
                  className={`block w-full pl-3 pr-3 py-3 sm:text-sm bg-white border border-gray-200 rounded-lg shadow-sm focus:ring-0 focus:border-blue-500 ${errors.originTerminal ? 'border-orange-500' : ''}`}
                  placeholder="e.g., New Delhi"
                  value={parcelOriginTerminal}
                  onChange={(e) => { setParcelOriginTerminal(e.target.value); setErrors((prev) => ({ ...prev, originTerminal: undefined })); }}
                  required
                />
              </div>
              {errors.originTerminal && <p className="mt-1 text-sm text-orange-600">{errors.originTerminal}</p>}
            </>
          )}
        </div>

        {/* Destination Field - Conditional Rendering */}
        <div className="md:col-span-1">
          {(parcelServiceType === 'doorToDoor' || parcelServiceType === 'terminalToDoor') ? (
            <>
              <label htmlFor="parcelDestinationAddress" className="block text-sm font-medium text-gray-700 mb-1">Destination (City/Pincode)<span className="text-red-500">*</span></label>
              <div className="relative">
                <input
                  type="text"
                  id="parcelDestinationAddress"
                  className={`block w-full pl-3 pr-3 py-3 sm:text-sm bg-white border border-gray-200 rounded-lg shadow-sm focus:ring-0 focus:focus:border-blue-500 ${errors.destinationAddress ? 'border-orange-500' : ''}`}
                  placeholder="e.g., Mumbai, 400001"
                  value={parcelDestinationAddress}
                  onChange={(e) => { setParcelDestinationAddress(e.target.value); setErrors((prev) => ({ ...prev, destinationAddress: undefined })); }}
                  required
                />
              </div>
              {errors.destinationAddress && <p className="mt-1 text-sm text-orange-600">{errors.destinationAddress}</p>}
            </>
          ) : (
            <>
              <label htmlFor="parcelDestinationTerminal" className="block text-sm font-medium text-gray-700 mb-1">Destination Terminal<span className="text-red-500">*</span></label>
              <div className="relative">
                <input
                  type="text"
                  id="parcelDestinationTerminal"
                  className={`block w-full pl-3 pr-3 py-3 sm:text-sm bg-white border border-gray-200 rounded-lg shadow-sm focus:ring-0 focus:border-blue-500 ${errors.destinationTerminal ? 'border-orange-500' : ''}`}
                  placeholder="e.g., Mumbai"
                  value={parcelDestinationTerminal}
                  onChange={(e) => { setParcelDestinationTerminal(e.target.value); setErrors((prev) => ({ ...prev, destinationTerminal: undefined })); }}
                  required
                />
              </div>
              {errors.destinationTerminal && <p className="mt-1 text-sm text-orange-600">{errors.destinationTerminal}</p>}
            </>
          )}
        </div>

        {/* Date */}
        <div className="md:col-span-1">
          <label htmlFor="parcelDate" className="block text-sm font-medium text-gray-700 mb-1">Date<span className="text-red-500">*</span></label>
          <div className="relative">
            <input
              type="date" // Changed to native date input
              id="parcelDate"
              value={parcelDate ? parcelDate.toISOString().split('T')[0] : ''} // Format date for input type="date"
              onChange={(e) => {
                setParcelDate(e.target.value ? new Date(e.target.value) : null);
                setErrors((prev) => ({ ...prev, date: undefined }));
              }}
              className={`block w-full pl-3 pr-3 py-3 sm:text-sm bg-white border border-gray-200 rounded-lg shadow-sm focus:ring-0 focus:border-blue-500 ${errors.date ? 'border-orange-500' : ''}`}
              required
            />
          </div>
          {errors.date && <p className="mt-1 text-sm text-orange-600">{errors.date}</p>}
        </div>

        {/* Dimensions */}
        <div className="md:col-span-1">
          <label htmlFor="parcelDimensions" className="block text-sm font-medium text-gray-700 mb-1">Dimensions (LxWxH in cm)<span className="text-red-500">*</span></label>
          <div className="relative">
            <input
              type="text"
              id="parcelDimensions"
              className={`block w-full pl-3 pr-3 py-3 sm:text-sm bg-white border border-gray-200 rounded-lg shadow-sm focus:ring-0 focus:focus:border-blue-500 ${errors.dimensions ? 'border-orange-500' : ''}`}
              placeholder="e.g., 30x20x10"
              value={parcelDimensions}
              onChange={(e) => { setParcelDimensions(e.target.value); setErrors((prev) => ({ ...prev, dimensions: undefined })); }}
              required
            />
          </div>
          {errors.dimensions && <p className="mt-1 text-sm text-orange-600">{errors.dimensions}</p>}
        </div>
      </div>

      {/* Line 2: Total Weight, Parcel Description, Parcel Count, Hazardous Cargo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-4">
        {/* Total Weight */}
        <div className="md:col-span-1">
          <label htmlFor="parcelTotalWeight" className="block text-sm font-medium text-gray-700 mb-1">Total Weight (Kgs)<span className="text-red-500">*</span></label>
          <div className="relative">
            <input
              type="number"
              id="parcelTotalWeight"
              className={`block w-full pl-3 pr-3 py-3 sm:text-sm bg-white border border-gray-200 rounded-lg shadow-sm focus:ring-0 focus:border-blue-500 ${errors.totalWeight ? 'border-orange-500' : ''}`}
              placeholder="e.g., 5"
              value={parcelTotalWeight}
              onChange={(e) => { setParcelTotalWeight(e.target.value === '' ? '' : Number(e.target.value)); setErrors((prev) => ({ ...prev, totalWeight: undefined })); }}
              min="0.01"
              step="0.01"
              required
            />
          </div>
          {errors.totalWeight && <p className="mt-1 text-sm text-orange-600">{errors.totalWeight}</p>}
        </div>

        {/* Parcel Description */}
        <div className="md:col-span-1">
          <label htmlFor="parcelDetailedDescriptionOfGoods" className="block text-sm font-medium text-gray-700 mb-1">Parcel Description<span className="text-red-500">*</span></label>
          <div className="relative">
            <textarea
              id="parcelDetailedDescriptionOfGoods"
              rows={1}
              className={`block w-full pl-3 pr-3 py-3 sm:text-sm bg-white border border-gray-200 rounded-lg shadow-sm focus:ring-0 focus:border-blue-500 resize-none ${errors.detailedDescriptionOfGoods ? 'border-orange-500' : ''}`}
              placeholder="e.g., Books, documents"
              value={parcelDetailedDescriptionOfGoods}
              onChange={(e) => { setParcelDetailedDescriptionOfGoods(e.target.value); setErrors((prev) => ({ ...prev, detailedDescriptionOfGoods: undefined })); }}
              required
            ></textarea>
          </div>
          {errors.detailedDescriptionOfGoods && <p className="mt-1 text-sm text-orange-600">{errors.detailedDescriptionOfGoods}</p>}
        </div>

        {/* Parcel Count */}
        <div className="md:col-span-1">
          <label htmlFor="parcelCount" className="block text-sm font-medium text-gray-700 mb-1">Parcel Count<span className="text-red-500">*</span></label>
          <div className="relative">
            <input
              type="number"
              id="parcelCount"
              className={`block w-full pl-3 pr-3 py-3 sm:text-sm bg-white border border-gray-200 rounded-lg shadow-sm focus:ring-0 focus:border-blue-500 ${errors.parcelCount ? 'border-orange-500' : ''}`}
              placeholder="e.g., 1"
              value={parcelCount}
              onChange={(e) => { setParcelCount(e.target.value === '' ? '' : Number(e.target.value)); setErrors((prev) => ({ ...prev, parcelCount: undefined })); }}
              min="1"
              required
            />
          </div>
          {errors.parcelCount && <p className="mt-1 text-sm text-orange-600">{errors.parcelCount}</p>}
        </div>

        {/* Hazardous Cargo (Radio Buttons) */}
        <div className="md:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Hazardous Cargo<span className="text-red-500">*</span></label>
          <div className={`flex items-center space-x-4 p-2 rounded-md ${errors.hazardousCargo ? 'border border-orange-500' : ''}`}>
            <div className="flex items-center">
              <input
                type="radio"
                id="parcelHazardousYes"
                name="parcelHazardousCargo"
                checked={parcelHazardousCargo === true}
                onChange={() => { setParcelHazardousCargo(true); setErrors((prev) => ({ ...prev, hazardousCargo: undefined })); }}
                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                required
              />
              <label htmlFor="parcelHazardousYes" className="ml-2 block text-sm text-gray-900">
                Yes
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="radio"
                id="parcelHazardousNo"
                name="parcelHazardousCargo"
                checked={parcelHazardousCargo === false}
                onChange={() => { setParcelHazardousCargo(false); setErrors((prev) => ({ ...prev, hazardousCargo: undefined })); }}
                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                required
              />
              <label htmlFor="parcelHazardousNo" className="ml-2 block text-sm text-gray-900">
                No
              </label>
            </div>
          </div>
          {errors.hazardousCargo && <p className="mt-1 text-sm text-orange-600">{errors.hazardousCargo}</p>}
        </div>
      </div>
    </form>
  );

  // Function to render the currently active form
  const renderCurrentForm = () => {
    switch (activeTab) {
      case "container":
        return renderContainerForm();
      case "parcel":
        return renderParcelForm();
      case "goods":
        return renderGoodsForm();
      default:
        return null;
    }
  };

  return (
    <div className="p-6 bg-white shadow-md rounded-xl border border-gray-200 font-inter">
      {/* Added Rail Freight Heading */}
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Rail Freight</h2>

      {/* Tab Bar Container */}
      <div className="p-1 bg-gray-50 rounded-xl mb-6 border border-gray-200 w-full shadow-lg">
        <div className="flex justify-center space-x-3 w-fit mx-auto">
          {validBookingTabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => {
                setActiveTab(tab);
                setErrors({}); // Clear errors when switching tabs
                setShowValidationMessage(false);
                setShowSuccessMessage(false);
              }}
              className={`flex items-center justify-center px-4 py-2 text-sm font-medium transition-all duration-300 ease-in-out whitespace-nowrap
                  ${activeTab === tab
                    ? "bg-blue-200 text-black font-bold shadow-lg rounded-xl"
                    : "bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-800 border border-gray-200 rounded-xl"
                  }`}
            >
              {tab === "container"
                ? "Container Train"
                : tab === "parcel"
                  ? "Parcel Train"
                  : "Goods Train"}
            </button>
          ))}
        </div>
      </div>

      {/* Render the active form */}
      {renderCurrentForm()}

      {/* Action Buttons - Render ONLY if showButtons prop is true */}
      {showButtons && (
        <div className="flex justify-center space-x-4 mt-8">
          <button
            type="button"
            onClick={() => handleFormSubmissionLogic()}
            className="px-8 py-4 bg-blue-600 text-white font-bold text-xl rounded-xl shadow-lg hover:bg-blue-700 transition duration-300 transform hover:scale-105"
          >
            Search Quotes
          </button>
          <button
            type="button"
            onClick={resetAllFields}
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
              ❌
            </button>
            <div className="flex items-center mb-4">
              <span className="text-orange-500 text-3xl mr-3">⚠️</span>
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
              ❌
            </button>
            <div className="flex items-center mb-4">
              <span className="text-green-500 text-3xl mr-3">✅</span>
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

export default RailQuoteForm;
