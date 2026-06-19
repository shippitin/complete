// src/pages/BookingHistoryPage.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingAPI } from '../services/api';
import {
  FaBoxOpen, FaTruck, FaShip, FaPlane, FaTrain, FaAnchor,
  FaMapMarkerAlt, FaCalendarAlt, FaWeight, FaRupeeSign,
  FaSearchLocation, FaPlus, FaChevronRight,
  FaBoxes, FaPencilAlt, FaSave, FaCreditCard, FaCheckCircle,
  FaTimes, FaStream, FaTrashAlt, FaFileSignature,
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
  is_domestic?: boolean;
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

// Shared footer button styles.
const BTN_BLUE       = 'flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-semibold transition';
const BTN_BLUE_SOLID = 'flex items-center gap-1.5 px-3 py-2 rounded-lg bg-brand-gradient hover:opacity-90 text-white text-xs font-semibold transition';
const BTN_AMBER      = 'flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-600 text-xs font-semibold transition';
const BTN_SLATE      = 'flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold transition';

// Progress timeline shown by the "Shipment status" button.
// Shipment status milestones. "Customs done" and "Shipping Bill" are customs /
// export steps, so they only apply to INTERNATIONAL shipments. Domestic skips them.
const STAGES_INTL = ['Shipment Booked', 'Customs done', 'Payment done', 'Shipping Bill', 'e-Forwarding Note', 'Ready for pickup', 'In transit', 'Delivered'];
const STAGES_DOM  = ['Shipment Booked', 'Payment done', 'e-Forwarding Note', 'Ready for pickup', 'In transit', 'Delivered'];
const stagesFor = (isDomestic: boolean) => (isDomestic ? STAGES_DOM : STAGES_INTL);
// Map a booking's status (+ paid flag) to the current milestone index in its list.
// Backend doesn't track granular milestones yet, so this is an approximation.
const stageFor = (stKey: string, paid: boolean | undefined, isDomestic: boolean): number => {
  if (isDomestic) {
    // Booked(0) · Payment done(1) · e-FNote(2) · Ready(3) · In transit(4) · Delivered(5)
    switch (stKey) {
      case 'pending':    return paid ? 1 : 0;
      case 'confirmed':  return 3;
      case 'in_transit': return 4;
      case 'delivered':  return 5;
      default:           return 0;
    }
  }
  // Booked(0) · Customs(1) · Payment(2) · Shipping Bill(3) · e-FNote(4) · Ready(5) · In transit(6) · Delivered(7)
  switch (stKey) {
    case 'pending':    return paid ? 2 : 0;
    case 'confirmed':  return 5;
    case 'in_transit': return 6;
    case 'delivered':  return 7;
    default:           return 0;
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

// Payment-done flags, keyed by booking_number. The Razorpay payment page writes
// this on a verified payment (no backend "paid" flag yet), so a Pending card can
// show "Payment done" instead of "Complete payment".
const PAYMENT_DONE_KEY = 'bookingPaymentDone';
const loadPaymentDone = (): Record<string, boolean> => {
  try { return JSON.parse(localStorage.getItem(PAYMENT_DONE_KEY) || '{}'); } catch { return {}; }
};

// Locally-hidden bookings. The backend has no delete endpoint, so "Clear all"
// hides bookings from this device's view (and wipes the local demo overrides) to
// give a clean slate for walking the flow end-to-end. Keyed by booking id.
const HIDDEN_KEY = 'bookingHidden';
const loadHidden = (): string[] => {
  try { return JSON.parse(localStorage.getItem(HIDDEN_KEY) || '[]'); } catch { return []; }
};

// Treat a booking as international only when is_domestic is an explicit "false"-like
// value — handles boolean false, 0, "0", "false" from the API. true / 1 / null / unset
// (and anything else) is domestic. Keeps the tab split correct regardless of how the
// backend serialises the flag.
const bookingIsDomestic = (m: any): boolean => {
  const v = m?.is_domestic;
  return !(v === false || v === 0 || v === '0' || v === 'false' || v === 'f' || v === 'no' || v === 'No');
};

// ── Single source of truth for shipment status ──
// Documentation filed? Domestic = e-Forwarding Note only; international also needs the Shipping Bill.
const isDocsFiled = (m: any): boolean => {
  const dom = bookingIsDomestic(m);
  return dom ? !!m.efn_filed : (!!m.filing_number && !!m.efn_filed);
};
// A booking becomes a Confirmed shipment only once BOTH documentation AND payment are done.
// Used by the card, the filter-tab counts and the shipment detail page so they never disagree.
const effectiveStatusKey = (rawStatus: string | undefined, docsFiled: boolean, paid: boolean): string => {
  const x = (rawStatus || '').toLowerCase().trim().replace(/[\s-]+/g, '_');
  const norm = (x === 'intransit' || x === 'transit') ? 'in_transit' : x;
  return (norm === 'pending' && docsFiled && paid) ? 'confirmed' : norm;
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
  paid?: boolean;
  onSaveDetails: (id: string, patch: any) => void;
}> = ({ booking, details, paid, onSaveDetails }) => {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing]   = useState(false);
  const [showStatus, setShowStatus] = useState(false);
  const isDomesticBooking = bookingIsDomestic(booking);

  const d: any = { ...booking, ...(details || {}) };

  const docsFiled = isDocsFiled(d);
  // Confirmed only once BOTH documentation and payment are done (shared rule).
  const stKey = effectiveStatusKey(booking.status, docsFiled, !!paid);
  const statusConfig = getStatusConfig(stKey);
  const stages = stagesFor(isDomesticBooking);
  const stageIndex = stageFor(stKey, paid, isDomesticBooking);

  const [form, setForm] = useState<Record<string, string>>(blankDetailForm);
  const saveEdit = () => {
    onSaveDetails(booking.id, { ...form });
    setEditing(false);
    setExpanded(true);
  };

  // "Complete payment" → straight to the Razorpay payment page. Pass booking_number
  // as the id (backend keys payment verify by booking_number).
  const goPayment = () => {
    navigate('/payment', {
      state: {
        bookingId: booking.booking_number,
        amount: booking.estimated_price,
        bookingNumber: booking.booking_number,
        serviceType: booking.service_type,
      },
    });
  };

  // "Complete booking" opens the full rail booking-confirmation page
  // (Sender → Receiver → Cargo → Add-ons → Payment), prefilled. We pass the
  // existing booking ref so the page completes THIS booking (no duplicate).
  const goComplete = (initialStep: number) => {
    const cb: any = d.charges_breakdown || null;
    const basePrice = cb?.base ?? booking.estimated_price ?? 0;
    const st = d.route_type || 'terminalToTerminal';
    const doorO = ['doorToDoor', 'doorToTerminal', 'doorToPort'].includes(st);
    const doorD = ['doorToDoor', 'terminalToDoor', 'portToDoor'].includes(st);
    const formData = {
      bookingType:        booking.service_type || 'Train Container Booking',
      containerType:      d.container_type || '20ft Standard',
      numberOfContainers: d.number_of_containers || 1,
      serviceType:        st,
      isDomestic:         d.is_domestic !== false,
      hazardousCargo:     !!d.hazardous,
      cargoType:          booking.cargo_type || 'General',
      totalWeight:        booking.weight || 0,
      addFirstMile:       (cb?.fm || 0) > 0 || doorO,   // re-select first/last mile as before
      addLastMile:        (cb?.lm || 0) > 0 || doorD,
    };
    const selectedTrainResult = {
      id:                 booking.booking_number,
      price:              basePrice,
      originStation:      booking.origin,
      destinationStation: booking.destination,
      transitDuration:    d.transit_time || '—',
      operator:           d.operator || 'CONCOR',
      serviceName:        booking.service_type,
    };
    const prefill = {
      sender: {
        name: d.sender_name, phone: d.sender_phone, email: d.sender_email, gstin: d.sender_gstin,
        address: d.sender_address, city: d.sender_city, state: d.sender_state, pincode: d.sender_pincode, country: d.sender_country,
      },
      receiver: {
        name: d.receiver_name, phone: d.receiver_phone, email: d.receiver_email, gstin: d.receiver_gstin,
        address: d.receiver_address, city: d.receiver_city, state: d.receiver_state, pincode: d.receiver_pincode, country: d.receiver_country,
      },
      cargo: {
        goodsDescription: d.goods_description, hsnCode: d.hsn_code, natureOfPacking: d.nature_of_packing,
        weightPerContainer: d.weight_per_container, invoiceNumber: d.invoice_number, invoiceDate: d.invoice_date,
        invoiceValue: d.invoice_value, numPackages: d.num_packages, packageSize: d.package_size,
        specialInstructions: d.special_instructions,
      },
      filing: d.filing_number,
      efnFiled: d.efn_filed,
    };
    navigate('/rail-booking-confirmation', {
      state: {
        formData,
        selectedTrainResult,
        initialInsuranceRequired: !!d.insurance_required,
        shippingLine: d.shipping_line || '',
        initialStep,
        existing: { id: booking.id, booking_number: booking.booking_number },
        prefill,
      },
    });
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

        {/* Footer: status-driven actions, right-aligned. A Pending booking turns Confirmed only
            once BOTH documentation and payment are done.
            • Pending   → Complete booking (if details missing) · Complete documentation (if unfiled) · Complete payment (if unpaid)
            • Confirmed → Complete payment (if still unpaid) · Track · Shipment status · View shipment
            • In Transit→ Track + View shipment + Shipment status
            • Delivered / Cancelled → View shipment */}
        <div className="flex items-center justify-end gap-2 flex-wrap pt-4 border-t border-gray-50">
          {stKey === 'pending' && (
            <>
              {!docsFiled && (
                <button onClick={() => goComplete(0)} className={BTN_AMBER}>
                  <FaFileSignature className="text-[11px]" /> Complete documentation
                </button>
              )}
              {!paid && (
                <button onClick={goPayment} className={BTN_BLUE_SOLID}>
                  <FaCreditCard className="text-xs" /> Complete payment
                </button>
              )}
            </>
          )}

          {/* Confirmed but unpaid → still offer payment (filing confirms the shipment; payment is separate). */}
          {stKey === 'confirmed' && !paid && (
            <button onClick={goPayment} className={BTN_BLUE_SOLID}>
              <FaCreditCard className="text-xs" /> Complete payment
            </button>
          )}

          {paid && (stKey === 'pending' || stKey === 'confirmed') && (
            <span className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-green-50 text-green-600 text-xs font-semibold">
              <FaCheckCircle className="text-xs" /> Paid
            </span>
          )}

          {/* Track available once the shipment is Confirmed (and while In Transit). */}
          {(stKey === 'confirmed' || stKey === 'in_transit') && (
            <button onClick={() => navigate(`/track?id=${booking.booking_number}`)} className={BTN_BLUE}>
              <FaSearchLocation className="text-xs" /> Track
            </button>
          )}

          {(stKey === 'pending' || stKey === 'confirmed' || stKey === 'in_transit') && (
            <button onClick={() => setShowStatus(true)} className={BTN_SLATE}>
              <FaStream className="text-xs" /> Shipment status
            </button>
          )}

          {/* View shipment — opens the full shipment page (all details + documents) */}
          <button onClick={() => navigate(`/shipment/${booking.id}`, { state: { booking: d } })} className={BTN_BLUE}>
            View shipment <FaChevronRight className="text-[10px]" />
          </button>
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
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand-gradient hover:opacity-90 text-white text-xs font-bold transition disabled:opacity-40 disabled:cursor-not-allowed">
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

      {/* Shipment status — progress timeline modal */}
      {showStatus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowStatus(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-1">
              <div className="min-w-0">
                <h3 className="text-base font-bold text-gray-800">Shipment status</h3>
                <p className="text-xs text-gray-400 truncate">{booking.booking_number} · {booking.origin} → {booking.destination}</p>
              </div>
              <button onClick={() => setShowStatus(false)} className="text-gray-400 hover:text-gray-600 ml-2 flex-shrink-0">
                <FaTimes />
              </button>
            </div>
            <div className="mt-5">
              {stages.map((stage, i) => {
                const done   = i < stageIndex;
                const active = i === stageIndex;
                const last   = i === stages.length - 1;
                return (
                  <div key={stage} className="flex items-stretch gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold ${
                        done ? 'bg-green-500 text-white' : active ? 'bg-brand-gradient text-white ring-4 ring-blue-100' : 'bg-gray-100 text-gray-400'
                      }`}>
                        {done ? <FaCheckCircle className="text-xs" /> : i + 1}
                      </div>
                      {!last && <div className={`w-0.5 flex-1 min-h-[28px] ${i < stageIndex ? 'bg-green-400' : 'bg-gray-200'}`} />}
                    </div>
                    <div className="pb-5">
                      <p className={`text-sm font-semibold ${active ? 'text-blue-700' : done ? 'text-gray-700' : 'text-gray-400'}`}>{stage}</p>
                      <p className="text-xs text-gray-400">{active ? 'Current stage' : done ? 'Completed' : 'Upcoming'}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

const BookingHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [detailsById, setDetailsById] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  // Top-level split: International first, then Domestic. Remember the last-selected
  // tab so a refresh stays where the user was (instead of snapping back to International).
  const [routeTab, setRouteTab] = useState<'international' | 'domestic'>(
    () => (localStorage.getItem('myShipmentsTab') === 'domestic' ? 'domestic' : 'international')
  );
  // Read once per mount; the payment page (a separate route) sets these, so a
  // return to this page remounts and picks up the fresh "paid" flags.
  const [paidByNumber] = useState<Record<string, boolean>>(loadPaymentDone);

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
        const hidden = new Set(loadHidden());
        const list = sortLatestFirst(applyOverrides(response.data.data || [])).filter(b => !hidden.has(b.id));
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

  // "Clear all" — there's no backend delete, so hide every currently-loaded
  // booking on this device and wipe the local demo overrides for a clean slate.
  // New bookings made afterwards still show (they get fresh, un-hidden ids).
  const clearAll = () => {
    if (!window.confirm('Clear all shipments from this view?\n\nThis wipes the local demo state (status / details / payment) so you can walk the flow from scratch. New shipments you make will show normally.')) return;
    try {
      const hidden = new Set(loadHidden());
      bookings.forEach(b => hidden.add(b.id));
      localStorage.setItem(HIDDEN_KEY, JSON.stringify([...hidden]));
      localStorage.removeItem(STATUS_OVERRIDE_KEY);
      localStorage.removeItem(DETAILS_OVERRIDE_KEY);
      localStorage.removeItem(PAYMENT_DONE_KEY);
    } catch { /* quota */ }
    setBookings([]);
    setDetailsById({});
    setFilter('All');
  };

  // Effective status for a booking — the SAME rule the card uses (docs + payment → Confirmed),
  // so the filter tabs and counts always match the badge shown on each card.
  const effOf = (b: Booking) => {
    const merged = { ...b, ...(detailsById[b.id] || {}) };
    return effectiveStatusKey(b.status, isDocsFiled(merged), !!paidByNumber[b.booking_number]);
  };

  // International vs Domestic (robust to non-boolean is_domestic from the API).
  const isIntl = (b: Booking) => !bookingIsDomestic(b);
  const intlTotal = bookings.filter(isIntl).length;
  const domTotal  = bookings.length - intlTotal;
  const scoped = bookings.filter(b => isIntl(b) === (routeTab === 'international'));

  const filters = ['All', 'pending', 'confirmed', 'in_transit', 'delivered', 'cancelled'];
  const filtered = filter === 'All'
    ? scoped
    : scoped.filter(b => effOf(b) === filter);

  const counts = {
    All: scoped.length,
    pending:    scoped.filter(b => effOf(b) === 'pending').length,
    confirmed:  scoped.filter(b => effOf(b) === 'confirmed').length,
    in_transit: scoped.filter(b => effOf(b) === 'in_transit').length,
    delivered:  scoped.filter(b => effOf(b) === 'delivered').length,
    cancelled:  scoped.filter(b => effOf(b) === 'cancelled').length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky header */}
      <div className="sticky top-16 z-30 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <FaBoxOpen className="text-blue-500" /> My Shipments
          </h1>
          <div className="flex items-center gap-2">
            {bookings.length > 0 && (
              <button
                onClick={clearAll}
                title="Clear all shipments from this view"
                className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-xl text-sm font-bold transition"
              >
                <FaTrashAlt className="text-xs" /> Clear all
              </button>
            )}
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 bg-brand-gradient hover:opacity-90 text-white px-4 py-2 rounded-xl text-sm font-bold transition"
            >
              <FaPlus className="text-xs" /> New Shipment
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 pt-4 pb-8">
        {/* International / Domestic split — International first */}
        <div className="mb-5">
          <div className="inline-flex rounded-xl bg-gray-100 p-1">
            {([
              { key: 'international' as const, label: 'International', icon: '🌐', count: intlTotal },
              { key: 'domestic'      as const, label: 'Domestic',      icon: '🇮🇳', count: domTotal },
            ]).map(t => (
              <button
                key={t.key}
                onClick={() => { setRouteTab(t.key); setFilter('All'); try { localStorage.setItem('myShipmentsTab', t.key); } catch { /* quota */ } }}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2 ${
                  routeTab === t.key ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <span>{t.icon}</span> {t.label}
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                  routeTab === t.key ? 'bg-blue-50 text-blue-600' : 'bg-gray-200 text-gray-500'
                }`}>
                  {t.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Status filter tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {filters.map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition flex items-center gap-1.5 ${
                filter === status
                  ? 'bg-brand-gradient text-white shadow-sm'
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
            <p className="text-gray-400 text-lg font-medium mb-2">No {routeTab} shipments found</p>
            <p className="text-gray-300 text-sm mb-6">
              {filter === 'All' ? `You have no ${routeTab} shipments yet` : `No ${filter} ${routeTab} shipments`}
            </p>
            {filter === 'All' && (
              <button
                onClick={() => navigate('/')}
                className="bg-brand-gradient text-white px-6 py-2.5 rounded-xl font-bold hover:opacity-90 transition text-sm"
              >
                Create First Shipment
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(booking => (
              <BookingCard key={booking.id} booking={booking} details={detailsById[booking.id]} paid={!!paidByNumber[booking.booking_number]} onSaveDetails={saveDetails} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingHistoryPage;
