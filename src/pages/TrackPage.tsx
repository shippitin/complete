// src/pages/TrackPage.tsx
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  FaSearch, FaTruck, FaMapMarkerAlt, FaCalendarAlt, FaClipboardList, 
  FaInfoCircle, FaCheckCircle, FaHourglassHalf, FaTimesCircle, FaPlane, 
  FaShip, FaBoxOpen, FaTrain, FaGlobeAmericas, FaFilePdf, FaShieldAlt, 
  FaDownload, FaLock, FaRobot, FaLeaf, FaShareAlt, FaWhatsapp, FaEnvelope, FaCopy 
} from 'react-icons/fa';
import Map from '../components/Map';

// --- Interfaces ---

interface ShipmentDoc {
  name: string;
  type: string;
  date: string;
  status: 'Verified' | 'Pending';
}

interface ShipmentStatus {
  date: string;
  status: string;
  location: string;
  coordinates?: [number, number];
}

interface Shipment {
  id: string;
  carrier: string;
  currentLocation: string;
  status: string;
  estimatedDelivery: string;
  shipmentType: 'Truck' | 'Sea' | 'Air' | 'Parcel' | 'International' | 'Rail';
  path: [number, number][];
  statusTimeline: ShipmentStatus[];
  documents: ShipmentDoc[];
  reliabilityScore: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  predictionMessage: string;
  co2Emissions: number;
  co2Saved: number;
}

// --- Full Dataset ---

const dummyShipments: Shipment[] = [
  {
    id: 'TRK001',
    carrier: 'Roadways Express',
    currentLocation: 'Mumbai',
    status: 'Delivered',
    estimatedDelivery: '2025-07-25',
    shipmentType: 'Truck',
    path: [[28.7041, 77.1025], [19.0760, 72.8777]],
    statusTimeline: [
      { date: '2025-07-20', status: 'Booked', location: 'Delhi' },
      { date: '2025-07-25', status: 'Delivered', location: 'Mumbai' },
    ],
    documents: [{ name: 'Bill of Lading', type: 'e-BL', date: '2025-07-20', status: 'Verified' }],
    reliabilityScore: 98, riskLevel: 'Low', predictionMessage: "Route optimized for efficiency.",
    co2Emissions: 18.4, co2Saved: 32.1,
  },
  {
    id: 'AIR002',
    carrier: 'SkyCargo Int.',
    currentLocation: 'In Transit',
    status: 'In Flight',
    estimatedDelivery: '2025-08-05',
    shipmentType: 'Air',
    path: [[40.7128, -74.0060], [51.5074, -0.1278]],
    statusTimeline: [
      { date: '2025-08-01', status: 'Departed', location: 'New York (JFK)' },
      { date: '2025-08-03', status: 'In Transit', location: 'Atlantic Airspace' },
    ],
    documents: [{ name: 'Air Waybill', type: 'AWB', date: '2025-08-01', status: 'Verified' }],
    reliabilityScore: 92, riskLevel: 'Low', predictionMessage: "Tailwinds assisting flight speed.",
    co2Emissions: 450.2, co2Saved: 5.4,
  },
  {
    id: 'SEA003',
    carrier: 'Oceanic Lines',
    currentLocation: 'Singapore',
    status: 'At Sea',
    estimatedDelivery: '2025-08-15',
    shipmentType: 'Sea',
    path: [[34.6937, 135.5022], [1.3521, 103.8198]],
    statusTimeline: [
      { date: '2025-07-28', status: 'Booked', location: 'Osaka' },
      { date: '2025-08-02', status: 'At Sea', location: 'South China Sea' },
    ],
    documents: [{ name: 'Ocean BL', type: 'e-BL', date: '2025-07-28', status: 'Verified' }],
    reliabilityScore: 84, riskLevel: 'Medium', predictionMessage: "Minor congestion at Singapore terminal.",
    co2Emissions: 42.5, co2Saved: 110.2,
  },
  {
    id: 'RAIL006',
    carrier: 'National Rail',
    currentLocation: 'Nagpur',
    status: 'Delayed',
    estimatedDelivery: '2025-07-27',
    shipmentType: 'Rail',
    path: [[22.5726, 88.3639], [21.1458, 79.0882]],
    statusTimeline: [
      { date: '2025-07-20', status: 'Booked', location: 'Kolkata' },
      { date: '2025-07-24', status: 'Delayed', location: 'Nagpur Yard' },
    ],
    documents: [{ name: 'Rail Consignment Note', type: 'e-CMR', date: '2025-07-20', status: 'Verified' }],
    reliabilityScore: 35, riskLevel: 'High', predictionMessage: "High risk of 48h delay due to maintenance.",
    co2Emissions: 12.1, co2Saved: 85.4,
  }
];

