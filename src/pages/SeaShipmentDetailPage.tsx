// src/pages/SeaShipmentDetailPage.tsx
// Post-booking shipment view — matches Freightos tabs exactly:
//   Action Required | Summary | Shipment Charges | Quote
// Navigated to from booking confirmation or shipments list
// Pass shipmentId via route params or location.state
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  FaShip, FaDownload, FaUniversity, FaExternalLinkAlt, FaChevronRight, FaChevronDown,
} from 'react-icons/fa';

interface ShipmentDetail {
  shipmentId: string;
  bookedOn: string;
  bookedBy: string;
  rateValidUntil: string;
  primarySeller: string;
  originPort: string;
  destinationCity: string;
  destinationPort: string;
  load: string;
  commoditiesValue: string;
  readyForPickup: string;
  mode: string;
  serviceType: string;
  portToPortTransit: string;
  endToEndTransit: string;
  // Charges
  sellerQuote: number;
  customsBrokerage: number;
  insurance: number;
  platformFee: number;
  // Quote breakdown
  originCharges: Array<{ code: string; name: string; comment: string; units: number; unitPrice: number; amount: number }>;
  oceanCharges: Array<{ code: string; name: string; comment: string; units: number; unitPrice: number; amount: number }>;
  destinationCharges: Array<{ code: string; name: string; comment: string; units: number; unitPrice: number; amount: number }>;
  customsCharges: Array<{ name: string; comment: string; amount: number }>;
  insuranceCharges: Array<{ name: string; comment: string; amount: number }>;
}

type Tab = 'action' | 'summary' | 'charges' | 'quote';

const SeaShipmentDetailPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('action');
  const [summaryOpen, setSummaryOpen] = useState(true);
  const [consignorOpen, setConsignorOpen] = useState(false);
  const [docsOpen, setDocsOpen] = useState(false);

  // Hydrate from location state or use mock
  const raw = location.state?.bookingDetails;
  const shipment: ShipmentDetail = {
    shipmentId: raw?.bookingId || '#S260603002444',
    bookedOn: raw?.bookingDate || new Date().toLocaleDateString('en-IN'),
    bookedBy: raw?.bookedBy || 'SHIPPITIN INDIA',
    rateValidUntil: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
    primarySeller: raw?.selectedResult?.serviceName || 'Seabay International Freight Forwarding Ltd',
    originPort: raw?.selectedResult?.originPort || 'INHYD',
    destinationCity: 'Hamburg',
    destinationPort: raw?.selectedResult?.destinationPort || 'DEHAM',
    load: '40\' Container',
    commoditiesValue: '₹8,30,000',
    readyForPickup: raw?.bookingDate || new Date(Date.now() + 86400000).toLocaleDateString('en-IN'),
    mode: 'FCL',
    serviceType: 'Port to port',
    portToPortTransit: '39-46 days',
    endToEndTransit: '45-55 days',
    sellerQuote: raw?.finalAmount ? Math.round(raw.finalAmount * 0.96) : 605000,
    customsBrokerage: 12500,
    insurance: 5900,
    platformFee: 9350,
    originCharges: [
      { code: 'OTHC 40\'', name: 'Origin Terminal Handling Charge', comment: 'Per Container, including OTHC, DOCK fee', units: 1, unitPrice: 29900, amount: 29900 },
      { code: 'ODOC',      name: 'Documentation Charges at Origin', comment: 'Flat Fee', units: 1, unitPrice: 5800, amount: 5800 },
      { code: 'O-LOCAL',   name: 'Local Charges at Origin', comment: 'Flat Fee, one customs declaration within 3 HS codes, thereafter ₹1,250/HS', units: 1, unitPrice: 12500, amount: 12500 },
    ],
    oceanCharges: [
      { code: 'OCEAN 40\'', name: 'Ocean Freight Cost', comment: 'Per Container', units: 1, unitPrice: 504900, amount: 504900 },
      { code: 'HDL',        name: 'Handling Charge', comment: 'Flat Fee', units: 1, unitPrice: 7050, amount: 7050 },
    ],
    destinationCharges: [
      { code: 'D-LOCAL 40\'', name: 'Local Charges at Destination', comment: 'Per Container', units: 1, unitPrice: 45650, amount: 45650 },
    ],
    customsCharges: [
      { name: 'Import Customs Clearance', comment: 'Flat Fee. Within 2 lines. Thereafter ₹1,250 per line', amount: 12500 },
    ],
    insuranceCharges: [
      { name: 'Transport Insurance (based on goods value and initial freight costs)', comment: '—', amount: 5900 },
    ],
  };

  const subtotalSeller = shipment.sellerQuote;
  const subtotalCustoms = shipment.customsBrokerage;
  const subtotalInsurance = shipment.insurance;
  const totalBeforePlatform = subtotalSeller + subtotalCustoms + subtotalInsurance;
  const grandTotal = totalBeforePlatform + shipment.platformFee;

  const fmt = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;

  const TABS: { key: Tab; label: string }[] = [
    { key: 'action',  label: 'Action required' },
    { key: 'summary', label: 'Summary' },
    { key: 'charges', label: 'Shipment Charges' },
    { key: 'quote',   label: 'Quote' },
  ];

  const FeeTable = ({ rows }: { rows: Array<{ code?: string; name: string; comment: string; units?: number; unitPrice?: number; amount: number }> }) => (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-gray-100">
          {rows[0]?.code !== undefined && <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-2 pr-4">Fee code</th>}
          <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-2 pr-4">Fee name</th>
          <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-2 pr-4">Comment</th>
          {rows[0]?.units !== undefined && <th className="text-right text-xs font-semibold text-gray-400 uppercase tracking-wide py-2 pr-4">Units</th>}
          {rows[0]?.unitPrice !== undefined && <th className="text-right text-xs font-semibold text-gray-400 uppercase tracking-wide py-2 pr-4">Unit price</th>}
          <th className="text-right text-xs font-semibold text-gray-400 uppercase tracking-wide py-2">Amount</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} className="border-b border-gray-50">
            {row.code !== undefined && <td className="py-3 pr-4 text-gray-500 text-xs font-mono">{row.code}</td>}
            <td className="py-3 pr-4 text-gray-700 font-medium">{row.name}</td>
            <td className="py-3 pr-4 text-gray-400 text-xs max-w-[200px]">{row.comment}</td>
            {row.units !== undefined && <td className="py-3 pr-4 text-right text-gray-600">{row.units}</td>}
            {row.unitPrice !== undefined && <td className="py-3 pr-4 text-right text-gray-600">{fmt(row.unitPrice)}</td>}
            <td className="py-3 text-right font-bold text-gray-800">{fmt(row.amount)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── Top tab bar ── */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <div className="flex gap-0">
              {TABS.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-5 py-4 text-sm font-semibold border-b-2 transition-all ${
                    activeTab === tab.key
                      ? 'border-blue-600 text-blue-700'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            {/* Download buttons */}
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition">
                <FaUniversity className="text-xs" /> Bank Details
              </button>
              <button className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition">
                <FaDownload className="text-xs" /> Invoices Summary
              </button>
              <button className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition">
                <FaDownload className="text-xs" /> Proforma Invoice
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* ── ACTION REQUIRED ── */}
        {activeTab === 'action' && (
          <div>
            {/* Almost ready banner */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-6 overflow-hidden">
              <div className="flex items-center gap-4 px-8 py-6">
                <div className="text-4xl">🏠</div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Your shipment is almost ready to go!</h2>
                  <p className="text-sm text-gray-500 mt-0.5">Fill in the required information below so the logistics provider can process your shipment.</p>
                </div>
              </div>
              <div className="border-t border-gray-100 px-8 py-3 bg-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FaShip className="text-gray-400 text-xs" />
                  <span>Port To Port</span>
                  <span className="mx-2 text-gray-300">·</span>
                  <span className="font-semibold">{shipment.originPort}, Secunderabad, India</span>
                  <span className="text-gray-400 mx-1">→</span>
                  <span className="font-semibold">{shipment.destinationPort}, {shipment.destinationCity}, Germany</span>
                </div>
                <button className="text-red-500 text-xs font-semibold hover:underline">Cancel shipment</button>
              </div>
            </div>

            {/* Left/right layout for sections */}
            <div className="flex gap-6">
              <div className="flex-1 space-y-4">
                {/* Payments */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <button onClick={() => {}} className="w-full flex items-center justify-between px-6 py-4 text-left">
                    <div>
                      <p className="text-sm font-bold text-gray-800">Payments</p>
                      <p className="text-xs text-gray-400 mt-0.5">Payment method</p>
                    </div>
                    <FaChevronRight className="text-gray-300 text-xs" />
                  </button>
                </div>
                {/* Contact Details */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <button onClick={() => setConsignorOpen(!consignorOpen)} className="w-full flex items-center justify-between px-6 py-4 text-left">
                    <div>
                      <p className="text-sm font-bold text-gray-800">Contact details</p>
                    </div>
                    {consignorOpen ? <FaChevronDown className="text-gray-300 text-xs" /> : <FaChevronRight className="text-gray-300 text-xs" />}
                  </button>
                  {consignorOpen && (
                    <div className="px-6 pb-4 border-t border-gray-50">
                      <p className="text-sm text-gray-500 py-4">Consignor and Consignee details are saved from your booking form.</p>
                    </div>
                  )}
                </div>
                {/* Your Goods */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <button onClick={() => setDocsOpen(!docsOpen)} className="w-full flex items-center justify-between px-6 py-4 text-left">
                    <div>
                      <p className="text-sm font-bold text-gray-800">Your Goods</p>
                    </div>
                    {docsOpen ? <FaChevronDown className="text-gray-300 text-xs" /> : <FaChevronRight className="text-gray-300 text-xs" />}
                  </button>
                </div>
              </div>

              {/* Right summary mini card */}
              <div className="w-[280px] flex-shrink-0">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3 text-sm">
                  <p className="font-bold text-gray-800 text-base">Price details</p>
                  <div className="flex justify-between"><span className="text-gray-500">Seller's Quote</span><span className="font-semibold">{fmt(shipment.sellerQuote)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Customs brokerage</span><span className="font-semibold">{fmt(shipment.customsBrokerage)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Duties and taxes</span><span className="text-gray-400 text-xs">Not Included</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Insurance</span><span className="font-semibold">{fmt(shipment.insurance)}</span></div>
                  <div className="border-t border-dashed border-gray-200 pt-3 flex justify-between">
                    <span className="text-gray-500">Platform fee</span><span className="font-semibold">{fmt(shipment.platformFee)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
                    <span className="font-bold text-gray-900 text-base">Total:</span>
                    <span className="text-xl font-black text-blue-700">{fmt(grandTotal)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── SUMMARY ── */}
        {activeTab === 'summary' && (
          <div className="space-y-5">
            {/* Consignor & Consignee */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
              <button onClick={() => setConsignorOpen(!consignorOpen)} className="w-full flex items-center justify-between px-6 py-4 text-left">
                <p className="text-sm font-bold text-gray-700">Consignor And Consignee</p>
                {consignorOpen ? <FaChevronDown className="text-gray-400 text-xs" /> : <FaChevronRight className="text-gray-400 text-xs" />}
              </button>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
              <button onClick={() => setDocsOpen(!docsOpen)} className="w-full flex items-center justify-between px-6 py-4 text-left">
                <p className="text-sm font-bold text-gray-700">Documents</p>
                {docsOpen ? <FaChevronDown className="text-gray-400 text-xs" /> : <FaChevronRight className="text-gray-400 text-xs" />}
              </button>
            </div>

            {/* Summary accordion */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <button onClick={() => setSummaryOpen(!summaryOpen)} className="w-full flex items-center justify-between px-6 py-4 text-left">
                <p className="text-sm font-bold text-gray-700">Summary</p>
                {summaryOpen ? <FaChevronDown className="text-gray-400 text-xs" /> : <FaChevronRight className="text-gray-400 text-xs" />}
              </button>
              {summaryOpen && (
                <div className="px-6 pb-6 border-t border-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    {/* Goods */}
                    <div className="border border-gray-100 rounded-xl p-4">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">GOODS</p>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between"><span className="text-gray-400">Load:</span><span className="font-semibold text-gray-700">{shipment.load}</span></div>
                        <div className="flex justify-between"><span className="text-gray-400">Commodities:</span><span className="font-semibold text-gray-700">—</span></div>
                        <div className="flex justify-between"><span className="text-gray-400">Value:</span><span className="font-semibold text-gray-700">{shipment.commoditiesValue}</span></div>
                        <div className="flex justify-between"><span className="text-gray-400">Ready For Pickup:</span>
                          <span className="font-semibold text-blue-600">{shipment.readyForPickup}</span>
                        </div>
                      </div>
                    </div>
                    {/* Route */}
                    <div className="border border-gray-100 rounded-xl p-4">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">ROUTE</p>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between"><span className="text-gray-400">Route:</span>
                          <span className="font-semibold text-gray-700">{shipment.originPort} → {shipment.destinationPort}</span>
                        </div>
                        <div className="flex justify-between"><span className="text-gray-400">Mode:</span><span className="font-semibold text-gray-700">{shipment.mode}</span></div>
                        <div className="flex justify-between"><span className="text-gray-400">Service Type:</span><span className="font-semibold text-gray-700">{shipment.serviceType}</span></div>
                        <div className="flex justify-between"><span className="text-gray-400">Port To Port Transit:</span><span className="font-semibold text-gray-700">{shipment.portToPortTransit}</span></div>
                        <div className="flex justify-between"><span className="text-gray-400">End To End Transit:</span><span className="font-semibold text-gray-700">{shipment.endToEndTransit}</span></div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom 3 cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div className="border border-gray-100 rounded-xl p-4">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">BOOKING DETAILS</p>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between"><span className="text-gray-400">Shipment ID:</span><span className="font-semibold text-gray-700 text-xs font-mono">{shipment.shipmentId}</span></div>
                        <div className="flex justify-between"><span className="text-gray-400">Rate Valid Until:</span><span className="font-semibold text-gray-700">{shipment.rateValidUntil}</span></div>
                        <div className="flex justify-between"><span className="text-gray-400">Booked On:</span><span className="font-semibold text-gray-700">{shipment.bookedOn}</span></div>
                        <div className="flex justify-between"><span className="text-gray-400">Booked By:</span><span className="font-semibold text-gray-700">{shipment.bookedBy}</span></div>
                        <div className="flex justify-between"><span className="text-gray-400">Primary Seller:</span><span className="font-semibold text-gray-700 text-right text-xs max-w-[120px]">{shipment.primarySeller}</span></div>
                      </div>
                    </div>
                    <div className="border border-gray-100 rounded-xl p-4">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">REQUESTED SERVICES</p>
                      <div className="space-y-2 text-sm">
                        <p className="font-semibold text-gray-700 text-xs">↑ Insurance</p>
                        <div className="flex justify-between pl-3 text-xs"><span className="text-gray-400">Goods value</span><span className="font-semibold">{shipment.commoditiesValue}</span></div>
                        <div className="flex justify-between pl-3 text-xs"><span className="text-gray-400">Provider</span><span className="font-semibold">Shippitin Insure</span></div>
                        <p className="font-semibold text-gray-700 text-xs mt-2">↑ Customs Brokerage</p>
                        <div className="flex justify-between pl-3 text-xs"><span className="text-gray-400">Number of commodities</span><span className="font-semibold">1</span></div>
                        <div className="flex justify-between pl-3 text-xs"><span className="text-gray-400">Origin port charges</span><span className="font-semibold">—</span></div>
                        <div className="flex justify-between pl-3 text-xs"><span className="text-gray-400">Destination port charges</span><span className="font-semibold">—</span></div>
                      </div>
                    </div>
                    <div className="border border-gray-100 rounded-xl p-4">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">COMMENTS</p>
                      <div className="flex flex-col items-center justify-center h-20 text-gray-300">
                        <p className="text-2xl mb-1">💬</p>
                        <p className="text-xs">No Comments</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── SHIPMENT CHARGES ── */}
        {activeTab === 'charges' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Header summary */}
            <div className="grid grid-cols-3 divide-x divide-gray-100 border-b border-gray-100">
              {[
                { label: 'TOTAL COST', value: fmt(grandTotal) },
                { label: 'TOTAL PAID', value: fmt(0) },
                { label: 'TOTAL DUE', value: fmt(grandTotal) },
              ].map(item => (
                <div key={item.label} className="px-8 py-6">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{item.label}</p>
                  <p className="text-xl font-black text-gray-900">{item.value}</p>
                </div>
              ))}
            </div>

            {/* Cost breakdown table */}
            <div className="px-8 py-6">
              <h3 className="text-sm font-bold text-gray-700 mb-5">Cost Breakdown</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      {['DATE', 'CHARGE-TYPE', 'DESCRIPTION', 'SERVICE PROVIDER', 'AMOUNT'].map(h => (
                        <th key={h} className="text-left text-xs font-bold text-gray-400 uppercase tracking-wide py-2 pr-4 last:text-right">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td colSpan={5} className="py-3 text-xs font-bold text-gray-500">↑ Initial Freight Quote</td></tr>
                    {[
                      { type: 'Shipment charges', desc: `${shipment.originPort}, ${shipment.destinationPort === 'DEHAM' ? 'Secunderabad' : ''} > ${shipment.destinationPort}, ${shipment.destinationCity}`, provider: shipment.primarySeller, amount: shipment.sellerQuote },
                      { type: 'Customs Brokerage', desc: '', provider: shipment.primarySeller, amount: shipment.customsBrokerage },
                      { type: 'Insurance', desc: '', provider: 'Shippitin Insure', amount: shipment.insurance },
                    ].map((row, i) => (
                      <tr key={i} className="border-b border-gray-50">
                        <td className="py-3 pr-4 text-gray-500 text-xs">{shipment.bookedOn}</td>
                        <td className="py-3 pr-4 text-gray-700 font-medium">{row.type}</td>
                        <td className="py-3 pr-4 text-gray-400 text-xs">{row.desc}</td>
                        <td className="py-3 pr-4 text-gray-500 text-xs max-w-[160px]">{row.provider}</td>
                        <td className="py-3 text-right font-bold text-gray-800">+{fmt(row.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-6 border-t border-gray-100 pt-4 space-y-1.5 text-sm text-right">
                <div className="flex justify-end gap-8"><span className="text-gray-400">subtotal:</span><span className="font-bold text-gray-700">{fmt(totalBeforePlatform)}</span></div>
                <div className="flex justify-end gap-8"><span className="text-gray-400">Platform fee:</span><span className="font-bold text-gray-700">{fmt(shipment.platformFee)}</span></div>
                <div className="flex justify-end gap-8 text-base"><span className="font-bold text-gray-900">Total:</span><span className="font-black text-gray-900">{fmt(grandTotal)}</span></div>
              </div>

              <div className="mt-8 bg-gray-50 rounded-xl p-4 text-xs text-gray-500 leading-relaxed">
                The Sellers on Shippitin have agreed to abide by the Shippitin Standard Operating Procedure. This allows you to know up front what charges may occur and under what circumstances. The original Quote will always remain binding if it has not expired, and this policy will cover any additional charges that were unknown at the time of booking.
              </div>
            </div>
          </div>
        )}

        {/* ── QUOTE ── */}
        {activeTab === 'quote' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-8 py-6 space-y-8">

              {/* Origin charges */}
              <div>
                <h3 className="text-sm font-bold text-gray-800 mb-4">Origin charges</h3>
                <div className="overflow-x-auto">
                  <FeeTable rows={shipment.originCharges} />
                </div>
                <div className="text-right mt-3 text-sm text-gray-500 font-semibold">
                  Subtotal: {fmt(shipment.originCharges.reduce((s, r) => s + r.amount, 0))}
                </div>
              </div>

              {/* Ocean leg */}
              <div className="border-t border-gray-100 pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <FaShip className="text-gray-400 text-xs" />
                  <h3 className="text-sm font-bold text-gray-800">{shipment.originPort} &gt; {shipment.destinationPort}</h3>
                </div>
                <div className="overflow-x-auto">
                  <FeeTable rows={shipment.oceanCharges} />
                </div>
                <div className="text-right mt-3 text-sm text-gray-500 font-semibold">
                  Subtotal: {fmt(shipment.oceanCharges.reduce((s, r) => s + r.amount, 0))}
                </div>
              </div>

              {/* Destination charges */}
              <div className="border-t border-gray-100 pt-6">
                <h3 className="text-sm font-bold text-gray-800 mb-4">Destination charges</h3>
                <div className="overflow-x-auto">
                  <FeeTable rows={shipment.destinationCharges} />
                </div>
                <div className="text-right mt-3 text-sm text-gray-500 font-semibold">
                  Subtotal: {fmt(shipment.destinationCharges.reduce((s, r) => s + r.amount, 0))}
                </div>
              </div>

              {/* Customs Brokerage */}
              <div className="border-t border-gray-100 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-gray-800">Customs Brokerage</h3>
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">SB</div>
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-2 pr-4">Fee name</th>
                      <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-2 pr-4">Comment</th>
                      <th className="text-right text-xs font-semibold text-gray-400 uppercase tracking-wide py-2">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shipment.customsCharges.map((r, i) => (
                      <tr key={i} className="border-b border-gray-50">
                        <td className="py-3 pr-4 text-gray-700 font-medium">{r.name}</td>
                        <td className="py-3 pr-4 text-gray-400 text-xs">{r.comment}</td>
                        <td className="py-3 text-right font-bold text-gray-800">{fmt(r.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="text-right mt-3 text-sm text-gray-500 font-semibold">
                  Subtotal: {fmt(shipment.customsBrokerage)}
                </div>
              </div>

              {/* Insurance */}
              <div className="border-t border-gray-100 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-gray-800">Insurance</h3>
                  <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200">Shippitin Insure</span>
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-2 pr-4">Fee name</th>
                      <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-2 pr-4">Comment</th>
                      <th className="text-right text-xs font-semibold text-gray-400 uppercase tracking-wide py-2">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shipment.insuranceCharges.map((r, i) => (
                      <tr key={i} className="border-b border-gray-50">
                        <td className="py-3 pr-4 text-gray-700 font-medium">{r.name}</td>
                        <td className="py-3 pr-4 text-gray-400 text-xs">{r.comment}</td>
                        <td className="py-3 text-right font-bold text-gray-800">{fmt(r.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="text-right mt-3 text-sm text-gray-500 font-semibold">
                  Subtotal: {fmt(shipment.insurance)}
                </div>
              </div>

              {/* Grand total */}
              <div className="border-t-2 border-gray-200 pt-5 text-right">
                <p className="text-lg font-black text-gray-900">Total: {fmt(totalBeforePlatform)} (INR)</p>
              </div>

              {/* CO2 + note */}
              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs text-gray-400">CO₂: ~1,770 kg (est.)</p>
                <div className="mt-3 bg-gray-50 rounded-xl p-4 text-xs text-gray-500 leading-relaxed">
                  <strong>Shippitin Note:</strong> Subject to Shippitin SOP and Terms and Conditions. Online rates assume the cargo is general commodity and stackable; otherwise, additional fees may apply.
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default SeaShipmentDetailPage;
