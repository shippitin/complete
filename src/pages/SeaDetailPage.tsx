// src/pages/SeaDetailPage.tsx
// Freightos-style dashboard: embedded search bar + recent searches + shipment status cards
import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaShip, FaSearch, FaClock, FaCheckCircle, FaFileInvoiceDollar, FaCreditCard } from 'react-icons/fa';
import SeaQuoteForm from '../components/QuoteForms/SeaQuoteForm';
import type { QuoteFormHandle, AllFormData, SeaFormData } from '../types/QuoteFormHandle';

// Mock recent searches stored in localStorage key 'sea_recent_searches'
interface RecentSearch {
  origin: string;
  destination: string;
  load: string;
}

const MOCK_RECENT: RecentSearch[] = [
  { origin: 'INMAA', destination: 'SGSIN', load: '1 × 40\' container' },
  { origin: 'INHYD', destination: 'DEHAM', load: '1 × 40\' container' },
  { origin: 'INMAA', destination: 'NLRTM', load: '2 × 20\' container' },
];

const SeaDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const formRef = useRef<QuoteFormHandle>(null);
  const [formVisible, setFormVisible] = useState(false);

  // Pull shipment counts from localStorage (set by booking confirmation page)
  const booked = parseInt(localStorage.getItem('sea_booked_count') || '0');
  const inTransit = parseInt(localStorage.getItem('sea_transit_count') || '0');
  const delivered = parseInt(localStorage.getItem('sea_delivered_count') || '0');
  const totalShipments = booked + inTransit + delivered;

  const invoiceOpen = parseInt(localStorage.getItem('sea_invoice_open') || '0');
  const invoiceDue = parseInt(localStorage.getItem('sea_invoice_due') || '0');
  const invoicePaid = parseInt(localStorage.getItem('sea_invoice_paid') || '0');
  const totalInvoices = invoiceOpen + invoiceDue + invoicePaid;

  const handleSearchResult = (data: AllFormData | null) => {
    if (!data) return;
    const seaData = data as SeaFormData;
    // Save to recent searches
    const recent: RecentSearch[] = JSON.parse(localStorage.getItem('sea_recent_searches') || '[]');
    const newEntry: RecentSearch = {
      origin: seaData.originPort || seaData.originCity || '',
      destination: seaData.destinationPort || seaData.destinationCity || '',
      load: seaData.shipmentMode === 'FCL'
        ? `${seaData.numberOfContainers || 1} × ${seaData.containerType || '40\''} container`
        : `LCL · ${seaData.volumeCBM} CBM`,
    };
    const deduped = [newEntry, ...recent.filter(r => r.origin !== newEntry.origin || r.destination !== newEntry.destination)].slice(0, 5);
    localStorage.setItem('sea_recent_searches', JSON.stringify(deduped));
    navigate('/sea-recommended-services', { state: { formData: seaData } });
  };

  const recentSearches: RecentSearch[] = JSON.parse(localStorage.getItem('sea_recent_searches') || 'null') || MOCK_RECENT;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8fafc', fontFamily: "'DM Sans', sans-serif" }}>

      {/* ─── Hero search band ─── */}
      <div style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 60%, #1d4ed8 100%)' }} className="px-4 py-14">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-1">Where would you like to ship?</h1>
          <p className="text-blue-200 text-sm mb-8">Search, compare and book ocean freight — all in one place</p>

          {/* Quote Form */}
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            <SeaQuoteForm
              ref={formRef}
              showButtons={false}
            />
            {/* Custom submit row */}
            <div className="px-5 pb-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => formRef.current?.reset()}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-500 bg-gray-100 hover:bg-gray-200 transition"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => {
                  const result = formRef.current?.submit();
                  if (result && !(result instanceof Promise)) handleSearchResult(result);
                }}
                className="flex items-center gap-2 px-7 py-2.5 rounded-xl text-sm font-bold text-white transition"
                style={{ background: 'linear-gradient(90deg, #1d4ed8, #2563eb)' }}
              >
                <FaSearch className="text-xs" /> Search Quotes
              </button>
            </div>
          </div>

          {/* Recent searches */}
          {recentSearches.length > 0 && (
            <div className="mt-5">
              <p className="text-blue-200 text-xs font-semibold uppercase tracking-widest mb-3">My recent searches</p>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((rs, i) => (
                  <button
                    key={i}
                    className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-xs font-medium px-4 py-2 rounded-full border border-white/20 transition backdrop-blur-sm"
                    onClick={() => {/* prefill would go here */}}
                  >
                    <FaShip className="text-blue-300 text-xs" />
                    {rs.origin} → {rs.destination}
                    <span className="text-blue-300 ml-1">· {rs.load}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── Dashboard cards ─── */}
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          {/* Manage Shipments */}
          <div
            className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
            onClick={() => navigate('/shipments')}
          >
            <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-gray-50">
              <div>
                <h3 className="text-base font-bold text-gray-800">Manage your shipments</h3>
              </div>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#eff6ff' }}>
                <FaShip className="text-blue-500 text-sm" />
              </div>
            </div>

            {totalShipments === 0 ? (
              <div className="px-6 py-5">
                <p className="text-sm text-gray-400">No shipments yet. Book your first ocean freight above.</p>
              </div>
            ) : (
              <div className="px-6 py-4">
                {/* attention banner */}
                {booked > 0 && (
                  <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mb-4">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0"></span>
                    {booked} item(s) need your attention —{' '}
                    <button className="font-bold underline" onClick={e => { e.stopPropagation(); navigate('/shipments'); }}>Fix now</button>
                  </div>
                )}
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-gray-300"></span> Booked ({booked})
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span> In transit ({inTransit})
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-400"></span> Delivered ({delivered})
                  </div>
                </div>
              </div>
            )}
            <div className="px-6 pb-5 flex items-center justify-between">
              <span className="text-2xl font-black text-gray-800">{totalShipments}</span>
              <span className="text-xs text-gray-400">Total shipments</span>
            </div>
          </div>

          {/* Manage Payments */}
          <div
            className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
            onClick={() => navigate('/payments')}
          >
            <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-gray-50">
              <div>
                <h3 className="text-base font-bold text-gray-800">Manage your payments</h3>
              </div>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#f0fdf4' }}>
                <FaFileInvoiceDollar className="text-green-500 text-sm" />
              </div>
            </div>

            {totalInvoices === 0 ? (
              <div className="px-6 py-5">
                <p className="text-sm text-gray-400 font-medium">You're all up to date</p>
              </div>
            ) : (
              <div className="px-6 py-4">
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-gray-300"></span> Open ({invoiceOpen})
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span> Payment due ({invoiceDue})
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-400"></span> Paid in full ({invoicePaid})
                  </div>
                </div>
              </div>
            )}
            <div className="px-6 pb-5 flex items-center justify-between">
              <span className="text-2xl font-black text-gray-800">{totalInvoices}</span>
              <span className="text-xs text-gray-400">Total invoices</span>
            </div>
          </div>

          {/* Shippitin Credit */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-gray-50">
              <div>
                <h3 className="text-base font-bold text-gray-800">Shippitin credit</h3>
              </div>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#fef3c7' }}>
                <FaCreditCard className="text-amber-500 text-sm" />
              </div>
            </div>
            <div className="px-6 py-5 flex-1">
              <p className="text-sm text-gray-500 leading-relaxed">
                A registered Indian business? Take advantage of our freight credit terms for ocean shipments.
                <button className="block mt-2 text-blue-600 text-sm font-semibold hover:underline">Contact support</button>
              </p>
            </div>
            <div className="px-6 pb-5">
              <button
                className="w-full border border-blue-200 text-blue-600 text-sm font-semibold py-2 rounded-xl hover:bg-blue-50 transition"
                onClick={() => navigate('/contact')}
              >
                Apply for credit
              </button>
            </div>
          </div>

        </div>

        {/* Services strip */}
        <div className="mt-10">
          <h2 className="text-base font-bold text-gray-700 mb-4">Ocean Freight Services</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { label: 'FCL', sub: 'Full Container Load', icon: '🚢' },
              { label: 'LCL', sub: 'Less than Container', icon: '📦' },
              { label: 'Reefer', sub: 'Temperature Controlled', icon: '❄️' },
              { label: 'OOG', sub: 'Out of Gauge Cargo', icon: '🏗️' },
              { label: 'Hazmat', sub: 'Hazardous Goods', icon: '⚠️' },
            ].map(s => (
              <div key={s.label} className="bg-white border border-gray-100 rounded-xl p-4 text-center hover:border-blue-200 hover:shadow-sm transition cursor-pointer">
                <div className="text-2xl mb-2">{s.icon}</div>
                <p className="text-sm font-bold text-gray-800">{s.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeaDetailPage;
