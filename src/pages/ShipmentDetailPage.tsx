// src/pages/ShipmentDetailPage.tsx
//
// Full shipment view, opened from "View shipment" on My Shipments. Shows all
// details + charges, and lets the user open/print shipment documents
// (Summary, Invoice, Shipping Bill, e-Forwarding Note, Freight Bill).
// "Back" returns to My Shipments.
//
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { bookingAPI } from '../services/api';
import {
  FaArrowLeft, FaFilePdf, FaFileInvoiceDollar, FaFileAlt, FaFileSignature, FaReceipt,
} from 'react-icons/fa';

const brandGradient = { background: 'linear-gradient(to right, #53b2fe, #065af3)' };

const getStatusLabel = (status?: string) => {
  switch ((status || '').toLowerCase().replace(/[\s-]+/g, '_')) {
    case 'confirmed':  return 'Confirmed';
    case 'pending':    return 'Pending';
    case 'in_transit':
    case 'intransit':
    case 'transit':    return 'In Transit';
    case 'delivered':  return 'Delivered';
    case 'cancelled':  return 'Cancelled';
    default:           return status || '—';
  }
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

const money = (n: any) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

const DETAILS_OVERRIDE_KEY = 'bookingDetailOverrides';
const STATUS_OVERRIDE_KEY  = 'bookingStatusOverrides';
const readJSON = (k: string): Record<string, any> => {
  try { return JSON.parse(localStorage.getItem(k) || '{}'); } catch { return {}; }
};

// ── Printable document builder — opens a branded, print-ready page ──
const DOC_TITLES: Record<string, string> = {
  summary: 'Shipment Summary', invoice: 'Tax Invoice', shipping_bill: 'Shipping Bill',
  challan: 'e-Forwarding Note / Challan', bill: 'Freight Bill',
};

const buildDocHTML = (kind: string, b: any): string => {
  const cb = b.charges_breakdown || {};
  const title = DOC_TITLES[kind] || 'Document';
  const ref = b.booking_number || '—';
  const esc = (v: any) => String(v).replace(/[<>&]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c] as string));
  const row = (l: string, v: any) => (v !== null && v !== undefined && v !== '') ? `<tr><td class="l">${l}</td><td class="v">${esc(v)}</td></tr>` : '';
  const senderAddr = [b.sender_address, b.sender_city, b.sender_state, b.sender_pincode].filter(Boolean).join(', ');
  const receiverAddr = [b.receiver_address, b.receiver_city, b.receiver_state, b.receiver_pincode].filter(Boolean).join(', ');
  const showCharges = kind === 'invoice' || kind === 'bill';
  const showCargo   = kind === 'shipping_bill' || kind === 'challan';
  const chargeRows = showCharges ? [
    row('Base Rail Freight', cb.base != null ? money(cb.base) : ''),
    row('Terminal Handling (THC)', (cb.thcO || cb.thcD) ? money((cb.thcO || 0) + (cb.thcD || 0)) : ''),
    row('First / Last Mile', (cb.fm || cb.lm) ? money((cb.fm || 0) + (cb.lm || 0)) : ''),
    row('Cargo Insurance', cb.insAmt ? money(cb.insAmt) : ''),
    row('Platform Fee', cb.pf != null ? money(cb.pf) : ''),
    row('Total GST', cb.totalGST != null ? money(cb.totalGST) : ''),
    cb.grand != null ? `<tr><td class="l" style="font-weight:700">Grand Total</td><td class="v" style="font-weight:700">${money(cb.grand)}</td></tr>` : '',
  ].join('') : '';
  const cargoRows = showCargo ? [
    row('HSN Code', b.hsn_code), row('Invoice No.', b.invoice_number),
    row('Invoice Value', b.invoice_value ? money(b.invoice_value) : ''),
    row('Gross Weight / Container', b.weight_per_container ? `${b.weight_per_container} MT` : ''),
    row('No. of Packages', b.num_packages), row('Nature of Packing', b.nature_of_packing),
  ].join('') : '';
  return `<!doctype html><html><head><meta charset="utf-8"><title>${title} ${ref}</title>
  <style>
    *{box-sizing:border-box} body{font-family:Arial,Helvetica,sans-serif;color:#1f2937;margin:0;padding:32px;max-width:820px}
    .top{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #065af3;padding-bottom:12px;margin-bottom:6px}
    .brand{font-size:26px;font-weight:800;letter-spacing:1px;color:#0b1324}
    .doc{font-size:18px;font-weight:700;color:#065af3;text-transform:uppercase}
    .muted{color:#6b7280;font-size:12px}
    h3{font-size:12px;text-transform:uppercase;letter-spacing:.5px;color:#6b7280;margin:18px 0 6px}
    table{width:100%;border-collapse:collapse;font-size:13px}
    td{padding:5px 4px;border-bottom:1px solid #eef1f5;vertical-align:top}
    td.l{color:#6b7280;width:42%} td.v{font-weight:600}
    .two{display:flex;gap:24px} .two>div{flex:1}
    .foot{margin-top:28px;font-size:11px;color:#9ca3af;text-align:center;border-top:1px solid #eee;padding-top:10px}
    .btn{display:inline-block;margin:14px 0;padding:10px 18px;background:#065af3;color:#fff;border-radius:8px;font-weight:700;font-size:13px;cursor:pointer;border:none}
    @media print{.noprint{display:none}}
  </style></head><body>
  <div class="top">
    <div><div class="brand">SHIPPITIN</div><div class="muted">Shippitin Logistics &middot; shippitin.co</div></div>
    <div style="text-align:right"><div class="doc">${title}</div><div class="muted">Ref: ${ref}</div><div class="muted">Date: ${new Date(b.booking_date || Date.now()).toLocaleDateString('en-IN')}</div></div>
  </div>
  <button class="btn noprint" onclick="window.print()">Save as PDF / Print</button>
  <h3>Shipment</h3>
  <table>
    ${row('Booking No.', b.booking_number)}${row('Service', b.service_type)}${row('Route', formatRoute(b.route_type))}
    ${row('From', b.origin)}${row('To', b.destination)}${row('Operator', b.operator)}${row('Transit', b.transit_time)}
    ${row('Container', b.container_type)}${row('No. of Containers', b.number_of_containers)}
    ${row('Cargo', b.cargo_type)}${row('Goods', b.goods_description)}${row('Shipping Bill No.', b.filing_number)}${row('e-Forwarding Note', b.efn_filed ? 'Filed' : '')}${row('Status', getStatusLabel(b.status))}
  </table>
  <div class="two">
    <div><h3>Sender / Consignor</h3><table>${row('Name', b.sender_name)}${row('Phone', b.sender_phone)}${row('Email', b.sender_email)}${row('GSTIN', b.sender_gstin)}${row('Address', senderAddr)}</table></div>
    <div><h3>Receiver / Consignee</h3><table>${row('Name', b.receiver_name)}${row('Phone', b.receiver_phone)}${row('Email', b.receiver_email)}${row('GSTIN', b.receiver_gstin)}${row('Address', receiverAddr)}</table></div>
  </div>
  ${showCargo ? `<h3>Cargo &amp; Documents</h3><table>${cargoRows}</table>` : ''}
  ${showCharges ? `<h3>Charges</h3><table>${chargeRows}</table>` : ''}
  <div class="foot">System-generated ${title.toLowerCase()} for ${ref} &middot; &copy; Shippitin Logistics</div>
  </body></html>`;
};

