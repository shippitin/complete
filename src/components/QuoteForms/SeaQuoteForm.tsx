// src/components/QuoteForms/SeaQuoteForm.tsx
import React, { useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaTimesCircle, FaCheckCircle, FaInfoCircle } from 'react-icons/fa';
import type { SeaFormData, QuoteFormHandle, ParsedVoiceCommand, AllFormData } from '../../types/QuoteFormHandle';
import { parseNumber } from '../../utils/parseNumber';
import LocationAutocomplete from '../LocationAutocomplete';

type ActivityTypeLiteral = 'Port to Port' | 'Door to Door' | 'Door to Port' | 'Port to Door';
const validActivityTypes: ActivityTypeLiteral[] = ['Port to Port', 'Door to Door', 'Door to Port', 'Port to Door'];

type ShipmentModeLiteral = 'LCL' | 'FCL';

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

const containerTypes = [
  { label: 'ALL', value: 'ALL' },
  { label: '20ft Standard', value: '20ft Standard' },
  { label: '40ft Standard', value: '40ft Standard' },
  { label: '40ft High Cube', value: '40ft High Cube' },
  { label: '40ft Open Top High', value: '40ft Open Top High' },
];

interface SeaQuoteFormProps {
  prefillData?: ParsedVoiceCommand;
  showButtons?: boolean;
}

