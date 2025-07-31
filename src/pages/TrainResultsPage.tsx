// src/pages/TrainResultsPage.tsx
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  FaTrain, FaMapMarkerAlt, FaClock, FaCalendarDay, FaBoxes, FaInfoCircle, FaRupeeSign,
  FaArrowRight, FaArrowLeft, FaHome, FaFilter, FaCheckCircle, FaTimesCircle, FaTruck,
  FaShippingFast, FaBox, FaCogs, FaMoneyBillWave, FaRoute
} from 'react-icons/fa';
import type { AllFormData, FreightTrainResult, RailServiceType, TrainContainerFormData, TrainGoodsFormData, TrainParcelFormData } from '../types/QuoteFormHandle';

// Define filter types
type TrainTypeFilter = 'Express Cargo' | 'Standard Cargo' | 'Premium Cargo' | 'Economy Cargo';
type OperatorFilter = 'CONCOR' | 'Maersk' | 'MSC' | 'CMA CGM' | 'Hapag-Lloyd' | 'Evergreen'; // Consolidated operators
type FeatureFilter = 'GPS Tracking' | 'Refrigerated' | 'Priority Handling' | 'Door-to-Door Service' | 'Terminal-to-Terminal Service' | 'Hazardous Cargo Handling' | 'Real-time Updates' | 'Door-to-Terminal Service' | 'Terminal-to-Door Service';
type ServiceTypeFilter = RailServiceType; // Re-using the RailServiceType for filters

const TrainResultsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<AllFormData | null>(null);
  const [allSearchResults, setAllSearchResults] = useState<FreightTrainResult[]>([]); // Store all results
  const [filteredSearchResults, setFilteredSearchResults] = useState<FreightTrainResult[]>([]); // Store filtered results
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [selectedTrainTypes, setSelectedTrainTypes] = useState<TrainTypeFilter[]>([]);
  const [selectedOperators, setSelectedOperators] = useState<OperatorFilter[]>([]);
  const [selectedFeatures, setSelectedFeatures] = useState<FeatureFilter[]>([]);
  const [selectedServiceTypes, setSelectedServiceTypes] = useState<ServiceTypeFilter[]>([]);

  // --- Data Fetching and Initial Simulation ---
  useEffect(() => {
    const state = location.state as { formData: AllFormData } | undefined;
    if (state && state.formData) {
      setFormData(state.formData);
      const simulatedResults = simulateSearchResults(state.formData);
      setAllSearchResults(simulatedResults);
      setLoading(false);
    } else {
      setError("No form data provided. Please go back and fill the form.");
      setLoading(false);
    }
  }, [location.state]);

  // --- Filtering Logic ---
  useEffect(() => {
    let currentFilteredResults = [...allSearchResults];

    // Apply Train Type filters
    if (selectedTrainTypes.length > 0) {
      currentFilteredResults = currentFilteredResults.filter((result: FreightTrainResult) =>
        selectedTrainTypes.some((type: TrainTypeFilter) => {
          if (type === 'Express Cargo' && result.serviceName.includes('Express Freight Link')) return true;
          if (type === 'Standard Cargo' && result.serviceName.includes('Standard Cargo Express')) return true;
          if (type === 'Premium Cargo' && result.serviceName.includes('Premium Rail Transit')) return true;
          if (type === 'Economy Cargo' && result.serviceName.includes('Economy Freight')) return true;
          return false;
        })
      );
    }

    // Apply Operator filters
    if (selectedOperators.length > 0) {
      currentFilteredResults = currentFilteredResults.filter((result: FreightTrainResult) =>
        selectedOperators.includes(result.operator as OperatorFilter)
      );
    }

    // Apply Feature filters
    if (selectedFeatures.length > 0) {
      currentFilteredResults = currentFilteredResults.filter((result: FreightTrainResult) =>
        selectedFeatures.every((feature: FeatureFilter) => result.features.includes(feature))
      );
    }

    // Apply Service Type filters
    if (selectedServiceTypes.length > 0) {
      currentFilteredResults = currentFilteredResults.filter((result: FreightTrainResult) => {
        // Assuming service type is part of features for simplicity in simulation
        return selectedServiceTypes.some((st: ServiceTypeFilter) => result.features.includes(mapServiceTypeToFeature(st)));
      });
    }

    setFilteredSearchResults(currentFilteredResults);
  }, [selectedTrainTypes, selectedOperators, selectedFeatures, selectedServiceTypes, allSearchResults]);

  // Helper to map RailServiceType to a feature string for filtering
  const mapServiceTypeToFeature = (serviceType: RailServiceType): FeatureFilter => {
    switch (serviceType) {
      case 'doorToDoor': return 'Door-to-Door Service';
      case 'doorToTerminal': return 'Door-to-Terminal Service';
      case 'terminalToDoor': return 'Terminal-to-Door Service';
      case 'terminalToTerminal': return 'Terminal-to-Terminal Service';
      default: return 'Terminal-to-Terminal Service'; // Fallback
    }
  };


  // --- Display Helpers ---
  const getOriginDisplay = (data: AllFormData): string => {
    const serviceType = (data as any).serviceType as RailServiceType;
    if (serviceType === 'doorToDoor' || serviceType === 'doorToTerminal') {
      return data.originAddress || data.originStation || 'N/A';
    }
    return data.originTerminal || data.originStation || 'N/A';
  };

  const getDestinationDisplay = (data: AllFormData): string => {
    const serviceType = (data as any).serviceType as RailServiceType;
    if (serviceType === 'doorToDoor' || serviceType === 'terminalToDoor') {
      return data.destinationAddress || data.destinationStation || 'N/A';
    }
    return data.destinationTerminal || data.destinationStation || 'N/A';
  };

  // --- Search Results Simulation Logic ---
  const simulateSearchResults = (data: AllFormData): FreightTrainResult[] => {
    const commonOriginDisplay = getOriginDisplay(data);
    const commonDestinationDisplay = getDestinationDisplay(data);

    let basePricePerUnit = 0;
    let capacityUnit = '';
    let cargoDetails = '';
    let transitDaysFactor = 1; // Multiplier for transit duration in days
    let priceMultiplier = 1; // Multiplier for price based on specific cargo
    let baseCapacity = 100; // Base capacity for simulation

    // Determine base pricing and cargo details based on booking type
    if (data.bookingType === 'Train Container Booking') {
      const containerData = data as TrainContainerFormData;
      basePricePerUnit = 2.5; // Price per KG
      capacityUnit = 'Containers';
      cargoDetails = containerData.containerType;
      priceMultiplier = containerData.numberOfContainers || 1;
      baseCapacity = 100; // Example: 100 containers base capacity

      if (containerData.containerType.includes('Reefer')) {
        basePricePerUnit *= 2.0; // Reefer containers are significantly more expensive
        cargoDetails += ' (Refrigerated)';
      }
      if (!containerData.isDomestic) { // International containers might have higher base price
        basePricePerUnit *= 1.3;
      }
    } else if (data.bookingType === 'Train Goods Booking') {
      const goodsData = data as TrainGoodsFormData;
      basePricePerUnit = 2.5; // Price per Ton
      capacityUnit = 'Wagons';
      cargoDetails = goodsData.wagonType;
      priceMultiplier = goodsData.numberOfWagons || 1;
      baseCapacity = 200; // Example: 200 wagons base capacity
      // Add more specific wagon type pricing if needed
    } else if (data.bookingType === 'Train Parcel Booking') {
      const parcelData = data as TrainParcelFormData;
      basePricePerUnit = 100; // Price per KG for parcels
      capacityUnit = 'Parcels';
      cargoDetails = parcelData.detailedDescriptionOfGoods;
      priceMultiplier = parcelData.parcelCount || 1;
      baseCapacity = 500; // Example: 500 parcels base capacity

      // Simulate price increase based on dimensions (e.g., volumetric weight)
      if (parcelData.dimensions) {
        const dims = parcelData.dimensions.split('x').map(Number);
        if (dims.length === 3 && !isNaN(dims[0]) && !isNaN(dims[1]) && !isNaN(dims[2])) {
          const volumeCm3 = dims[0] * dims[1] * dims[2];
          const volumetricWeightKg = volumeCm3 / 5000; // Common volumetric factor
          basePricePerUnit *= (1 + (volumetricWeightKg / 10)); // Scale price by volumetric weight
        }
      }
    }

    const totalCalculatedWeight = data.totalWeight || 0;
    let calculatedPrice = Math.max(basePricePerUnit * totalCalculatedWeight * priceMultiplier, 10000); // Minimum price

    // Adjust price and transit based on service type
    const serviceType = data.serviceType as RailServiceType;
    let serviceFeature: FeatureFilter = 'Terminal-to-Terminal Service';
    if (serviceType === 'doorToDoor') {
      calculatedPrice *= 1.6; // Door-to-door is most expensive
      transitDaysFactor *= 1.3; // Longer transit for door services
      serviceFeature = 'Door-to-Door Service';
    } else if (serviceType === 'doorToTerminal') {
      calculatedPrice *= 1.3;
      transitDaysFactor *= 1.15;
      serviceFeature = 'Door-to-Terminal Service';
    } else if (serviceType === 'terminalToDoor') {
      calculatedPrice *= 1.3;
      transitDaysFactor *= 1.15;
      serviceFeature = 'Terminal-to-Door Service';
    } else { // terminalToTerminal
      calculatedPrice *= 1.0;
      transitDaysFactor *= 1.0;
      serviceFeature = 'Terminal-to-Terminal Service';
    }

    // Hazardous cargo surcharge
    if (data.hazardousCargo) {
      calculatedPrice *= 1.4; // Significant surcharge for hazardous
    }

    const results: FreightTrainResult[] = [];

    // Determine operator based on domestic/international
    const domesticOperator: OperatorFilter = 'CONCOR';
    const internationalOperators: OperatorFilter[] = ['Maersk', 'MSC', 'CMA CGM', 'Hapag-Lloyd', 'Evergreen'];

    const getOperator = (isDomestic: boolean | undefined): OperatorFilter => {
      if (isDomestic === false) { // Explicitly check for false for international
        // Randomly select an international operator
        return internationalOperators[Math.floor(Math.random() * internationalOperators.length)];
      } else {
        // For domestic or if isDomestic is undefined (e.g., for Parcel/Goods which are always domestic in this context)
        return domesticOperator;
      }
    };

    // Safely access isDomestic, providing a default if not present (e.g., for Parcel/Goods)
    const operatorForResults = getOperator((data as TrainContainerFormData)?.isDomestic);


    // --- Simulated Result 1: Premium Express Service ---
    const transitDays1 = Math.max(2, Math.round(3 * transitDaysFactor)); // Minimum 2 days
    results.push({
      id: 'TRN001',
      serviceName: 'Premium Rail Transit',
      operator: operatorForResults, // Dynamic operator
      originStation: commonOriginDisplay,
      destinationStation: commonDestinationDisplay,
      departureTime: 'As per schedule', // Keep for type safety, but will be hidden
      arrivalTime: 'Estimated', // Keep for type safety, but will be hidden
      transitDuration: `${transitDays1} Days`,
      availableCapacity: `${Math.round(baseCapacity * 0.8 * priceMultiplier)} ${capacityUnit}`,
      price: calculatedPrice * 1.25, // Highest price
      features: ['GPS Tracking', 'Priority Handling', 'Real-time Updates', serviceFeature, 'Refrigerated'],
      cargoType: cargoDetails,
      isHazardousCompatible: true, // This service can handle hazardous
    });

    // --- Simulated Result 2: Express Freight Link (Good Balance) ---
    const transitDays2 = Math.max(3, Math.round(5 * transitDaysFactor)); // Minimum 3 days
    results.push({
      id: 'TRN002',
      serviceName: 'Express Freight Link',
      operator: operatorForResults, // Dynamic operator
      originStation: commonOriginDisplay,
      destinationStation: commonDestinationDisplay,
      departureTime: 'As per schedule', // Keep for type safety, but will be hidden
      arrivalTime: 'Estimated', // Keep for type safety, but will be hidden
      transitDuration: `${transitDays2} Days`,
      availableCapacity: `${Math.round(baseCapacity * 1.0 * priceMultiplier)} ${capacityUnit}`,
      price: calculatedPrice * 1.0, // Base price
      features: ['GPS Tracking', serviceFeature],
      cargoType: cargoDetails,
      isHazardousCompatible: data.bookingType === 'Train Container Booking' || data.bookingType === 'Train Goods Booking' ? true : false,
    });

    // --- Simulated Result 3: Standard Cargo Express (Economical) ---
    const transitDays3 = Math.max(4, Math.round(7 * transitDaysFactor)); // Minimum 4 days
    results.push({
      id: 'TRN003',
      serviceName: 'Standard Cargo Express',
      operator: operatorForResults, // Dynamic operator
      originStation: commonOriginDisplay,
      destinationStation: commonDestinationDisplay,
      departureTime: 'As per schedule', // Keep for type safety, but will be hidden
      arrivalTime: 'Estimated', // Keep for type safety, but will be hidden
      transitDuration: `${transitDays3} Days`,
      availableCapacity: `${Math.round(baseCapacity * 1.2 * priceMultiplier)} ${capacityUnit}`,
      price: calculatedPrice * 0.8, // Lower price
      features: ['Basic Service', serviceFeature],
      cargoType: cargoDetails,
      isHazardousCompatible: false, // This service does not handle hazardous
    });

    // --- Simulated Result 4: Economy Freight (Budget Option) ---
    const transitDays4 = Math.max(5, Math.round(9 * transitDaysFactor)); // Minimum 5 days
    results.push({
      id: 'TRN004',
      serviceName: 'Economy Freight',
      operator: operatorForResults, // Dynamic operator
      originStation: commonOriginDisplay,
      destinationStation: commonDestinationDisplay,
      departureTime: 'As per schedule', // Keep for type safety, but will be hidden
      arrivalTime: 'Estimated', // Keep for type safety, but will be hidden
      transitDuration: `${transitDays4} Days`,
      availableCapacity: `${Math.round(baseCapacity * 1.5 * priceMultiplier)} ${capacityUnit}`,
      price: calculatedPrice * 0.6, // Lowest price
      features: ['Economy Service', serviceFeature],
      cargoType: cargoDetails,
      isHazardousCompatible: false, // This service does not handle hazardous
    });


    // Filter out results that cannot handle hazardous cargo if requested by the user
    if (data.hazardousCargo) {
      return results.filter(result => result.isHazardousCompatible);
    }

    return results;
  };

  // --- Event Handlers ---
  const handleViewDetails = (result: FreightTrainResult) => {
    if (formData) {
      navigate('/train-service-details', { state: { formData: formData, selectedTrainResult: result } });
    }
  };

  const handleFilterChange = (filterType: 'trainType' | 'operator' | 'feature' | 'serviceType', value: string) => {
    if (filterType === 'trainType') {
      setSelectedTrainTypes(prev =>
        prev.includes(value as TrainTypeFilter)
          ? prev.filter((item: TrainTypeFilter) => item !== value)
          : [...prev, value as TrainTypeFilter]
      );
    } else if (filterType === 'operator') {
      setSelectedOperators(prev =>
        prev.includes(value as OperatorFilter)
          ? prev.filter((item: OperatorFilter) => item !== value)
          : [...prev, value as OperatorFilter]
      );
    } else if (filterType === 'feature') {
      setSelectedFeatures(prev =>
        prev.includes(value as FeatureFilter)
          ? prev.filter((item: FeatureFilter) => item !== value)
          : [...prev, value as FeatureFilter]
      );
    } else if (filterType === 'serviceType') {
      setSelectedServiceTypes(prev =>
        prev.includes(value as ServiceTypeFilter)
          ? prev.filter((item: ServiceTypeFilter) => item !== value)
          : [...prev, value as ServiceTypeFilter]
      );
    }
  };

  const handleClearFilters = () => {
    setSelectedTrainTypes([]);
    setSelectedOperators([]);
    setSelectedFeatures([]);
    setSelectedServiceTypes([]);
  };

  // --- Loading and Error States JSX ---
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="text-center p-10 bg-white rounded-2xl shadow-xl">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-6"></div>
          <p className="text-2xl text-gray-700 font-semibold">Searching for the best train services...</p>
          <p className="text-gray-500 mt-2">This might take a moment.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="max-w-md mx-auto px-6 py-12 bg-white shadow-2xl rounded-2xl border border-red-200 text-center">
          <h3 className="text-3xl font-extrabold text-red-600 mb-6">Oops! An Error Occurred</h3>
          <p className="text-gray-700 text-lg mb-8">{error}</p>
          <button
            onClick={() => navigate('/train-booking')}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition duration-300 transform hover:scale-105 flex items-center justify-center mx-auto"
          >
            <FaArrowLeft className="inline-block mr-3 text-xl" /> Go Back to Train Booking
          </button>
        </div>
      </div>
    );
  }

  // --- Main Component JSX ---
  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 sm:px-6 lg:px-8 font-inter">
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col lg:flex-row">
        {/* Left Sidebar for Filters */}
        <aside className="lg:w-1/4 w-full p-8 border-b lg:border-r border-gray-200 bg-gray-50 lg:bg-white flex-shrink-0">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
            <FaFilter className="mr-3 text-blue-600 text-xl" /> Filter Results
          </h3>
          <div className="space-y-8">
            {/* Filter Group: Train Type */}
            <div>
              <h4 className="font-semibold text-gray-700 mb-4">Train Type</h4>
              <div className="space-y-3">
                {['Premium Cargo', 'Express Cargo', 'Standard Cargo', 'Economy Cargo'].map(type => (
                  <label key={type} className="flex items-center text-gray-700 text-base cursor-pointer hover:text-blue-600 transition-colors duration-150">
                    <input
                      type="checkbox"
                      className="mr-3 h-5 w-5 rounded text-blue-600 focus:ring-blue-500 border-gray-300"
                      checked={selectedTrainTypes.includes(type as TrainTypeFilter)}
                      onChange={() => handleFilterChange('trainType', type)}
                    /> {type}
                  </label>
                ))}
              </div>
            </div>

            {/* Filter Group: Operators */}
            <div>
              <h4 className="font-semibold text-gray-700 mb-4">Operators</h4>
              <div className="space-y-3">
                {/* Display all possible operators in the filter, regardless of domestic/international */}
                {['CONCOR', 'Maersk', 'MSC', 'CMA CGM', 'Hapag-Lloyd', 'Evergreen'].map(operator => (
                  <label key={operator} className="flex items-center text-gray-700 text-base cursor-pointer hover:text-blue-600 transition-colors duration-150">
                    <input
                      type="checkbox"
                      className="mr-3 h-5 w-5 rounded text-blue-600 focus:ring-blue-500 border-gray-300"
                      checked={selectedOperators.includes(operator as OperatorFilter)}
                      onChange={() => handleFilterChange('operator', operator)}
                    /> {operator}
                  </label>
                ))}
              </div>
            </div>

            {/* Filter Group: Service Type */}
            <div>
              <h4 className="font-semibold text-gray-700 mb-4">Service Type</h4>
              <div className="space-y-3">
                {['terminalToTerminal', 'doorToDoor', 'doorToTerminal', 'terminalToDoor'].map(serviceType => (
                  <label key={serviceType} className="flex items-center text-gray-700 text-base cursor-pointer hover:text-blue-600 transition-colors duration-150">
                    <input
                      type="checkbox"
                      className="mr-3 h-5 w-5 rounded text-blue-600 focus:ring-blue-500 border-gray-300"
                      checked={selectedServiceTypes.includes(serviceType as ServiceTypeFilter)}
                      onChange={() => handleFilterChange('serviceType', serviceType)}
                    />
                    {serviceType === 'terminalToTerminal' && 'Terminal to Terminal'}
                    {serviceType === 'doorToDoor' && 'Door to Door'}
                    {serviceType === 'doorToTerminal' && 'Door to Terminal'}
                    {serviceType === 'terminalToDoor' && 'Terminal to Door'}
                  </label>
                ))}
              </div>
            </div>

            {/* Filter Group: Features */}
            <div>
              <h4 className="font-semibold text-gray-700 mb-4">Features</h4>
              <div className="space-y-3">
                {['GPS Tracking', 'Refrigerated', 'Priority Handling', 'Hazardous Cargo Handling', 'Real-time Updates'].map(feature => (
                  <label key={feature} className="flex items-center text-gray-700 text-base cursor-pointer hover:text-blue-600 transition-colors duration-150">
                    <input
                      type="checkbox"
                      className="mr-3 h-5 w-5 rounded text-blue-600 focus:ring-blue-500 border-gray-300"
                      checked={selectedFeatures.includes(feature as FeatureFilter)}
                      onChange={() => handleFilterChange('feature', feature)}
                    /> {feature}
                  </label>
                ))}
              </div>
            </div>
          </div>
          <button
            onClick={handleClearFilters}
            className="mt-8 w-full bg-gray-200 text-gray-700 font-semibold py-3 rounded-lg shadow-sm hover:bg-gray-300 transition duration-200 flex items-center justify-center"
          >
            <FaTimesCircle className="mr-2" /> Clear Filters
          </button>
        </aside>

        {/* Main Content Area for Search Results */}
        <main className="lg:flex-1 w-full p-8">
          {/* Top Bar with Back Button and Heading */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
            <button
              onClick={() => navigate('/train-booking')}
              className="flex items-center text-blue-600 hover:text-blue-700 font-medium text-lg transition duration-200 mb-4 sm:mb-0"
            >
              <FaArrowLeft className="mr-2 text-xl" /> Back to Train Booking Form
            </button>
            <h3 className="text-2xl font-bold text-gray-800 flex items-center">
              <FaTrain className="text-blue-600 mr-3 text-2xl" /> Available Train Services
            </h3>
          </div>

          {filteredSearchResults.length > 0 ? (
            <div className="space-y-6">
              {filteredSearchResults.map((result: FreightTrainResult) => (
                <div key={result.id} className="bg-white rounded-xl p-6 border border-gray-200 shadow-md flex flex-col transition-all duration-200 ease-in-out hover:shadow-lg hover:border-blue-200">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                    <div className="flex-grow mb-3 md:mb-0">
                      <h4 className="text-xl font-bold text-gray-800 mb-1">{result.serviceName} <span className="text-gray-500 text-sm font-normal">({result.id})</span></h4>
                      <p className="text-gray-600 text-sm">Operator: <span className="font-semibold">{result.operator}</span></p>
                    </div>
                    {/* Price display */}
                    <div className="text-3xl font-extrabold text-gray-800 flex items-center">
                      <FaRupeeSign className="text-2xl mr-1" />{Math.round(result.price).toLocaleString('en-IN')}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3 text-sm text-gray-700 mb-4">
                    <div className="flex items-center">
                      {(formData?.serviceType === 'doorToDoor' || formData?.serviceType === 'doorToTerminal') ? <FaHome className="mr-2 text-gray-500 text-base" /> : <FaMapMarkerAlt className="mr-2 text-gray-500 text-base" />}
                      <span className="font-semibold">Origin:</span> {result.originStation}
                    </div>
                    <div className="flex items-center">
                      {(formData?.serviceType === 'doorToDoor' || formData?.serviceType === 'terminalToDoor') ? <FaHome className="mr-2 text-gray-500 text-base" /> : <FaMapMarkerAlt className="mr-2 text-gray-500 text-base" />}
                      <span className="font-semibold">Destination:</span> {result.destinationStation}
                    </div>
                    {/* Removed Departure Time and Arrival Time display */}
                    <div className="flex items-center">
                      <FaCalendarDay className="mr-2 text-gray-500 text-base" /> <span className="font-semibold">Transit:</span> {result.transitDuration}
                    </div>
                    <div className="flex items-center">
                      <FaBoxes className="mr-2 text-gray-500 text-base" /> <span className="font-semibold">Capacity:</span> {result.availableCapacity}
                    </div>
                    <div className="flex items-center lg:col-span-2">
                      <FaBox className="mr-2 text-gray-500 text-base" /> <span className="font-semibold">Cargo Type:</span> {result.cargoType || 'N/A'}
                    </div>
                    <div className="flex items-center">
                      {result.isHazardousCompatible ? (
                        <FaCheckCircle className="mr-2 text-green-500 text-base" />
                      ) : (
                        <FaTimesCircle className="mr-2 text-red-500 text-base" />
                      )}
                      <span className="font-semibold">Hazardous Compatible:</span> {result.isHazardousCompatible ? 'Yes' : 'No'}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600 mb-4">
                    <span className="font-semibold mr-1">Key Features:</span>
                    {result.features.map((feature: string, index: number) => (
                      <span key={index} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full flex items-center">
                        <FaCheckCircle className="mr-1 text-xs" /> {feature}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={() => handleViewDetails(result)}
                    // Changed to a consistent blue gradient
                    className="mt-auto self-end bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-semibold py-3 px-8 rounded-lg shadow-lg transition duration-300 transform hover:scale-105 flex items-center justify-center w-full sm:w-auto"
                  >
                    View Details <FaArrowRight className="ml-3 text-lg" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-gray-50 rounded-xl border border-gray-200 shadow-inner mt-8">
              <FaTrain className="text-gray-400 text-6xl mx-auto mb-6" />
              <p className="text-gray-700 text-xl font-semibold mb-2">No train services found for your criteria.</p>
              <p className="text-gray-500 text-base">Please adjust your search parameters or clear filters and try again.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default TrainResultsPage;