const openDocument = (kind: string, b: any) => {
  const w = window.open('', '_blank');
  if (!w) return;
  w.document.write(buildDocHTML(kind, b));
  w.document.close();
};

const ShipmentDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [b, setB] = useState<any>((location.state as any)?.booking || null);
  const [loading, setLoading] = useState(!((location.state as any)?.booking));

  // Refresh / deep-link fallback: fetch by id and merge any local overrides.
  useEffect(() => {
    if (b || !id) { setLoading(false); return; }
    (async () => {
      try {
        const r = await bookingAPI.getById(id);
        const full = r.data?.data || r.data || {};
        const dov = readJSON(DETAILS_OVERRIDE_KEY)[id] || {};
        const sov = readJSON(STATUS_OVERRIDE_KEY)[id];
        setB({ ...full, ...dov, ...(sov ? { status: sov } : {}) });
      } catch {
        setB(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, b]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent" />
    </div>
  );
  if (!b) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center bg-white p-10 rounded-2xl shadow">
        <p className="text-gray-500 mb-4">Shipment not found.</p>
        <button onClick={() => navigate('/my-bookings')} className="bg-blue-600 text-white px-6 py-2 rounded-lg">Back to My Shipments</button>
      </div>
    </div>
  );

  const cb = b.charges_breakdown || null;

  const detailRows: [string, any][] = [
    ['Service Type', formatRoute(b.route_type)],
    ['Booking Type', b.service_type],
    ['Container Type', b.container_type],
    ['No. of Containers', b.number_of_containers],
    ['Weight', b.weight ? `${b.weight} KG` : null],
    ['Cargo Type', b.cargo_type],
    ['Goods Description', b.goods_description],
    ['Hazardous', b.hazardous === true ? 'Yes' : b.hazardous === false ? 'No' : null],
    ['Shipping Line', b.shipping_line],
    ['Operator', b.operator],
    ['Transit Time', b.transit_time],
    ['Insurance', b.insurance_required ? 'Yes (₹1,000)' : null],
    ['Origin', b.origin],
    ['Destination', b.destination],
    ['HSN Code', b.hsn_code],
    ['Nature of Packing', b.nature_of_packing],
    ['Gross Weight / Cont.', b.weight_per_container ? `${b.weight_per_container} MT` : null],
    ['Invoice Number', b.invoice_number],
    ['Invoice Date', b.invoice_date ? new Date(b.invoice_date).toLocaleDateString('en-IN') : null],
    ['Invoice Value', b.invoice_value ? money(b.invoice_value) : null],
    ['Shipping Bill No.', b.filing_number],
    ['e-Forwarding Note', b.efn_filed ? 'Filed' : null],
    ['No. of Packages', b.num_packages],
    ['Package Size', b.package_size],
    ['Special Instructions', b.special_instructions],
    ['Sender', b.sender_name],
    ['Sender Phone', b.sender_phone],
    ['Sender Email', b.sender_email],
    ['Sender GSTIN', b.sender_gstin],
    ['Sender Address', [b.sender_address, b.sender_city, b.sender_state, b.sender_pincode].filter(Boolean).join(', ') || null],
    ['Receiver', b.receiver_name],
    ['Receiver Phone', b.receiver_phone],
    ['Receiver Email', b.receiver_email],
    ['Receiver GSTIN', b.receiver_gstin],
    ['Receiver Address', [b.receiver_address, b.receiver_city, b.receiver_state, b.receiver_pincode].filter(Boolean).join(', ') || null],
    ['Booking Date', b.booking_date ? new Date(b.booking_date).toLocaleDateString('en-IN') : null],
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

  // Shipping Bill is a customs / export document — international shipments only.
  const isDomestic = b.is_domestic !== false;
  const docs = [
    { kind: 'summary',       label: 'Summary (PDF)',    icon: <FaFilePdf /> },
    { kind: 'invoice',       label: 'Invoice',          icon: <FaFileInvoiceDollar /> },
    ...(!isDomestic ? [{ kind: 'shipping_bill', label: 'Shipping Bill', icon: <FaFileAlt /> }] : []),
    { kind: 'challan',       label: 'e-Forwarding Note', icon: <FaFileSignature /> },
    { kind: 'bill',          label: 'Freight Bill',     icon: <FaReceipt /> },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div style={brandGradient} className="rounded-2xl px-6 py-5 text-white mb-5 shadow-sm">
        <button onClick={() => navigate('/my-bookings')} className="flex items-center gap-2 text-white/90 hover:text-white text-sm font-medium mb-3">
          <FaArrowLeft className="text-xs" /> Back to My Shipments
        </button>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold">{b.booking_number}</h1>
            <p className="text-sm text-blue-50/90">{b.origin} → {b.destination} · {b.service_type}</p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/15 ring-1 ring-white/30">{getStatusLabel(b.status)}</span>
        </div>
      </div>

      {/* Documents */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5 mb-5 shadow-sm">
        <h2 className="text-sm font-bold text-gray-800 mb-3">Documents</h2>
        <div className="flex flex-wrap gap-2">
          {docs.map(doc => (
            <button key={doc.kind} onClick={() => openDocument(doc.kind, b)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-gray-50 hover:bg-blue-50 hover:border-blue-200 text-gray-700 hover:text-blue-700 text-sm font-semibold transition">
              {doc.icon} {doc.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-2">Opens a print-ready document — use “Save as PDF” in the print dialog.</p>
      </div>

      {/* All details */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5 mb-5 shadow-sm">
        <h2 className="text-sm font-bold text-gray-800 mb-3">Shipment details</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3">
          {detailRows.filter(([, v]) => v !== null && v !== undefined && v !== '').map(([label, value]) => (
            <div key={label}>
              <p className="text-[11px] text-gray-400 mb-0.5">{label}</p>
              <p className="text-sm font-semibold text-gray-700 break-words">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Charges */}
      {cb && (
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-bold text-gray-800 mb-3">Charges breakup</h2>
          <div className="space-y-1 text-sm bg-gray-50 rounded-xl p-4 max-w-md">
            {chargeLines.filter(([, v]) => v).map(([label, v]) => (
              <div key={label} className="flex justify-between">
                <span className="text-gray-500">{label}</span>
                <span className="font-medium text-gray-700">{money(v)}</span>
              </div>
            ))}
            {cb.grand != null && (
              <div className="flex justify-between pt-2 mt-1 border-t border-gray-200 font-bold text-gray-800">
                <span>Grand Total</span><span>{money(cb.grand)}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ShipmentDetailPage;