const TrackPage: React.FC = () => {
  const [trackingId, setTrackingId] = useState('');
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const [copySuccess, setCopySuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const idFromUrl = searchParams.get('id');
    if (idFromUrl) {
      setTrackingId(idFromUrl);
      handleTrack(idFromUrl);
    }
  }, [searchParams]);

  const handleTrack = async (idToTrack: string = trackingId) => {
    setError(null);
    setShipment(null);
    if (!idToTrack) return;

    setLoading(true);

    // First try real backend
    try {
      const response = await fetch(`http://localhost:5000/api/tracking/${idToTrack.trim()}`);
      if (response.ok) {
        const result = await response.json();
        const booking = result.data;

        // Map backend data to Shipment interface
        const realShipment: Shipment = {
          id: booking.booking_number,
          carrier: 'CONCOR',
          currentLocation: booking.tracking_events?.length > 0
            ? booking.tracking_events[0].location
            : booking.origin,
          status: booking.status || 'Pending',
          estimatedDelivery: booking.booking_date,
          shipmentType: 'Rail',
          path: [[20.5937, 78.9629], [28.6139, 77.2090]],
          statusTimeline: booking.tracking_events?.length > 0
            ? booking.tracking_events.map((event: any) => ({
                date: new Date(event.timestamp).toLocaleDateString('en-IN'),
                status: event.status,
                location: event.location,
              }))
            : [{
                date: new Date(booking.booking_date).toLocaleDateString('en-IN'),
                status: 'Booked',
                location: booking.origin,
              }],
          documents: [],
          reliabilityScore: 90,
          riskLevel: 'Low',
          predictionMessage: `Shipment from ${booking.origin} to ${booking.destination}. Status: ${booking.status}.`,
          co2Emissions: 12.5,
          co2Saved: 85.0,
        };

        setShipment(realShipment);
        setLoading(false);
        return;
      }
    } catch (err) {
      // Backend not available, fall through to dummy data
    }

    // Fall back to dummy data
    const found = dummyShipments.find(
      (s) => s.id.trim().toUpperCase() === idToTrack.trim().toUpperCase()
    );

    if (found) {
      setShipment(found);
    } else {
      setError(`ID "${idToTrack}" not found. Try TRK001, AIR002, SEA003, or RAIL006.`);
    }

    setLoading(false);
  };

  const getShareLink = () => `${window.location.origin}${window.location.pathname}?id=${shipment?.id}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(getShareLink());
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'booked': return <FaClipboardList className="text-white" />;
      case 'delivered': return <FaCheckCircle className="text-white" />;
      case 'delayed': return <FaTimesCircle className="text-white" />;
      case 'in flight': return <FaPlane className="text-white" />;
      case 'at sea': return <FaShip className="text-white" />;
      default: return <FaHourglassHalf className="text-white" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header & Search */}
        <div className="bg-white rounded-3xl shadow-xl border border-blue-100 overflow-hidden">
          <div className="p-8 text-white text-center bg-gradient-to-r from-blue-400 to-blue-700">
            <h1 className="text-4xl font-black italic tracking-tighter uppercase mb-2">Shippitin Track</h1>
            <p className="opacity-90">Universal Logistics Intelligence</p>
          </div>
          <div className="p-8 flex flex-col sm:flex-row gap-4">
            <input 
              className="flex-grow p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-400 text-lg"
              placeholder="Search ID (AIR002, SEA003, RAIL006...)"
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleTrack()}
            />
            <button
              onClick={() => handleTrack()}
              disabled={loading}
              className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center disabled:opacity-50"
            >
              {loading ? (
                <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></span>
              ) : (
                <FaSearch className="mr-2" />
              )}
              {loading ? 'Searching...' : 'Track'}
            </button>
          </div>
          {error && <div className="p-4 bg-red-50 text-red-600 text-center font-medium border-t">{error}</div>}
        </div>

        {shipment && (
          <div className="animate-fade-in space-y-8">
            
            {/* Quick Actions / Share Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Share Tracking:</span>
                <button onClick={copyToClipboard} className={`p-2 rounded-lg transition-all ${copySuccess ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600'}`}>
                  {copySuccess ? <FaCheckCircle /> : <FaCopy />}
                </button>
                <a href={`https://wa.me/?text=Track my ${shipment.carrier} shipment here: ${getShareLink()}`} target="_blank" rel="noreferrer" className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-600 hover:text-white transition-all">
                  <FaWhatsapp />
                </a>
                <a href={`mailto:?subject=Shipment Update: ${shipment.id}&body=You can track this shipment live at: ${getShareLink()}`} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all">
                  <FaEnvelope />
                </a>
              </div>
              <div className="flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-xl">
                 <FaShieldAlt className="text-blue-600 text-xs" />
                 <span className="text-[10px] font-bold text-blue-700 uppercase">Live Public Link Active</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Live Status</span>
                  <p className={`text-2xl font-black ${shipment.status === 'Delayed' ? 'text-red-600' : 'text-green-600'}`}>{shipment.status}</p>
                  <p className="text-sm text-gray-500">{shipment.carrier}</p>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Estimated Arrival</span>
                  <p className="text-2xl font-black text-gray-800">{shipment.estimatedDelivery}</p>
                  <p className="text-sm text-gray-500">{shipment.currentLocation}</p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-emerald-500 to-green-600 p-6 rounded-3xl shadow-lg text-white relative overflow-hidden">
                <FaLeaf className="absolute -bottom-4 -right-4 text-white/10" size={120} />
                <h4 className="font-bold flex items-center mb-4"><FaLeaf className="mr-2" /> Sustainability Impact</h4>
                <div className="space-y-3">
                  <div className="flex justify-between border-b border-white/20 pb-2">
                    <span className="text-xs opacity-80">CO2 Emissions</span>
                    <span className="text-xl font-bold">{shipment.co2Emissions}kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs opacity-80">Carbon Saved</span>
                    <span className="text-xl font-bold text-emerald-200">+{shipment.co2Saved}kg</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center"><FaRobot className="mr-3 text-blue-600" /> AI Insights</h3>
                <div className="flex items-center space-x-6">
                  <div className="relative w-20 h-20">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-gray-100" />
                      <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="6" fill="transparent" strokeDasharray="226" strokeDashoffset={226 - (226 * shipment.reliabilityScore / 100)} className={shipment.reliabilityScore > 60 ? 'text-blue-500' : 'text-red-500'} />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center font-bold text-sm">{shipment.reliabilityScore}%</span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed italic">"{shipment.predictionMessage}"</p>
                </div>
              </div>

              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-800 flex items-center"><FaShieldAlt className="mr-3 text-blue-800" /> Document Vault</h3>
                  <span className="text-[9px] font-bold bg-green-100 text-green-700 px-3 py-1 rounded-full"><FaLock className="inline mr-1" /> SECURED</span>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {shipment.documents.length > 0 ? (
                    shipment.documents.map((doc, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <div className="flex items-center">
                          <FaFilePdf className="text-red-500 mr-3" />
                          <span className="text-xs font-bold text-gray-700">{doc.name}</span>
                        </div>
                        <FaDownload className="text-gray-400 hover:text-blue-600 cursor-pointer" />
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">No documents available yet.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-3">
                <div className="lg:col-span-2 h-[450px] bg-gray-50">
                  <Map path={shipment.path} shipmentType={shipment.shipmentType} statusTimeline={shipment.statusTimeline} />
                </div>
                <div className="p-8 border-l border-gray-100 max-h-[450px] overflow-y-auto">
                  <h3 className="font-bold text-gray-800 mb-8 flex items-center"><FaCalendarAlt className="mr-2 text-blue-600" /> Journey History</h3>
                  <div className="relative border-l-2 border-blue-50 ml-2 space-y-10">
                    {shipment.statusTimeline.map((item, i) => (
                      <div key={i} className="relative pl-8">
                        <div className="absolute -left-[17px] top-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shadow-lg">
                          <div className="scale-75">{getStatusIcon(item.status)}</div>
                        </div>
                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-tighter">{item.date}</p>
                        <p className="font-bold text-gray-800">{item.status}</p>
                        <p className="text-xs text-gray-500">{item.location}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default TrackPage;