const SeaQuoteForm = forwardRef<QuoteFormHandle, SeaQuoteFormProps>(({ prefillData, showButtons = true }, ref) => {
  const navigate = useNavigate();

  const [activityType, setActivityType] = useState<ActivityTypeLiteral>('Port to Port');
  const [shipmentMode, setShipmentMode] = useState<ShipmentModeLiteral>('FCL');
  const [originPort, setOriginPort] = useState('');
  const [destinationPort, setDestinationPort] = useState('');
  const [originCityPincode, setOriginCityPincode] = useState('');
  const [destinationCityPincode, setDestinationCityPincode] = useState('');
  const [readyDate, setReadyDate] = useState<Date | null>(new Date());
  const [totalWeight, setTotalWeight] = useState<number | ''>('');
  const [hazardousCargo, setHazardousCargo] = useState(false);
  const [commodity, setCommodity] = useState('FAK (Freight of All Kinds)');
  const [numberOfPieces, setNumberOfPieces] = useState<number | ''>('');
  const [volumeCBM, setVolumeCBM] = useState<number | ''>('');
  const [fclContainerType, setFclContainerType] = useState<SeaFormData['containerType']>('ALL');
  const [fclNumberOfContainers, setFclNumberOfContainers] = useState<number | ''>(1);
  const [errors, setErrors] = useState<Partial<Record<keyof SeaFormData, string>>>({});
  const [showValidationMessage, setShowValidationMessage] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const resetFieldsForActivityTypeChange = () => {
    setOriginPort(''); setOriginCityPincode(''); setDestinationPort(''); setDestinationCityPincode('');
    setReadyDate(new Date()); setTotalWeight(''); setHazardousCargo(false); setCommodity('FAK (Freight of All Kinds)');
    setNumberOfPieces(''); setVolumeCBM(''); setFclContainerType('ALL'); setFclNumberOfContainers(1);
    setErrors({}); setShowValidationMessage(false); setShowSuccessMessage(false);
  };

  useEffect(() => {
    if (prefillData) {
      if (prefillData.activityType && validActivityTypes.includes(prefillData.activityType as ActivityTypeLiteral)) setActivityType(prefillData.activityType as ActivityTypeLiteral);
      const pd = prefillData as any;
      setOriginPort(prefillData.origin || pd.originPort || '');
      setDestinationPort(prefillData.destination || pd.destinationPort || '');
      setOriginCityPincode([pd.originCity, pd.originPincode].filter(Boolean).join(', ') || prefillData.origin || '');
      setDestinationCityPincode([pd.destinationCity, pd.destinationPincode].filter(Boolean).join(', ') || prefillData.destination || '');
      setVolumeCBM(parseNumber((prefillData as any).volumetricWeight) ?? '');
      if (prefillData.containerType) setFclContainerType(prefillData.containerType as SeaFormData['containerType']);
      setFclNumberOfContainers(parseNumber(prefillData.numberOfContainers) ?? 1);
    }
  }, [prefillData]);

  const handleSubmitLogic = (): AllFormData | null => {
    const newErrors: Partial<Record<keyof SeaFormData, string>> = {};
    if (!activityType) newErrors.activityType = 'Activity Type is required.';
    if (!shipmentMode) newErrors.shipmentMode = 'Shipment Mode is required.';
    if (!readyDate) newErrors.readyDate = 'Date is required.';

    if (activityType === 'Door to Door') {
      if (!originCityPincode) newErrors.originCity = 'Origin is required.';
      if (!destinationCityPincode) newErrors.destinationCity = 'Destination is required.';
    } else if (activityType === 'Port to Port') {
      if (!originPort) newErrors.originPort = 'Origin Port is required.';
      if (!destinationPort) newErrors.destinationPort = 'Destination Port is required.';
    } else if (activityType === 'Door to Port') {
      if (!originCityPincode) newErrors.originCity = 'Origin is required.';
      if (!destinationPort) newErrors.destinationPort = 'Destination Port is required.';
    } else if (activityType === 'Port to Door') {
      if (!originPort) newErrors.originPort = 'Origin Port is required.';
      if (!destinationCityPincode) newErrors.destinationCity = 'Destination is required.';
    }

    const finalTotalWeight = parseNumber(totalWeight);
    if (finalTotalWeight === undefined || finalTotalWeight <= 0) newErrors.totalWeight = 'Total Weight is required.';
    if (!commodity) newErrors.commodity = 'Commodity is required.';

    if (shipmentMode === 'LCL') {
      const finalNumberOfPieces = parseNumber(numberOfPieces);
      if (finalNumberOfPieces === undefined || finalNumberOfPieces <= 0) newErrors.numberOfPieces = 'Number of Pieces is required.';
      const finalVolumeCBM = parseNumber(volumeCBM);
      if (finalVolumeCBM === undefined || finalVolumeCBM <= 0) newErrors.volumeCBM = 'Volume (CBM) is required.';
    }
    if (shipmentMode === 'FCL') {
      if (!fclContainerType) newErrors.containerType = 'Container Type is required.';
      const finalFclNumberOfContainers = parseNumber(fclNumberOfContainers);
      if (finalFclNumberOfContainers === undefined || finalFclNumberOfContainers <= 0) newErrors.numberOfContainers = 'Number of Containers is required.';
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      setValidationMessage('Please fill in all required fields correctly.');
      setShowValidationMessage(true);
      return null;
    }

    const formData: SeaFormData = {
      bookingType: 'Sea', activityType, shipmentMode,
      readyDate: readyDate ? readyDate.toISOString().split('T')[0] : '',
      totalWeight: finalTotalWeight as number, commodity, cargoType: commodity, hazardousCargo,
      originPort: undefined, originCity: undefined, originAddress: undefined, originPincode: undefined,
      destinationPort: undefined, destinationCity: undefined, destinationAddress: undefined, destinationPincode: undefined,
      dimensions: undefined, cargoValue: undefined, insuranceRequired: false, incoterms: undefined,
      hsCode: undefined, stuffingPoint: undefined, detailedDescriptionOfGoods: undefined,
      commodityCategory: '', numberOfPieces: undefined, volumeCBM: undefined,
      containerType: undefined, numberOfContainers: undefined,
    };

    if (activityType === 'Port to Port') { formData.originPort = originPort; formData.destinationPort = destinationPort; }
    else if (activityType === 'Door to Port') { formData.originCity = originCityPincode; formData.destinationPort = destinationPort; }
    else if (activityType === 'Port to Door') { formData.originPort = originPort; formData.destinationCity = destinationCityPincode; }
    else if (activityType === 'Door to Door') { formData.originCity = originCityPincode; formData.destinationCity = destinationCityPincode; }

    if (shipmentMode === 'LCL') { formData.numberOfPieces = parseNumber(numberOfPieces); formData.volumeCBM = parseNumber(volumeCBM); }
    if (shipmentMode === 'FCL') {
      formData.containerType = fclContainerType === 'ALL' ? undefined : fclContainerType;
      formData.numberOfContainers = parseNumber(fclNumberOfContainers);
    }

    // ← Only change:  /sea-recommended-services → /sea-recommended-services
    if (showButtons) {
      navigate('/sea-recommended-services', { state: { formData } });
      setSuccessMessage('Redirecting...');
      setShowSuccessMessage(true);
    } else {
      setSuccessMessage('Form data collected successfully.');
      setShowSuccessMessage(true);
    }
    return formData;
  };

  const resetForm = () => {
    setActivityType('Port to Port'); setShipmentMode('FCL');
    setOriginPort(''); setDestinationPort(''); setOriginCityPincode(''); setDestinationCityPincode('');
    setReadyDate(new Date()); setTotalWeight(''); setHazardousCargo(false); setCommodity('FAK (Freight of All Kinds)');
    setNumberOfPieces(''); setVolumeCBM(''); setFclContainerType('ALL'); setFclNumberOfContainers(1);
    setErrors({}); setShowValidationMessage(false); setShowSuccessMessage(false);
  };

  useImperativeHandle(ref, () => ({ submit: () => handleSubmitLogic(), reset: () => resetForm() }));

  const inputClass = (hasError: boolean) =>
    `block w-full pl-3 pr-3 py-2 sm:text-sm bg-transparent border-0 border-b focus:ring-0 focus:border-blue-500 ${hasError ? 'border-orange-500' : 'border-gray-300'}`;

  const renderOrigin = () => {
    if (activityType === 'Port to Port' || activityType === 'Port to Door') {
      return (
        <div className="md:col-span-1">
          <LocationAutocomplete label="Origin Port" required value={originPort}
            onChange={(v) => { setOriginPort(v); setErrors(p => ({ ...p, originPort: undefined })); }}
            placeholder="e.g., Chennai Port, INMAA" locationType="seaport"
            className={errors.originPort ? 'ring-1 ring-orange-500 rounded-xl' : ''} />
          {errors.originPort && <p className="mt-1 text-sm text-orange-600">{errors.originPort}</p>}
        </div>
      );
    }
    return (
      <div className="md:col-span-1">
        <LocationAutocomplete label="Origin (City/Pincode)" required value={originCityPincode}
          onChange={(v) => { setOriginCityPincode(v); setErrors(p => ({ ...p, originCity: undefined })); }}
          placeholder="e.g., Chennai, 600001" locationType="city"
          className={errors.originCity ? 'ring-1 ring-orange-500 rounded-xl' : ''} />
        {errors.originCity && <p className="mt-1 text-sm text-orange-600">{errors.originCity}</p>}
      </div>
    );
  };

  const renderDestination = () => {
    if (activityType === 'Port to Port' || activityType === 'Door to Port') {
      return (
        <div className="md:col-span-1">
          <LocationAutocomplete label="Destination Port" required value={destinationPort}
            onChange={(v) => { setDestinationPort(v); setErrors(p => ({ ...p, destinationPort: undefined })); }}
            placeholder="e.g., Singapore, SGSIN" locationType="seaport" global
            className={errors.destinationPort ? 'ring-1 ring-orange-500 rounded-xl' : ''} />
          {errors.destinationPort && <p className="mt-1 text-sm text-orange-600">{errors.destinationPort}</p>}
        </div>
      );
    }
    return (
      <div className="md:col-span-1">
        <LocationAutocomplete label="Destination (City/Pincode)" required value={destinationCityPincode}
          onChange={(v) => { setDestinationCityPincode(v); setErrors(p => ({ ...p, destinationCity: undefined })); }}
          placeholder="e.g., Los Angeles, 90210" locationType="city" global
          className={errors.destinationCity ? 'ring-1 ring-orange-500 rounded-xl' : ''} />
        {errors.destinationCity && <p className="mt-1 text-sm text-orange-600">{errors.destinationCity}</p>}
      </div>
    );
  };

  return (
    <div className="space-y-4 p-5 bg-white rounded-xl shadow-md border border-gray-200 font-inter">

      {/* Activity Type */}
      <div>
        <div className={`grid grid-cols-2 sm:grid-cols-4 gap-2 ${errors.activityType ? 'border-2 border-orange-500 rounded-lg p-1' : ''}`}>
          {validActivityTypes.map(type => (
            <button key={type} type="button"
              onClick={() => { setActivityType(type); resetFieldsForActivityTypeChange(); setErrors(p => ({ ...p, activityType: undefined })); }}
              className={`flex items-center justify-center px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${activityType === type ? 'bg-blue-100 text-blue-800 shadow-sm border border-blue-200' : 'bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-600 border border-gray-300'}`}>
              {type}
            </button>
          ))}
        </div>
        {errors.activityType && <p className="mt-1 text-sm text-orange-600">{errors.activityType}</p>}
      </div>

      {/* Shipment Mode */}
      <div className="flex gap-2 w-fit">
        {['FCL', 'LCL'].map(mode => (
          <button key={mode} type="button"
            onClick={() => { setShipmentMode(mode as ShipmentModeLiteral); setErrors(p => ({ ...p, shipmentMode: undefined })); setNumberOfPieces(''); setVolumeCBM(''); setFclContainerType('ALL'); setFclNumberOfContainers(1); }}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${shipmentMode === mode ? 'bg-blue-100 text-blue-800 border border-blue-200' : 'bg-gray-100 text-gray-700 hover:bg-blue-50 border border-gray-300'}`}>
            {mode}
          </button>
        ))}
      </div>

      {/* Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-3">
        {renderOrigin()}
        {renderDestination()}
        {shipmentMode === 'FCL' ? (
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Container Type<span className="text-red-500">*</span></label>
            <select className={inputClass(!!errors.containerType)} value={fclContainerType}
              onChange={(e) => { setFclContainerType(e.target.value as SeaFormData['containerType']); setErrors(p => ({ ...p, containerType: undefined })); }}>
              {containerTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            {errors.containerType && <p className="mt-1 text-sm text-orange-600">{errors.containerType}</p>}
          </div>
        ) : (
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">No. of Pieces<span className="text-red-500">*</span></label>
            <input type="number" className={inputClass(!!errors.numberOfPieces)} placeholder="e.g., 1" value={numberOfPieces} min="1"
              onChange={(e) => { setNumberOfPieces(e.target.value === '' ? '' : Number(e.target.value)); setErrors(p => ({ ...p, numberOfPieces: undefined })); }} />
            {errors.numberOfPieces && <p className="mt-1 text-sm text-orange-600">{errors.numberOfPieces}</p>}
          </div>
        )}
        <div className="md:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Date<span className="text-red-500">*</span></label>
          <DatePicker selected={readyDate} onChange={(date) => { setReadyDate(date); setErrors(p => ({ ...p, readyDate: undefined })); }}
            dateFormat="dd-MM-yyyy" placeholderText="DD-MM-YYYY" className={inputClass(!!errors.readyDate)} />
          {errors.readyDate && <p className="mt-1 text-sm text-orange-600">{errors.readyDate}</p>}
        </div>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-3">
        <div className="md:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Total Weight (Kgs)<span className="text-red-500">*</span></label>
          <input type="number" className={inputClass(!!errors.totalWeight)} placeholder="e.g., 20000" value={totalWeight}
            onChange={(e) => { setTotalWeight(e.target.value === '' ? '' : Number(e.target.value)); setErrors(p => ({ ...p, totalWeight: undefined })); }} />
          {errors.totalWeight && <p className="mt-1 text-sm text-orange-600">{errors.totalWeight}</p>}
        </div>
        {shipmentMode === 'FCL' ? (
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Number of Containers<span className="text-red-500">*</span></label>
            <input type="number" className={inputClass(!!errors.numberOfContainers)} placeholder="e.g., 1" value={fclNumberOfContainers} min="1"
              onChange={(e) => { setFclNumberOfContainers(e.target.value === '' ? '' : Number(e.target.value)); setErrors(p => ({ ...p, numberOfContainers: undefined })); }} />
            {errors.numberOfContainers && <p className="mt-1 text-sm text-orange-600">{errors.numberOfContainers}</p>}
          </div>
        ) : (
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Volume (CBM)<span className="text-red-500">*</span></label>
            <input type="number" className={inputClass(!!errors.volumeCBM)} placeholder="e.g., 1.5" value={volumeCBM} step="0.01" min="0.01"
              onChange={(e) => { setVolumeCBM(e.target.value === '' ? '' : Number(e.target.value)); setErrors(p => ({ ...p, volumeCBM: undefined })); }} />
            {errors.volumeCBM && <p className="mt-1 text-sm text-orange-600">{errors.volumeCBM}</p>}
          </div>
        )}
        <div className="md:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Select Commodity<span className="text-red-500">*</span></label>
          <select className={inputClass(!!errors.commodity)} value={commodity}
            onChange={(e) => { setCommodity(e.target.value); setErrors(p => ({ ...p, commodity: undefined })); }}>
            <option value="">Select Commodity</option>
            {allCommodities.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
          {errors.commodity && <p className="mt-1 text-sm text-orange-600">{errors.commodity}</p>}
        </div>
        <div className="flex items-center mt-2 md:col-span-1">
          <input type="checkbox" id="seaHazardousCargo" checked={hazardousCargo}
            onChange={(e) => setHazardousCargo(e.target.checked)}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
          <label htmlFor="seaHazardousCargo" className="ml-2 block text-sm text-gray-900">Hazardous Cargo</label>
        </div>
      </div>

      {showButtons && (
        <div className="flex justify-center space-x-4 mt-6">
          <button type="button" onClick={handleSubmitLogic} className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition">Search Quotes</button>
          <button type="button" onClick={resetForm} className="px-8 py-3 bg-gray-200 text-gray-800 font-bold rounded-xl hover:bg-gray-300 transition">Reset</button>
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
            <FaCheckCircle className="text-green-500 text-4xl mx-auto mb-3" />
            <p className="text-gray-700 mb-4">{successMessage}</p>
            <button onClick={() => setShowSuccessMessage(false)} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg w-full">OK</button>
          </div>
        </div>
      )}
    </div>
  );
});

export default SeaQuoteForm;
