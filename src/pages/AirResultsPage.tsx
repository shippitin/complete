// src/pages/AirResultsPage.tsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AirFormData } from '../types/QuoteFormHandle';
import { FaPlane, FaCalendarAlt, FaWeight, FaBoxes, FaTag, FaMoneyBillWave, FaInfoCircle, FaCheckCircle, FaTimesCircle, FaMapMarkerAlt, FaClock, FaRupeeSign, FaBoxOpen } from 'react-icons/fa'; // Added FaBoxOpen for commodity icon

// Dummy data for demonstration
interface ServiceOffer {
  id: string;
  serviceProvider: string;
  transitTime: string;
  price: number;
  includedServices: {
    pickup: boolean;
    originClearance: boolean;
    freight: boolean;
    destinationClearance: boolean;
    delivery: boolean;
  };
  loadType: 'PTL' | 'FTL';
  slabs: string; // e.g., 'Min', 'Normal', '+45', '+100'
}

const dummyOffers: ServiceOffer[] = [
  {
    id: 'AE-JULY25-00489-1',
    serviceProvider: 'Shippitin Express',
    transitTime: '3-4 days',
    price: 18290,
    includedServices: {
      pickup: true,
      originClearance: true,
      freight: true,
      destinationClearance: true,
      delivery: false,
    },
    loadType: 'PTL',
    slabs: 'Min',
  },
  {
    id: 'AE-JULY25-00490-2',
    serviceProvider: 'Global Freight Co.',
    transitTime: '2-3 days',
    price: 22500,
    includedServices: {
      pickup: true,
      originClearance: true,
      freight: true,
      destinationClearance: true,
      delivery: true,
    },
    loadType: 'FTL',
    slabs: '+45',
  },
  {
    id: 'AE-JULY25-00491-3',
    serviceProvider: 'Sky Cargo Logistics',
    transitTime: '4-5 days',
    price: 15000,
    includedServices: {
      pickup: false,
      originClearance: true,
      freight: true,
      destinationClearance: false,
      delivery: false,
    },
    loadType: 'PTL',
    slabs: 'Normal',
  },
  {
    id: 'AE-JULY25-00492-4',
    serviceProvider: 'Fast Air Solutions',
    transitTime: '1-2 days',
    price: 28000,
    includedServices: {
      pickup: true,
      originClearance: true,
      freight: true,
      destinationClearance: true,
      delivery: true,
    },
    loadType: 'FTL',
    slabs: '+100',
  },
];

