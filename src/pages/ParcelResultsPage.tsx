// src/pages/ParcelResultsPage.tsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaBox, FaInfoCircle, FaArrowLeft, FaClock, FaRupeeSign, FaWeight, FaBoxes, FaTag, FaMapMarkerAlt, FaCalendarAlt, FaGlobe, FaBook, FaDollarSign, FaRulerCombined } from 'react-icons/fa';
import type { ParcelFormData } from '../types/QuoteFormHandle';

// Define the structure for a Parcel service offer
interface ParcelServiceOffer {
  id: string;
  serviceProvider: string;
  origin: string;
  destination: string;
  pickupDate: string;
  transitTime: string;
  price: number;
  isDomestic: boolean;
  courierMode: 'DOC' | 'NON';
  parcelCount: number;
  totalWeight: number;
  cargoType: string;
  features: string[];
  status: 'Available' | 'Limited' | 'Full';
}

const ParcelResultsPage: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const formData = location.state?.formData as ParcelFormData | undefined; // Access formData from location.state

  const [allOffers, setAllOffers] = useState<ParcelServiceOffer[]>([]);
  const [filteredOffers, setFilteredOffers] = useState<ParcelServiceOffer[]>([]);
  const [selectedServiceProviderFilter, setSelectedServiceProviderFilter] = useState<string>('');
  const [selectedCourierModeFilter, setSelectedCourierModeFilter] = useState<string>('');
  const [selectedServiceTypeFilter, setSelectedServiceTypeFilter] = useState<string>(''); // For Domestic/International

  // Dummy data generation for Parcel services
  const generateDummyOffers = (data: ParcelFormData): ParcelServiceOffer[] => {
    const basePricePerKG = data.isDomestic ? 100 : 300; // Domestic cheaper than International
    const basePricePerParcel = data.courierMode === 'DOC' ? 50 : 150; // Documents cheaper than Non-Documents

    const totalCalculatedPrice = (data.totalWeight || 0) * basePricePerKG + (data.parcelCount || 0) * basePricePerParcel;

    const offers: ParcelServiceOffer[] = [
      {
        id: `PARCEL-${data.isDomestic ? 'DOM' : 'INT'}-${data.courierMode}-${Date.now().toString().slice(-6)}-A`,
        serviceProvider: 'Zipaworld',
        origin: data.origin,
        destination: data.destination,
        pickupDate: data.readyDate,
        transitTime: data.isDomestic ? '2-4 Days' : '5-7 Days',
        price: totalCalculatedPrice * 1.1, // Slightly higher
        isDomestic: data.isDomestic,
        courierMode: data.courierMode,
        parcelCount: data.parcelCount,
        totalWeight: data.totalWeight,
        cargoType: data.cargoType,
        features: ['Express Delivery', 'Real-time Tracking'],
        status: 'Available',
      },
      {
        id: `PARCEL-${data.isDomestic ? 'DOM' : 'INT'}-${data.courierMode}-${Date.now().toString().slice(-6)}-B`,
        serviceProvider: 'Blue Dart',
        origin: data.origin,
        destination: data.destination,
        pickupDate: data.readyDate,
        transitTime: data.isDomestic ? '3-5 Days' : '6-8 Days',
        price: totalCalculatedPrice * 0.95, // Competitive
        isDomestic: data.isDomestic,
        courierMode: data.courierMode,
        parcelCount: data.parcelCount,
        totalWeight: data.totalWeight,
        cargoType: data.cargoType,
        features: ['Reliable Service', 'Proof of Delivery'],
        status: 'Available',
      },
      {
        id: `PARCEL-${data.isDomestic ? 'DOM' : 'INT'}-${data.courierMode}-${Date.now().toString().slice(-6)}-C`,
        serviceProvider: 'DTDC',
        origin: data.origin,
        destination: data.destination,
        pickupDate: data.readyDate,
        transitTime: data.isDomestic ? '4-6 Days' : '7-10 Days',
        price: totalCalculatedPrice * 0.9, // Most economical
        isDomestic: data.isDomestic,
        courierMode: data.courierMode,
        parcelCount: data.parcelCount,
        totalWeight: data.totalWeight,
        cargoType: data.cargoType,
        features: ['Economical', 'Wide Coverage'],
        status: 'Limited',
      },
    ];

    return offers;
  };

  useEffect(() => {
    if (!formData) {
      navigate('/parcel-booking'); // Redirect if no form data is available
    } else {
      const generated = generateDummyOffers(formData);
      setAllOffers(generated);
      setFilteredOffers(generated);
    }
  }, [formData, navigate]);

  useEffect(() => {
    let currentOffers = allOffers;

    if (selectedServiceProviderFilter) {
      currentOffers = currentOffers.filter(offer => offer.serviceProvider === selectedServiceProviderFilter);
    }
    if (selectedCourierModeFilter) {
      currentOffers = currentOffers.filter(offer => offer.courierMode === selectedCourierModeFilter);
    }
    if (selectedServiceTypeFilter !== '') { // Use explicit check for boolean filter
      const isDomesticFilter = selectedServiceTypeFilter === 'Domestic';
      currentOffers = currentOffers.filter(offer => offer.isDomestic === isDomesticFilter);
    }

    setFilteredOffers(currentOffers);
  }, [selectedServiceProviderFilter, selectedCourierModeFilter, selectedServiceTypeFilter, allOffers]);


  const getStatusBadgeClass = (status: 'Available' | 'Limited' | 'Full') => {
    switch (status) {
      case 'Available': return 'bg-green-100 text-green-800';
      case 'Limited': return 'bg-yellow-100 text-yellow-800';
      case 'Full': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleBackToForm = () => {
    navigate('/parcel-booking'); // Navigate back to the ParcelBookingPage
  };

  const handleBookNow = (offer: ParcelServiceOffer) => {
    // Navigate to a booking details page, passing selected result and original form data
    console.log(`Booking ${offer.serviceProvider} for ${offer.price.toLocaleString()}!`);
    navigate(`/parcel-booking-details`, { state: { selectedResult: offer, originalFormData: formData } });
  };

  if (!formData) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 font-inter">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center border border-gray-200">
          <FaInfoCircle className="text-blue-500 text-6xl mb-4 mx-auto" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('parcel_results_page.no_data_found_title')}</h2>
          <p className="text-gray-600 mb-6">{t('parcel_results_page.no_data_found_message')}</p>
          <button
            onClick={handleBackToForm}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl shadow-md transition-all duration-300 transform hover:scale-105"
          >
            <FaArrowLeft className="inline-block mr-2" /> {t('parcel_results_page.back_to_form')}
          </button>
        </div>
      </div>
    );
  }

  // Extract unique filter options from allOffers
  const uniqueServiceProviders = Array.from(new Set(allOffers.map(offer => offer.serviceProvider)));
  const uniqueCourierModes = Array.from(new Set(allOffers.map(offer => offer.courierMode)));
  const uniqueServiceTypes = Array.from(new Set(allOffers.map(offer => offer.isDomestic ? 'Domestic' : 'International')));


  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 font-inter">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-extrabold text-blue-800 mb-8 text-center tracking-tight">
          {t('parcel_results_page.title')}
        </h1>

        {/* Submitted Form Details */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-8 border border-blue-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-5 border-b pb-3 border-gray-200">
            {t('parcel_results_page.your_shipment_details')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4 text-gray-700 text-base">
            <p><FaMapMarkerAlt className="inline-block mr-2 text-blue-500" /> <strong>{t('parcel_results_page.origin')}:</strong> {formData.origin}</p>
            <p><FaMapMarkerAlt className="inline-block mr-2 text-blue-500" /> <strong>{t('parcel_results_page.destination')}:</strong> {formData.destination}</p>
            <p><FaCalendarAlt className="inline-block mr-2 text-blue-500" /> <strong>{t('parcel_results_page.ready_date')}:</strong> {formData.readyDate}</p>
            <p><FaGlobe className="inline-block mr-2 text-blue-500" /> <strong>{t('parcel_results_page.service_type')}:</strong> {formData.isDomestic ? t('domestic') : t('international')}</p>
            <p><FaBook className="inline-block mr-2 text-blue-500" /> <strong>{t('parcel_results_page.courier_mode')}:</strong> {formData.courierMode === 'DOC' ? t('document') : t('non_document')}</p>
            <p><FaBoxes className="inline-block mr-2 text-blue-500" /> <strong>{t('parcel_results_page.parcel_count')}:</strong> {formData.parcelCount}</p>
            <p><FaWeight className="inline-block mr-2 text-blue-500" /> <strong>{t('parcel_results_page.total_weight')}:</strong> {formData.totalWeight} Kgs</p>
            <p><FaBox className="inline-block mr-2 text-blue-500" /> <strong>{t('parcel_results_page.cargo_type')}:</strong> {formData.cargoType}</p>
            {formData.dimensions && <p><FaRulerCombined className="inline-block mr-2 text-blue-500" /> <strong>{t('parcel_results_page.dimensions')}:</strong> {formData.dimensions}</p>}
            {formData.cargoValue && <p><FaDollarSign className="inline-block mr-2 text-blue-500" /> <strong>{t('parcel_results_page.cargo_value')}:</strong> INR {formData.cargoValue.toLocaleString()}</p>}
            <p><FaInfoCircle className="inline-block mr-2 text-blue-500" /> <strong>{t('parcel_results_page.hazardous_cargo')}:</strong> {formData.hazardousCargo ? t('yes') : t('no')}</p>
            <p><FaInfoCircle className="inline-block mr-2 text-blue-500" /> <strong>{t('parcel_results_page.insurance_required')}:</strong> {formData.insuranceRequired ? t('yes') : t('no')}</p>
            {formData.specialInstructions && <p><FaInfoCircle className="inline-block mr-2 text-blue-500" /> <strong>{t('parcel_results_page.special_instructions')}:</strong> {formData.specialInstructions}</p>}
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-8 border border-blue-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-5 border-b pb-3 border-gray-200">
            {t('parcel_results_page.filters')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
            {/* Service Provider Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('parcel_results_page.service_provider')}</label>
              <select
                value={selectedServiceProviderFilter}
                onChange={(e) => setSelectedServiceProviderFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              >
                <option value="">{t('parcel_results_page.all')}</option>
                {uniqueServiceProviders.map((provider: string) => (
                  <option key={provider} value={provider}>{provider}</option>
                ))}
              </select>
            </div>

            {/* Courier Mode Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('parcel_results_page.courier_mode')}</label>
              <select
                value={selectedCourierModeFilter}
                onChange={(e) => setSelectedCourierModeFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              >
                <option value="">{t('parcel_results_page.all')}</option>
                {uniqueCourierModes.map((mode: string) => (
                  <option key={mode} value={mode}>{mode === 'DOC' ? t('document') : t('non_document')}</option>
                ))}
              </select>
            </div>

            {/* Service Type Filter (Domestic/International) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('parcel_results_page.service_type')}</label>
              <select
                value={selectedServiceTypeFilter}
                onChange={(e) => setSelectedServiceTypeFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              >
                <option value="">{t('parcel_results_page.all')}</option>
                {uniqueServiceTypes.map((type: string) => (
                  <option key={type} value={type}>{type}</option>
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
                    <p className="flex items-center"><FaMapMarkerAlt className="inline-block mr-2 text-gray-500" /> {offer.origin} to {offer.destination}</p>
                    <p className="flex items-center"><FaCalendarAlt className="inline-block mr-2 text-gray-500" /> {offer.pickupDate}</p>
                    <p className="flex items-center"><FaClock className="inline-block mr-2 text-gray-500" /> {offer.transitTime}</p>
                    <p className="flex items-center"><FaGlobe className="inline-block mr-2 text-gray-500" /> {offer.isDomestic ? t('domestic') : t('international')}</p>
                    <p className="flex items-center"><FaBook className="inline-block mr-2 text-gray-500" /> {offer.courierMode === 'DOC' ? t('document') : t('non_document')}</p>
                    <p className="flex items-center"><FaBoxes className="inline-block mr-2 text-gray-500" /> {offer.parcelCount} {t('parcels')}</p>
                    <p className="flex items-center"><FaWeight className="inline-block mr-2 text-gray-500" /> {offer.totalWeight} Kgs</p>
                    <p className="flex items-center"><FaBox className="inline-block mr-2 text-gray-500" /> {offer.cargoType}</p>
                    {formData.dimensions && <p className="flex items-center"><FaRulerCombined className="inline-block mr-2 text-gray-500" /> {formData.dimensions}</p>}
                    {formData.cargoValue && <p className="flex items-center"><FaDollarSign className="inline-block mr-2 text-gray-500" /> INR {formData.cargoValue.toLocaleString()}</p>}
                  </div>

                  {/* Features */}
                  <div className="mt-4 text-sm text-gray-600">
                    <h4 className="font-semibold mb-2 text-gray-800">{t('parcel_results_page.features')}:</h4>
                    <div className="flex flex-wrap gap-2">
                      {offer.features.map((feature, idx) => (
                        <span key={idx} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                          {feature}
                        </span>
                      ))}
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
                    {t('parcel_results_page.book_now')}
                  </button>
                  <button
                    onClick={() => console.log(`Viewing details for ${offer.serviceProvider}`)}
                    className="text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium transition-colors duration-200"
                  >
                    {t('parcel_results_page.view_details')}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-gray-500 text-xl bg-white rounded-xl shadow-md border border-gray-200">
              {t('parcel_results_page.no_offers_found')}
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
            {t('parcel_results_page.home_button')}
          </button>
          <button
            onClick={handleBackToForm}
            className="bg-blue-600 text-white font-semibold py-3 px-8 rounded-xl shadow-md hover:bg-blue-700
                       transition-colors duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300"
          >
            {t('parcel_results_page.previous_button')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ParcelResultsPage;
