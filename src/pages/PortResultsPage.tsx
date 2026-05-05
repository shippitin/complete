// src/pages/PortResultsPage.tsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  FaAnchor, FaCalendarAlt, FaClock, FaRupeeSign,
  FaChevronRight, FaArrowLeft, FaShip, FaWrench,
} from 'react-icons/fa';
import { portAPI } from '../services/api';

interface PortFormData {
  bookingType: 'Port Services';
  vesselName: string;
  portLocation: string;
  serviceDate: string;
  serviceCategory: string;
  specificRequirements?: string;
}

interface PortOffer {
  id: string;
  provider: string;
  portName: string;
  serviceCategory: string;
  transitTime: string;
  charges: {
    portDues: number;
    pilotage: number;
    tugCharges: number;
    berthingCharges: number;
    storageCharges: number;
    miscCharges: number;
  };
  totalAmount: number;
  validUntil: string;
  badge?: 'best_value' | 'fastest' | 'most_popular' | null;
}

const getBadgeConfig = (badge: string | null | undefined) => {
  switch (badge) {
    case 'best_value':   return { label: '★ Best Value',   pill: 'bg-amber-50 text-amber-700 border border-amber-200' };
    case 'fastest':      return { label: '⚡ Fastest',      pill: 'bg-sky-50 text-sky-700 border border-sky-200' };
    case 'most_popular': return { label: '🔥 Most Popular', pill: 'bg-rose-50 text-rose-700 border border-rose-200' };
    default: return null;
  }
};

const getBorderColor = (badge: string | null | undefined) => {
  switch (badge) {
    case 'best_value':   return '#fbbf24';
    case 'fastest':      return '#38bdf8';
    case 'most_popular': return '#fb7185';
    default: return 'transparent';
  }
};

// Maps the user-facing service category to the backend enum value
const mapServiceCategory = (category: string): string => {
  const map: Record<string, string> = {
    'Crew Change / Logistics': 'pilotage',
    'Bunkering':               'bunkering',
    'Technical Repairs':       'stevedoring',
    'Provisions & Stores':     'storage',
  };
  return map[category] || 'stevedoring';
};

const makeDummyOffers = (serviceCategory: string): PortOffer[] => [
  {
    id: 'PORT-001', provider: 'JNPT', portName: 'Jawaharlal Nehru Port Trust',
    serviceCategory, transitTime: '4-6 hrs',
    charges: { portDues: 25000, pilotage: 15000, tugCharges: 12000, berthingCharges: 8000, storageCharges: 5000, miscCharges: 2000 },
    totalAmount: 67000, validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), badge: 'most_popular',
  },
  {
    id: 'PORT-002', provider: 'Chennai Port', portName: 'Chennai Port Trust',
    serviceCategory, transitTime: '3-5 hrs',
    charges: { portDues: 22000, pilotage: 13000, tugCharges: 10000, berthingCharges: 7000, storageCharges: 4500, miscCharges: 1800 },
    totalAmount: 58300, validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), badge: 'best_value',
  },
  {
    id: 'PORT-003', provider: 'Vizag Port', portName: 'Visakhapatnam Port',
    serviceCategory, transitTime: '2-4 hrs',
    charges: { portDues: 20000, pilotage: 11000, tugCharges: 9000, berthingCharges: 6000, storageCharges: 4000, miscCharges: 1500 },
    totalAmount: 51500, validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), badge: 'fastest',
  },
];

const chargeLabels: Record<string, string> = {
  portDues: 'Port Dues', pilotage: 'Pilotage', tugCharges: 'Tug Charges',
  berthingCharges: 'Berthing', storageCharges: 'Storage', miscCharges: 'Misc',
};

const PortResultsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const formData = location.state?.formData as PortFormData | undefined;

  const [offers, setOffers] = useState<PortOffer[]>([]);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState<'price' | 'transit'>('price');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!formData) { navigate('/port-booking'); return; }

    (async () => {
      setLoading(true);
      try {
        const response = await portAPI.getQuote({
          portCode: formData.portLocation || 'INJNP',
          serviceCategory: mapServiceCategory(formData.serviceCategory),
          vesselName: formData.vesselName,
          vesselType: 'General Cargo',
          grt: 5000,
          arrivalDate: formData.serviceDate,
          departureDate: formData.serviceDate,
          specificRequirements: formData.specificRequirements || '',
        });
        const json = response.data;
        if (json.success && json.data) {
          const base = json.data;
          const variants = [
            { provider: 'JNPT',         portName: 'Jawaharlal Nehru Port Trust', m: 1,    time: '4-6 hrs', badge: 'most_popular' as const },
            { provider: 'Chennai Port', portName: 'Chennai Port Trust',           m: 0.87, time: '3-5 hrs', badge: 'best_value'   as const },
            { provider: 'Vizag Port',   portName: 'Visakhapatnam Port',           m: 0.77, time: '2-4 hrs', badge: 'fastest'      as const },
          ];
          setOffers(variants.map((v, i) => ({
            id: `PORT-00${i + 1}`,
            provider: v.provider,
            portName: v.portName,
            serviceCategory: formData.serviceCategory, // ✅ show user-facing label, not backend enum
            transitTime: v.time,
            charges: Object.fromEntries(
              Object.entries(base.charges).map(([k, val]) => [k, Math.round((val as number) * v.m)])
            ) as PortOffer['charges'],
            totalAmount: Math.round(base.totalAmount * v.m),
            validUntil: base.validUntil,
            badge: v.badge,
          })));
        } else {
          setOffers(makeDummyOffers(formData.serviceCategory));
        }
      } catch {
        setOffers(makeDummyOffers(formData.serviceCategory));
      } finally {
        setLoading(false);
      }
    })();
  }, [formData, navigate]);

  const sorted = [...offers].sort((a, b) =>
    sortBy === 'price'
      ? a.totalAmount - b.totalAmount
      : parseInt(a.transitTime) - parseInt(b.transitTime)
  );

  const handleBookNow = (offer: PortOffer) => {
    navigate('/port-booking-details', {
      state: { selectedOffer: offer, originalFormData: formData },
    });
  };

  if (!formData) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky summary bar */}
      <div className="sticky top-16 z-30 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-5 text-sm">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 text-gray-400 hover:text-blue-600 transition font-medium"
            >
              <FaArrowLeft className="text-xs" /> Back
            </button>
            <div className="h-4 w-px bg-gray-200" />
            <div className="flex items-center gap-2 text-gray-700">
              <FaShip className="text-blue-400 text-xs" />
              <span className="font-semibold">{formData.vesselName}</span>
              <span className="text-gray-300">·</span>
              <span className="font-semibold">{formData.portLocation}</span>
            </div>
            <div className="hidden md:flex items-center gap-1.5 text-gray-400">
              <FaCalendarAlt className="text-xs" />
              <span>{new Date(formData.serviceDate).toLocaleDateString('en-IN')}</span>
            </div>
            <div className="hidden md:flex items-center gap-1.5 text-gray-400">
              <FaWrench className="text-xs" />
              <span>{formData.serviceCategory}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Sort:</span>
            {[{ key: 'price', label: 'Price' }, { key: 'transit', label: 'Transit' }].map(s => (
              <button
                key={s.key}
                onClick={() => setSortBy(s.key as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  sortBy === s.key ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-5">
          <h1 className="text-xl font-bold text-gray-800">Port Services Quotes</h1>
          <p className="text-sm text-gray-400 mt-0.5">{sorted.length} options · Indicative pricing</p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
                <div className="h-5 bg-gray-100 rounded w-1/3 mb-3" />
                <div className="h-4 bg-gray-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {sorted.map(offer => {
              const badgeConfig = getBadgeConfig(offer.badge);
              const isExpanded = expandedId === offer.id;

              return (
                <div
                  key={offer.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
                  style={{ borderLeft: `4px solid ${getBorderColor(offer.badge)}` }}
                >
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
                          <FaAnchor className="text-blue-500 text-sm" />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-gray-800">{offer.provider}</h3>
                          <p className="text-xs text-gray-400">{offer.portName}</p>
                        </div>
                      </div>
                      {badgeConfig && (
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${badgeConfig.pill}`}>
                          {badgeConfig.label}
                        </span>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-400 mb-0.5">SERVICE</p>
                        <p className="text-sm font-semibold text-gray-700">{offer.serviceCategory}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-0.5">TURNAROUND</p>
                        <p className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                          <FaClock className="text-gray-300 text-xs" />{offer.transitTime}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-0.5">VESSEL</p>
                        <p className="text-sm font-semibold text-gray-700">{formData.vesselName}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-0.5">VALID UNTIL</p>
                        <p className="text-sm font-semibold text-gray-700">
                          {new Date(offer.validUntil).toLocaleDateString('en-IN')}
                        </p>
                      </div>
                    </div>

                    {/* Charge breakdown toggle */}
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : offer.id)}
                      className="text-xs text-blue-500 hover:text-blue-700 font-medium mb-4 transition"
                    >
                      {isExpanded ? '▲ Hide breakdown' : '▼ View charge breakdown'}
                    </button>

                    {isExpanded && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4 bg-gray-50 rounded-xl p-4">
                        {Object.entries(offer.charges).map(([key, val]) => (
                          <div key={key} className="flex justify-between text-xs text-gray-600">
                            <span>{chargeLabels[key] || key}</span>
                            <span className="font-semibold">₹{(val as number).toLocaleString('en-IN')}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                      <p className="text-xs text-gray-400">{formData.serviceCategory}</p>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-xs text-gray-400 mb-0.5">TOTAL ESTIMATED</p>
                          <p className="text-2xl font-black text-gray-900 flex items-center gap-1">
                            <FaRupeeSign className="text-lg text-blue-500" />
                            {offer.totalAmount.toLocaleString('en-IN')}
                          </p>
                        </div>
                        <button
                          onClick={() => handleBookNow(offer)}
                          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all text-sm whitespace-nowrap"
                        >
                          Book Now <FaChevronRight className="text-xs" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default PortResultsPage;
