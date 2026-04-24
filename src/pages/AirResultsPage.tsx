// src/pages/AirResultsPage.tsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AirFormData } from '../types/QuoteFormHandle';
import { FaPlane, FaCalendarAlt, FaWeight, FaBoxes, FaTag, FaInfoCircle, FaCheckCircle, FaTimesCircle, FaMapMarkerAlt, FaClock, FaRupeeSign, FaBoxOpen } from 'react-icons/fa';
import { rateCardsAPI } from '../services/api';

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
  slabs: string;
}

const dummyOffers: ServiceOffer[] = [
  { id: 'AE-JULY25-00489-1', serviceProvider: 'Shippitin Express', transitTime: '3-4 days', price: 18290, includedServices: { pickup: true, originClearance: true, freight: true, destinationClearance: true, delivery: false }, loadType: 'PTL', slabs: 'Min' },
  { id: 'AE-JULY25-00490-2', serviceProvider: 'Global Freight Co.', transitTime: '2-3 days', price: 22500, includedServices: { pickup: true, originClearance: true, freight: true, destinationClearance: true, delivery: true }, loadType: 'FTL', slabs: '+45' },
  { id: 'AE-JULY25-00491-3', serviceProvider: 'Sky Cargo Logistics', transitTime: '4-5 days', price: 15000, includedServices: { pickup: false, originClearance: true, freight: true, destinationClearance: false, delivery: false }, loadType: 'PTL', slabs: 'Normal' },
  { id: 'AE-JULY25-00492-4', serviceProvider: 'Fast Air Solutions', transitTime: '1-2 days', price: 28000, includedServices: { pickup: true, originClearance: true, freight: true, destinationClearance: true, delivery: true }, loadType: 'FTL', slabs: '+100' },
];

