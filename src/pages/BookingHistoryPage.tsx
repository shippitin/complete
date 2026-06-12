// src/pages/BookingHistoryPage.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingAPI } from '../services/api';
import { jsPDF } from 'jspdf';
import {
  FaBoxOpen, FaTruck, FaShip, FaPlane, FaTrain, FaAnchor,
  FaMapMarkerAlt, FaCalendarAlt, FaWeight, FaRupeeSign,
  FaDownload, FaSearchLocation, FaTimes, FaPlus, FaChevronRight,
  FaBoxes, FaPencilAlt, FaSave,
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

// Local detail overrides — lets a customer complete missing sender/receiver/cargo
// info for the demo (there's no backend update endpoint yet); kept in localStorage.
const DETAILS_OVERRIDE_KEY = 'bookingDetailOverrides';
const loadDetailOverrides = (): Record<string, any> => {
  try { return JSON.parse(localStorage.getItem(DETAILS_OVERRIDE_KEY) || '{}'); } catch { return {}; }
};
const saveDetailOverride = (id: string, patch: any) => {
  const o = loadDetailOverrides(); o[id] = { ...(o[id] || {}), ...patch };
  try { localStorage.setItem(DETAILS_OVERRIDE_KEY, JSON.stringify(o)); } catch { /* quota */ }
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

// Full sender / receiver / cargo field set — mirrors the rail booking page so a
// customer can complete exactly the details they skipped there.
const SENDER_FIELDS: [string, string][] = [
  ['sender_name', 'Full Name / Company'], ['sender_phone', 'Mobile Number'],
  ['sender_email', 'Email ID'], ['sender_gstin', 'GSTIN'],
  ['sender_address', 'Address'], ['sender_city', 'City'],
  ['sender_state', 'State'], ['sender_pincode', 'Pincode'], ['sender_country', 'Country'],
];
const RECEIVER_FIELDS: [string, string][] = [
  ['receiver_name', 'Full Name / Company'], ['receiver_phone', 'Mobile Number'],
  ['receiver_email', 'Email ID'], ['receiver_gstin', 'GSTIN'],
  ['receiver_address', 'Address'], ['receiver_city', 'City'],
  ['receiver_state', 'State'], ['receiver_pincode', 'Pincode'], ['receiver_country', 'Country'],
];
const CARGO_FIELDS: [string, string][] = [
  ['goods_description', 'Description of Goods'], ['hsn_code', 'HSN Code'],
  ['nature_of_packing', 'Nature of Packing'], ['weight_per_container', 'Gross Weight / Container (MT)'],
  ['invoice_number', 'Invoice Number'], ['invoice_date', 'Invoice Date'],
  ['invoice_value', 'Invoice Value (₹)'], ['num_packages', 'No. of Packages'],
  ['package_size', 'Package Size (L×W×H cm)'], ['special_instructions', 'Special Instructions'],
];
const DETAIL_SECTIONS: [string, [string, string][]][] = [
  ['Sender Details', SENDER_FIELDS],
  ['Receiver Details', RECEIVER_FIELDS],
  ['Cargo Details', CARGO_FIELDS],
];
const ALL_DETAIL_KEYS = [...SENDER_FIELDS, ...RECEIVER_FIELDS, ...CARGO_FIELDS].map(([k]) => k);
const WIDE_DETAIL_FIELDS = new Set(['sender_address', 'receiver_address', 'goods_description', 'special_instructions', 'package_size']);
const blankDetailForm = Object.fromEntries(ALL_DETAIL_KEYS.map(k => [k, ''])) as Record<string, string>;

const BookingCard: React.FC<{
  booking: Booking;
  details?: any;
  onChangeStatus: (id: string, status: string) => void;
  onSaveDetails: (id: string, patch: any) => void;
}> = ({ booking, details, onChangeStatus, onSaveDetails }) => {
  const st = (booking.status || '').toLowerCase().replace(/[\s-]+/g, '_');
  const stKey = (st === 'intransit' || st === 'transit') ? 'in_transit' : st;
  const navigate = useNavigate();
  const statusConfig = getStatusConfig(booking.status);
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing]   = useState(false);

  const d: any = { ...booking, ...(details || {}) };
  // Complete once sender + receiver + a cargo type/description are on file. Until
  // the full record arrives (details === undefined) assume complete so the button
  // doesn't briefly flash "Edit details".
  const isComplete = details
    ? !!(details.sender_name && details.receiver_name && (details.goods_description || details.cargo_type || booking.cargo_type))
    : true;

  const [form, setForm] = useState<Record<string, string>>(blankDetailForm);
  const toggleEdit = () => {
    if (!editing) {
      setForm(Object.fromEntries(ALL_DETAIL_KEYS.map(k => [k, d[k] != null ? String(d[k]) : ''])) as Record<string, string>);
    }
    setEditing(v => !v);
  };
  const saveEdit = () => {
    onSaveDetails(booking.id, { ...form });
    setEditing(false);
    setExpanded(true);
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
          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusConfig.pill}`}>
            {statusConfig.label}
          </span>
        </div>

        {/* Details grid — From · To · Date · Cargo · Rate */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
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
          <div>
            <p className="text-xs text-gray-400 mb-0.5 flex items-center gap-1"><FaRupeeSign className="text-xs" />RATE</p>
            <p className="text-sm font-bold text-gray-900">₹{(booking.estimated_price || 0).toLocaleString('en-IN')}</p>
          </div>
        </div>

        {/* Footer: actions left · view/edit right */}
        <div className="flex items-center justify-between gap-2 flex-wrap pt-4 border-t border-gray-50">
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
          {isComplete ? (
            <button
              onClick={() => setExpanded(v => !v)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-semibold transition"
            >
              {expanded ? 'Hide details' : 'View details'}
              <FaChevronRight className={`text-[10px] transition-transform ${expanded ? 'rotate-90' : ''}`} />
            </button>
          ) : (
            <button
              onClick={toggleEdit}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-600 text-xs font-semibold transition"
            >
              <FaPencilAlt className="text-[10px]" /> {editing ? 'Close' : 'Edit details'}
            </button>
          )}
        </div>

        {/* Edit form — the same sender / receiver / cargo details as the booking page */}
        {editing && (
          <div className="mt-3 pt-4 border-t border-gray-100 space-y-4">
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Complete your booking details</p>
            {DETAIL_SECTIONS.map(([title, fields]) => (
              <div key={title}>
                <p className="text-xs font-bold text-gray-600 mb-2">{title}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {fields.map(([k, label]) => (
                    <div key={k} className={WIDE_DETAIL_FIELDS.has(k) ? 'sm:col-span-2' : ''}>
                      <label className="block text-[11px] text-gray-400 mb-0.5">{label}</label>
                      <input
                        type={k === 'invoice_date' ? 'date' : 'text'}
                        value={form[k] || ''}
                        onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <div className="flex justify-end gap-2">
              <button onClick={() => setEditing(false)} className="px-4 py-2 rounded-lg text-xs font-semibold text-gray-500 hover:bg-gray-100 transition">Cancel</button>
              <button onClick={saveEdit} disabled={!form.sender_name?.trim() || !form.receiver_name?.trim()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition disabled:opacity-40 disabled:cursor-not-allowed">
                <FaSave className="text-xs" /> Save details
              </button>
            </div>
          </div>
        )}

        {expanded && (
          <div className="mt-3 pt-4 border-t border-gray-100">
            {(() => {
              const cb: any = d.charges_breakdown || null;
              const money = (n: any) => `₹${Number(n).toLocaleString('en-IN')}`;
              const rows: [string, any][] = [
                ['Service Type',      formatRoute(d.route_type)],
                ['Booking Type',      d.service_type],
                ['Container Type',    d.container_type],
                ['No. of Containers', d.number_of_containers],
                ['Weight',            d.weight ? `${d.weight} KG` : null],
                ['Cargo Type',        d.cargo_type],
                ['Goods Description', d.goods_description],
                ['Hazardous',         d.hazardous === true ? 'Yes' : d.hazardous === false ? 'No' : null],
                ['Shipping Line',     d.shipping_line],
                ['Operator',          d.operator],
                ['Transit Time',      d.transit_time],
                ['Insurance',         d.insurance_required ? 'Yes (₹1,000)' : null],
                ['Origin',            d.origin],
                ['Destination',       d.destination],
                ['HSN Code',          d.hsn_code],
                ['Nature of Packing', d.nature_of_packing],
                ['Gross Weight / Cont.', d.weight_per_container ? `${d.weight_per_container} MT` : null],
                ['Invoice Number',    d.invoice_number],
                ['Invoice Date',      d.invoice_date ? new Date(d.invoice_date).toLocaleDateString('en-IN') : null],
                ['Invoice Value',     d.invoice_value ? `₹${Number(d.invoice_value).toLocaleString('en-IN')}` : null],
                ['No. of Packages',   d.num_packages],
                ['Package Size',      d.package_size],
                ['Special Instructions', d.special_instructions],
                ['Sender',            d.sender_name],
                ['Sender Phone',      d.sender_phone],
                ['Sender Email',      d.sender_email],
                ['Sender GSTIN',      d.sender_gstin],
                ['Sender Address',    [d.sender_address, d.sender_city, d.sender_state, d.sender_pincode].filter(Boolean).join(', ') || null],
                ['Receiver',          d.receiver_name],
                ['Receiver Phone',    d.receiver_phone],
                ['Receiver Email',    d.receiver_email],
                ['Receiver GSTIN',    d.receiver_gstin],
                ['Receiver Address',  [d.receiver_address, d.receiver_city, d.receiver_state, d.receiver_pincode].filter(Boolean).join(', ') || null],
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
  const [detailsById, setDetailsById] = useState<Record<string, any>>({});
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

  // Persist completed details locally (no backend update endpoint yet) and reflect
  // them immediately so the card flips from "Edit details" to "View details".
  const saveDetails = (id: string, patch: any) => {
    saveDetailOverride(id, patch);
    setDetailsById(prev => ({ ...prev, [id]: { ...(prev[id] || {}), ...patch } }));
  };

  useEffect(() => {
    const load = async () => {
      try {
        const response = await bookingAPI.getAll();
        const list = sortLatestFirst(applyOverrides(response.data.data || []));
        setBookings(list);
        setLoading(false);
        // The list is lean (no sender/receiver), so prefetch each full record to
        // decide View vs Edit and make expanding instant. Merge any local overrides.
        const ov = loadDetailOverrides();
        const entries = await Promise.all(list.map(async (b) => {
          try {
            const r = await bookingAPI.getById(b.id);
            const full = r.data?.data || r.data || {};
            return [b.id, { ...full, ...(ov[b.id] || {}) }] as [string, any];
          } catch {
            return [b.id, ov[b.id] ? { ...ov[b.id] } : null] as [string, any];
          }
        }));
        setDetailsById(Object.fromEntries(entries));
      } catch (error) {
        console.error('Error fetching bookings:', error);
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
              <BookingCard key={booking.id} booking={booking} details={detailsById[booking.id]} onChangeStatus={changeStatus} onSaveDetails={saveDetails} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingHistoryPage;
