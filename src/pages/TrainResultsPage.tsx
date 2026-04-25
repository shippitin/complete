// src/pages/TrainResultsPage.tsx
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  FaTrain, FaMapMarkerAlt, FaClock, FaCalendarDay, FaBoxes, FaInfoCircle, FaRupeeSign,
  FaArrowRight, FaArrowLeft, FaHome, FaFilter, FaCheckCircle, FaTimesCircle, FaBox
} from 'react-icons/fa';
import type { AllFormData, FreightTrainResult, RailServiceType, TrainContainerFormData, TrainGoodsFormData, TrainParcelFormData } from '../types/QuoteFormHandle';
import { rateCardsAPI } from '../services/api';

type TrainTypeFilter = 'Express Cargo' | 'Standard Cargo' | 'Premium Cargo' | 'Economy Cargo';
type OperatorFilter = 'CONCOR' | 'Maersk' | 'MSC' | 'CMA CGM' | 'Hapag-Lloyd' | 'Evergreen';
type FeatureFilter = 'GPS Tracking' | 'Refrigerated' | 'Priority Handling' | 'Door-to-Door Service' | 'Terminal-to-Terminal Service' | 'Hazardous Cargo Handling' | 'Real-time Updates' | 'Door-to-Terminal Service' | 'Terminal-to-Door Service';
type ServiceTypeFilter = RailServiceType;

const TrainResultsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<AllFormData | null>(null);
  const [allSearchResults, setAllSearchResults] = useState<FreightTrainResult[]>([]);
  const [filteredSearchResults, setFilteredSearchResults] = useState<FreightTrainResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedTrainTypes, setSelectedTrainTypes] = useState<TrainTypeFilter[]>([]);
  const [selectedOperators, setSelectedOperators] = useState<OperatorFilter[]>([]);
  const [selectedFeatures, setSelectedFeatures] = useState<FeatureFilter[]>([]);
  const [selectedServiceTypes, setSelectedServiceTypes] = useState<ServiceTypeFilter[]>([]);

  const mapServiceTypeToFeature = (serviceType: RailServiceType): FeatureFilter => {
    switch (serviceType) {
      case 'doorToDoor': return 'Door-to-Door Service';
      case 'doorToTerminal': return 'Door-to-Terminal Service';
      case 'terminalToDoor': return 'Terminal-to-Door Service';
      default: return 'Terminal-to-Terminal Service';
    }
  };

  const getOriginDisplay = (data: AllFormData): string => {
    const serviceType = (data as any).serviceType as RailServiceType;
    if (serviceType === 'doorToDoor' || serviceType === 'doorToTerminal') return data.originAddress || data.originStation || 'N/A';
    return data.originTerminal || data.originStation || 'N/A';
  };

  const getDestinationDisplay = (data: AllFormData): string => {
    const serviceType = (data as any).serviceType as RailServiceType;
    if (serviceType === 'doorToDoor' || serviceType === 'terminalToDoor') return data.destinationAddress || data.destinationStation || 'N/A';
    return data.destinationTerminal || data.destinationStation || 'N/A';
  };

  const simulateSearchResults = (data: AllFormData): FreightTrainResult[] => {
    const commonOriginDisplay = getOriginDisplay(data);
    const commonDestinationDisplay = getDestinationDisplay(data);
    let basePricePerUnit = 0;
    let capacityUnit = '';
    let cargoDetails = '';
    let transitDaysFactor = 1;
    let priceMultiplier = 1;
    let baseCapacity = 100;

    if (data.bookingType === 'Train Container Booking') {
      const containerData = data as TrainContainerFormData;
      basePricePerUnit = 2.5;
      capacityUnit = 'Containers';
      cargoDetails = containerData.containerType;
      priceMultiplier = containerData.numberOfContainers || 1;
      baseCapacity = 100;
      if (containerData.containerType?.includes('Reefer')) basePricePerUnit *= 2.0;
      if (!containerData.isDomestic) basePricePerUnit *= 1.3;
    } else if (data.bookingType === 'Train Goods Booking') {
      const goodsData = data as TrainGoodsFormData;
      basePricePerUnit = 2.5;
      capacityUnit = 'Wagons';
      cargoDetails = goodsData.wagonType;
      priceMultiplier = goodsData.numberOfWagons || 1;
      baseCapacity = 200;
    } else if (data.bookingType === 'Train Parcel Booking') {
      const parcelData = data as TrainParcelFormData;
      basePricePerUnit = 100;
      capacityUnit = 'Parcels';
      cargoDetails = parcelData.detailedDescriptionOfGoods;
      priceMultiplier = parcelData.parcelCount || 1;
      baseCapacity = 500;
    }

    const totalCalculatedWeight = data.totalWeight || 0;
    let calculatedPrice = Math.max(basePricePerUnit * totalCalculatedWeight * priceMultiplier, 10000);

    const serviceType = data.serviceType as RailServiceType;
    let serviceFeature: FeatureFilter = 'Terminal-to-Terminal Service';
    if (serviceType === 'doorToDoor') { calculatedPrice *= 1.6; transitDaysFactor *= 1.3; serviceFeature = 'Door-to-Door Service'; }
    else if (serviceType === 'doorToTerminal') { calculatedPrice *= 1.3; transitDaysFactor *= 1.15; serviceFeature = 'Door-to-Terminal Service'; }
    else if (serviceType === 'terminalToDoor') { calculatedPrice *= 1.3; transitDaysFactor *= 1.15; serviceFeature = 'Terminal-to-Door Service'; }
    if (data.hazardousCargo) calculatedPrice *= 1.4;

    const internationalOperators: OperatorFilter[] = ['Maersk', 'MSC', 'CMA CGM', 'Hapag-Lloyd', 'Evergreen'];
    const operatorForResults: OperatorFilter = (data as TrainContainerFormData)?.isDomestic === false
      ? internationalOperators[Math.floor(Math.random() * internationalOperators.length)]
      : 'CONCOR';

    const results: FreightTrainResult[] = [
      { id: 'TRN001', serviceName: 'Premium Rail Transit', operator: operatorForResults, originStation: commonOriginDisplay, destinationStation: commonDestinationDisplay, departureTime: 'As per schedule', arrivalTime: 'Estimated', transitDuration: `${Math.max(2, Math.round(3 * transitDaysFactor))} Days`, availableCapacity: `${Math.round(baseCapacity * 0.8 * priceMultiplier)} ${capacityUnit}`, price: calculatedPrice * 1.25, features: ['GPS Tracking', 'Priority Handling', 'Real-time Updates', serviceFeature, 'Refrigerated'], cargoType: cargoDetails, isHazardousCompatible: true },
      { id: 'TRN002', serviceName: 'Express Freight Link', operator: operatorForResults, originStation: commonOriginDisplay, destinationStation: commonDestinationDisplay, departureTime: 'As per schedule', arrivalTime: 'Estimated', transitDuration: `${Math.max(3, Math.round(5 * transitDaysFactor))} Days`, availableCapacity: `${Math.round(baseCapacity * 1.0 * priceMultiplier)} ${capacityUnit}`, price: calculatedPrice * 1.0, features: ['GPS Tracking', serviceFeature], cargoType: cargoDetails, isHazardousCompatible: true },
      { id: 'TRN003', serviceName: 'Standard Cargo Express', operator: operatorForResults, originStation: commonOriginDisplay, destinationStation: commonDestinationDisplay, departureTime: 'As per schedule', arrivalTime: 'Estimated', transitDuration: `${Math.max(4, Math.round(7 * transitDaysFactor))} Days`, availableCapacity: `${Math.round(baseCapacity * 1.2 * priceMultiplier)} ${capacityUnit}`, price: calculatedPrice * 0.8, features: ['Basic Service', serviceFeature], cargoType: cargoDetails, isHazardousCompatible: false },
      { id: 'TRN004', serviceName: 'Economy Freight', operator: operatorForResults, originStation: commonOriginDisplay, destinationStation: commonDestinationDisplay, departureTime: 'As per schedule', arrivalTime: 'Estimated', transitDuration: `${Math.max(5, Math.round(9 * transitDaysFactor))} Days`, availableCapacity: `${Math.round(baseCapacity * 1.5 * priceMultiplier)} ${capacityUnit}`, price: calculatedPrice * 0.6, features: ['Economy Service', serviceFeature], cargoType: cargoDetails, isHazardousCompatible: false },
    ];

    if (data.hazardousCargo) return results.filter(r => r.isHazardousCompatible);
    return results;
  };

  useEffect(() => {
    const state = location.state as { formData: AllFormData } | undefined;
    if (!state?.formData) { setError("No form data provided."); setLoading(false); return; }

    const data = state.formData;
    setFormData(data);

    (async () => {
      try {
        const origin = getOriginDisplay(data);
        const destination = getDestinationDisplay(data);
        const response = await rateCardsAPI.search({
          serviceType: 'Rail',
          origin: origin === 'N/A' ? '' : origin,
          destination: destination === 'N/A' ? '' : destination,
          numberOfContainers: (data as TrainContainerFormData).numberOfContainers,
          containerType: (data as TrainContainerFormData).containerType,
        });

        if (response.data.data.length > 0) {
          const commonOriginDisplay = getOriginDisplay(data);
          const commonDestinationDisplay = getDestinationDisplay(data);
          const serviceFeature: FeatureFilter = mapServiceTypeToFeature((data as any).serviceType);

          const mapped: FreightTrainResult[] = response.data.data.map((r: any) => ({
            id: r.id,
            serviceName: r.carrier,
            operator: r.carrier,
            originStation: commonOriginDisplay,
            destinationStation: commonDestinationDisplay,
            departureTime: 'As per schedule',
            arrivalTime: 'Estimated',
            transitDuration: r.transitTime,
            availableCapacity: 'Available',
            price: r.totalPrice,
            features: ['GPS Tracking', serviceFeature],
            cargoType: (data as TrainContainerFormData).containerType || 'General',
            isHazardousCompatible: true,
          }));
          setAllSearchResults(mapped);
          setFilteredSearchResults(mapped);
        } else {
          const simulated = simulateSearchResults(data);
          setAllSearchResults(simulated);
          setFilteredSearchResults(simulated);
        }
      } catch (error) {
        const simulated = simulateSearchResults(data);
        setAllSearchResults(simulated);
        setFilteredSearchResults(simulated);
      } finally {
        setLoading(false);
      }
    })();
  }, [location.state]);

  useEffect(() => {
    let current = [...allSearchResults];
    if (selectedTrainTypes.length > 0) current = current.filter(r => selectedTrainTypes.some(t => r.serviceName.includes(t.replace(' Cargo', ''))));
    if (selectedOperators.length > 0) current = current.filter(r => selectedOperators.includes(r.operator as OperatorFilter));
    if (selectedFeatures.length > 0) current = current.filter(r => selectedFeatures.every(f => r.features.includes(f)));
    if (selectedServiceTypes.length > 0) current = current.filter(r => selectedServiceTypes.some(st => r.features.includes(mapServiceTypeToFeature(st))));
    setFilteredSearchResults(current);
  }, [selectedTrainTypes, selectedOperators, selectedFeatures, selectedServiceTypes, allSearchResults]);

  const handleViewDetails = (result: FreightTrainResult) => {
    if (formData) navigate('/train-service-details', { state: { formData, selectedTrainResult: result } });
  };

  const handleFilterChange = (filterType: 'trainType' | 'operator' | 'feature' | 'serviceType', value: string) => {
    if (filterType === 'trainType') setSelectedTrainTypes(prev => prev.includes(value as TrainTypeFilter) ? prev.filter(i => i !== value) : [...prev, value as TrainTypeFilter]);
    else if (filterType === 'operator') setSelectedOperators(prev => prev.includes(value as OperatorFilter) ? prev.filter(i => i !== value) : [...prev, value as OperatorFilter]);
    else if (filterType === 'feature') setSelectedFeatures(prev => prev.includes(value as FeatureFilter) ? prev.filter(i => i !== value) : [...prev, value as FeatureFilter]);
    else if (filterType === 'serviceType') setSelectedServiceTypes(prev => prev.includes(value as ServiceTypeFilter) ? prev.filter(i => i !== value) : [...prev, value as ServiceTypeFilter]);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="text-center p-10 bg-white rounded-2xl shadow-xl">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-6"></div>
          <p className="text-2xl text-gray-700 font-semibold">Searching for the best train services...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="max-w-md mx-auto px-6 py-12 bg-white shadow-2xl rounded-2xl text-center">
          <h3 className="text-3xl font-extrabold text-red-600 mb-6">Error</h3>
          <p className="text-gray-700 text-lg mb-8">{error}</p>
          <button onClick={() => navigate('/train-booking')} className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition">
            <FaArrowLeft className="inline-block mr-3" /> Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col lg:flex-row">
        {/* Filters Sidebar */}
        <aside className="lg:w-1/4 w-full p-8 border-b lg:border-r border-gray-200 bg-gray-50">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center"><FaFilter className="mr-3 text-blue-600" /> Filter Results</h3>
          <div className="space-y-8">
            <div>
              <h4 className="font-semibold text-gray-700 mb-4">Train Type</h4>
              <div className="space-y-3">
                {['Premium Cargo', 'Express Cargo', 'Standard Cargo', 'Economy Cargo'].map(type => (
                  <label key={type} className="flex items-center text-gray-700 cursor-pointer hover:text-blue-600">
                    <input type="checkbox" className="mr-3 h-5 w-5 rounded text-blue-600" checked={selectedTrainTypes.includes(type as TrainTypeFilter)} onChange={() => handleFilterChange('trainType', type)} /> {type}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700 mb-4">Operators</h4>
              <div className="space-y-3">
                {['CONCOR', 'Maersk', 'MSC', 'CMA CGM', 'Hapag-Lloyd', 'Evergreen'].map(op => (
                  <label key={op} className="flex items-center text-gray-700 cursor-pointer hover:text-blue-600">
                    <input type="checkbox" className="mr-3 h-5 w-5 rounded text-blue-600" checked={selectedOperators.includes(op as OperatorFilter)} onChange={() => handleFilterChange('operator', op)} /> {op}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700 mb-4">Service Type</h4>
              <div className="space-y-3">
                {[['terminalToTerminal', 'Terminal to Terminal'], ['doorToDoor', 'Door to Door'], ['doorToTerminal', 'Door to Terminal'], ['terminalToDoor', 'Terminal to Door']].map(([val, label]) => (
                  <label key={val} className="flex items-center text-gray-700 cursor-pointer hover:text-blue-600">
                    <input type="checkbox" className="mr-3 h-5 w-5 rounded text-blue-600" checked={selectedServiceTypes.includes(val as ServiceTypeFilter)} onChange={() => handleFilterChange('serviceType', val)} /> {label}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700 mb-4">Features</h4>
              <div className="space-y-3">
                {['GPS Tracking', 'Refrigerated', 'Priority Handling', 'Hazardous Cargo Handling', 'Real-time Updates'].map(feature => (
                  <label key={feature} className="flex items-center text-gray-700 cursor-pointer hover:text-blue-600">
                    <input type="checkbox" className="mr-3 h-5 w-5 rounded text-blue-600" checked={selectedFeatures.includes(feature as FeatureFilter)} onChange={() => handleFilterChange('feature', feature)} /> {feature}
                  </label>
                ))}
              </div>
            </div>
          </div>
          <button onClick={() => { setSelectedTrainTypes([]); setSelectedOperators([]); setSelectedFeatures([]); setSelectedServiceTypes([]); }} className="mt-8 w-full bg-gray-200 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-300 transition flex items-center justify-center">
            <FaTimesCircle className="mr-2" /> Clear Filters
          </button>
        </aside>

        {/* Results */}
        <main className="lg:flex-1 w-full p-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
            <button onClick={() => navigate('/train-booking')} className="flex items-center text-blue-600 hover:text-blue-700 font-medium text-lg transition mb-4 sm:mb-0">
              <FaArrowLeft className="mr-2" /> Back to Train Booking
            </button>
            <h3 className="text-2xl font-bold text-gray-800 flex items-center">
              <FaTrain className="text-blue-600 mr-3" /> Available Train Services
            </h3>
          </div>

          {filteredSearchResults.length > 0 ? (
            <div className="space-y-6">
              {filteredSearchResults.map(result => (
                <div key={result.id} className="bg-white rounded-xl p-6 border border-gray-200 shadow-md flex flex-col hover:shadow-lg hover:border-blue-200 transition-all duration-200">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                    <div className="flex-grow mb-3 md:mb-0">
                      <h4 className="text-xl font-bold text-gray-800 mb-1">{result.serviceName} <span className="text-gray-500 text-sm font-normal">({result.id})</span></h4>
                      <p className="text-gray-600 text-sm">Operator: <span className="font-semibold">{result.operator}</span></p>
                    </div>
                    <div className="text-3xl font-extrabold text-gray-800 flex items-center">
                      <FaRupeeSign className="text-2xl mr-1" />{Math.round(result.price).toLocaleString('en-IN')}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3 text-sm text-gray-700 mb-4">
                    <div className="flex items-center"><FaMapMarkerAlt className="mr-2 text-gray-500" /><span className="font-semibold">Origin:</span>&nbsp;{result.originStation}</div>
                    <div className="flex items-center"><FaMapMarkerAlt className="mr-2 text-gray-500" /><span className="font-semibold">Destination:</span>&nbsp;{result.destinationStation}</div>
                    <div className="flex items-center"><FaCalendarDay className="mr-2 text-gray-500" /><span className="font-semibold">Transit:</span>&nbsp;{result.transitDuration}</div>
                    <div className="flex items-center"><FaBoxes className="mr-2 text-gray-500" /><span className="font-semibold">Capacity:</span>&nbsp;{result.availableCapacity}</div>
                    <div className="flex items-center lg:col-span-2"><FaBox className="mr-2 text-gray-500" /><span className="font-semibold">Cargo:</span>&nbsp;{result.cargoType || 'N/A'}</div>
                    <div className="flex items-center">
                      {result.isHazardousCompatible ? <FaCheckCircle className="mr-2 text-green-500" /> : <FaTimesCircle className="mr-2 text-red-500" />}
                      <span className="font-semibold">Hazardous:</span>&nbsp;{result.isHazardousCompatible ? 'Yes' : 'No'}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-gray-600 mb-4">
                    {result.features.map((f, i) => (
                      <span key={i} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full flex items-center">
                        <FaCheckCircle className="mr-1 text-xs" />{f}
                      </span>
                    ))}
                  </div>
                  <button onClick={() => handleViewDetails(result)} className="mt-auto self-end bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-semibold py-3 px-8 rounded-lg shadow-lg transition flex items-center justify-center w-full sm:w-auto">
                    View Details <FaArrowRight className="ml-3" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-gray-50 rounded-xl border border-gray-200 mt-8">
              <FaTrain className="text-gray-400 text-6xl mx-auto mb-6" />
              <p className="text-gray-700 text-xl font-semibold">No train services found for your criteria.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default TrainResultsPage;