const AirResultsPage: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const formData = location.state?.formData as AirFormData | undefined;

  const [allOffers, setAllOffers] = useState<ServiceOffer[]>([]);
  const [filteredOffers, setFilteredOffers] = useState<ServiceOffer[]>([]);
  const [selectedLoadTypeFilter, setSelectedLoadTypeFilter] = useState<string>('');
  const [selectedTransitTimeFilter, setSelectedTransitTimeFilter] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!formData) { navigate('/air-booking'); return; }

    (async () => {
      setLoading(true);
      try {
        const response = await rateCardsAPI.search({
          serviceType: 'Air',
          origin: formData.originAirport || formData.originCity || '',
          destination: formData.destinationAirport || formData.destinationCity || '',
          weight: formData.totalWeight,
        });

        if (response.data.data.length > 0) {
          const offers: ServiceOffer[] = response.data.data.map((r: any) => ({
            id: r.id,
            serviceProvider: r.carrier,
            transitTime: r.transitTime,
            price: r.totalPrice,
            includedServices: { pickup: true, originClearance: true, freight: true, destinationClearance: true, delivery: false },
            loadType: 'PTL' as const,
            slabs: 'Normal',
          }));
          setAllOffers(offers);
          setFilteredOffers(offers);
        } else {
          setAllOffers(dummyOffers);
          setFilteredOffers(dummyOffers);
        }
      } catch (error) {
        setAllOffers(dummyOffers);
        setFilteredOffers(dummyOffers);
      } finally {
        setLoading(false);
      }
    })();
  }, [formData, navigate]);

  useEffect(() => {
    let current = allOffers;
    if (selectedLoadTypeFilter) current = current.filter(o => o.loadType === selectedLoadTypeFilter);
    if (selectedTransitTimeFilter) current = current.filter(o => o.transitTime === selectedTransitTimeFilter);
    setFilteredOffers(current);
  }, [selectedLoadTypeFilter, selectedTransitTimeFilter, allOffers]);

  const handleBookNow = (offer: ServiceOffer) => {
    navigate('/air-booking-details', {
      state: {
        selectedResult: {
          id: offer.id,
          serviceName: offer.serviceProvider,
          carrier: offer.serviceProvider,
          originAirport: formData?.originAirport || '',
          destinationAirport: formData?.destinationAirport || '',
          departureDate: formData?.readyDate || '',
          transitTime: offer.transitTime,
          price: offer.price,
          cargoType: formData?.commodity || 'General',
          features: [],
          status: 'Available',
        },
        originalFormData: formData,
      }
    });
  };

  if (!formData) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-extrabold text-blue-800 mb-8 text-center">{t('air_results_page.title')}</h1>

        {/* Shipment Details */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-8 border border-blue-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-5 border-b pb-3">{t('air_results_page.your_shipment_details')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4 text-gray-700">
            {formData.originAirport && <p><FaMapMarkerAlt className="inline-block mr-2 text-blue-500" /><strong>{t('air_results_page.origin_airport')}:</strong> {formData.originAirport}</p>}
            {formData.destinationAirport && <p><FaMapMarkerAlt className="inline-block mr-2 text-blue-500" /><strong>{t('air_results_page.destination_airport')}:</strong> {formData.destinationAirport}</p>}
            <p><FaPlane className="inline-block mr-2 text-blue-500" /><strong>{t('air_results_page.activity_type')}:</strong> {formData.activityType}</p>
            <p><FaCalendarAlt className="inline-block mr-2 text-blue-500" /><strong>{t('air_results_page.clearance_date')}:</strong> {formData.readyDate}</p>
            <p><FaWeight className="inline-block mr-2 text-blue-500" /><strong>{t('air_results_page.gross_weight')}:</strong> {formData.totalWeight} Kgs</p>
            <p><FaBoxes className="inline-block mr-2 text-blue-500" /><strong>{t('air_results_page.number_of_pieces')}:</strong> {formData.numberOfPieces}</p>
            <p><FaTag className="inline-block mr-2 text-blue-500" /><strong>{t('air_results_page.commodity_category')}:</strong> {formData.commodityCategory}</p>
            <p><FaBoxOpen className="inline-block mr-2 text-blue-500" /><strong>{t('air_results_page.commodity')}:</strong> {formData.commodity}</p>
            <p><FaInfoCircle className="inline-block mr-2 text-blue-500" /><strong>{t('air_results_page.hazardous_cargo')}:</strong> {formData.hazardousCargo ? 'Yes' : 'No'}</p>
            <p><FaInfoCircle className="inline-block mr-2 text-blue-500" /><strong>{t('air_results_page.insurance_required')}:</strong> {formData.insuranceRequired ? 'Yes' : 'No'}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-8 border border-blue-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-5 border-b pb-3">{t('air_results_page.filters')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('air_results_page.load_type')}</label>
              <select value={selectedLoadTypeFilter} onChange={e => setSelectedLoadTypeFilter(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                <option value="">{t('air_results_page.all')}</option>
                <option value="PTL">PTL</option>
                <option value="FTL">FTL</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('air_results_page.transit_time')}</label>
              <select value={selectedTransitTimeFilter} onChange={e => setSelectedTransitTimeFilter(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                <option value="">{t('air_results_page.all')}</option>
                <option value="1-2 days">1-2 days</option>
                <option value="2-3 days">2-3 days</option>
                <option value="3-4 days">3-4 days</option>
                <option value="4-5 days">4-5 days</option>
              </select>
            </div>
          </div>
        </div>

        {/* Offers */}
        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-500 text-lg">Fetching best rates...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOffers.length > 0 ? filteredOffers.map(offer => (
              <div key={offer.id} className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-blue-100 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 hover:shadow-2xl transition-all duration-300">
                <div className="flex-grow">
                  <p className="text-sm text-gray-500 mb-1 font-mono">JOB ID: {offer.id}</p>
                  <h3 className="text-2xl font-extrabold text-blue-700 mb-3">{offer.serviceProvider}</h3>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-gray-700 text-sm mb-4">
                    <p className="flex items-center"><FaClock className="mr-2 text-gray-500" />{offer.transitTime}</p>
                    <p className="flex items-center"><FaPlane className="mr-2 text-gray-500" />{formData.activityType}</p>
                    <p className="flex items-center"><FaBoxOpen className="mr-2 text-gray-500" />{formData.numberOfPieces} Pcs / {formData.totalWeight} Kgs</p>
                    <p className="flex items-center"><FaTag className="mr-2 text-gray-500" />{formData.commodity}</p>
                  </div>
                  <div className="mt-4 text-sm text-gray-600">
                    <h4 className="font-semibold mb-2 text-gray-800">{t('air_results_page.included_services')}:</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      <p className="flex items-center">{offer.includedServices.pickup ? <FaCheckCircle className="text-green-500 mr-2" /> : <FaTimesCircle className="text-red-500 mr-2" />}{t('air_results_page.pickup')}</p>
                      <p className="flex items-center">{offer.includedServices.originClearance ? <FaCheckCircle className="text-green-500 mr-2" /> : <FaTimesCircle className="text-red-500 mr-2" />}{t('air_results_page.origin_clearance')}</p>
                      <p className="flex items-center">{offer.includedServices.freight ? <FaCheckCircle className="text-green-500 mr-2" /> : <FaTimesCircle className="text-red-500 mr-2" />}{t('air_results_page.freight')}</p>
                      <p className="flex items-center">{offer.includedServices.destinationClearance ? <FaCheckCircle className="text-green-500 mr-2" /> : <FaTimesCircle className="text-red-500 mr-2" />}{t('air_results_page.destination_clearance')}</p>
                      <p className="flex items-center">{offer.includedServices.delivery ? <FaCheckCircle className="text-green-500 mr-2" /> : <FaTimesCircle className="text-red-500 mr-2" />}{t('air_results_page.delivery')}</p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-center lg:items-end space-y-3 w-full lg:w-auto mt-6 lg:mt-0">
                  <p className="text-4xl font-extrabold text-blue-700 flex items-center">
                    <FaRupeeSign className="mr-2 text-3xl" />{offer.price.toLocaleString()}
                  </p>
                  <button onClick={() => handleBookNow(offer)} className="bg-blue-600 text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:bg-blue-700 transition-all w-full lg:w-auto">
                    {t('air_results_page.book_now')}
                  </button>
                </div>
              </div>
            )) : (
              <div className="text-center py-10 text-gray-500 text-xl bg-white rounded-xl shadow-md">
                {t('air_results_page.no_offers_found')}
              </div>
            )}
          </div>
        )}

        <div className="flex justify-center mt-10 space-x-4">
          <button onClick={() => navigate('/')} className="bg-gray-700 text-white font-semibold py-3 px-8 rounded-xl shadow-md hover:bg-gray-800 transition">
            {t('air_results_page.home_button')}
          </button>
          <button onClick={() => navigate(-1)} className="bg-blue-600 text-white font-semibold py-3 px-8 rounded-xl shadow-md hover:bg-blue-700 transition">
            {t('air_results_page.previous_button')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AirResultsPage;
 