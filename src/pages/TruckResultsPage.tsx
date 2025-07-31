// src/pages/TruckResultsPage.tsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaTruck, FaInfoCircle, FaArrowLeft, FaClock, FaRupeeSign, FaWeight, FaBoxes, FaTag, FaRulerCombined, FaDollarSign, FaMapMarkerAlt, FaCalendarAlt, FaBox } from 'react-icons/fa';
import type { TruckFormData } from '../types/QuoteFormHandle'; // Correctly import TruckFormData

// Define the structure for a Truck service offer, matching the updated form data
interface TruckServiceOffer {
  id: string;
  serviceProvider: string;
  pickupPincode: string;
  dropoffPincode: string;
  pickupDate: string; // Ready Date
  transitTime: string;
  price: number;
  loadType: 'PTL' | 'FTL';
  truckType?: 'open' | 'closed' | 'flatbed' | 'reefer'; // Body type
  vehicleType?: 'Bike' | 'Van' | 'Mini Truck' | 'Truck' | '14 ft Truck' | '17 ft Truck' | '20 ft Truck' | '32 ft SXL' | '32 ft MXL' | 'Container Truck' | 'Trailer'; // Specific vehicle type
  features: string[];
  status: 'Available' | 'Limited' | 'Full';
}

const TruckResultsPage: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const formData = location.state?.formData as TruckFormData | undefined; // Access formData from location.state

  const [allOffers, setAllOffers] = useState<TruckServiceOffer[]>([]);
  const [filteredOffers, setFilteredOffers] = useState<TruckServiceOffer[]>([]
  );
  const [selectedLoadTypeFilter, setSelectedLoadTypeFilter] = useState<string>('');
  const [selectedTruckTypeFilter, setSelectedTruckTypeFilter] = useState<string>('');
  const [selectedVehicleTypeFilter, setSelectedVehicleTypeFilter] = useState<string>('');
  const [selectedServiceProviderFilter, setSelectedServiceProviderFilter] = useState<string>('');


  // Dummy data generation for Truck services
  const generateDummyOffers = (data: TruckFormData): TruckServiceOffer[] => {
    const basePricePerKG = data.loadType === 'PTL' ? 5 : 3; // PTL is more expensive per KG
    const basePricePerTruck = data.loadType === 'FTL' ? 50000 : 0; // FTL base price

    const totalCalculatedPrice = data.loadType === 'PTL'
      ? (data.totalWeight || 0) * basePricePerKG + (data.numberOfPieces || 0) * 100 // Example PTL calculation
      : (data.numberOfTrucks || 0) * basePricePerTruck; // Example FTL calculation

    const offers: TruckServiceOffer[] = [
      {
        id: 'TRUCK-JULY25-001-X',
        serviceProvider: 'Zipaworld',
        pickupPincode: data.pickupPincode,
        dropoffPincode: data.dropoffPincode,
        pickupDate: data.readyDate,
        transitTime: '2-3 Days',
        price: totalCalculatedPrice * 1.05, // Slightly higher
        loadType: data.loadType,
        truckType: data.truckType,
        vehicleType: data.vehicleType,
        features: ['Fast Delivery', 'GPS Tracking'],
        status: 'Available',
      },
      {
        id: 'TRUCK-JULY25-002-Y',
        serviceProvider: 'Gati KWE',
        pickupPincode: data.pickupPincode,
        dropoffPincode: data.dropoffPincode,
        pickupDate: data.readyDate,
        transitTime: '3-4 Days',
        price: totalCalculatedPrice * 0.98, // Slightly lower
        loadType: data.loadType,
        truckType: data.truckType,
        vehicleType: data.vehicleType,
        features: ['Economical', 'Reliable Service'],
        status: 'Available',
      },
      {
        id: 'TRUCK-JULY25-003-Z',
        serviceProvider: 'Delhivery',
        pickupPincode: data.pickupPincode,
        dropoffPincode: data.dropoffPincode,
        pickupDate: data.readyDate,
        transitTime: '4-5 Days',
        price: totalCalculatedPrice * 0.9, // Cheapest
        loadType: data.loadType,
        truckType: data.truckType,
        vehicleType: data.vehicleType,
        features: ['Cost-Effective', 'Wide Network'],
        status: 'Limited',
      },
    ];

    return offers;
  };

  useEffect(() => {
    if (!formData) {
      navigate('/truck-booking'); // Redirect if no form data is available
    } else {
      const generated = generateDummyOffers(formData);
      setAllOffers(generated);
      setFilteredOffers(generated);
    }
  }, [formData, navigate]);

  useEffect(() => {
    let currentOffers = allOffers;

    if (selectedLoadTypeFilter) {
      currentOffers = currentOffers.filter(offer => offer.loadType === selectedLoadTypeFilter);
    }
    if (selectedTruckTypeFilter) {
      currentOffers = currentOffers.filter(offer => offer.truckType === selectedTruckTypeFilter);
    }
    if (selectedVehicleTypeFilter) {
      currentOffers = currentOffers.filter(offer => offer.vehicleType === selectedVehicleTypeFilter);
    }
    if (selectedServiceProviderFilter) {
      currentOffers = currentOffers.filter(offer => offer.serviceProvider === selectedServiceProviderFilter);
    }

    setFilteredOffers(currentOffers);
  }, [selectedLoadTypeFilter, selectedTruckTypeFilter, selectedVehicleTypeFilter, selectedServiceProviderFilter, allOffers]);


  const getStatusBadgeClass = (status: 'Available' | 'Limited' | 'Full') => {
    switch (status) {
      case 'Available': return 'bg-green-100 text-green-800';
      case 'Limited': return 'bg-yellow-100 text-yellow-800';
      case 'Full': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleBackToForm = () => {
    navigate('/truck-booking'); // Navigate back to the TruckBookingPage
  };

  const handleBookNow = (offer: TruckServiceOffer) => {
    // Navigate to a booking details page, passing selected result and original form data
    console.log(`Booking ${offer.serviceProvider} for ${offer.price.toLocaleString()}!`); // Replaced alert
    navigate(`/truck-booking-details`, { state: { selectedResult: offer, originalFormData: formData } });
  };

  if (!formData) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 font-inter">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center border border-gray-200">
          <FaInfoCircle className="text-blue-500 text-6xl mb-4 mx-auto" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('truck_results_page.no_data_found_title')}</h2>
          <p className="text-gray-600 mb-6">{t('truck_results_page.no_data_found_message')}</p>
          <button
            onClick={handleBackToForm}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl shadow-md transition-all duration-300 transform hover:scale-105"
          >
            <FaArrowLeft className="inline-block mr-2" /> {t('truck_results_page.back_to_form')}
          </button>
        </div>
      </div>
    );
  }

  // Extract unique filter options from allOffers
  const uniqueLoadTypes = Array.from(new Set(allOffers.map(offer => offer.loadType)));
  const uniqueTruckTypes = Array.from(new Set(allOffers.map(offer => offer.truckType))).filter(Boolean) as string[]; // Explicitly cast to string[]
  const uniqueVehicleTypes = Array.from(new Set(allOffers.map(offer => offer.vehicleType))).filter(Boolean) as string[]; // Explicitly cast to string[]
  const uniqueServiceProviders = Array.from(new Set(allOffers.map(offer => offer.serviceProvider)));


  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 font-inter">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-extrabold text-blue-800 mb-8 text-center tracking-tight">
          {t('truck_results_page.title')}
        </h1>

        {/* Submitted Form Details */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-8 border border-blue-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-5 border-b pb-3 border-gray-200">
            {t('truck_results_page.your_shipment_details')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4 text-gray-700 text-base">
            <p><FaMapMarkerAlt className="inline-block mr-2 text-blue-500" /> <strong>{t('truck_results_page.pickup_pincode')}:</strong> {formData.pickupPincode}</p>
            <p><FaMapMarkerAlt className="inline-block mr-2 text-blue-500" /> <strong>{t('truck_results_page.dropoff_pincode')}:</strong> {formData.dropoffPincode}</p>
            <p><FaCalendarAlt className="inline-block mr-2 text-blue-500" /> <strong>{t('truck_results_page.pickup_date')}:</strong> {formData.readyDate}</p>
            <p><FaTruck className="inline-block mr-2 text-blue-500" /> <strong>{t('truck_results_page.load_type')}:</strong> {formData.loadType}</p>
            <p><FaTruck className="inline-block mr-2 text-blue-500" /> <strong>{t('truck_results_page.number_of_trucks')}:</strong> {formData.numberOfTrucks}</p>
            <p><FaBox className="inline-block mr-2 text-blue-500" /> <strong>{t('truck_results_page.cargo_type')}:</strong> {formData.cargoType}</p>
            <p><FaWeight className="inline-block mr-2 text-blue-500" /> <strong>{t('truck_results_page.total_weight')}:</strong> {formData.totalWeight} Kgs</p>
            <p><FaBoxes className="inline-block mr-2 text-blue-500" /> <strong>{t('truck_results_page.number_of_pieces')}:</strong> {formData.numberOfPieces}</p>
            {formData.dimensions && <p><FaRulerCombined className="inline-block mr-2 text-blue-500" /> <strong>{t('truck_results_page.dimensions')}:</strong> {formData.dimensions}</p>}
            {formData.cargoValue && <p><FaDollarSign className="inline-block mr-2 text-blue-500" /> <strong>{t('truck_results_page.product_declared_value')}:</strong> INR {formData.cargoValue.toLocaleString()}</p>}
            {formData.truckType && <p><FaTruck className="inline-block mr-2 text-blue-500" /> <strong>{t('truck_results_page.truck_body_type')}:</strong> {formData.truckType}</p>}
            {formData.vehicleType && <p><FaTruck className="inline-block mr-2 text-blue-500" /> <strong>{t('truck_results_page.specific_vehicle_type')}:</strong> {formData.vehicleType}</p>}
            <p><FaInfoCircle className="inline-block mr-2 text-blue-500" /> <strong>{t('truck_results_page.hazardous_cargo')}:</strong> {formData.hazardousCargo ? t('yes') : t('no')}</p>
            <p><FaInfoCircle className="inline-block mr-2 text-blue-500" /> <strong>{t('truck_results_page.insurance_required')}:</strong> {formData.insuranceRequired ? t('yes') : t('no')}</p>
            {formData.specialInstructions && <p><FaInfoCircle className="inline-block mr-2 text-blue-500" /> <strong>{t('truck_results_page.special_instructions')}:</strong> {formData.specialInstructions}</p>}
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-8 border border-blue-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-5 border-b pb-3 border-gray-200">
            {t('truck_results_page.filters')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
            {/* Load Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('truck_results_page.load_type')}</label>
              <select
                value={selectedLoadTypeFilter}
                onChange={(e) => setSelectedLoadTypeFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              >
                <option value="">{t('truck_results_page.all')}</option>
                {uniqueLoadTypes.map((type: string) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Truck Body Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('truck_results_page.truck_body_type')}</label>
              <select
                value={selectedTruckTypeFilter}
                onChange={(e) => setSelectedTruckTypeFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              >
                <option value="">{t('truck_results_page.all')}</option>
                {uniqueTruckTypes.map((type: string) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Specific Vehicle Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('truck_results_page.specific_vehicle_type')}</label>
              <select
                value={selectedVehicleTypeFilter}
                onChange={(e) => setSelectedVehicleTypeFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              >
                <option value="">{t('truck_results_page.all')}</option>
                {uniqueVehicleTypes.map((type: string) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Service Provider Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('truck_results_page.service_provider')}</label>
              <select
                value={selectedServiceProviderFilter}
                onChange={(e) => setSelectedServiceProviderFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              >
                <option value="">{t('truck_results_page.all')}</option>
                {uniqueServiceProviders.map((provider: string) => (
                  <option key={provider} value={provider}>{provider}</option>
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
                    <p className="flex items-center"><FaMapMarkerAlt className="inline-block mr-2 text-gray-500" /> {offer.pickupPincode} to {offer.dropoffPincode}</p>
                    <p className="flex items-center"><FaCalendarAlt className="inline-block mr-2 text-gray-500" /> {offer.pickupDate}</p>
                    <p className="flex items-center"><FaClock className="inline-block mr-2 text-gray-500" /> {offer.transitTime}</p>
                    <p className="flex items-center"><FaTruck className="inline-block mr-2 text-gray-500" /> {offer.loadType}</p>
                    <p className="flex items-center"><FaWeight className="inline-block mr-2 text-gray-500" /> {formData.totalWeight} Kgs</p>
                    <p className="flex items-center"><FaBoxes className="inline-block mr-2 text-gray-500" /> {formData.numberOfPieces} Pcs</p>
                    {formData.dimensions && <p className="flex items-center"><FaRulerCombined className="inline-block mr-2 text-gray-500" /> {formData.dimensions}</p>}
                    {formData.cargoValue && <p className="flex items-center"><FaDollarSign className="inline-block mr-2 text-gray-500" /> INR {formData.cargoValue.toLocaleString()}</p>}
                    {formData.truckType && <p className="flex items-center"><FaTruck className="inline-block mr-2 text-gray-500" /> Body: {formData.truckType}</p>}
                    {formData.vehicleType && <p className="flex items-center"><FaTruck className="inline-block mr-2 text-gray-500" /> Vehicle: {formData.vehicleType}</p>}
                    <p className="flex items-center"><FaBox className="inline-block mr-2 text-gray-500" /> {formData.cargoType}</p>
                  </div>

                  {/* Features */}
                  <div className="mt-4 text-sm text-gray-600">
                    <h4 className="font-semibold mb-2 text-gray-800">{t('truck_results_page.features')}:</h4>
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
                    {t('truck_results_page.book_now')}
                  </button>
                  <button
                    onClick={() => console.log(`Viewing details for ${offer.serviceProvider}`)} // Replaced alert
                    className="text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium transition-colors duration-200"
                  >
                    {t('truck_results_page.view_details')}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-gray-500 text-xl bg-white rounded-xl shadow-md border border-gray-200">
              {t('truck_results_page.no_offers_found')}
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
            {t('truck_results_page.home_button')}
          </button>
          <button
            onClick={handleBackToForm}
            className="bg-blue-600 text-white font-semibold py-3 px-8 rounded-xl shadow-md hover:bg-blue-700
                       transition-colors duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300"
          >
            {t('truck_results_page.previous_button')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TruckResultsPage;
