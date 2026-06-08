// src/pages/SeaBookingDetailsPage.tsx
// Freightos-style booking: left accordion (Payments, Contact details, Your Goods)
// Right sticky: Price details sidebar with all line items
// Post-booking tabs: Action Required / Summary / Shipment Charges / Quote
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  FaArrowLeft, FaShip, FaCheckCircle, FaChevronDown, FaChevronUp,
  FaCreditCard, FaUser, FaBuilding, FaTag, FaShieldAlt, FaFileInvoice,
} from 'react-icons/fa';
import type { AllFormData } from '../types/QuoteFormHandle';
import { bookingAPI } from '../services/api';

interface SeaServiceResult {
  id: string;
  serviceName: string;
  carrier: string;
  originPort: string;
  destinationPort: string;
  departureDate: string;
  transitTime: string;
  price: number;
  containerSize: string;
  features: string[];
  status: string;
}

const STEPS = ['Search', 'Recommended Services', 'Results', 'Booking', 'Verification'];

const inp = (err?: boolean) =>
  `w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 transition ${
    err ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'
  }`;

type AccSection = 'payment' | 'consignor' | 'consignee' | 'commodities' | 'documents';

const SeaBookingDetailsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const selectedResult = location.state?.selectedResult as SeaServiceResult | undefined;
  const originalFormData = location.state?.originalFormData as AllFormData | undefined;

  const user = JSON.parse(localStorage.getItem('shippitin_user') || '{}');

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'bank_transfer' | 'credit_account'>('credit_card');

  // Consignor (shipper)
  const [consignorCompany, setConsignorCompany] = useState(user.company_name || '');
  const [consignorName, setConsignorName]       = useState(user.full_name || '');
  const [consignorEmail, setConsignorEmail]     = useState(user.email || '');
  const [consignorPhone, setConsignorPhone]     = useState(user.phone || '');
  const [consignorStreet, setConsignorStreet]   = useState('');
  const [consignorCity, setConsignorCity]       = useState('');
  const [consignorState, setConsignorState]     = useState('');
  const [consignorCountry, setConsignorCountry] = useState('India');
  const [consignorZip, setConsignorZip]         = useState('');

  // Consignee
  const [consigneeCompany, setConsigneeCompany] = useState('');
  const [consigneeName, setConsigneeName]       = useState('');
  const [consigneeEmail, setConsigneeEmail]     = useState('');
  const [consigneePhone, setConsigneePhone]     = useState('');
  const [consigneeStreet, setConsigneeStreet]   = useState('');
  const [consigneeCity, setConsigneeCity]       = useState('');
  const [consigneeState, setConsigneeState]     = useState('');
  const [consigneeCountry, setConsigneeCountry] = useState('');
  const [consigneeZip, setConsigneeZip]         = useState('');

  // Commodities
  const [productName, setProductName]         = useState('');
  const [sku, setSku]                         = useState('');
  const [productDesc, setProductDesc]         = useState('');
  const [endUse, setEndUse]                   = useState('');
  const [countryOfMfg, setCountryOfMfg]       = useState('India');
  const [productUrl, setProductUrl]           = useState('');
  const [hsCode, setHsCode]                   = useState('');
  const [termsConfirmed, setTermsConfirmed]   = useState(false);
  const [promoCode, setPromoCode]             = useState('');
  const [promoApplied, setPromoApplied]       = useState(false);
  const [discount, setDiscount]               = useState(0);

  // UI state
  const [openSection, setOpenSection]   = useState<AccSection>('payment');
  const [errors, setErrors]             = useState<Record<string, string>>({});
  const [loading, setLoading]           = useState(false);
  const [consignorDone, setConsignorDone] = useState(false);
  const [consigneeDone, setConsigneeDone] = useState(false);
  const [commoditiesDone, setCommoditiesDone] = useState(false);

  if (!selectedResult || !originalFormData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-10 bg-white rounded-2xl shadow">
          <p className="text-red-600 mb-4">Booking details missing. Please go back to search results.</p>
          <button onClick={() => navigate('/sea-results')} className="bg-blue-600 text-white px-6 py-2 rounded-xl">Go Back</button>
        </div>
      </div>
    );
  }

  const toggleSection = (s: AccSection) => setOpenSection(prev => prev === s ? prev : s);

  const handlePromo = () => {
    const valid: Record<string, number> = { 'SHIPPITIN10': 0.10, 'RAIL2026': 0.08, 'CONCOR5': 0.05 };
    const upper = promoCode.trim().toUpperCase();
    if (valid[upper]) { setDiscount(valid[upper]); setPromoApplied(true); }
    else { setDiscount(0); setPromoApplied(false); }
  };

  const insuranceFee = selectedResult.price * 0.01;
  const customsFee   = 2000;
  const platformFee  = Math.round(selectedResult.price * 0.015);
  const discountAmt  = selectedResult.price * discount;
  const total        = selectedResult.price - discountAmt + insuranceFee + customsFee + platformFee;
  const fmt          = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;

  const handleSubmit = async () => {
    if (!termsConfirmed) { setErrors({ terms: 'Please confirm the terms to proceed.' }); return; }
    setLoading(true);
    const bookingId = `SEA-${Date.now().toString().slice(-6)}`;
    try {
      await bookingAPI.create({
        booking_number: bookingId,
        service_type: 'Sea',
        origin: selectedResult.originPort,
        destination: selectedResult.destinationPort,
        cargo_type: (originalFormData as any).commodity || 'General',
        weight: (originalFormData as any).totalWeight || 0,
        container_type: selectedResult.containerSize,
        booking_date: new Date().toISOString().split('T')[0],
        estimated_price: total,
        status: 'confirmed',
      });
    } catch (err) { console.error('Backend save failed:', err); }
    finally { setLoading(false); }

    navigate('/booking-confirmation', {
      state: {
        bookingDetails: {
          selectedResult: { ...selectedResult, mode: 'sea' },
          originalFormData,
          bookingDate: new Date().toLocaleDateString('en-IN'),
          bookingId,
          finalAmount: total,
        },
      },
    });
  };

  const SectionHeader = ({
    id, label, sub, icon, done,
  }: { id: AccSection; label: string; sub: string; icon: React.ReactNode; done: boolean }) => (
    <button
      onClick={() => toggleSection(id)}
      className={`w-full flex items-center justify-between px-6 py-4 text-left transition ${
        openSection === id ? 'bg-gray-50' : 'hover:bg-gray-50'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${
          done ? 'bg-green-500 text-white' : openSection === id ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
        }`}>
          {done ? <FaCheckCircle /> : icon}
        </div>
        <div>
          <p className="text-sm font-bold text-gray-800">{label}</p>
          <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
        </div>
      </div>
      {openSection === id ? <FaChevronUp className="text-gray-400 text-xs" /> : <FaChevronDown className="text-gray-400 text-xs" />}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── Step bar ── */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {STEPS.map((step, idx) => {
              const stepNum = idx + 1;
              const isActive = stepNum === 4;
              const isDone = stepNum < 4;
              return (
                <React.Fragment key={step}>
                  <div className="flex flex-col items-center gap-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      isDone ? 'bg-blue-500 text-white' : isActive ? 'bg-blue-600 text-white ring-4 ring-blue-100' : 'bg-gray-200 text-gray-400'
                    }`}>{stepNum}</div>
                    <span className={`text-xs font-semibold whitespace-nowrap hidden sm:block ${isActive ? 'text-gray-800' : isDone ? 'text-blue-500' : 'text-gray-400'}`}>{step}</span>
                  </div>
                  {idx < STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-2 mb-5 ${isDone ? 'bg-blue-400' : 'bg-gray-200'}`} />}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* "Almost ready" banner */}
        <div className="bg-white rounded-2xl border border-amber-200 shadow-sm mb-6 overflow-hidden">
          <div className="px-6 py-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-3xl">🏠</div>
              <div>
                <h2 className="text-base font-bold text-gray-900">Your shipment is almost ready to go!</h2>
                <p className="text-sm text-gray-500 mt-0.5">Fill in the required information below so the logistics provider can process your shipment.</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-100 px-6 py-3 bg-gray-50 flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <FaShip className="text-gray-400 text-xs" />
              <span>Port To Port</span>
              <span className="mx-2 text-gray-300">·</span>
              <span className="font-semibold">{selectedResult.originPort}</span>
              <span className="text-gray-400 mx-1">→</span>
              <span className="font-semibold">{selectedResult.destinationPort}</span>
            </div>
            <button onClick={() => navigate(-1)} className="text-red-500 text-xs font-semibold hover:underline">Cancel shipment</button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">

          {/* ── Left accordion ── */}
          <div className="flex-1 space-y-4">

            {/* PAYMENTS */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <SectionHeader id="payment" label="Payments" sub="Payment method" icon={<FaCreditCard />} done={false} />
              {openSection === 'payment' && (
                <div className="px-6 pb-6 border-t border-gray-50">
                  <h3 className="text-base font-bold text-gray-900 mt-5 mb-4">Company Billing Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Full name <span className="text-red-400">*</span></label>
                      <input type="text" value={consignorName} onChange={e => setConsignorName(e.target.value)} placeholder="Enter full name" className={inp(!!errors.name)} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Company name <span className="text-red-400">*</span></label>
                      <input type="text" value={consignorCompany} onChange={e => setConsignorCompany(e.target.value)} placeholder="Enter company name" className={inp()} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Phone</label>
                      <input type="tel" value={consignorPhone} onChange={e => setConsignorPhone(e.target.value)} placeholder="+91 (xxx) xxx-xxxx" className={inp()} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Doing business as <span className="text-gray-400 font-normal">(Optional)</span></label>
                      <input type="text" placeholder="Enter business name" className={inp()} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">GSTIN / Tax ID <span className="text-gray-400 font-normal">(Optional)</span></label>
                      <input type="text" placeholder="Enter GSTIN / Tax ID" className={inp()} />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Company billing address <span className="text-red-400">*</span></label>
                      <input type="text" value={consignorStreet} onChange={e => setConsignorStreet(e.target.value)} placeholder="Enter full street address or PO box" className={inp()} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">City <span className="text-red-400">*</span></label>
                      <input type="text" value={consignorCity} onChange={e => setConsignorCity(e.target.value)} placeholder="Enter city" className={inp()} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">State / Region <span className="text-gray-400 font-normal">(Optional)</span></label>
                      <input type="text" value={consignorState} onChange={e => setConsignorState(e.target.value)} placeholder="Enter state / region" className={inp()} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Zip code <span className="text-gray-400 font-normal">(Optional)</span></label>
                      <input type="text" value={consignorZip} onChange={e => setConsignorZip(e.target.value)} placeholder="Enter zip code" className={inp()} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Country</label>
                      <select value={consignorCountry} onChange={e => setConsignorCountry(e.target.value)} className={inp()}>
                        {['India', 'United States', 'Germany', 'Singapore', 'China', 'United Kingdom', 'Other'].map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="mt-5 flex justify-end">
                    <button type="button" onClick={() => toggleSection('consignor')}
                      className="px-6 py-2.5 rounded-xl text-sm font-bold text-white" style={{ background: 'linear-gradient(90deg, #1e40af, #2563eb)' }}>
                      Save
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* CONTACT DETAILS */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-50">
                <p className="text-sm font-bold text-gray-700">Contact details</p>
              </div>

              {/* Consignor */}
              <div className="border-b border-gray-50">
                <SectionHeader id="consignor" label="Consignor" sub="The exporter of record for your shipment. Usually the factory, sourcing agent, etc." icon={<FaUser />} done={consignorDone} />
                {openSection === 'consignor' && (
                  <div className="px-6 pb-6 border-t border-gray-50">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Company name</label>
                        <input type="text" value={consignorCompany} onChange={e => setConsignorCompany(e.target.value)} placeholder="Enter company name" className={inp()} />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Full name</label>
                        <input type="text" value={consignorName} onChange={e => setConsignorName(e.target.value)} placeholder="Enter first & last name" className={inp()} />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Email</label>
                        <input type="email" value={consignorEmail} onChange={e => setConsignorEmail(e.target.value)} placeholder="Enter email address" className={inp()} />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Phone</label>
                        <input type="tel" value={consignorPhone} onChange={e => setConsignorPhone(e.target.value)} placeholder="+91 (xxx) xxx-xxxx" className={inp()} />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Street address</label>
                        <input type="text" value={consignorStreet} onChange={e => setConsignorStreet(e.target.value)} placeholder="Street, Number, PO Box, Apartment, Suite, Unit, Building, Floor, Etc." className={inp()} />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">City</label>
                        <input type="text" value={consignorCity} onChange={e => setConsignorCity(e.target.value)} placeholder="Enter city" className={inp()} />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">State <span className="text-gray-400 font-normal">(Optional)</span></label>
                        <input type="text" value={consignorState} onChange={e => setConsignorState(e.target.value)} placeholder="Enter state" className={inp()} />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Country / Region</label>
                        <select value={consignorCountry} onChange={e => setConsignorCountry(e.target.value)} className={inp()}>
                          {['India', 'United States', 'Germany', 'Singapore', 'China', 'Other'].map(c => <option key={c}>{c}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Zip code <span className="text-gray-400 font-normal">(Optional)</span></label>
                        <input type="text" value={consignorZip} onChange={e => setConsignorZip(e.target.value)} placeholder="Enter ZIP code" className={inp()} />
                      </div>
                    </div>
                    <div className="mt-5 flex justify-end">
                      <button type="button" onClick={() => { setConsignorDone(true); toggleSection('consignee'); }}
                        className="px-6 py-2.5 rounded-xl text-sm font-bold text-white" style={{ background: 'linear-gradient(90deg, #1e40af, #2563eb)' }}>
                        Done
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Consignee */}
              <div>
                <SectionHeader id="consignee" label="Consignee" sub="The importer of record responsible for paying duties and freight charges. Usually you or your client." icon={<FaBuilding />} done={consigneeDone} />
                {openSection === 'consignee' && (
                  <div className="px-6 pb-6 border-t border-gray-50">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Company name</label>
                        <input type="text" value={consigneeCompany} onChange={e => setConsigneeCompany(e.target.value)} placeholder="Enter company name" className={inp()} />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Full name</label>
                        <input type="text" value={consigneeName} onChange={e => setConsigneeName(e.target.value)} placeholder="Enter first & last name" className={inp()} />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Email</label>
                        <input type="email" value={consigneeEmail} onChange={e => setConsigneeEmail(e.target.value)} placeholder="Enter email address" className={inp()} />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Phone</label>
                        <input type="tel" value={consigneePhone} onChange={e => setConsigneePhone(e.target.value)} placeholder="+x (xxx) xxx-xxxx" className={inp()} />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Street address</label>
                        <input type="text" value={consigneeStreet} onChange={e => setConsigneeStreet(e.target.value)} placeholder="Street, Number, PO Box, Apartment, Suite, Unit, Building, Floor, Etc." className={inp()} />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">City</label>
                        <input type="text" value={consigneeCity} onChange={e => setConsigneeCity(e.target.value)} placeholder="Enter city" className={inp()} />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">State <span className="text-gray-400 font-normal">(Optional)</span></label>
                        <input type="text" value={consigneeState} onChange={e => setConsigneeState(e.target.value)} placeholder="Enter state" className={inp()} />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Country / Region</label>
                        <select value={consigneeCountry} onChange={e => setConsigneeCountry(e.target.value)} className={inp()}>
                          {['India', 'United States', 'Germany', 'Singapore', 'China', 'Other'].map(c => <option key={c}>{c}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Zip code <span className="text-gray-400 font-normal">(Optional)</span></label>
                        <input type="text" value={consigneeZip} onChange={e => setConsigneeZip(e.target.value)} placeholder="Enter ZIP code" className={inp()} />
                      </div>
                    </div>
                    <div className="mt-5 flex justify-end">
                      <button type="button" onClick={() => { setConsigneeDone(true); toggleSection('commodities'); }}
                        className="px-6 py-2.5 rounded-xl text-sm font-bold text-white" style={{ background: 'linear-gradient(90deg, #1e40af, #2563eb)' }}>
                        Done
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* YOUR GOODS */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-50">
                <p className="text-sm font-bold text-gray-700">Your Goods</p>
              </div>

              {/* Commodities */}
              <div className="border-b border-gray-50">
                <SectionHeader id="commodities" label="Commodities" sub="Product details for customs & documentation" icon={<FaTag />} done={commoditiesDone} />
                {openSection === 'commodities' && (
                  <div className="px-6 pb-6 border-t border-gray-50">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Product name</label>
                        <input type="text" value={productName} onChange={e => setProductName(e.target.value)} placeholder="Add product name" className={inp()} />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">SKU <span className="text-gray-400 font-normal">(Optional)</span></label>
                        <input type="text" value={sku} onChange={e => setSku(e.target.value)} placeholder="Enter SKU" className={inp()} />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Detailed product description <span className="text-gray-400 font-normal">(Optional)</span></label>
                        <textarea
                          value={productDesc} onChange={e => setProductDesc(e.target.value)} rows={3}
                          placeholder={'Describe what your goods are and what they\'re made of. Include any brand and model numbers. For example, "100% cotton woven men\'s t-shirt" not "cotton t-shirt."'}
                          className={`${inp()} resize-none`}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">End-use of product <span className="text-gray-400 font-normal">(Optional)</span></label>
                        <input type="text" value={endUse} onChange={e => setEndUse(e.target.value)} placeholder="Describe how the product will be used" className={inp()} />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Country of manufacture <span className="text-gray-400 font-normal">(Optional)</span></label>
                        <select value={countryOfMfg} onChange={e => setCountryOfMfg(e.target.value)} className={inp()}>
                          {['India', 'China', 'United States', 'Germany', 'Japan', 'Other'].map(c => <option key={c}>{c}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Product URL <span className="text-gray-400 font-normal">(Optional)</span></label>
                        <input type="url" value={productUrl} onChange={e => setProductUrl(e.target.value)} placeholder="Enter URL" className={inp()} />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">HS / HTS code <span className="text-gray-400 font-normal">(Optional)</span></label>
                        <input type="text" value={hsCode} onChange={e => setHsCode(e.target.value)} placeholder="Enter HT/HTS code" className={inp()} />
                      </div>
                      {/* Supporting docs */}
                      <div className="sm:col-span-2">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Supporting documents and images <span className="text-gray-400 font-normal">(Optional)</span></p>
                        <p className="text-xs text-gray-400 mb-3">Adding product specs, government agency forms, and photographs will help your customs broker classify your product more accurately.</p>
                        <div className="grid grid-cols-2 gap-3">
                          {['Upload your product image', 'Upload your Doc'].map(label => (
                            <div key={label} className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition">
                              <div className="text-gray-300 text-2xl mb-1">{label.includes('image') ? '🖼️' : '📄'}</div>
                              <p className="text-xs font-semibold text-gray-500">{label}</p>
                              <p className="text-xs text-gray-400 mt-0.5">File shouldn't exceed 7 MB</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="mt-5 flex justify-between items-center">
                      <button className="text-blue-600 text-xs hover:underline">What can I ship?</button>
                      <button type="button" onClick={() => { setCommoditiesDone(true); toggleSection('documents'); }}
                        className="px-6 py-2.5 rounded-xl text-sm font-bold text-white" style={{ background: 'linear-gradient(90deg, #1e40af, #2563eb)' }}>
                        Save
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Upload Documents */}
              <div>
                <SectionHeader id="documents" label="Upload documents" sub="Commercial invoice, packing list, etc." icon={<FaFileInvoice />} done={false} />
                {openSection === 'documents' && (
                  <div className="px-6 pb-6 border-t border-gray-50 mt-0 pt-4">
                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-blue-300 hover:bg-blue-50 transition cursor-pointer">
                      <div className="text-4xl mb-2">📁</div>
                      <p className="text-sm font-semibold text-gray-600">Drop files here or click to upload</p>
                      <p className="text-xs text-gray-400 mt-1">Accepted: PDF, JPG, PNG · Max 10 MB per file</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Terms confirmation */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
              <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                This rate is valid until {new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}. If your goods are gated in after this date, or if your container exceeds the standard weight permitted, the rate may be subject to an adjustment in line with the marketplace rate.
              </p>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={termsConfirmed}
                  onChange={e => setTermsConfirmed(e.target.checked)}
                  className="mt-0.5 h-4 w-4 text-blue-600 rounded accent-blue-600"
                />
                <span className="text-xs text-gray-700">
                  I confirm that this is a commercial shipment and that all details entered in the search are correct to the best of my knowledge. I accept the terms of the Quote and all applicable conditions.
                </span>
              </label>
              {errors.terms && <p className="text-xs text-red-500 mt-2">{errors.terms}</p>}
            </div>

          </div>

          {/* ── Right sticky price summary ── */}
          <div className="w-full lg:w-[340px] flex-shrink-0">
            <div className="sticky top-6 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

              {/* Route visual */}
              <div className="px-6 pt-6 pb-4 border-b border-gray-100">
                <h3 className="text-base font-bold text-gray-900 mb-4">Booking Summary</h3>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div className="text-center">
                    <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-1">
                      <FaShip className="text-gray-500 text-sm" />
                    </div>
                    <p className="text-xs font-bold text-gray-700">{selectedResult.originPort}</p>
                  </div>
                  <div className="flex-1 flex items-center">
                    <div className="flex-1 border-t-2 border-dashed border-gray-300"></div>
                    <FaShip className="text-blue-400 text-base mx-2 flex-shrink-0" />
                    <div className="flex-1 border-t-2 border-dashed border-gray-300"></div>
                  </div>
                  <div className="text-center">
                    <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-1">
                      <FaShip className="text-gray-500 text-sm" />
                    </div>
                    <p className="text-xs font-bold text-gray-700">{selectedResult.destinationPort}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-gray-400 mb-0.5">Mode</p>
                    <p className="font-bold text-gray-700">{(originalFormData as any)?.shipmentMode || 'FCL'}</p>
                    <p className="text-gray-400">Port to port</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-gray-400 mb-0.5">Transit</p>
                    <p className="font-bold text-gray-700">{selectedResult.transitTime}</p>
                    <p className="text-gray-400">Est. end-to-end</p>
                  </div>
                </div>
                <div className="mt-3 bg-gray-50 rounded-xl p-3 text-xs">
                  <div className="flex justify-between mb-1.5">
                    <span className="text-gray-400">Load</span>
                    <span className="font-semibold text-gray-700">1 × {selectedResult.containerSize || "40'"} Container</span>
                  </div>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-gray-400">Seller</span>
                    <span className="font-semibold text-gray-700 text-right max-w-[180px] truncate">{selectedResult.serviceName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Goods Ready</span>
                    <span className="font-semibold text-gray-700">Yes</span>
                  </div>
                </div>
              </div>

              {/* Price details */}
              <div className="px-6 py-5">
                <h4 className="text-sm font-bold text-gray-700 mb-4">Price details</h4>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Seller's Quote</span>
                    <span className="font-semibold text-gray-800">{fmt(selectedResult.price)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Customs brokerage</span>
                    <span className="font-semibold text-gray-800">{fmt(customsFee)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Duties and taxes</span>
                    <span className="text-gray-400 text-xs font-medium">Not Included</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Insurance</span>
                    <span className="font-semibold text-gray-800">{fmt(insuranceFee)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Promo discount ({(discount * 100).toFixed(0)}%)</span>
                      <span>−{fmt(discountAmt)}</span>
                    </div>
                  )}

                  {/* Promo code */}
                  <div className="pt-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={promoCode}
                        onChange={e => { setPromoCode(e.target.value); setPromoApplied(false); }}
                        placeholder="Add a promo code"
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-100"
                      />
                      <button type="button" onClick={handlePromo} className="px-3 py-2 text-blue-600 text-xs font-bold hover:underline">Apply</button>
                    </div>
                    {promoApplied && <p className="text-xs text-green-600 mt-1">✓ {(discount * 100).toFixed(0)}% discount applied</p>}
                  </div>

                  <div className="flex justify-between text-sm border-t border-gray-100 pt-3">
                    <span className="text-gray-500">Platform fee</span>
                    <span className="font-semibold text-gray-800">{fmt(platformFee)}</span>
                  </div>

                  <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
                    <span className="text-base font-bold text-gray-900">Total:</span>
                    <span className="text-2xl font-black text-blue-700">{fmt(total)}</span>
                  </div>
                </div>

                {/* Seller info */}
                <div className="mt-5 bg-blue-50 rounded-xl p-4 border border-blue-100">
                  <p className="text-xs font-bold text-gray-700 mb-2">About {selectedResult.serviceName?.split(' ').slice(0, 2).join(' ')}</p>
                  <p className="text-xs text-gray-500 italic leading-relaxed">
                    "A leading logistics provider with over 10 years of experience in ocean freight. Specializing in India-Europe and India-Southeast Asia corridors."
                  </p>
                </div>

                {/* Confirm button */}
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="mt-5 w-full py-3.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50"
                  style={{ background: 'linear-gradient(90deg, #1e40af, #2563eb)' }}
                >
                  {loading
                    ? <span className="flex items-center justify-center gap-2"><span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> Saving...</span>
                    : 'Confirm Booking'}
                </button>
                <p className="text-xs text-gray-400 text-center mt-2">*Prices indicative, subject to change on actuals.</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SeaBookingDetailsPage;
