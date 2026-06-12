// src/pages/BookingHistoryPage.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingAPI } from '../services/api';
import { jsPDF } from 'jspdf';
import {
  FaBoxOpen, FaTruck, FaShip, FaPlane, FaTrain, FaAnchor,
  FaMapMarkerAlt, FaCalendarAlt, FaWeight, FaRupeeSign,
  FaDownload, FaSearchLocation, FaTimes, FaPlus, FaChevronRight,
  FaCheckCircle, FaClock, FaTimesCircle, FaBoxes,
} from 'react-icons/fa';

interface Booking {
  id: string;
  booking_number: string;
  service_type: string;
  status: string;
  booking_date: string;
  created_at?: string;
  estimated_price: number;
  origin: string;
  destination: string;
  cargo_type: string;
  weight: number;
  container_type?: string;
  number_of_containers?: number;
}

const getServiceIcon = (type: string) => {
  switch (type?.toLowerCase()) {
    case 'truck':   return <FaTruck className="text-orange-500" />;
    case 'sea':     return <FaShip className="text-blue-500" />;
    case 'air':     return <FaPlane className="text-sky-500" />;
    case 'rail':
    case 'train':   return <FaTrain className="text-green-500" />;
    case 'port':    return <FaAnchor className="text-indigo-500" />;
    case 'parcel':  return <FaBoxes className="text-yellow-500" />;
    default:        return <FaBoxOpen className="text-gray-400" />;
  }
};

const getStatusConfig = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'confirmed': return { label: 'Confirmed', pill: 'bg-green-50 text-green-700 border border-green-200', dot: 'bg-green-500', border: '#22c55e' };
    case 'pending':   return { label: 'Pending',   pill: 'bg-yellow-50 text-yellow-700 border border-yellow-200', dot: 'bg-yellow-500', border: '#eab308' };
    case 'in_transit':
    case 'in transit':
    case 'intransit':
    case 'transit':   return { label: 'In Transit', pill: 'bg-indigo-50 text-indigo-700 border border-indigo-200', dot: 'bg-indigo-500', border: '#6366f1' };
    case 'delivered': return { label: 'Delivered', pill: 'bg-blue-50 text-blue-700 border border-blue-200', dot: 'bg-blue-500', border: '#3b82f6' };
    case 'cancelled': return { label: 'Cancelled', pill: 'bg-red-50 text-red-700 border border-red-200', dot: 'bg-red-500', border: '#ef4444' };
    default:          return { label: status,      pill: 'bg-gray-50 text-gray-600 border border-gray-200', dot: 'bg-gray-400', border: 'transparent' };
  }
};

// Local status overrides — so a Cancel reflects immediately (past the backend's
// ~1-min list cache) and so a booking can be moved to In Transit / Delivered for demo.
const STATUS_OVERRIDE_KEY = 'bookingStatusOverrides';
const loadStatusOverrides = (): Record<string, string> => {
  try { return JSON.parse(localStorage.getItem(STATUS_OVERRIDE_KEY) || '{}'); } catch { return {}; }
};
const saveStatusOverride = (id: string, status: string) => {
  const o = loadStatusOverrides(); o[id] = status;
  try { localStorage.setItem(STATUS_OVERRIDE_KEY, JSON.stringify(o)); } catch { /* quota */ }
};

const formatRoute = (st?: string): string | null => {
  if (!st) return null;
  const map: Record<string, string> = {
    terminalToTerminal: 'Terminal to Terminal', doorToDoor: 'Door to Door',
    doorToTerminal: 'Door to Terminal', terminalToDoor: 'Terminal to Door',
    terminalToPort: 'Terminal to Port', doorToPort: 'Door to Port',
    portToTerminal: 'Port to Terminal', portToDoor: 'Port to Door',
  };
  return map[st] || st;
};

