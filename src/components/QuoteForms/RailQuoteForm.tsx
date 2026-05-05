// src/components/QuoteForms/RailQuoteForm.tsx
import React, { useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LocationAutocomplete from '../LocationAutocomplete';

import {
  QuoteFormHandle,
  TrainContainerFormData,
  TrainGoodsFormData,
  TrainParcelFormData,
  RailServiceType,
  ParsedVoiceCommand,
} from '../../types/QuoteFormHandle';

const parseNumber = (value: string | number | undefined | null): number | undefined => {
  if (value === null || value === undefined || value === '') return undefined;
  const num = Number(value);
  return isNaN(num) ? undefined : num;
};

type BookingTab = "container" | "parcel" | "goods";
const validBookingTabs: BookingTab[] = ["container", "parcel", "goods"];
type ContainerMode = "domestic" | "international";
const validContainerModes: ContainerMode[] = ["domestic", "international"];
const validRailServiceTypes: RailServiceType[] = ["terminalToTerminal", "doorToDoor", "doorToTerminal", "terminalToDoor"];

const allCommodities = [
  { label: 'Batteries', value: 'Batteries' },
  { label: 'Chemicals', value: 'Chemicals' },
  { label: 'Electronic Goods', value: 'Electronic Goods' },
  { label: 'FAK (Freight of All Kinds)', value: 'FAK (Freight of All Kinds)' },
  { label: 'Fabrics', value: 'Fabrics' },
  { label: 'Fruits & Vegetables', value: 'Fruits & Vegetables' },
  { label: 'Garments', value: 'Garments' },
  { label: 'Handicrafts', value: 'Handicrafts' },
  { label: 'Leather Goods', value: 'Leather Goods' },
  { label: 'Machinery', value: 'Machinery' },
  { label: 'Meat & Seafood', value: 'Meat & Seafood' },
  { label: 'Miscellaneous', value: 'Miscellaneous' },
  { label: 'Pharmaceuticals', value: 'Pharmaceuticals' },
  { label: 'Spare Parts', value: 'Spare Parts' },
  { label: 'Vehicles', value: 'Vehicles' },
  { label: 'Other', value: 'Other' },
];

const containerTypes = [
  { label: '20ft Standard', value: '20ft Standard' },
  { label: '20ft High Cube', value: '20ft High Cube' },
  { label: '20ft High Cube Reefer', value: '20ft High Cube Reefer' },
  { label: '40ft Standard', value: '40ft Standard' },
  { label: '40ft High Cube', value: '40ft High Cube' },
  { label: '40ft High Cube Reefer', value: '40ft High Cube Reefer' },
  { label: '40ft Open Top High', value: '40ft Open Top High' },
];

const wagonTypes = [
  { label: 'Open Wagon', value: 'Open Wagon' },
  { label: 'Covered Wagon', value: 'Covered Wagon' },
  { label: 'Flat Wagon', value: 'Flat Wagon' },
  { label: 'Hopper Wagon', value: 'Hopper Wagon' },
  { label: 'Other', value: 'Other' },
];

interface RailQuoteFormProps {
  initialActiveService?: BookingTab;
  prefillData?: ParsedVoiceCommand;
  showButtons?: boolean;
}

const RailQuoteForm = forwardRef<QuoteFormHandle, RailQuoteFormProps>(({ initialActiveService = "container", prefillData, showButtons = true }, ref) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<BookingTab>(initialActiveService);

  // Container states
  const [containerOriginTerminal, setContainerOriginTerminal] = useState('');
  const [containerDestinationTerminal, setContainerDestinationTerminal] = useState('');
  const [containerOriginAddress, setContainerOriginAddress] = useState('');
  const [containerDestinationAddress, setContainerDestinationAddress] = useState('');
  const [containerNumberOfContainers, setContainerNumberOfContainers] = useState<number | ''>(1);
  const [containerType, setContainerType] = useState('');
  const [containerTotalWeight, setContainerTotalWeight] = useState<number | ''>('');
  const [containerCommodity, setContainerCommodity] = useState('FAK (Freight of All Kinds)');
  const [containerMode, setContainerMode] = useState<ContainerMode>("domestic");
  const [containerHazardousCargo, setContainerHazardousCargo] = useState<boolean | ''>(false);
  const [containerDate, setContainerDate] = useState<Date | null>(new Date());
  const [containerServiceType, setContainerServiceType] = useState<RailServiceType | ''>('terminalToTerminal');

  // Goods states
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

  // Parcel states
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

  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [showValidationMessage, setShowValidationMessage] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (initialActiveService && validBookingTabs.includes(initialActiveService)) setActiveTab(initialActiveService);
  }, [initialActiveService]);

  useEffect(() => {
    if (prefillData) {
      let targetTab: BookingTab = activeTab;
      if (typeof prefillData.service === 'string') {
        if (prefillData.service === 'Train Container Booking' || (prefillData.service === 'Rail' && prefillData.containerType)) targetTab = 'container';
        else if (prefillData.service === 'Train Goods Booking' || (prefillData.service === 'Rail' && prefillData.wagonType)) targetTab = 'goods';
        else if (prefillData.service === 'Train Parcel Booking' || (prefillData.service === 'Rail' && prefillData.parcelCount)) targetTab = 'parcel';
      }
      setActiveTab(targetTab);
      if (prefillData.isDomestic !== undefined) {
        const domesticValue = typeof prefillData.isDomestic === 'string' ? prefillData.isDomestic.toLowerCase() === 'true' : prefillData.isDomestic;
        setContainerMode(domesticValue ? 'domestic' : 'international');
      }
      if (targetTab === 'container') {
        setContainerOriginTerminal(prefillData.originTerminal || prefillData.originStation || prefillData.origin || '');
        setContainerDestinationTerminal(prefillData.destinationTerminal || prefillData.destinationStation || prefillData.destination || '');
        setContainerOriginAddress(prefillData.originAddress || '');
        setContainerDestinationAddress(prefillData.destinationAddress || '');
        setContainerNumberOfContainers(parseNumber(prefillData.numberOfContainers) ?? 1);
        setContainerType(prefillData.containerType || '');
        setContainerTotalWeight(parseNumber(prefillData.cargoWeight) ?? parseNumber(prefillData.totalWeight) ?? '');
        setContainerCommodity(prefillData.commodity || prefillData.cargoType || 'FAK (Freight of All Kinds)');
        setContainerHazardousCargo(prefillData.hazardousCargo ?? false);
        setContainerDate(prefillData.readyDate ? new Date(prefillData.readyDate) : (prefillData.date ? new Date(prefillData.date) : null));
        setContainerServiceType(prefillData.serviceType as RailServiceType || 'terminalToTerminal');
      } else if (targetTab === 'goods') {
        setGoodsOriginTerminal(prefillData.originTerminal || prefillData.originStation || prefillData.origin || '');
        setGoodsDestinationTerminal(prefillData.destinationTerminal || prefillData.destinationStation || prefillData.destination || '');
        setGoodsOriginAddress(prefillData.originAddress || '');
        setGoodsDestinationAddress(prefillData.destinationAddress || '');
        setGoodsTotalWeight(parseNumber(prefillData.cargoWeight) ?? parseNumber(prefillData.totalWeight) ?? '');
        setGoodsCommodity(prefillData.commodity || prefillData.cargoType || 'FAK (Freight of All Kinds)');
        setGoodsWagonType(prefillData.wagonType || '');
        setGoodsNumberOfWagons(parseNumber(prefillData.numberOfWagons) ?? 1);
        setGoodsHazardousCargo(prefillData.hazardousCargo ?? false);
        setGoodsDate(prefillData.readyDate ? new Date(prefillData.readyDate) : (prefillData.date ? new Date(prefillData.date) : null));
        setGoodsServiceType(prefillData.serviceType as RailServiceType || 'terminalToTerminal');
      } else if (targetTab === 'parcel') {
        setParcelOriginTerminal(prefillData.originTerminal || prefillData.originStation || prefillData.origin || '');
        setParcelDestinationTerminal(prefillData.destinationTerminal || prefillData.destinationStation || prefillData.destination || '');
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

  const resetAllFields = () => {
    setContainerOriginTerminal(''); setContainerDestinationTerminal(''); setContainerOriginAddress(''); setContainerDestinationAddress('');
    setContainerNumberOfContainers(1); setContainerType(''); setContainerTotalWeight(''); setContainerCommodity('FAK (Freight of All Kinds)');
    setContainerMode("domestic"); setContainerHazardousCargo(false); setContainerDate(new Date()); setContainerServiceType('terminalToTerminal');
    setGoodsOriginTerminal(''); setGoodsDestinationTerminal(''); setGoodsOriginAddress(''); setGoodsDestinationAddress('');
    setGoodsTotalWeight(''); setGoodsCommodity('FAK (Freight of All Kinds)'); setGoodsWagonType(''); setGoodsNumberOfWagons(1);
    setGoodsHazardousCargo(false); setGoodsDate(new Date()); setGoodsServiceType('terminalToTerminal');
    setParcelOriginTerminal(''); setParcelDestinationTerminal(''); setParcelOriginAddress(''); setParcelDestinationAddress('');
    setParcelTotalWeight(''); setParcelDimensions(''); setParcelDetailedDescriptionOfGoods(''); setParcelHazardousCargo(false);
    setParcelDate(new Date()); setParcelCount(1); setParcelServiceType('terminalToTerminal');
    setErrors({}); setShowValidationMessage(false); setValidationMessage(''); setShowSuccessMessage(false); setSuccessMessage('');
  };

  const handleFormSubmissionLogic = async (): Promise<TrainContainerFormData | TrainGoodsFormData | TrainParcelFormData | null> => {
    const newErrors: Partial<Record<string, string>> = {};
    let formData: TrainContainerFormData | TrainGoodsFormData | TrainParcelFormData | null = null;

    if (activeTab === 'container') {
      if (!containerServiceType) { newErrors.serviceType = 'Service Type is required.'; }
      else {
        if (containerServiceType === 'doorToDoor' || containerServiceType === 'doorToTerminal') { if (!containerOriginAddress) newErrors.originAddress = 'Origin is required.'; }
        else { if (!containerOriginTerminal) newErrors.originTerminal = 'Origin Terminal is required.'; }
        if (containerServiceType === 'doorToDoor' || containerServiceType === 'terminalToDoor') { if (!containerDestinationAddress) newErrors.destinationAddress = 'Destination is required.'; }
        else { if (!containerDestinationTerminal) newErrors.destinationTerminal = 'Destination Terminal is required.'; }
      }
      const numContainers = parseNumber(containerNumberOfContainers);
      if (numContainers === undefined || numContainers <= 0) newErrors.numberOfContainers = 'Required.';
      if (!containerType) newErrors.containerType = 'Required.';
      const totalWeight = parseNumber(containerTotalWeight);
      if (totalWeight === undefined || totalWeight <= 0) newErrors.totalWeight = 'Required.';
      if (!containerCommodity) newErrors.cargoType = 'Required.';
      if (containerHazardousCargo === '') newErrors.hazardousCargo = 'Required.';
      if (!containerDate) newErrors.date = 'Required.';

      if (Object.keys(newErrors).length === 0) {
        formData = {
          bookingType: 'Train Container Booking', isDomestic: containerMode === 'domestic',
          originStation: (containerServiceType === 'doorToDoor' || containerServiceType === 'doorToTerminal') ? containerOriginAddress : containerOriginTerminal,
          destinationStation: (containerServiceType === 'doorToDoor' || containerServiceType === 'terminalToDoor') ? containerDestinationAddress : containerDestinationTerminal,
          originTerminal: (containerServiceType === 'terminalToTerminal' || containerServiceType === 'terminalToDoor') ? containerOriginTerminal : undefined,
          originAddress: (containerServiceType === 'doorToDoor' || containerServiceType === 'doorToTerminal') ? containerOriginAddress : undefined,
          destinationTerminal: (containerServiceType === 'terminalToTerminal' || containerServiceType === 'doorToTerminal') ? containerDestinationTerminal : undefined,
          destinationAddress: (containerServiceType === 'doorToDoor' || containerServiceType === 'terminalToDoor') ? containerDestinationAddress : undefined,
          containerType, numberOfContainers: numContainers as number, totalWeight: totalWeight as number,
          cargoType: containerCommodity, hazardousCargo: containerHazardousCargo === true,
          readyDate: containerDate ? containerDate.toISOString().split('T')[0] : '',
          cargoValue: 0, insuranceRequired: false, serviceType: containerServiceType as RailServiceType,
        } as TrainContainerFormData;
      }
    } else if (activeTab === 'goods') {
      if (!goodsServiceType) { newErrors.serviceType = 'Service Type is required.'; }
      else {
        if (goodsServiceType === 'doorToDoor' || goodsServiceType === 'doorToTerminal') { if (!goodsOriginAddress) newErrors.originAddress = 'Origin is required.'; }
        else { if (!goodsOriginTerminal) newErrors.originTerminal = 'Origin Terminal is required.'; }
        if (goodsServiceType === 'doorToDoor' || goodsServiceType === 'terminalToDoor') { if (!goodsDestinationAddress) newErrors.destinationAddress = 'Destination is required.'; }
        else { if (!goodsDestinationTerminal) newErrors.destinationTerminal = 'Destination Terminal is required.'; }
      }
      const totalWeight = parseNumber(goodsTotalWeight);
      if (totalWeight === undefined || totalWeight <= 0) newErrors.totalWeight = 'Required.';
      if (!goodsCommodity) newErrors.cargoType = 'Required.';
      if (!goodsWagonType) newErrors.wagonType = 'Required.';
      const numWagons = parseNumber(goodsNumberOfWagons);
      if (numWagons === undefined || numWagons <= 0) newErrors.numberOfWagons = 'Required.';
      if (goodsHazardousCargo === '') newErrors.hazardousCargo = 'Required.';
      if (!goodsDate) newErrors.date = 'Required.';

      if (Object.keys(newErrors).length === 0) {
        formData = {
          bookingType: 'Train Goods Booking', isDomestic: true,
          originStation: (goodsServiceType === 'doorToDoor' || goodsServiceType === 'doorToTerminal') ? goodsOriginAddress : goodsOriginTerminal,
          destinationStation: (goodsServiceType === 'doorToDoor' || goodsServiceType === 'terminalToDoor') ? goodsDestinationAddress : goodsDestinationTerminal,
          originTerminal: (goodsServiceType === 'terminalToTerminal' || goodsServiceType === 'terminalToDoor') ? goodsOriginTerminal : undefined,
          originAddress: (goodsServiceType === 'doorToDoor' || goodsServiceType === 'doorToTerminal') ? goodsOriginAddress : undefined,
          destinationTerminal: (goodsServiceType === 'terminalToTerminal' || goodsServiceType === 'doorToTerminal') ? goodsDestinationTerminal : undefined,
          destinationAddress: (goodsServiceType === 'doorToDoor' || goodsServiceType === 'terminalToDoor') ? goodsDestinationAddress : undefined,
          totalWeight: totalWeight as number, cargoType: goodsCommodity, wagonType: goodsWagonType,
          numberOfWagons: numWagons as number, hazardousCargo: goodsHazardousCargo === true,
          readyDate: goodsDate ? goodsDate.toISOString().split('T')[0] : '',
          cargoValue: 0, insuranceRequired: false, serviceType: goodsServiceType as RailServiceType,
        } as TrainGoodsFormData;
      }
    } else if (activeTab === 'parcel') {
      if (!parcelServiceType) { newErrors.serviceType = 'Service Type is required.'; }
      else {
        if (parcelServiceType === 'doorToDoor' || parcelServiceType === 'doorToTerminal') { if (!parcelOriginAddress) newErrors.originAddress = 'Origin is required.'; }
        else { if (!parcelOriginTerminal) newErrors.originTerminal = 'Origin Terminal is required.'; }
        if (parcelServiceType === 'doorToDoor' || parcelServiceType === 'terminalToDoor') { if (!parcelDestinationAddress) newErrors.destinationAddress = 'Destination is required.'; }
        else { if (!parcelDestinationTerminal) newErrors.destinationTerminal = 'Destination Terminal is required.'; }
      }
      const totalWeight = parseNumber(parcelTotalWeight);
      if (totalWeight === undefined || totalWeight <= 0) newErrors.totalWeight = 'Required.';
      if (!parcelDimensions) newErrors.dimensions = 'Required.';
      if (!parcelDetailedDescriptionOfGoods) newErrors.detailedDescriptionOfGoods = 'Required.';
      const parsedParcelCount = parseNumber(parcelCount);
      if (parsedParcelCount === undefined || parsedParcelCount <= 0) newErrors.parcelCount = 'Required.';
      if (parcelHazardousCargo === '') newErrors.hazardousCargo = 'Required.';
      if (!parcelDate) newErrors.date = 'Required.';

      if (Object.keys(newErrors).length === 0) {
        formData = {
          bookingType: 'Train Parcel Booking', isDomestic: true,
          originStation: (parcelServiceType === 'doorToDoor' || parcelServiceType === 'doorToTerminal') ? parcelOriginAddress : parcelOriginTerminal,
          destinationStation: (parcelServiceType === 'doorToDoor' || parcelServiceType === 'terminalToDoor') ? parcelDestinationAddress : parcelDestinationTerminal,
          originTerminal: (parcelServiceType === 'terminalToTerminal' || parcelServiceType === 'terminalToDoor') ? parcelOriginTerminal : undefined,
          originAddress: (parcelServiceType === 'doorToDoor' || parcelServiceType === 'doorToTerminal') ? parcelOriginAddress : undefined,
          destinationTerminal: (parcelServiceType === 'terminalToTerminal' || parcelServiceType === 'doorToTerminal') ? parcelDestinationTerminal : undefined,
          destinationAddress: (parcelServiceType === 'doorToDoor' || parcelServiceType === 'terminalToDoor') ? parcelDestinationAddress : undefined,
          totalWeight: totalWeight as number, dimensions: parcelDimensions,
          detailedDescriptionOfGoods: parcelDetailedDescriptionOfGoods, parcelCount: parsedParcelCount as number,
          cargoType: 'Parcel', hazardousCargo: parcelHazardousCargo === true,
          readyDate: parcelDate ? parcelDate.toISOString().split('T')[0] : '',
          cargoValue: 0, insuranceRequired: false, serviceType: parcelServiceType as RailServiceType,
        } as TrainParcelFormData;
      }
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      setValidationMessage('Please fill in all required fields correctly.');
      setShowValidationMessage(true);
      return null;
    }

    if (showButtons && formData) {
      try {
        const token = localStorage.getItem('shippitin_token');
        if (token) {
          await fetch('http://localhost:5000/api/bookings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({
              service_type: formData.bookingType, origin: formData.originStation,
              destination: formData.destinationStation, cargo_type: formData.cargoType,
              weight: formData.totalWeight, container_type: (formData as any).containerType || null,
              number_of_containers: (formData as any).numberOfContainers || 1, booking_date: formData.readyDate
            })
          });
        }
      } catch (error) { console.error('Failed to save booking:', error); }
      navigate('/train-results', { state: { formData } });
    }
    return formData;
  };

  useImperativeHandle(ref, () => ({ submit: handleFormSubmissionLogic, reset: resetAllFields }));

  const inputClass = (hasError: boolean) =>
    `block w-full pl-3 pr-3 py-2 sm:text-sm bg-transparent border-0 border-b focus:ring-0 focus:border-blue-500 ${hasError ? 'border-orange-500' : 'border-gray-300'}`;

  const inputBoxClass = (hasError: boolean) =>
    `block w-full pl-3 pr-3 py-2 sm:text-sm bg-white border rounded-lg focus:ring-0 focus:border-blue-500 ${hasError ? 'border-orange-500' : 'border-gray-200'}`;

  const renderServiceTypeRadios = (name: string, value: RailServiceType | '', onChange: (v: RailServiceType) => void, hasError: boolean) => (
    <div className="mb-2">
      <label className="block text-sm font-medium text-gray-700 mb-1">Service Type<span className="text-red-500">*</span></label>
      <div className="flex flex-wrap gap-3">
        {validRailServiceTypes.map((type) => (
          <label key={type} className="flex items-center gap-1.5 text-sm text-gray-700 cursor-pointer">
            <input type="radio" name={name} value={type} checked={value === type}
              onChange={() => { onChange(type); setErrors(prev => ({ ...prev, serviceType: undefined })); }}
              className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500" />
            {type === 'terminalToTerminal' ? 'Terminal to Terminal' :
             type === 'doorToDoor' ? 'Door to Door' :
             type === 'doorToTerminal' ? 'Door to Terminal' : 'Terminal to Door'}
          </label>
        ))}
      </div>
      {hasError && <p className="mt-1 text-xs text-orange-600">Service Type is required.</p>}
    </div>
  );

  const renderContainerForm = () => (
    <div className="space-y-3 mt-2">
      {/* Domestic/International */}
      <div className="flex items-center gap-3">
        <div className="flex gap-2">
          {validContainerModes.map((mode) => (
            <button key={mode} type="button" onClick={() => setContainerMode(mode)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${containerMode === mode ? 'bg-blue-100 text-blue-800 border border-blue-200' : 'bg-gray-100 text-gray-700 hover:bg-blue-50 border border-gray-300'}`}>
              {mode === 'domestic' ? 'Domestic' : 'International'}
            </button>
          ))}
        </div>
      </div>

      {renderServiceTypeRadios('containerServiceType', containerServiceType, setContainerServiceType, !!errors.serviceType)}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-3">
        <div>
          {(containerServiceType === 'doorToDoor' || containerServiceType === 'doorToTerminal') ? (
            <LocationAutocomplete label="Origin (City/Pincode)" required value={containerOriginAddress}
              onChange={(v) => { setContainerOriginAddress(v); setErrors(p => ({ ...p, originAddress: undefined })); }}
              placeholder="e.g., Chennai, 600001" locationType="city" />
          ) : (
            <LocationAutocomplete label="Origin Terminal" required value={containerOriginTerminal}
              onChange={(v) => { setContainerOriginTerminal(v); setErrors(p => ({ ...p, originTerminal: undefined })); }}
              placeholder="e.g., Chennai ICD" locationType="rail_terminal" />
          )}
          {(errors.originAddress || errors.originTerminal) && <p className="mt-1 text-xs text-orange-600">{errors.originAddress || errors.originTerminal}</p>}
        </div>
        <div>
          {(containerServiceType === 'doorToDoor' || containerServiceType === 'terminalToDoor') ? (
            <LocationAutocomplete label="Destination (City/Pincode)" required value={containerDestinationAddress}
              onChange={(v) => { setContainerDestinationAddress(v); setErrors(p => ({ ...p, destinationAddress: undefined })); }}
              placeholder="e.g., Mumbai, 400001" locationType="city" />
          ) : (
            <LocationAutocomplete label="Destination Terminal" required value={containerDestinationTerminal}
              onChange={(v) => { setContainerDestinationTerminal(v); setErrors(p => ({ ...p, destinationTerminal: undefined })); }}
              placeholder="e.g., New Delhi ICD" locationType="rail_terminal" />
          )}
          {(errors.destinationAddress || errors.destinationTerminal) && <p className="mt-1 text-xs text-orange-600">{errors.destinationAddress || errors.destinationTerminal}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date<span className="text-red-500">*</span></label>
          <input type="date" value={containerDate ? containerDate.toISOString().split('T')[0] : ''}
            onChange={(e) => { setContainerDate(e.target.value ? new Date(e.target.value) : null); setErrors(p => ({ ...p, date: undefined })); }}
            className={inputClass(!!errors.date)} />
          {errors.date && <p className="mt-1 text-xs text-orange-600">{errors.date}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Container Type<span className="text-red-500">*</span></label>
          <select className={inputClass(!!errors.containerType)} value={containerType}
            onChange={(e) => { setContainerType(e.target.value); setErrors(p => ({ ...p, containerType: undefined })); }}>
            <option value="">Select Container Type</option>
            {containerTypes.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
          </select>
          {errors.containerType && <p className="mt-1 text-xs text-orange-600">{errors.containerType}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Weight (KG)<span className="text-red-500">*</span></label>
          <input type="number" className={inputClass(!!errors.totalWeight)} placeholder="e.g., 20000" value={containerTotalWeight}
            onChange={(e) => { setContainerTotalWeight(e.target.value === '' ? '' : Number(e.target.value)); setErrors(p => ({ ...p, totalWeight: undefined })); }} />
          {errors.totalWeight && <p className="mt-1 text-xs text-orange-600">{errors.totalWeight}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">No. of Containers<span className="text-red-500">*</span></label>
          <input type="number" className={inputClass(!!errors.numberOfContainers)} placeholder="e.g., 2" value={containerNumberOfContainers} min="1"
            onChange={(e) => { setContainerNumberOfContainers(e.target.value === '' ? '' : Number(e.target.value)); setErrors(p => ({ ...p, numberOfContainers: undefined })); }} />
          {errors.numberOfContainers && <p className="mt-1 text-xs text-orange-600">{errors.numberOfContainers}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cargo Type<span className="text-red-500">*</span></label>
          <select className={inputClass(!!errors.cargoType)} value={containerCommodity}
            onChange={(e) => { setContainerCommodity(e.target.value); setErrors(p => ({ ...p, cargoType: undefined })); }}>
            {allCommodities.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
          {errors.cargoType && <p className="mt-1 text-xs text-orange-600">{errors.cargoType}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Hazardous Cargo<span className="text-red-500">*</span></label>
          <div className="flex items-center gap-4 pt-1">
            {[{ val: true, label: 'Yes' }, { val: false, label: 'No' }].map(opt => (
              <label key={String(opt.val)} className="flex items-center gap-1.5 text-sm text-gray-700 cursor-pointer">
                <input type="radio" name="containerHazardousCargo" checked={containerHazardousCargo === opt.val}
                  onChange={() => { setContainerHazardousCargo(opt.val); setErrors(p => ({ ...p, hazardousCargo: undefined })); }}
                  className="h-4 w-4 text-blue-600" /> {opt.label}
              </label>
            ))}
          </div>
          {errors.hazardousCargo && <p className="mt-1 text-xs text-orange-600">{errors.hazardousCargo}</p>}
        </div>
      </div>
    </div>
  );

  const renderGoodsForm = () => (
    <div className="space-y-3 mt-2">
      {renderServiceTypeRadios('goodsServiceType', goodsServiceType, setGoodsServiceType, !!errors.serviceType)}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-3">
        <div>
          {(goodsServiceType === 'doorToDoor' || goodsServiceType === 'doorToTerminal') ? (
            <LocationAutocomplete label="Origin (City/Pincode)" required value={goodsOriginAddress}
              onChange={(v) => { setGoodsOriginAddress(v); setErrors(p => ({ ...p, originAddress: undefined })); }}
              placeholder="e.g., New Delhi, 110001" locationType="city" />
          ) : (
            <LocationAutocomplete label="Origin Terminal" required value={goodsOriginTerminal}
              onChange={(v) => { setGoodsOriginTerminal(v); setErrors(p => ({ ...p, originTerminal: undefined })); }}
              placeholder="e.g., New Delhi ICD" locationType="rail_terminal" />
          )}
          {(errors.originAddress || errors.originTerminal) && <p className="mt-1 text-xs text-orange-600">{errors.originAddress || errors.originTerminal}</p>}
        </div>
        <div>
          {(goodsServiceType === 'doorToDoor' || goodsServiceType === 'terminalToDoor') ? (
            <LocationAutocomplete label="Destination (City/Pincode)" required value={goodsDestinationAddress}
              onChange={(v) => { setGoodsDestinationAddress(v); setErrors(p => ({ ...p, destinationAddress: undefined })); }}
              placeholder="e.g., Mumbai, 400001" locationType="city" />
          ) : (
            <LocationAutocomplete label="Destination Terminal" required value={goodsDestinationTerminal}
              onChange={(v) => { setGoodsDestinationTerminal(v); setErrors(p => ({ ...p, destinationTerminal: undefined })); }}
              placeholder="e.g., Mumbai ICD" locationType="rail_terminal" />
          )}
          {(errors.destinationAddress || errors.destinationTerminal) && <p className="mt-1 text-xs text-orange-600">{errors.destinationAddress || errors.destinationTerminal}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date<span className="text-red-500">*</span></label>
          <input type="date" value={goodsDate ? goodsDate.toISOString().split('T')[0] : ''}
            onChange={(e) => { setGoodsDate(e.target.value ? new Date(e.target.value) : null); setErrors(p => ({ ...p, date: undefined })); }}
            className={inputClass(!!errors.date)} />
          {errors.date && <p className="mt-1 text-xs text-orange-600">{errors.date}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Wagon Type<span className="text-red-500">*</span></label>
          <select className={inputClass(!!errors.wagonType)} value={goodsWagonType}
            onChange={(e) => { setGoodsWagonType(e.target.value); setErrors(p => ({ ...p, wagonType: undefined })); }}>
            <option value="">Select Wagon Type</option>
            {wagonTypes.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
          </select>
          {errors.wagonType && <p className="mt-1 text-xs text-orange-600">{errors.wagonType}</p>}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Total Weight (Tons)<span className="text-red-500">*</span></label>
          <input type="number" className={inputClass(!!errors.totalWeight)} placeholder="e.g., 50" value={goodsTotalWeight} min="0.01" step="0.01"
            onChange={(e) => { setGoodsTotalWeight(e.target.value === '' ? '' : Number(e.target.value)); setErrors(p => ({ ...p, totalWeight: undefined })); }} />
          {errors.totalWeight && <p className="mt-1 text-xs text-orange-600">{errors.totalWeight}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">No. of Wagons<span className="text-red-500">*</span></label>
          <input type="number" className={inputClass(!!errors.numberOfWagons)} placeholder="e.g., 1" value={goodsNumberOfWagons} min="1"
            onChange={(e) => { setGoodsNumberOfWagons(e.target.value === '' ? '' : Number(e.target.value)); setErrors(p => ({ ...p, numberOfWagons: undefined })); }} />
          {errors.numberOfWagons && <p className="mt-1 text-xs text-orange-600">{errors.numberOfWagons}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cargo Type<span className="text-red-500">*</span></label>
          <select className={inputClass(!!errors.cargoType)} value={goodsCommodity}
            onChange={(e) => { setGoodsCommodity(e.target.value); setErrors(p => ({ ...p, cargoType: undefined })); }}>
            {allCommodities.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
          {errors.cargoType && <p className="mt-1 text-xs text-orange-600">{errors.cargoType}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Hazardous Cargo<span className="text-red-500">*</span></label>
          <div className="flex items-center gap-4 pt-1">
            {[{ val: true, label: 'Yes' }, { val: false, label: 'No' }].map(opt => (
              <label key={String(opt.val)} className="flex items-center gap-1.5 text-sm text-gray-700 cursor-pointer">
                <input type="radio" name="goodsHazardousCargo" checked={goodsHazardousCargo === opt.val}
                  onChange={() => { setGoodsHazardousCargo(opt.val); setErrors(p => ({ ...p, hazardousCargo: undefined })); }}
                  className="h-4 w-4 text-blue-600" /> {opt.label}
              </label>
            ))}
          </div>
          {errors.hazardousCargo && <p className="mt-1 text-xs text-orange-600">{errors.hazardousCargo}</p>}
        </div>
      </div>
    </div>
  );

  const renderParcelForm = () => (
    <div className="space-y-3 mt-2">
      {renderServiceTypeRadios('parcelServiceType', parcelServiceType, setParcelServiceType, !!errors.serviceType)}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-3">
        <div>
          {(parcelServiceType === 'doorToDoor' || parcelServiceType === 'doorToTerminal') ? (
            <LocationAutocomplete label="Origin (City/Pincode)" required value={parcelOriginAddress}
              onChange={(v) => { setParcelOriginAddress(v); setErrors(p => ({ ...p, originAddress: undefined })); }}
              placeholder="e.g., New Delhi, 110001" locationType="city" />
          ) : (
            <LocationAutocomplete label="Origin Terminal" required value={parcelOriginTerminal}
              onChange={(v) => { setParcelOriginTerminal(v); setErrors(p => ({ ...p, originTerminal: undefined })); }}
              placeholder="e.g., Chennai ICD" locationType="rail_terminal" />
          )}
          {(errors.originAddress || errors.originTerminal) && <p className="mt-1 text-xs text-orange-600">{errors.originAddress || errors.originTerminal}</p>}
        </div>
        <div>
          {(parcelServiceType === 'doorToDoor' || parcelServiceType === 'terminalToDoor') ? (
            <LocationAutocomplete label="Destination (City/Pincode)" required value={parcelDestinationAddress}
              onChange={(v) => { setParcelDestinationAddress(v); setErrors(p => ({ ...p, destinationAddress: undefined })); }}
              placeholder="e.g., Mumbai, 400001" locationType="city" />
          ) : (
            <LocationAutocomplete label="Destination Terminal" required value={parcelDestinationTerminal}
              onChange={(v) => { setParcelDestinationTerminal(v); setErrors(p => ({ ...p, destinationTerminal: undefined })); }}
              placeholder="e.g., JNPT ICD" locationType="rail_terminal" />
          )}
          {(errors.destinationAddress || errors.destinationTerminal) && <p className="mt-1 text-xs text-orange-600">{errors.destinationAddress || errors.destinationTerminal}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date<span className="text-red-500">*</span></label>
          <input type="date" value={parcelDate ? parcelDate.toISOString().split('T')[0] : ''}
            onChange={(e) => { setParcelDate(e.target.value ? new Date(e.target.value) : null); setErrors(p => ({ ...p, date: undefined })); }}
            className={inputClass(!!errors.date)} />
          {errors.date && <p className="mt-1 text-xs text-orange-600">{errors.date}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Dimensions (LxWxH cm)<span className="text-red-500">*</span></label>
          <input type="text" className={inputClass(!!errors.dimensions)} placeholder="e.g., 30x20x10" value={parcelDimensions}
            onChange={(e) => { setParcelDimensions(e.target.value); setErrors(p => ({ ...p, dimensions: undefined })); }} />
          {errors.dimensions && <p className="mt-1 text-xs text-orange-600">{errors.dimensions}</p>}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Total Weight (Kgs)<span className="text-red-500">*</span></label>
          <input type="number" className={inputClass(!!errors.totalWeight)} placeholder="e.g., 5" value={parcelTotalWeight} min="0.01" step="0.01"
            onChange={(e) => { setParcelTotalWeight(e.target.value === '' ? '' : Number(e.target.value)); setErrors(p => ({ ...p, totalWeight: undefined })); }} />
          {errors.totalWeight && <p className="mt-1 text-xs text-orange-600">{errors.totalWeight}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Parcel Description<span className="text-red-500">*</span></label>
          <input type="text" className={inputClass(!!errors.detailedDescriptionOfGoods)} placeholder="e.g., Books, documents" value={parcelDetailedDescriptionOfGoods}
            onChange={(e) => { setParcelDetailedDescriptionOfGoods(e.target.value); setErrors(p => ({ ...p, detailedDescriptionOfGoods: undefined })); }} />
          {errors.detailedDescriptionOfGoods && <p className="mt-1 text-xs text-orange-600">{errors.detailedDescriptionOfGoods}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Parcel Count<span className="text-red-500">*</span></label>
          <input type="number" className={inputClass(!!errors.parcelCount)} placeholder="e.g., 1" value={parcelCount} min="1"
            onChange={(e) => { setParcelCount(e.target.value === '' ? '' : Number(e.target.value)); setErrors(p => ({ ...p, parcelCount: undefined })); }} />
          {errors.parcelCount && <p className="mt-1 text-xs text-orange-600">{errors.parcelCount}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Hazardous Cargo<span className="text-red-500">*</span></label>
          <div className="flex items-center gap-4 pt-1">
            {[{ val: true, label: 'Yes' }, { val: false, label: 'No' }].map(opt => (
              <label key={String(opt.val)} className="flex items-center gap-1.5 text-sm text-gray-700 cursor-pointer">
                <input type="radio" name="parcelHazardousCargo" checked={parcelHazardousCargo === opt.val}
                  onChange={() => { setParcelHazardousCargo(opt.val); setErrors(p => ({ ...p, hazardousCargo: undefined })); }}
                  className="h-4 w-4 text-blue-600" /> {opt.label}
              </label>
            ))}
          </div>
          {errors.hazardousCargo && <p className="mt-1 text-xs text-orange-600">{errors.hazardousCargo}</p>}
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-4 bg-white shadow-md rounded-xl border border-gray-200 font-inter">

      {/* Tab selector */}
      <div className="p-1 bg-gray-50 rounded-xl mb-3 border border-gray-200 w-full">
        <div className="flex justify-center gap-2 w-fit mx-auto">
          {validBookingTabs.map((tab) => (
            <button key={tab} type="button"
              onClick={() => { setActiveTab(tab); setErrors({}); setShowValidationMessage(false); setShowSuccessMessage(false); }}
              className={`px-4 py-2 text-sm font-medium transition-all rounded-lg ${activeTab === tab ? 'bg-blue-100 text-blue-800 border border-blue-200' : 'bg-white text-gray-700 hover:bg-blue-50 border border-gray-200'}`}>
              {tab === "container" ? "Container Train" : tab === "parcel" ? "Parcel Train" : "Goods Train"}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'container' && renderContainerForm()}
      {activeTab === 'goods' && renderGoodsForm()}
      {activeTab === 'parcel' && renderParcelForm()}

      {showButtons && (
        <div className="flex justify-center mt-4">
          <button type="button" onClick={() => handleFormSubmissionLogic()}
            className="px-10 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition">
            Search Quotes
          </button>
        </div>
      )}

      {showValidationMessage && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full">
            <p className="text-gray-700 mb-4">{validationMessage}</p>
            <button onClick={() => setShowValidationMessage(false)} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg w-full">Got It</button>
          </div>
        </div>
      )}

      {showSuccessMessage && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full text-center">
            <p className="text-gray-700 mb-4">{successMessage}</p>
            <button onClick={() => setShowSuccessMessage(false)} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg w-full">OK</button>
          </div>
        </div>
      )}
    </div>
  );
});

export default RailQuoteForm;
