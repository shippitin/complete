// src/pages/SeaResultsPage.tsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaShip, FaInfoCircle, FaArrowLeft, FaClock, FaRupeeSign, FaCube, FaMapMarkerAlt, FaCalendarAlt, FaCheckCircle, FaTimesCircle, FaBoxOpen, FaWeight, FaBoxes, FaTag } from 'react-icons/fa';
import type { SeaFormData } from '../types/QuoteFormHandle';
import { rateCardsAPI } from '../services/api';

interface SeaServiceOffer {
  id: string;
  serviceProvider: string;
  carrier: string;
  originPort: string;
  destinationPort: string;
  departureDate: string;
  transitTime: string;
  price: number;
  containerSize?: string;
  includedServices: {
    pickup: boolean;
    originClearance: boolean;
    freight: boolean;
    destinationClearance: boolean;
    delivery: boolean;
  };
  loadType: 'LCL' | 'FCL';
  features: string[];
  status: 'Available' | 'Limited' | 'Full';
}

const SeaResultsPage: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const formData = location.state?.formData as SeaFormData | undefined;

  const [allOffers, setAllOffers] = useState<SeaServiceOffer[]>([]);
  const [filteredOffers, setFilteredOffers] = useState<SeaServiceOffer[]>([]);
  const [selectedShipmentModeFilter, setSelectedShipmentModeFilter] = useState<string>('');
  const [selectedTransitTimeFilter, setSelectedTransitTimeFilter] = useState<string>('');
  const [selectedCarrierFilter, setSelectedCarrierFilter] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const generateDummyOffers = (data: SeaFormData): SeaServiceOffer[] => {
    const totalCalculatedPrice = data.shipmentMode === 'LCL'
      ? (data.totalWeight || 0) * 150 + (data.volumeCBM || 0) * 5000
      : (data.numberOfContainers || 0) * 100000;
    const departureDate = new Date(data.readyDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

    return [
      { id: 'SEA-001', serviceProvider: 'Maersk Line', carrier: 'Maersk Line', originPort: data.originPort || data.originCity || 'N/A', destinationPort: data.destinationPort || data.destinationCity || 'N/A', departureDate, transitTime: '25-30 Days', price: Math.round(totalCalculatedPrice * 1.1), containerSize: data.containerType, includedServices: { pickup: false, originClearance: true, freight: true, destinationClearance: false, delivery: false }, loadType: data.shipmentMode, features: ['Direct Route', 'GPS Tracking'], status: 'Available' },
      { id: 'SEA-002', serviceProvider: 'MSC Shipping', carrier: 'MSC Shipping', originPort: data.originPort || data.originCity || 'N/A', destinationPort: data.destinationPort || data.destinationCity || 'N/A', departureDate, transitTime: '30-35 Days', price: Math.round(totalCalculatedPrice * 0.95), containerSize: data.containerType, includedServices: { pickup: false, originClearance: true, freight: true, destinationClearance: false, delivery: false }, loadType: data.shipmentMode, features: ['Economical', 'Reliable Schedule'], status: 'Available' },
      { id: 'SEA-003', serviceProvider: 'CMA CGM', carrier: 'CMA CGM', originPort: data.originPort || data.originCity || 'N/A', destinationPort: data.destinationPort || data.destinationCity || 'N/A', departureDate, transitTime: '35-40 Days', price: Math.round(totalCalculatedPrice * 0.9), containerSize: data.containerType, includedServices: { pickup: false, originClearance: true, freight: true, destinationClearance: false, delivery: false }, loadType: data.shipmentMode, features: ['Cost-Effective', 'Bulk Cargo'], status: 'Limited' },
    ];
  };

  useEffect(() => {
    if (!formData) {
      navigate('/sea-booking');
      return;
    }

    (async () => {
      setLoading(true);
      try {
        const response = await rateCardsAPI.search({
          serviceType: 'Sea',
          origin: formData.originPort || formData.originCity || '',
          destination: formData.destinationPort || formData.destinationCity || '',
          numberOfContainers: formData.numberOfContainers,
          containerType: formData.containerType,
        });

        if (response.data.data.length > 0) {
          const offers: SeaServiceOffer[] = response.data.data.map((r: any) => ({
            id: r.id,
            serviceProvider: r.carrier,
            carrier: r.carrier,
            originPort: r.origin,
            destinationPort: r.destination,
            departureDate: new Date().toLocaleDateString('en-IN'),
            transitTime: r.transitTime,
            price: r.totalPrice,
            containerSize: r.containerType || formData.containerType,
            includedServices: { pickup: false, originClearance: true, freight: true, destinationClearance: false, delivery: false },
            loadType: formData.shipmentMode,
            features: ['GPS Tracking', 'Online Booking'],
            status: 'Available' as const,
          }));
          setAllOffers(offers);
          setFilteredOffers(offers);
        } else {
          const dummy = generateDummyOffers(formData);
          setAllOffers(dummy);
          setFilteredOffers(dummy);
        }
      } catch (error) {
        console.error('Failed to fetch quotes:', error);
        const dummy = generateDummyOffers(formData);
        setAllOffers(dummy);
        setFilteredOffers(dummy);
      } finally {
        setLoading(false);
      }
    })();
  }, [formData, navigate]);

  useEffect(() => {
    let current = allOffers;
    if (selectedShipmentModeFilter) current = current.filter(o => o.loadType === selectedShipmentModeFilter);
    if (selectedTransitTimeFilter) current = current.filter(o => o.transitTime === selectedTransitTimeFilter);
    if (selectedCarrierFilter) current = current.filter(o => o.carrier === selectedCarrierFilter);
    setFilteredOffers(current);
  }, [selectedShipmentModeFilter, selectedTransitTimeFilter, selectedCarrierFilter, allOffers]);

  const handleBookNow = (offer: SeaServiceOffer) => {
    navigate('/sea-booking-details', {
      state: {
        selectedResult: {
          id: offer.id,
          serviceName: offer.serviceProvider,
          carrier: offer.carrier,
          originPort: offer.originPort,
          destinationPort: offer.destinationPort,
          departureDate: offer.departureDate,
          transitTime: offer.transitTime,
          price: offer.price,
          containerSize: offer.containerSize || '',
          features: offer.features,
          status: offer.status,
        },
        originalFormData: formData,
      }
    });
  };

  if (!formData) return null;

  const uniqueCarriers = Array.from(new Set(allOffers.map(o => o.carrier)));
  const uniqueTransitTimes = Array.from(new Set(allOffers.map(o => o.transitTime)));
  const uniqueShipmentModes = Array.from(new Set(allOffers.map(o => o.loadType)));

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-extrabold text-blue-800 mb-8 text-center">{t('sea_results_page.title')}</h1>

        {/* Shipment Details */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-8 border border-blue-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-5 border-b pb-3">{t('sea_results_page.your_shipment_details')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4 text-gray-700">
            {formData.originPort && <p><FaMapMarkerAlt className="inline-block mr-2 text-blue-500" /><strong>{t('sea_results_page.origin_port')}:</strong> {formData.originPort}</p>}
            {formData.destinationPort && <p><FaMapMarkerAlt className="inline-block mr-2 text-blue-500" /><strong>{t('sea_results_page.destination_port')}:</strong> {formData.destinationPort}</p>}
            <p><FaShip className="inline-block mr-2 text-blue-500" /><strong>{t('sea_results_page.activity_type')}:</strong> {formData.activityType}</p>
            <p><FaShip className="inline-block mr-2 text-blue-500" /><strong>{t('sea_results_page.shipment_mode')}:</strong> {formData.shipmentMode}</p>
            <p><FaCalendarAlt className="inline-block mr-2 text-blue-500" /><strong>{t('sea_results_page.ready_date')}:</strong> {formData.readyDate}</p>
            <p><FaWeight className="inline-block mr-2 text-blue-500" /><strong>{t('sea_results_page.total_weight')}:</strong> {formData.totalWeight} Kgs</p>
            {formData.commodity && <p><FaBoxOpen className="inline-block mr-2 text-blue-500" /><strong>{t('sea_results_page.commodity')}:</strong> {formData.commodity}</p>}
            <p><FaInfoCircle className="inline-block mr-2 text-blue-500" /><strong>{t('sea_results_page.hazardous_cargo')}:</strong> {formData.hazardousCargo ? 'Yes' : 'No'}</p>
            <p><FaInfoCircle className="inline-block mr-2 text-blue-500" /><strong>{t('sea_results_page.insurance_required')}:</strong> {formData.insuranceRequired ? 'Yes' : 'No'}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-8 border border-blue-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-5 border-b pb-3">{t('sea_results_page.filters')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('sea_results_page.shipment_mode')}</label>
              <select value={selectedShipmentModeFilter} onChange={e => setSelectedShipmentModeFilter(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                <option value="">{t('sea_results_page.all')}</option>
                {uniqueShipmentModes.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('sea_results_page.transit_time')}</label>
              <select value={selectedTransitTimeFilter} onChange={e => setSelectedTransitTimeFilter(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                <option value="">{t('sea_results_page.all')}</option>
                {uniqueTransitTimes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('sea_results_page.carrier')}</label>
              <select value={selectedCarrierFilter} onChange={e => setSelectedCarrierFilter(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                <option value="">{t('sea_results_page.all')}</option>
                {uniqueCarriers.map(c => <option key={c} value={c}>{c}</option>)}
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
                    <p className="flex items-center"><FaShip className="mr-2 text-gray-500" />{formData.activityType}</p>
                    <p className="flex items-center"><FaShip className="mr-2 text-gray-500" />{formData.shipmentMode}</p>
                    <p className="flex items-center"><FaWeight className="mr-2 text-gray-500" />{formData.totalWeight} Kgs</p>
                    {offer.containerSize && <p className="flex items-center"><FaCube className="mr-2 text-gray-500" />{offer.containerSize}</p>}
                  </div>
                  <div className="mt-4 text-sm text-gray-600">
                    <h4 className="font-semibold mb-2 text-gray-800">{t('sea_results_page.included_services')}:</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      <p className="flex items-center">{offer.includedServices.pickup ? <FaCheckCircle className="text-green-500 mr-2" /> : <FaTimesCircle className="text-red-500 mr-2" />}{t('sea_results_page.pickup')}</p>
                      <p className="flex items-center">{offer.includedServices.originClearance ? <FaCheckCircle className="text-green-500 mr-2" /> : <FaTimesCircle className="text-red-500 mr-2" />}{t('sea_results_page.origin_clearance')}</p>
                      <p className="flex items-center">{offer.includedServices.freight ? <FaCheckCircle className="text-green-500 mr-2" /> : <FaTimesCircle className="text-red-500 mr-2" />}{t('sea_results_page.freight')}</p>
                      <p className="flex items-center">{offer.includedServices.destinationClearance ? <FaCheckCircle className="text-green-500 mr-2" /> : <FaTimesCircle className="text-red-500 mr-2" />}{t('sea_results_page.destination_clearance')}</p>
                      <p className="flex items-center">{offer.includedServices.delivery ? <FaCheckCircle className="text-green-500 mr-2" /> : <FaTimesCircle className="text-red-500 mr-2" />}{t('sea_results_page.delivery')}</p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-center lg:items-end space-y-3 w-full lg:w-auto mt-6 lg:mt-0">
                  <p className="text-4xl font-extrabold text-blue-700 flex items-center">
                    <FaRupeeSign className="mr-2 text-3xl" />{offer.price.toLocaleString()}
                  </p>
                  <button onClick={() => handleBookNow(offer)} className="bg-blue-600 text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:bg-blue-700 transition-all w-full lg:w-auto">
                    {t('sea_results_page.book_now')}
                  </button>
                </div>
              </div>
            )) : (
              <div className="text-center py-10 text-gray-500 text-xl bg-white rounded-xl shadow-md border border-gray-200">
                {t('sea_results_page.no_offers_found')}
              </div>
            )}
          </div>
        )}

        <div className="flex justify-center mt-10 space-x-4">
          <button onClick={() => navigate('/')} className="bg-gray-700 text-white font-semibold py-3 px-8 rounded-xl shadow-md hover:bg-gray-800 transition">
            {t('sea_results_page.home_button')}
          </button>
          <button onClick={() => navigate(-1)} className="bg-blue-600 text-white font-semibold py-3 px-8 rounded-xl shadow-md hover:bg-blue-700 transition">
            {t('sea_results_page.previous_button')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SeaResultsPage;