const BookingCard: React.FC<{ booking: Booking; onChangeStatus: (id: string, status: string) => void }> = ({ booking, onChangeStatus }) => {
  const st = (booking.status || '').toLowerCase().replace(/[\s-]+/g, '_');
  const stKey = (st === 'intransit' || st === 'transit') ? 'in_transit' : st;
  const navigate = useNavigate();
  const statusConfig = getStatusConfig(booking.status);
  const [expanded, setExpanded] = useState(false);
  const [details, setDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const toggleExpand = async () => {
    const next = !expanded;
    setExpanded(next);
    if (next && !details) {
      setLoadingDetails(true);
      try {
        const res = await bookingAPI.getById(booking.id);
        setDetails(res.data?.data || res.data || null);
      } catch { /* fall back to the list data we already have */ }
      finally { setLoadingDetails(false); }
    }
  };

  const handleDownload = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.setTextColor(37, 99, 235);
    doc.text('SHIPPITIN', 20, 20);
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text('Booking Summary', 20, 28);
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 32, 190, 32);
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(12);
    const lines = [
      `Booking ID    : ${booking.booking_number}`,
      `Service       : ${booking.service_type}`,
      `From          : ${booking.origin}`,
      `To            : ${booking.destination}`,
      `Date          : ${new Date(booking.booking_date).toLocaleDateString('en-IN')}`,
      `Weight        : ${booking.weight} kg`,
      `Cargo Type    : ${booking.cargo_type}`,
      `Status        : ${booking.status}`,
      `Amount        : Rs ${(booking.estimated_price || 0).toLocaleString('en-IN')}`,
    ];
    lines.forEach((line, i) => doc.text(line, 20, 44 + i * 12));
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text('Generated by Shippitin Logistics · shippitin.co', 20, 180);
    doc.save(`${booking.booking_number}_summary.pdf`);
  };

  return (
    <div
      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
      style={{ borderLeft: `4px solid ${statusConfig.border}` }}
    >
      <div className="p-6">
        {/* Header row */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-lg">
              {getServiceIcon(booking.service_type)}
            </div>
            <div>
              <p className="font-bold text-blue-600 text-base">{booking.booking_number}</p>
              <p className="text-xs text-gray-400">{booking.service_type}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusConfig.pill}`}>
              {statusConfig.label}
            </span>
            <select
              value={stKey || 'pending'}
              onChange={e => onChangeStatus(booking.id, e.target.value)}
              title="Set status"
              className="text-xs border border-gray-200 rounded-lg px-2 py-1 text-gray-500 bg-white cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-300"
            >
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="in_transit">In Transit</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          <div>
            <p className="text-xs text-gray-400 mb-0.5 flex items-center gap-1"><FaMapMarkerAlt className="text-xs" />FROM</p>
            <p className="text-sm font-semibold text-gray-700 truncate">{booking.origin}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-0.5 flex items-center gap-1"><FaMapMarkerAlt className="text-xs" />TO</p>
            <p className="text-sm font-semibold text-gray-700 truncate">{booking.destination}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-0.5 flex items-center gap-1"><FaCalendarAlt className="text-xs" />DATE</p>
            <p className="text-sm font-semibold text-gray-700">{new Date(booking.booking_date).toLocaleDateString('en-IN')}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-0.5 flex items-center gap-1"><FaWeight className="text-xs" />CARGO</p>
            <p className="text-sm font-semibold text-gray-700 truncate">{booking.cargo_type || 'General'}</p>
          </div>
        </div>

        {/* Footer: amount + actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-50">
          <p className="text-xl font-black text-gray-900 flex items-center gap-1">
            <FaRupeeSign className="text-base text-blue-500" />
            {(booking.estimated_price || 0).toLocaleString('en-IN')}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-semibold transition"
            >
              <FaDownload className="text-xs" /> PDF
            </button>
            <button
              onClick={() => navigate(`/track?id=${booking.booking_number}`)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-semibold transition"
            >
              <FaSearchLocation className="text-xs" /> Track
            </button>
            <button
              onClick={() => { if (window.confirm(`Cancel shipment ${booking.booking_number}? The entire booking will be cancelled.`)) onChangeStatus(booking.id, 'cancelled'); }}
              disabled={stKey === 'cancelled' || stKey === 'delivered'}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 text-xs font-semibold transition disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <FaTimes className="text-xs" /> Cancel
            </button>
          </div>
        </div>

        {/* View details — full booking breakdown */}
        <button
          onClick={toggleExpand}
          className="mt-4 w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700"
        >
          {expanded ? 'Hide details' : 'View details'}
          <FaChevronRight className={`text-[10px] transition-transform ${expanded ? 'rotate-90' : ''}`} />
        </button>

        {expanded && (
          <div className="mt-3 pt-4 border-t border-gray-100">
            {loadingDetails ? (
              <p className="text-xs text-gray-400 text-center py-2">Loading details…</p>
            ) : (() => {
              const d: any = { ...booking, ...(details || {}) };
              const cb: any = d.charges_breakdown || null;
              const money = (n: any) => `₹${Number(n).toLocaleString('en-IN')}`;
              const rows: [string, any][] = [
                ['Service Type',      formatRoute(d.route_type)],
                ['Booking Type',      d.service_type],
                ['Container Type',    d.container_type],
                ['No. of Containers', d.number_of_containers],
                ['Weight',            d.weight ? `${d.weight} KG` : null],
                ['Cargo Type',        d.cargo_type],
                ['Hazardous',         d.hazardous === true ? 'Yes' : d.hazardous === false ? 'No' : null],
                ['Shipping Line',     d.shipping_line],
                ['Operator',          d.operator],
                ['Transit Time',      d.transit_time],
                ['Insurance',         d.insurance_required ? 'Yes (₹1,000)' : null],
                ['Origin',            d.origin],
                ['Destination',       d.destination],
                ['Sender',            d.sender_name],
                ['Sender Phone',      d.sender_phone],
                ['Receiver',          d.receiver_name],
                ['Receiver Phone',    d.receiver_phone],
                ['Booking Date',      d.booking_date ? new Date(d.booking_date).toLocaleDateString('en-IN') : null],
                ['Status',            statusConfig.label],
              ];
              const chargeLines: [string, any][] = cb ? [
                ['Base Rail Freight', cb.base],
                ['Terminal Handling (THC)', (cb.thcO || 0) + (cb.thcD || 0) || null],
                ['Other Terminal Charges', cb.other],
                ['First Mile', cb.fm],
                ['Last Mile', cb.lm],
                ['Cargo Insurance', cb.insAmt],
                ['Platform Fee', cb.pf],
                ['Total GST', cb.totalGST],
              ] : [];
              return (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3">
                    {rows.filter(([, v]) => v !== null && v !== undefined && v !== '').map(([label, value]) => (
                      <div key={label}>
                        <p className="text-[11px] text-gray-400 mb-0.5">{label}</p>
                        <p className="text-sm font-semibold text-gray-700 break-words">{value}</p>
                      </div>
                    ))}
                  </div>

                  {cb && (
                    <div className="mt-4 pt-3 border-t border-gray-100">
                      <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-2">Charges Breakup</p>
                      <div className="space-y-1 text-xs bg-gray-50 rounded-xl p-3">
                        {chargeLines.filter(([, v]) => v).map(([label, v]) => (
                          <div key={label} className="flex justify-between">
                            <span className="text-gray-500">{label}</span>
                            <span className="font-medium text-gray-700">{money(v)}</span>
                          </div>
                        ))}
                        {cb.grand != null && (
                          <div className="flex justify-between pt-1.5 mt-1 border-t border-gray-200 font-bold text-gray-800">
                            <span>Grand Total</span><span>{money(cb.grand)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
};

const BookingHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  // Apply local status overrides on top of the fetched bookings
  const applyOverrides = (list: Booking[]): Booking[] => {
    const ov = loadStatusOverrides();
    return list.map(b => (ov[b.id] ? { ...b, status: ov[b.id] } : b));
  };

  // Newest booking first — prefer the precise created_at timestamp, fall back to
  // the (date-only) booking_date so same-day bookings still order sensibly.
  const sortLatestFirst = (list: Booking[]): Booking[] =>
    [...list].sort((a, b) => {
      const ta = new Date(a.created_at || a.booking_date || 0).getTime() || 0;
      const tb = new Date(b.created_at || b.booking_date || 0).getTime() || 0;
      return tb - ta;
    });

  const changeStatus = (id: string, status: string) => {
    setBookings(prev => prev.map(b => (b.id === id ? { ...b, status } : b)));
    saveStatusOverride(id, status);
    if (status === 'cancelled') bookingAPI.cancel(id).catch(() => { /* keep optimistic UI */ });
  };

  useEffect(() => {
    const load = async () => {
      try {
        const response = await bookingAPI.getAll();
        setBookings(sortLatestFirst(applyOverrides(response.data.data || [])));
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Normalise status variants ("In Transit" / "in-transit" / "intransit") to one key.
  const normStatus = (s?: string) => {
    const x = (s || '').toLowerCase().trim().replace(/[\s-]+/g, '_');
    return (x === 'intransit' || x === 'transit') ? 'in_transit' : x;
  };

  const filters = ['All', 'pending', 'confirmed', 'in_transit', 'delivered', 'cancelled'];
  const filtered = filter === 'All'
    ? bookings
    : bookings.filter(b => normStatus(b.status) === filter);

  const counts = {
    All: bookings.length,
    pending:    bookings.filter(b => normStatus(b.status) === 'pending').length,
    confirmed:  bookings.filter(b => normStatus(b.status) === 'confirmed').length,
    in_transit: bookings.filter(b => normStatus(b.status) === 'in_transit').length,
    delivered:  bookings.filter(b => normStatus(b.status) === 'delivered').length,
    cancelled:  bookings.filter(b => normStatus(b.status) === 'cancelled').length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky header */}
      <div className="sticky top-16 z-30 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <FaBoxOpen className="text-blue-500" /> My Bookings
          </h1>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition"
          >
            <FaPlus className="text-xs" /> New Booking
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 pt-4 pb-8">
        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {filters.map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition flex items-center gap-1.5 ${
                filter === status
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-gray-500 border border-gray-200 hover:border-blue-300 hover:text-blue-600'
              }`}
            >
              {status === 'in_transit' ? 'In Transit' : status.charAt(0).toUpperCase() + status.slice(1)}
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                filter === status ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
              }`}>
                {counts[status as keyof typeof counts]}
              </span>
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
                <div className="h-5 bg-gray-100 rounded w-1/3 mb-3" />
                <div className="h-4 bg-gray-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <FaBoxOpen className="text-gray-200 text-6xl mx-auto mb-4" />
            <p className="text-gray-400 text-lg font-medium mb-2">No bookings found</p>
            <p className="text-gray-300 text-sm mb-6">
              {filter === 'All' ? 'Create your first booking to get started' : `No ${filter} bookings`}
            </p>
            {filter === 'All' && (
              <button
                onClick={() => navigate('/')}
                className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition text-sm"
              >
                Create First Booking
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(booking => (
              <BookingCard key={booking.id} booking={booking} onChangeStatus={changeStatus} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingHistoryPage;