const AirResultsPage: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const formData = location.state?.formData as AirFormData | undefined;

  const [filteredOffers, setFilteredOffers] = useState<ServiceOffer[]>(dummyOffers);
  const [selectedActivityTypeFilter, setSelectedActivityTypeFilter] = useState<string>('');
  const [selectedLoadTypeFilter, setSelectedLoadTypeFilter] = useState<string>('');
  const [selectedTransitTimeFilter, setSelectedTransitTimeFilter] = useState<string>('');
  const [selectedSlabsFilter, setSelectedSlabsFilter] = useState<string>('');

  useEffect(() => {
    if (!formData) {
      // Redirect if no form data is available
      navigate('/air-booking');
    }
  }, [formData, navigate]);

  useEffect(() => {
    // Apply filters
    let currentOffers = dummyOffers;

    if (selectedActivityTypeFilter) {
      currentOffers = currentOffers.filter(offer => formData?.activityType === selectedActivityTypeFilter);
    }
    if (selectedLoadTypeFilter) {
      currentOffers = currentOffers.filter(offer => offer.loadType === selectedLoadTypeFilter);
    }
    if (selectedTransitTimeFilter) {
      currentOffers = currentOffers.filter(offer => offer.transitTime === selectedTransitTimeFilter);
    }
    if (selectedSlabsFilter) {
      currentOffers = currentOffers.filter(offer => offer.slabs === selectedSlabsFilter);
    }

    setFilteredOffers(currentOffers);
  }, [selectedActivityTypeFilter, selectedLoadTypeFilter, selectedTransitTimeFilter, selectedSlabsFilter, formData]);


  if (!formData) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <p className="text-xl text-gray-700">Loading Air Quote Results...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 font-inter">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-extrabold text-blue-800 mb-8 text-center tracking-tight">
          {t('air_results_page.title')}
        </h1>

        {/* Submitted Form Details */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-8 border border-blue-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-5 border-b pb-3 border-gray-200">
            {t('air_results_page.your_shipment_details')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4 text-gray-700 text-base">
            {/* Conditional Origin Display */}
            {(formData.activityType === 'Airport to Airport' || formData.activityType === 'Airport to Door') ? (
              <p><FaMapMarkerAlt className="inline-block mr-2 text-blue-500" /> <strong>{t('air_results_page.origin_airport')}:</strong> {formData.originAirport}</p>
            ) : (
              <>
                {formData.originCity && <p><FaMapMarkerAlt className="inline-block mr-2 text-blue-500" /> <strong>{t('air_results_page.origin_city')}:</strong> {formData.originCity}</p>}
                {formData.originAirport && <p><FaMapMarkerAlt className="inline-block mr-2 text-blue-500" /> <strong>{t('air_results_page.origin_airport')}:</strong> {formData.originAirport}</p>}
                {formData.originAddress && <p><FaMapMarkerAlt className="inline-block mr-2 text-blue-500" /> <strong>{t('air_results_page.origin_address')}:</strong> {formData.originAddress}</p>}
              </>
            )}

            {/* Conditional Destination Display */}
            {(formData.activityType === 'Airport to Airport' || formData.activityType === 'Door to Airport') ? (
              <p><FaMapMarkerAlt className="inline-block mr-2 text-blue-500" /> <strong>{t('air_results_page.destination_airport')}:</strong> {formData.destinationAirport}</p>
            ) : (
              <>
                {formData.destinationCity && <p><FaMapMarkerAlt className="inline-block mr-2 text-blue-500" /> <strong>{t('air_results_page.destination_city')}:</strong> {formData.destinationCity}</p>}
                {formData.destinationAirport && <p><FaMapMarkerAlt className="inline-block mr-2 text-blue-500" /> <strong>{t('air_results_page.destination_airport')}:</strong> {formData.destinationAirport}</p>}
                {formData.destinationAddress && <p><FaMapMarkerAlt className="inline-block mr-2 text-blue-500" /> <strong>{t('air_results_page.destination_address')}:</strong> {formData.destinationAddress}</p>}
              </>
            )}

            <p><FaPlane className="inline-block mr-2 text-blue-500" /> <strong>{t('air_results_page.activity_type')}:</strong> {formData.activityType}</p>
            <p><FaCalendarAlt className="inline-block mr-2 text-blue-500" /> <strong>{t('air_results_page.clearance_date')}:</strong> {formData.readyDate}</p>
            <p><FaWeight className="inline-block mr-2 text-blue-500" /> <strong>{t('air_results_page.gross_weight')}:</strong> {formData.totalWeight} Kgs</p>
            <p><FaBoxes className="inline-block mr-2 text-blue-500" /> <strong>{t('air_results_page.number_of_pieces')}:</strong> {formData.numberOfPieces}</p>
            <p><FaWeight className="inline-block mr-2 text-blue-500" /> <strong>{t('air_results_page.volume_weight')}:</strong> {formData.volumeWeight} Kgs</p>
            <p><FaTag className="inline-block mr-2 text-blue-500" /> <strong>{t('air_results_page.commodity_category')}:</strong> {formData.commodityCategory}</p>
            <p><FaBoxOpen className="inline-block mr-2 text-blue-500" /> <strong>{t('air_results_page.commodity')}:</strong> {formData.commodity}</p>
            {formData.hsnCode && <p><FaInfoCircle className="inline-block mr-2 text-blue-500" /> <strong>{t('air_results_page.hsn_code')}:</strong> {formData.hsnCode}</p>}
            <p><FaInfoCircle className="inline-block mr-2 text-blue-500" /> <strong>{t('air_results_page.hazardous_cargo')}:</strong> {formData.hazardousCargo ? t('yes') : t('no')}</p>
            <p><FaInfoCircle className="inline-block mr-2 text-blue-500" /> <strong>{t('air_results_page.insurance_required')}:</strong> {formData.insuranceRequired ? t('yes') : t('no')}</p>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-8 border border-blue-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-5 border-b pb-3 border-gray-200">
            {t('air_results_page.filters')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
            {/* Activity Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('air_results_page.activity_type')}</label>
              <select
                value={selectedActivityTypeFilter}
                onChange={(e) => setSelectedActivityTypeFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              >
                <option value="">{t('air_results_page.all')}</option>
                <option value="Airport to Airport">A2A Airport to Airport</option>
                <option value="Airport to Door">A2D Airport to Door</option>
                <option value="Door to Airport">D2A Door to Airport</option>
                <option value="Door to Door">D2D Door to Door</option>
              </select>
            </div>

            {/* Load Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('air_results_page.load_type')}</label>
              <select
                value={selectedLoadTypeFilter}
                onChange={(e) => setSelectedLoadTypeFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              >
                <option value="">{t('air_results_page.all')}</option>
                <option value="PTL">PTL</option>
                <option value="FTL">FTL</option>
              </select>
            </div>

            {/* Transit Time Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('air_results_page.transit_time')}</label>
              <select
                value={selectedTransitTimeFilter}
                onChange={(e) => setSelectedTransitTimeFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              >
                <option value="">{t('air_results_page.all')}</option>
                <option value="1-2 days">1-2 days</option>
                <option value="2-3 days">2-3 days</option>
                <option value="3-4 days">3-4 days</option>
                <option value="4-5 days">4-5 days</option>
              </select>
            </div>

            {/* Slabs Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('air_results_page.slabs')}</label>
              <select
                value={selectedSlabsFilter}
                onChange={(e) => setSelectedSlabsFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              >
                <option value="">{t('air_results_page.all')}</option>
                <option value="Min">Min</option>
                <option value="Normal">Normal</option>
                <option value="+45">+45</option>
                <option value="+100">+100</option>
                <option value="+300">+300</option>
                <option value="+500">+500</option>
                <option value="+1000">+1000</option>
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
                    <p className="flex items-center"><FaPlane className="inline-block mr-2 text-gray-500" /> {formData.activityType}</p>
                    <p className="flex items-center"><FaBoxOpen className="inline-block mr-2 text-gray-500" /> {formData.numberOfPieces} Pcs / {formData.totalWeight} Kgs</p>
                    <p className="flex items-center"><FaTag className="inline-block mr-2 text-gray-500" /> {formData.commodity}</p>
                  </div>

                  {/* Included Services */}
                  <div className="mt-4 text-sm text-gray-600">
                    <h4 className="font-semibold mb-2 text-gray-800">{t('air_results_page.included_services')}:</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      <p className="flex items-center">
                        {offer.includedServices.pickup ? <FaCheckCircle className="text-green-500 mr-2" /> : <FaTimesCircle className="text-red-500 mr-2" />}
                        {t('air_results_page.pickup')}
                      </p>
                      <p className="flex items-center">
                        {offer.includedServices.originClearance ? <FaCheckCircle className="text-green-500 mr-2" /> : <FaTimesCircle className="text-red-500 mr-2" />}
                        {t('air_results_page.origin_clearance')}
                      </p>
                      <p className="flex items-center">
                        {offer.includedServices.freight ? <FaCheckCircle className="text-green-500 mr-2" /> : <FaTimesCircle className="text-red-500 mr-2" />}
                        {t('air_results_page.freight')}
                      </p>
                      <p className="flex items-center">
                        {offer.includedServices.destinationClearance ? <FaCheckCircle className="text-green-500 mr-2" /> : <FaTimesCircle className="text-red-500 mr-2" />}
                        {t('air_results_page.destination_clearance')}
                      </p>
                      <p className="flex items-center">
                        {offer.includedServices.delivery ? <FaCheckCircle className="text-green-500 mr-2" /> : <FaTimesCircle className="text-red-500 mr-2" />}
                        {t('air_results_page.delivery')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Section: Price and Actions */}
                <div className="flex flex-col items-center lg:items-end space-y-3 w-full lg:w-auto mt-6 lg:mt-0">
                  <p className="text-4xl font-extrabold text-blue-700 flex items-center"> {/* Changed from text-green-600 */}
                    <FaRupeeSign className="mr-2 text-3xl" />{offer.price.toLocaleString()}
                  </p>
                  <button
                    onClick={() => navigate('/air-booking-details', { state: { formData, offer } })}
                    className="bg-blue-600 text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:bg-blue-700
                               transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300 w-full lg:w-auto"
                    // Changed from red-600/700 and red-300
                  >
                    {t('air_results_page.book_now')}
                  </button>
                  <button
                    onClick={() => alert(`Viewing details for ${offer.serviceProvider}`)} // Replace with actual detail view logic
                    className="text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium transition-colors duration-200"
                  >
                    {t('air_results_page.view_details')}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-gray-500 text-xl bg-white rounded-xl shadow-md border border-gray-200">
              {t('air_results_page.no_offers_found')}
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
            {t('air_results_page.home_button')}
          </button>
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-600 text-white font-semibold py-3 px-8 rounded-xl shadow-md hover:bg-blue-700
                       transition-colors duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300"
          >
            {t('air_results_page.previous_button')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AirResultsPage;
