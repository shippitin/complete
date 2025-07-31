// src/pages/SeaResultsPage.tsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaShip, FaInfoCircle, FaArrowLeft, FaClock, FaRupeeSign, FaCube, FaMapMarkerAlt, FaCalendarAlt, FaCheckCircle, FaTimesCircle, FaBoxOpen, FaWeight, FaBoxes, FaTag, FaRulerCombined, FaDollarSign } from 'react-icons/fa'; // Added FaRulerCombined and FaDollarSign
import type { SeaFormData } from '../types/QuoteFormHandle';

// Define the structure for a Sea service result
interface SeaServiceOffer { // Renamed to ServiceOffer for consistency with Air
  id: string;
  serviceProvider: string; // Changed from serviceName to serviceProvider
  carrier: string;
  originPort: string;
  destinationPort: string;
  departureDate: string;
  transitTime: string;
  price: number;
  containerSize?: string; // Made optional, as LCL won't have it directly
  includedServices: { // Added for consistency with Air
    pickup: boolean;
    originClearance: boolean;
    freight: boolean;
    destinationClearance: boolean;
    delivery: boolean;
  };
  loadType: 'LCL' | 'FCL'; // Added for consistency
  features: string[];
  status: 'Available' | 'Limited' | 'Full';
}

const SeaResultsPage: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const formData = location.state?.formData as SeaFormData | undefined; // Access formData from location.state

  const [allOffers, setAllOffers] = useState<SeaServiceOffer[]>([]); // New state to hold all generated offers
  const [filteredOffers, setFilteredOffers] = useState<SeaServiceOffer[]>([]);
  const [selectedActivityTypeFilter, setSelectedActivityTypeFilter] = useState<string>('');
  const [selectedShipmentModeFilter, setSelectedShipmentModeFilter] = useState<string>('');
  const [selectedTransitTimeFilter, setSelectedTransitTimeFilter] = useState<string>('');
  const [selectedCarrierFilter, setSelectedCarrierFilter] = useState<string>('');


  // Dummy data generation for Sea services
  const generateDummyOffers = (data: SeaFormData): SeaServiceOffer[] => {
    const basePricePerKG = data.shipmentMode === 'LCL' ? 150 : 0; // LCL price per KG
    const basePricePerContainer = data.shipmentMode === 'FCL' ? 100000 : 0; // FCL base price

    const totalCalculatedPrice = data.shipmentMode === 'LCL'
      ? (data.totalWeight || 0) * basePricePerKG + (data.volumeCBM || 0) * 5000 // Example LCL calculation
      : (data.numberOfContainers || 0) * basePricePerContainer; // Example FCL calculation

    const today = new Date(data.readyDate);
    const departureDate = today.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

    const offers: SeaServiceOffer[] = [
      {
        id: 'SEA-JULY25-001-A',
        serviceProvider: 'Maersk Line',
        carrier: 'Maersk Line',
        originPort: data.originPort || data.originCity || 'N/A',
        destinationPort: data.destinationPort || data.destinationCity || 'N/A',
        departureDate: departureDate,
        transitTime: '25-30 Days',
        price: totalCalculatedPrice * 1.1, // Slightly higher
        containerSize: data.shipmentMode === 'FCL' ? data.containerType : undefined, // Use undefined for LCL
        includedServices: {
          pickup: data.activityType === 'Door to Port' || data.activityType === 'Door to Door',
          originClearance: true,
          freight: true,
          destinationClearance: data.activityType === 'Port to Door' || data.activityType === 'Door to Door',
          delivery: data.activityType === 'Port to Door' || data.activityType === 'Door to Door',
        },
        loadType: data.shipmentMode,
        features: ['Direct Route', 'GPS Tracking'],
        status: 'Available',
      },
      {
        id: 'SEA-JULY25-002-B',
        serviceProvider: 'MSC Shipping',
        carrier: 'MSC Shipping',
        originPort: data.originPort || data.originCity || 'N/A',
        destinationPort: data.destinationPort || data.destinationCity || 'N/A',
        departureDate: departureDate,
        transitTime: '30-35 Days',
        price: totalCalculatedPrice * 0.95, // Slightly lower
        containerSize: data.shipmentMode === 'FCL' ? data.containerType : undefined, // Use undefined for LCL
        includedServices: {
          pickup: data.activityType === 'Door to Port' || data.activityType === 'Door to Door',
          originClearance: true,
          freight: true,
          destinationClearance: data.activityType === 'Port to Door' || data.activityType === 'Door to Door',
          delivery: data.activityType === 'Port to Door' || data.activityType === 'Door to Door',
        },
        loadType: data.shipmentMode,
        features: ['Economical', 'Reliable Schedule'],
        status: 'Available',
      },
      {
        id: 'SEA-JULY25-003-C',
        serviceProvider: 'CMA CGM',
        carrier: 'CMA CGM',
        originPort: data.originPort || data.originCity || 'N/A',
        destinationPort: data.destinationPort || data.destinationCity || 'N/A',
        departureDate: departureDate,
        transitTime: '35-40 Days',
        price: totalCalculatedPrice * 0.9, // Cheapest
        containerSize: data.shipmentMode === 'FCL' ? data.containerType : undefined, // Use undefined for LCL
        includedServices: {
          pickup: data.activityType === 'Door to Port' || data.activityType === 'Door to Door',
          originClearance: true,
          freight: true,
          destinationClearance: data.activityType === 'Port to Door' || data.activityType === 'Door to Door',
          delivery: data.activityType === 'Port to Door' || data.activityType === 'Door to Door',
        },
        loadType: data.shipmentMode,
        features: ['Cost-Effective', 'Bulk Cargo'],
        status: 'Limited',
      },
    ];

    return offers;
  };

  useEffect(() => {
    if (!formData) {
      navigate('/sea-booking'); // Redirect if no form data is available
    } else {
      const generated = generateDummyOffers(formData);
      setAllOffers(generated); // Set all generated offers
      setFilteredOffers(generated); // Initialize filtered offers with all offers
    }
  }, [formData, navigate]);

  useEffect(() => {
    let currentOffers = allOffers; // Filter from allOffers, not dummyOffers

    if (selectedActivityTypeFilter) {
      // Note: ActivityType is part of formData, not directly on offer.
      // We need to filter based on the formData's activityType.
      // This filter will only work if dummyOffers are generated to match the formData's activityType.
      // For a more robust solution, filters should be applied to a larger dataset or
      // the dummy data generation should produce offers for all activity types.
      // For now, assuming dummy offers are relevant to the initial formData's activityType.
      currentOffers = currentOffers.filter(offer => formData?.activityType === selectedActivityTypeFilter);
    }
    if (selectedShipmentModeFilter) {
      currentOffers = currentOffers.filter(offer => offer.loadType === selectedShipmentModeFilter);
    }
    if (selectedTransitTimeFilter) {
      currentOffers = currentOffers.filter(offer => offer.transitTime === selectedTransitTimeFilter);
    }
    if (selectedCarrierFilter) {
      currentOffers = currentOffers.filter(offer => offer.carrier === selectedCarrierFilter);
    }

    setFilteredOffers(currentOffers);
  }, [selectedActivityTypeFilter, selectedShipmentModeFilter, selectedTransitTimeFilter, selectedCarrierFilter, allOffers, formData]); // Added allOffers and formData to dependencies


  const getStatusBadgeClass = (status: 'Available' | 'Limited' | 'Full') => {
    switch (status) {
      case 'Available': return 'bg-green-100 text-green-800';
      case 'Limited': return 'bg-yellow-100 text-yellow-800';
      case 'Full': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleBackToForm = () => {
    navigate('/sea-booking'); // Navigate back to the SeaBookingPage
  };

  const handleBookNow = (offer: SeaServiceOffer) => {
    // Navigate to the new SeaBookingDetailsPage, passing selected result and original form data
    navigate(`/sea-booking-details`, {
      state: {
        selectedOffer: offer, // Changed from selectedResult to selectedOffer for consistency
        originalFormData: formData,
      }
    });
  };

  if (!formData) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 font-inter">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center border border-gray-200">
          <FaInfoCircle className="text-blue-500 text-6xl mb-4 mx-auto" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('sea_results_page.no_data_found_title')}</h2>
          <p className="text-gray-600 mb-6">{t('sea_results_page.no_data_found_message')}</p>
          <button
            onClick={handleBackToForm}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl shadow-md transition-all duration-300 transform hover:scale-105"
          >
            <FaArrowLeft className="inline-block mr-2" /> {t('sea_results_page.back_to_form')}
          </button>
        </div>
      </div>
    );
  }

  // Extract unique filter options from allOffers
  const uniqueCarriers = Array.from(new Set(allOffers.map((offer: SeaServiceOffer) => offer.carrier)));
  const uniqueTransitTimes = Array.from(new Set(allOffers.map((offer: SeaServiceOffer) => offer.transitTime)));
  const uniqueShipmentModes = Array.from(new Set(allOffers.map((offer: SeaServiceOffer) => offer.loadType)));
  // Activity types are derived from formData, not offers, so this needs to be handled differently
  // For now, we'll just use the formData's activityType as the only option if it exists,
  // or a predefined list if you want to show other options even if not in current formData.
  const uniqueActivityTypes = formData.activityType ? [formData.activityType] : [];


  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 font-inter">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-extrabold text-blue-800 mb-8 text-center tracking-tight">
          {t('sea_results_page.title')}
        </h1>

        {/* Submitted Form Details */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-8 border border-blue-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-5 border-b pb-3 border-gray-200">
            {t('sea_results_page.your_shipment_details')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4 text-gray-700 text-base">
            {/* Origin Display */}
            {(formData.activityType === 'Port to Port' || formData.activityType === 'Port to Door') ? (
              <p><FaMapMarkerAlt className="inline-block mr-2 text-blue-500" /> <strong>{t('sea_results_page.origin_port')}:</strong> {formData.originPort}</p>
            ) : (
              <>
                {formData.originCity && <p><FaMapMarkerAlt className="inline-block mr-2 text-blue-500" /> <strong>{t('sea_results_page.origin_city')}:</strong> {formData.originCity}</p>}
                {formData.originAddress && <p><FaMapMarkerAlt className="inline-block mr-2 text-blue-500" /> <strong>{t('sea_results_page.origin_address')}:</strong> {formData.originAddress}</p>}
                {formData.originPort && <p><FaMapMarkerAlt className="inline-block mr-2 text-blue-500" /> <strong>{t('sea_results_page.origin_port')}:</strong> {formData.originPort}</p>}
              </>
            )}

            {/* Destination Display */}
            {(formData.activityType === 'Port to Port' || formData.activityType === 'Door to Port') ? (
              <p><FaMapMarkerAlt className="inline-block mr-2 text-blue-500" /> <strong>{t('sea_results_page.destination_port')}:</strong> {formData.destinationPort}</p>
            ) : (
              <>
                {formData.destinationCity && <p><FaMapMarkerAlt className="inline-block mr-2 text-blue-500" /> <strong>{t('sea_results_page.destination_city')}:</strong> {formData.destinationCity}</p>}
                {formData.destinationAddress && <p><FaMapMarkerAlt className="inline-block mr-2 text-blue-500" /> <strong>{t('sea_results_page.destination_address')}:</strong> {formData.destinationAddress}</p>}
                {formData.destinationPort && <p><FaMapMarkerAlt className="inline-block mr-2 text-blue-500" /> <strong>{t('sea_results_page.destination_port')}:</strong> {formData.destinationPort}</p>}
              </>
            )}

            <p><FaShip className="inline-block mr-2 text-blue-500" /> <strong>{t('sea_results_page.activity_type')}:</strong> {formData.activityType}</p>
            <p><FaShip className="inline-block mr-2 text-blue-500" /> <strong>{t('sea_results_page.shipment_mode')}:</strong> {formData.shipmentMode}</p>
            <p><FaCalendarAlt className="inline-block mr-2 text-blue-500" /> <strong>{t('sea_results_page.ready_date')}:</strong> {formData.readyDate}</p>
            <p><FaWeight className="inline-block mr-2 text-blue-500" /> <strong>{t('sea_results_page.total_weight')}:</strong> {formData.totalWeight} Kgs</p>
            {formData.shipmentMode === 'LCL' && (
              <>
                <p><FaBoxes className="inline-block mr-2 text-blue-500" /> <strong>{t('sea_results_page.number_of_pieces')}:</strong> {formData.numberOfPieces}</p>
                <p><FaCube className="inline-block mr-2 text-blue-500" /> <strong>{t('sea_results_page.volume_cbm')}:</strong> {formData.volumeCBM} CBM</p>
              </>
            )}
            {formData.shipmentMode === 'FCL' && (
              <>
                {formData.containerType && formData.numberOfContainers && (
                  <p><FaCube className="inline-block mr-2 text-blue-500" /> <strong>{t('sea_results_page.container_type')}:</strong> {formData.numberOfContainers} x {formData.containerType}</p>
                )}
                {formData.stuffingPoint && ( // Display stuffing point if available
                  <p><FaInfoCircle className="inline-block mr-2 text-blue-500" /> <strong>{t('sea_results_page.stuffing_point')}:</strong> {formData.stuffingPoint}</p>
                )}
              </>
            )}
            <p><FaTag className="inline-block mr-2 text-blue-500" /> <strong>{t('sea_results_page.commodity_category')}:</strong> {formData.commodityCategory}</p>
            <p><FaBoxOpen className="inline-block mr-2 text-blue-500" /> <strong>{t('sea_results_page.commodity')}:</strong> {formData.commodity}</p>
            {formData.hsnCode && <p><FaInfoCircle className="inline-block mr-2 text-blue-500" /> <strong>{t('sea_results_page.hsn_code')}:</strong> {formData.hsnCode}</p>}
            {formData.dimensions && <p><FaRulerCombined className="inline-block mr-2 text-blue-500" /> <strong>{t('sea_results_page.dimensions')}:</strong> {formData.dimensions}</p>}
            {formData.cargoValue && <p><FaDollarSign className="inline-block mr-2 text-blue-500" /> <strong>{t('sea_results_page.cargo_value')}:</strong> INR {formData.cargoValue.toLocaleString()}</p>}
            <p><FaInfoCircle className="inline-block mr-2 text-blue-500" /> <strong>{t('sea_results_page.hazardous_cargo')}:</strong> {formData.hazardousCargo ? t('yes') : t('no')}</p>
            <p><FaInfoCircle className="inline-block mr-2 text-blue-500" /> <strong>{t('sea_results_page.insurance_required')}:</strong> {formData.insuranceRequired ? t('yes') : t('no')}</p>
            {formData.incoterms && <p><FaInfoCircle className="inline-block mr-2 text-blue-500" /> <strong>{t('sea_results_page.incoterms')}:</strong> {formData.incoterms}</p>}
            {formData.description && <p><FaInfoCircle className="inline-block mr-2 text-blue-500" /> <strong>{t('sea_results_page.description')}:</strong> {formData.description}</p>}
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-8 border border-blue-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-5 border-b pb-3 border-gray-200">
            {t('sea_results_page.filters')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
            {/* Activity Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('sea_results_page.activity_type')}</label>
              <select
                value={selectedActivityTypeFilter}
                onChange={(e) => setSelectedActivityTypeFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              >
                <option value="">{t('sea_results_page.all')}</option>
                {/* For activity type, we usually filter based on the original form's activity type,
                    or provide a fixed list if the dummy data covers all types.
                    For now, it will only show the activity type from the submitted form. */}
                {uniqueActivityTypes.map((type: string) => ( // Explicitly cast to string
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Shipment Mode Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('sea_results_page.shipment_mode')}</label>
              <select
                value={selectedShipmentModeFilter}
                onChange={(e) => setSelectedShipmentModeFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              >
                <option value="">{t('sea_results_page.all')}</option>
                {uniqueShipmentModes.map((mode: string) => ( // Explicitly cast to string
                  <option key={mode} value={mode}>{mode}</option>
                ))}
              </select>
            </div>

            {/* Transit Time Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('sea_results_page.transit_time')}</label>
              <select
                value={selectedTransitTimeFilter}
                onChange={(e) => setSelectedTransitTimeFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              >
                <option value="">{t('sea_results_page.all')}</option>
                {uniqueTransitTimes.map((time: string) => ( // Explicitly cast to string
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>

            {/* Carrier Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('sea_results_page.carrier')}</label>
              <select
                value={selectedCarrierFilter}
                onChange={(e) => setSelectedCarrierFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              >
                <option value="">{t('sea_results_page.all')}</option>
                {uniqueCarriers.map((carrier: string) => ( // Explicitly cast to string
                  <option key={carrier} value={carrier}>{carrier}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Service Offers */}
        <div className="space-y-6">
          {filteredOffers.length > 0 ? (
            filteredOffers.map((offer) => (
              <div
                key={offer.id}
                className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-blue-100
                           flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6
                           hover:shadow-2xl hover:scale-[1.01] transition-all duration-300 ease-in-out"
              >
                {/* Left Section: Provider, Details */}
                <div className="flex-grow w-full lg:w-auto">
                  <p className="text-sm text-gray-500 mb-1 font-mono tracking-wide">JOB ID: {offer.id}</p>
                  <h3 className="text-2xl font-extrabold text-blue-700 mb-3">{offer.serviceProvider}</h3>

                  {/* Core Shipment Details in a compact grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-gray-700 text-sm mb-4">
                    <p className="flex items-center"><FaClock className="inline-block mr-2 text-gray-500" /> {offer.transitTime}</p>
                    <p className="flex items-center"><FaShip className="inline-block mr-2 text-gray-500" /> {formData.activityType}</p>
                    <p className="flex items-center"><FaShip className="inline-block mr-2 text-gray-500" /> {formData.shipmentMode}</p>
                    <p className="flex items-center"><FaWeight className="inline-block mr-2 text-gray-500" /> {formData.totalWeight} Kgs</p>
                    {formData.shipmentMode === 'LCL' && (
                      <>
                        <p className="flex items-center"><FaBoxes className="inline-block mr-2 text-gray-500" /> {formData.numberOfPieces} Pcs</p>
                        <p className="flex items-center"><FaCube className="inline-block mr-2 text-gray-500" /> {formData.volumeCBM} CBM</p>
                      </>
                    )}
                    {formData.shipmentMode === 'FCL' && (
                      <>
                        {offer.containerSize && formData.numberOfContainers && (
                          <p className="flex items-center"><FaCube className="inline-block mr-2 text-gray-500" /> {formData.numberOfContainers} x {offer.containerSize}</p>
                        )}
                        {formData.stuffingPoint && ( // Display stuffing point in results
                          <p className="flex items-center"><FaInfoCircle className="inline-block mr-2 text-gray-500" /> {formData.stuffingPoint}</p>
                        )}
                      </>
                    )}
                    <p className="flex items-center"><FaBoxOpen className="inline-block mr-2 text-gray-500" /> {formData.commodity}</p>
                  </div>

                  {/* Included Services */}
                  <div className="mt-4 text-sm text-gray-600">
                    <h4 className="font-semibold mb-2 text-gray-800">{t('sea_results_page.included_services')}:</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      <p className="flex items-center">
                        {offer.includedServices.pickup ? <FaCheckCircle className="text-green-500 mr-2" /> : <FaTimesCircle className="text-red-500 mr-2" />}
                        {t('sea_results_page.pickup')}
                      </p>
                      <p className="flex items-center">
                        {offer.includedServices.originClearance ? <FaCheckCircle className="text-green-500 mr-2" /> : <FaTimesCircle className="text-red-500 mr-2" />}
                        {t('sea_results_page.origin_clearance')}
                      </p>
                      <p className="flex items-center">
                        {offer.includedServices.freight ? <FaCheckCircle className="text-green-500 mr-2" /> : <FaTimesCircle className="text-red-500 mr-2" />}
                        {t('sea_results_page.freight')}
                      </p>
                      <p className="flex items-center">
                        {offer.includedServices.destinationClearance ? <FaCheckCircle className="text-green-500 mr-2" /> : <FaTimesCircle className="text-red-500 mr-2" />}
                        {t('sea_results_page.destination_clearance')}
                      </p>
                      <p className="flex items-center">
                        {offer.includedServices.delivery ? <FaCheckCircle className="text-green-500 mr-2" /> : <FaTimesCircle className="text-red-500 mr-2" />}
                        {t('sea_results_page.delivery')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Section: Price and Actions */}
                <div className="flex flex-col items-center lg:items-end space-y-3 w-full lg:w-auto mt-6 lg:mt-0">
                  <p className="text-4xl font-extrabold text-blue-700 flex items-center">
                    <FaRupeeSign className="mr-2 text-3xl" />{offer.price.toLocaleString()}
                  </p>
                  <button
                    onClick={() => handleBookNow(offer)}
                    className="bg-blue-600 text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:bg-blue-700
                               transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300 w-full lg:w-auto"
                  >
                    {t('sea_results_page.book_now')}
                  </button>
                  <button
                    onClick={() => alert(`Viewing details for ${offer.serviceProvider}`)} // Replace with actual detail view logic
                    className="text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium transition-colors duration-200"
                  >
                    {t('sea_results_page.view_details')}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-gray-500 text-xl bg-white rounded-xl shadow-md border border-gray-200">
              {t('sea_results_page.no_offers_found')}
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-center mt-10 space-x-4">
          <button
            onClick={() => navigate('/')}
            className="bg-gray-700 text-white font-semibold py-3 px-8 rounded-xl shadow-md hover:bg-gray-800
                       transition-colors duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-gray-300"
          >
            {t('sea_results_page.home_button')}
          </button>
          <button
            onClick={handleBackToForm}
            className="bg-blue-600 text-white font-semibold py-3 px-8 rounded-xl shadow-md hover:bg-blue-700
                       transition-colors duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300"
          >
            {t('sea_results_page.previous_button')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SeaResultsPage;
