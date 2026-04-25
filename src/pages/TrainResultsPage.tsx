// src/pages/TrainResultsPage.tsx
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaTrain, FaMapMarkerAlt, FaCalendarDay, FaBoxes, FaRupeeSign, FaArrowRight, FaArrowLeft, FaFilter, FaCheckCircle, FaTimesCircle, FaBox, FaLeaf, FaFire, FaChevronRight } from 'react-icons/fa';
import type { AllFormData, FreightTrainResult, RailServiceType, TrainContainerFormData, TrainGoodsFormData, TrainParcelFormData } from '../types/QuoteFormHandle';
import { rateCardsAPI } from '../services/api';

type TrainTypeFilter = 'Express Cargo' | 'Standard Cargo' | 'Premium Cargo' | 'Economy Cargo';
type OperatorFilter = 'CONCOR' | 'Maersk' | 'MSC' | 'CMA CGM' | 'Hapag-Lloyd' | 'Evergreen';
type FeatureFilter = 'GPS Tracking' | 'Refrigerated' | 'Priority Handling' | 'Door-to-Door Service' | 'Terminal-to-Terminal Service' | 'Hazardous Cargo Handling' | 'Real-time Updates' | 'Door-to-Terminal Service' | 'Terminal-to-Door Service';
type ServiceTypeFilter = RailServiceType;

const getBadgeColor = (index: number) => {
  const colors = ['#fb7185', '#fbbf24', '#38bdf8'];
  return colors[index] || 'transparent';
};

const getBadgeLabel = (index: number) => {
  const labels = ['🔥 Most Popular', '★ Best Value', '⚡ Fastest'];
  return labels[index] || null;
};

const getBadgePill = (index: number) => {
  const pills = ['bg-rose-50 text-rose-700 border border-rose-200', 'bg-amber-50 text-amber-700 border border-amber-200', 'bg-sky-50 text-sky-700 border border-sky-200'];
  return pills[index] || '';
};

const TrainResultsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<AllFormData | null>(null);
  const [allSearchResults, setAllSearchResults] = useState<FreightTrainResult[]>([]);
  const [filteredSearchResults, setFilteredSearchResults] = useState<FreightTrainResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'price' | 'transit' | 'carbon'>('price');
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
    let basePricePerUnit = 0, capacityUnit = '', cargoDetails = '', transitDaysFactor = 1, priceMultiplier = 1, baseCapacity = 100;

    if (data.bookingType === 'Train Container Booking') {
      const cd = data as TrainContainerFormData;
      basePricePerUnit = 2.5; capacityUnit = 'Containers'; cargoDetails = cd.containerType; priceMultiplier = cd.numberOfContainers || 1;
      if (cd.containerType?.includes('Reefer')) basePricePerUnit *= 2.0;
      if (!cd.isDomestic) basePricePerUnit *= 1.3;
    } else if (data.bookingType === 'Train Goods Booking') {
      const gd = data as TrainGoodsFormData;
      basePricePerUnit = 2.5; capacityUnit = 'Wagons'; cargoDetails = gd.wagonType; priceMultiplier = gd.numberOfWagons || 1; baseCapacity = 200;
    } else if (data.bookingType === 'Train Parcel Booking') {
      const pd = data as TrainParcelFormData;
      basePricePerUnit = 100; capacityUnit = 'Parcels'; cargoDetails = pd.detailedDescriptionOfGoods; priceMultiplier = pd.parcelCount || 1; baseCapacity = 500;
    }

    let calculatedPrice = Math.max(basePricePerUnit * (data.totalWeight || 0) * priceMultiplier, 10000);
    const serviceType = data.serviceType as RailServiceType;
    let serviceFeature: FeatureFilter = 'Terminal-to-Terminal Service';
    if (serviceType === 'doorToDoor') { calculatedPrice *= 1.6; transitDaysFactor *= 1.3; serviceFeature = 'Door-to-Door Service'; }
    else if (serviceType === 'doorToTerminal') { calculatedPrice *= 1.3; transitDaysFactor *= 1.15; serviceFeature = 'Door-to-Terminal Service'; }
    else if (serviceType === 'terminalToDoor') { calculatedPrice *= 1.3; transitDaysFactor *= 1.15; serviceFeature = 'Terminal-to-Door Service'; }
    if (data.hazardousCargo) calculatedPrice *= 1.4;

    const internationalOperators: OperatorFilter[] = ['Maersk', 'MSC', 'CMA CGM', 'Hapag-Lloyd', 'Evergreen'];
    const operatorForResults: OperatorFilter = (data as TrainContainerFormData)?.isDomestic === false ? internationalOperators[Math.floor(Math.random() * internationalOperators.length)] : 'CONCOR';

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
        const response = await rateCardsAPI.search({ serviceType: 'Rail', origin: origin === 'N/A' ? '' : origin, destination: destination === 'N/A' ? '' : destination, numberOfContainers: (data as TrainContainerFormData).numberOfContainers, containerType: (data as TrainContainerFormData).containerType });
        if (response.data.data.length > 0) {
          const serviceFeature: FeatureFilter = mapServiceTypeToFeature((data as any).serviceType);
          const mapped: FreightTrainResult[] = response.data.data.map((r: any) => ({ id: r.id, serviceName: r.carrier, operator: r.carrier, originStation: getOriginDisplay(data), destinationStation: getDestinationDisplay(data), departureTime: 'As per schedule', arrivalTime: 'Estimated', transitDuration: r.transitTime, availableCapacity: 'Available', price: r.totalPrice, features: ['GPS Tracking', serviceFeature], cargoType: (data as TrainContainerFormData).containerType || 'General', isHazardousCompatible: true }));
          setAllSearchResults(mapped); setFilteredSearchResults(mapped);
        } else {
          const simulated = simulateSearchResults(data);
          setAllSearchResults(simulated); setFilteredSearchResults(simulated);
        }
      } catch {
        const simulated = simulateSearchResults(data);
        setAllSearchResults(simulated); setFilteredSearchResults(simulated);
      } finally { setLoading(false); }
    })();
  }, [location.state]);

  useEffect(() => {
    let current = [...allSearchResults];
    if (selectedTrainTypes.length > 0) current = current.filter(r => selectedTrainTypes.some(t => r.serviceName.includes(t.replace(' Cargo', ''))));
    if (selectedOperators.length > 0) current = current.filter(r => selectedOperators.includes(r.operator as OperatorFilter));
    if (selectedFeatures.length > 0) current = current.filter(r => selectedFeatures.every(f => r.features.includes(f)));
    if (selectedServiceTypes.length > 0) current = current.filter(r => selectedServiceTypes.some(st => r.features.includes(mapServiceTypeToFeature(st))));
    if (sortBy === 'price') current.sort((a, b) => a.price - b.price);
    if (sortBy === 'transit') current.sort((a, b) => parseInt(a.transitDuration) - parseInt(b.transitDuration));
    setFilteredSearchResults(current);
  }, [selectedTrainTypes, selectedOperators, selectedFeatures, selectedServiceTypes, sortBy, allSearchResults]);

  const handleViewDetails = (result: FreightTrainResult) => {
    if (formData) navigate('/train-service-details', { state: { formData, selectedTrainResult: result } });
  };

  const handleFilterChange = (filterType: string, value: string) => {
    if (filterType === 'trainType') setSelectedTrainTypes(prev => prev.includes(value as TrainTypeFilter) ? prev.filter(i => i !== value) : [...prev, value as TrainTypeFilter]);
    else if (filterType === 'operator') setSelectedOperators(prev => prev.includes(value as OperatorFilter) ? prev.filter(i => i !== value) : [...prev, value as OperatorFilter]);
    else if (filterType === 'feature') setSelectedFeatures(prev => prev.includes(value as FeatureFilter) ? prev.filter(i => i !== value) : [...prev, value as FeatureFilter]);
    else if (filterType === 'serviceType') setSelectedServiceTypes(prev => prev.includes(value as ServiceTypeFilter) ? prev.filter(i => i !== value) : [...prev, value as ServiceTypeFilter]);
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="text-center p-10 bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
        <p className="text-gray-600 font-semibold">Searching for best train services...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto px-6 py-12 bg-white shadow-sm rounded-2xl border border-gray-100 text-center">
        <h3 className="text-2xl font-bold text-red-500 mb-4">Error</h3>
        <p className="text-gray-600 mb-6">{error}</p>
        <button onClick={() => navigate('/train-booking')} className="bg-blue-600 text-white font-bold py-3 px-8 rounded-xl transition hover:bg-blue-700">Go Back</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky top bar */}
      <div className="sticky top-16 z-30 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-5 text-sm">
            <button onClick={() => navigate('/train-booking')} className="flex items-center gap-1.5 text-gray-400 hover:text-blue-600 transition font-medium"><FaArrowLeft className="text-xs" /> Back</button>
            {formData && (
              <>
                <div className="h-4 w-px bg-gray-200"></div>
                <div className="flex items-center gap-2 text-gray-700"><FaMapMarkerAlt className="text-blue-400 text-xs" /><span className="font-semibold">{getOriginDisplay(formData)}</span><span className="text-gray-300">→</span><span className="font-semibold">{getDestinationDisplay(formData)}</span></div>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Sort:</span>
            {[{ key: 'price', label: 'Price' }, { key: 'transit', label: 'Transit' }].map(s => (
              <button key={s.key} onClick={() => setSortBy(s.key as any)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${sortBy === s.key ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{s.label}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 flex gap-6">
        {/* Sidebar filters */}
        <aside className="hidden lg:block w-56 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-36">
            <h3 className="font-bold text-gray-700 text-sm mb-4 flex items-center gap-2"><FaFilter className="text-blue-400 text-xs" /> Filters</h3>
            <div className="space-y-5">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Train Type</p>
                <div className="space-y-1">
                  {['Premium Cargo', 'Express Cargo', 'Standard Cargo', 'Economy Cargo'].map(type => (
                    <label key={type} className="flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer hover:bg-gray-50 text-sm text-gray-600">
                      <input type="checkbox" className="rounded text-blue-600 text-xs" checked={selectedTrainTypes.includes(type as TrainTypeFilter)} onChange={() => handleFilterChange('trainType', type)} />{type}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Operators</p>
                <div className="space-y-1">
                  {['CONCOR', 'Maersk', 'MSC', 'CMA CGM', 'Hapag-Lloyd', 'Evergreen'].map(op => (
                    <label key={op} className="flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer hover:bg-gray-50 text-sm text-gray-600">
                      <input type="checkbox" className="rounded text-blue-600 text-xs" checked={selectedOperators.includes(op as OperatorFilter)} onChange={() => handleFilterChange('operator', op)} />{op}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Service Type</p>
                <div className="space-y-1">
                  {[['terminalToTerminal', 'Terminal to Terminal'], ['doorToDoor', 'Door to Door'], ['doorToTerminal', 'Door to Terminal'], ['terminalToDoor', 'Terminal to Door']].map(([val, label]) => (
                    <label key={val} className="flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer hover:bg-gray-50 text-sm text-gray-600">
                      <input type="checkbox" className="rounded text-blue-600 text-xs" checked={selectedServiceTypes.includes(val as ServiceTypeFilter)} onChange={() => handleFilterChange('serviceType', val)} />{label}
                    </label>
                  ))}
                </div>
              </div>
              <button onClick={() => { setSelectedTrainTypes([]); setSelectedOperators([]); setSelectedFeatures([]); setSelectedServiceTypes([]); }} className="w-full bg-gray-100 text-gray-600 font-semibold py-2.5 rounded-xl hover:bg-gray-200 transition text-sm">Clear Filters</button>
            </div>
          </div>
        </aside>

        {/* Results */}
        <div className="flex-1 min-w-0">
          <div className="mb-5">
            <h1 className="text-xl font-bold text-gray-800">Rail Freight Quotes</h1>
            <p className="text-sm text-gray-400 mt-0.5">{filteredSearchResults.length} options · AI-updated pricing</p>
          </div>

          {filteredSearchResults.length > 0 ? (
            <div className="space-y-4">
              {filteredSearchResults.map((result, index) => (
                <div key={result.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden" style={{ borderLeft: `4px solid ${getBadgeColor(index)}` }}>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center"><FaTrain className="text-blue-500 text-sm" /></div>
                        <div>
                          <h3 className="text-base font-bold text-gray-800">{result.serviceName} <span className="text-xs text-gray-400 font-normal">({result.id})</span></h3>
                          <p className="text-xs text-gray-400">Operator: <span className="font-semibold text-gray-600">{result.operator}</span></p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getBadgeLabel(index) && <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getBadgePill(index)}`}>{getBadgeLabel(index)}</span>}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div><p className="text-xs text-gray-400 mb-0.5">FROM</p><p className="text-sm font-bold text-gray-800">{result.originStation}</p></div>
                      <div><p className="text-xs text-gray-400 mb-0.5">TO</p><p className="text-sm font-bold text-gray-800">{result.destinationStation}</p></div>
                      <div><p className="text-xs text-gray-400 mb-0.5">TRANSIT</p><p className="text-sm font-semibold text-gray-700">{result.transitDuration}</p></div>
                      <div><p className="text-xs text-gray-400 mb-0.5">CAPACITY</p><p className="text-sm font-semibold text-gray-700">{result.availableCapacity}</p></div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {result.features.map((f, i) => <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-medium">{f}</span>)}
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1 ${result.isHazardousCompatible ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-400'}`}>
                        {result.isHazardousCompatible ? <FaCheckCircle className="text-xs" /> : <FaTimesCircle className="text-xs" />} Hazardous {result.isHazardousCompatible ? 'OK' : 'No'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                      <p className="text-xs text-gray-400">{result.cargoType || 'General Cargo'}</p>
                      <div className="flex items-center gap-4">
                        <p className="text-2xl font-black text-gray-900 flex items-center gap-1"><FaRupeeSign className="text-lg text-blue-500" />{Math.round(result.price).toLocaleString('en-IN')}</p>
                        <button onClick={() => handleViewDetails(result)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition text-sm whitespace-nowrap">
                          View Details <FaArrowRight className="text-xs" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <FaTrain className="text-gray-200 text-5xl mx-auto mb-4" />
              <p className="text-gray-500 font-semibold">No train services found for your criteria.</p>
              <button onClick={() => { setSelectedTrainTypes([]); setSelectedOperators([]); setSelectedFeatures([]); setSelectedServiceTypes([]); }} className="mt-4 text-blue-600 text-sm hover:underline">Clear filters</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrainResultsPage;
