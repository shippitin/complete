// src/pages/ParcelResultsPage.tsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaBox, FaInfoCircle, FaArrowLeft, FaClock, FaRupeeSign, FaWeight, FaBoxes, FaMapMarkerAlt, FaCalendarAlt, FaGlobe, FaBook } from 'react-icons/fa';
import type { ParcelFormData } from '../types/QuoteFormHandle';
import { rateCardsAPI } from '../services/api';

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
  const formData = location.state?.formData as ParcelFormData | undefined;

  const [allOffers, setAllOffers] = useState<ParcelServiceOffer[]>([]);
  const [filteredOffers, setFilteredOffers] = useState<ParcelServiceOffer[]>([]);
  const [selectedServiceProviderFilter, setSelectedServiceProviderFilter] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const getDummyOffers = (data: ParcelFormData): ParcelServiceOffer[] => {
    const basePricePerKG = data.isDomestic ? 100 : 300;
    const basePricePerParcel = data.courierMode === 'DOC' ? 50 : 150;
    const totalPrice = (data.totalWeight || 0) * basePricePerKG + (data.parcelCount || 0) * basePricePerParcel;
    const courierMode = data.courierMode as 'DOC' | 'NON';
    return [
      { id: 'PARCEL-A', serviceProvider: 'Zipaworld', origin: data.origin, destination: data.destination, pickupDate: data.readyDate, transitTime: data.isDomestic ? '2-4 Days' : '5-7 Days', price: Math.round(totalPrice * 1.1), isDomestic: data.isDomestic, courierMode, parcelCount: data.parcelCount, totalWeight: data.totalWeight, cargoType: data.cargoType, features: ['Express Delivery', 'Real-time Tracking'], status: 'Available' },
      { id: 'PARCEL-B', serviceProvider: 'Blue Dart', origin: data.origin, destination: data.destination, pickupDate: data.readyDate, transitTime: data.isDomestic ? '3-5 Days' : '6-8 Days', price: Math.round(totalPrice * 0.95), isDomestic: data.isDomestic, courierMode, parcelCount: data.parcelCount, totalWeight: data.totalWeight, cargoType: data.cargoType, features: ['Reliable Service', 'Proof of Delivery'], status: 'Available' },
      { id: 'PARCEL-C', serviceProvider: 'DTDC', origin: data.origin, destination: data.destination, pickupDate: data.readyDate, transitTime: data.isDomestic ? '4-6 Days' : '7-10 Days', price: Math.round(totalPrice * 0.9), isDomestic: data.isDomestic, courierMode, parcelCount: data.parcelCount, totalWeight: data.totalWeight, cargoType: data.cargoType, features: ['Economical', 'Wide Coverage'], status: 'Limited' },
    ];
  };

  useEffect(() => {
    if (!formData) { navigate('/parcel-booking'); return; }

    (async () => {
      setLoading(true);
      try {
        const response = await rateCardsAPI.search({
          serviceType: 'Parcel',
          origin: formData.origin || '',
          destination: formData.destination || '',
          weight: formData.totalWeight,
        });

        if (response.data.data.length > 0) {
          const courierMode = formData.courierMode as 'DOC' | 'NON';
          const mapped: ParcelServiceOffer[] = response.data.data.map((r: any) => ({
            id: r.id,
            serviceProvider: r.carrier,
            origin: r.origin,
            destination: r.destination,
            pickupDate: formData.readyDate,
            transitTime: r.transitTime,
            price: r.totalPrice,
            isDomestic: formData.isDomestic,
            courierMode,
            parcelCount: formData.parcelCount,
            totalWeight: formData.totalWeight,
            cargoType: formData.cargoType,
            features: ['GPS Tracking', 'Online Booking'],
            status: 'Available' as const,
          }));
          setAllOffers(mapped);
          setFilteredOffers(mapped);
        } else {
          const dummy = getDummyOffers(formData);
          setAllOffers(dummy);
          setFilteredOffers(dummy);
        }
      } catch (error) {
        const dummy = getDummyOffers(formData);
        setAllOffers(dummy);
        setFilteredOffers(dummy);
      } finally {
        setLoading(false);
      }
    })();
  }, [formData, navigate]);

  useEffect(() => {
    let current = allOffers;
    if (selectedServiceProviderFilter) current = current.filter(o => o.serviceProvider === selectedServiceProviderFilter);
    setFilteredOffers(current);
  }, [selectedServiceProviderFilter, allOffers]);

  const handleBookNow = (offer: ParcelServiceOffer) => {
    navigate('/parcel-booking-details', { state: { selectedResult: offer, originalFormData: formData } });
  };

  if (!formData) return null;

  const uniqueProviders = Array.from(new Set(allOffers.map(o => o.serviceProvider)));

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-extrabold text-blue-800 mb-8 text-center">{t('parcel_results_page.title')}</h1>

        {/* Shipment Details */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-8 border border-blue-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-5 border-b pb-3">{t('parcel_results_page.your_shipment_details')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4 text-gray-700">
            <p><FaMapMarkerAlt className="inline-block mr-2 text-blue-500" /><strong>Origin:</strong> {formData.origin}</p>
            <p><FaMapMarkerAlt className="inline-block mr-2 text-blue-500" /><strong>Destination:</strong> {formData.destination}</p>
            <p><FaCalendarAlt className="inline-block mr-2 text-blue-500" /><strong>Ready Date:</strong> {formData.readyDate}</p>
            <p><FaGlobe className="inline-block mr-2 text-blue-500" /><strong>Service Type:</strong> {formData.isDomestic ? 'Domestic' : 'International'}</p>
            <p><FaBook className="inline-block mr-2 text-blue-500" /><strong>Courier Mode:</strong> {formData.courierMode === 'DOC' ? 'Document' : 'Non-Document'}</p>
            <p><FaBoxes className="inline-block mr-2 text-blue-500" /><strong>Parcels:</strong> {formData.parcelCount}</p>
            <p><FaWeight className="inline-block mr-2 text-blue-500" /><strong>Weight:</strong> {formData.totalWeight} Kgs</p>
            <p><FaBox className="inline-block mr-2 text-blue-500" /><strong>Cargo Type:</strong> {formData.cargoType}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-8 border border-blue-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-5 border-b pb-3">{t('parcel_results_page.filters')}</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Service Provider</label>
            <select value={selectedServiceProviderFilter} onChange={e => setSelectedServiceProviderFilter(e.target.value)} className="w-full sm:w-64 px-4 py-2 border border-gray-300 rounded-lg">
              <option value="">All</option>
              {uniqueProviders.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
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
                    <p className="flex items-center"><FaMapMarkerAlt className="mr-2 text-gray-500" />{offer.origin} → {offer.destination}</p>
                    <p className="flex items-center"><FaClock className="mr-2 text-gray-500" />{offer.transitTime}</p>
                    <p className="flex items-center"><FaGlobe className="mr-2 text-gray-500" />{offer.isDomestic ? 'Domestic' : 'International'}</p>
                    <p className="flex items-center"><FaBoxes className="mr-2 text-gray-500" />{offer.parcelCount} Parcels / {offer.totalWeight} Kgs</p>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {offer.features.map((f, i) => (
                      <span key={i} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">{f}</span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col items-center lg:items-end space-y-3 w-full lg:w-auto mt-6 lg:mt-0">
                  <p className="text-4xl font-extrabold text-blue-700 flex items-center">
                    <FaRupeeSign className="mr-2 text-3xl" />{offer.price.toLocaleString()}
                  </p>
                  <button onClick={() => handleBookNow(offer)} className="bg-blue-600 text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:bg-blue-700 transition-all w-full lg:w-auto">
                    Book Now
                  </button>
                </div>
              </div>
            )) : (
              <div className="text-center py-10 text-gray-500 text-xl bg-white rounded-xl shadow-md">
                No offers found for your criteria.
              </div>
            )}
          </div>
        )}

        <div className="flex justify-center mt-10 space-x-4">
          <button onClick={() => navigate('/')} className="bg-gray-700 text-white font-semibold py-3 px-8 rounded-xl shadow-md hover:bg-gray-800 transition">Home</button>
          <button onClick={() => navigate(-1)} className="bg-blue-600 text-white font-semibold py-3 px-8 rounded-xl shadow-md hover:bg-blue-700 transition">Go Back</button>
        </div>
      </div>
    </div>
  );
};

export default ParcelResultsPage;
