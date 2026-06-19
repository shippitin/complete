// src/pages/SeaBookingDetailsPage.tsx
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  FaArrowLeft, FaUser, FaBuilding, FaIdCard, FaEnvelope,
  FaPhone, FaCommentDots, FaCheckCircle, FaShip,
  FaMapMarkerAlt, FaBox, FaCreditCard, FaChevronDown, FaChevronUp,
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
  status: 'Available' | 'Limited' | 'Full';
}

const inp = (err?: boolean) =>
  `w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 transition ${
    err ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'
  }`;

const fmt = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;

const STEPS = [
  { id: 1, label: 'Shipper',   icon: FaUser,        color: 'text-blue-500',   activeBg: 'bg-brand-gradient'   },
  { id: 2, label: 'Consignee', icon: FaMapMarkerAlt, color: 'text-green-500',  activeBg: 'bg-green-600'  },
  { id: 3, label: 'Cargo',     icon: FaBox,          color: 'text-orange-500', activeBg: 'bg-orange-500' },
  { id: 4, label: 'Payment',   icon: FaCreditCard,   color: 'text-purple-500', activeBg: 'bg-purple-600' },
];

const SeaBookingDetailsPage: React.FC = () => {
  const location  = useLocation();
  const navigate  = useNavigate();

  const selectedResult   = location.state?.selectedResult as SeaServiceResult | undefined;
  const originalFormData = location.state?.originalFormData as AllFormData | undefined;

  const user = JSON.parse(localStorage.getItem('shippitin_user') || '{}');

  // Shipper
  const [shipperName,    setShipperName]    = useState(user.full_name || '');
  const [shipperEmail,   setShipperEmail]   = useState(user.email || '');
  const [shipperPhone,   setShipperPhone]   = useState(user.phone || '');
  const [shipperCompany, setShipperCompany] = useState(user.company_name || '');
  const [shipperGstin,   setShipperGstin]   = useState(user.gstin || '');
  const [shipperAddress, setShipperAddress] = useState('');
  const [shipperCity,    setShipperCity]    = useState('');
  const [shipperCountry, setShipperCountry] = useState('India');

  // Consignee
  const [consigneeName,    setConsigneeName]    = useState('');
  const [consigneeEmail,   setConsigneeEmail]   = useState('');
  const [consigneePhone,   setConsigneePhone]   = useState('');
  const [consigneeCompany, setConsigneeCompany] = useState('');
  const [consigneeAddress, setConsigneeAddress] = useState('');
  const [consigneeCity,    setConsigneeCity]    = useState('');
  const [consigneeCountry, setConsigneeCountry] = useState('');

  // Cargo
  const [goodsDesc,     setGoodsDesc]     = useState('');
  const [hsnCode,       setHsnCode]       = useState('');
  const [invoiceNo,     setInvoiceNo]     = useState('');
  const [invoiceDate,   setInvoiceDate]   = useState('');
  const [invoiceValue,  setInvoiceValue]  = useState('');
  const [kycDocType,    setKycDocType]    = useState('Passport');
  const [blNo,          setBlNo]          = useState('');
  const [specialInstr,  setSpecialInstr]  = useState('');

  // Payment
  const [paymentMode,   setPaymentMode]   = useState<'online'|'bank'|'credit'>('online');
  const [creditAcct,    setCreditAcct]    = useState('');

  const [currentStep,   setCurrentStep]   = useState(1);
  const [showBreakup,   setShowBreakup]   = useState(true);
  const [errors,        setErrors]        = useState<Record<string,string>>({});
  const [loading,       setLoading]       = useState(false);

  const previewFields: Record<number, string[]> = {
    1: ['Full Name *', 'Email *', 'Phone *', 'Company', 'GSTIN', 'Address', 'City', 'Country'],
    2: ['Consignee Name *', 'Email *', 'Phone *', 'Company', 'Address', 'City', 'Country'],
    3: ['Description of Goods *', 'HSN Code', 'Invoice No *', 'Invoice Date', 'Invoice Value', 'Bill of Lading No', 'KYC Document', 'Special Instructions'],
    4: ['Payment Mode', 'Online / Bank Transfer / Credit Account'],
  };

  const validateStep = (step: number) => {
    const e: Record<string,string> = {};
    if (step === 1) {
      if (!shipperName.trim())  e.shipperName  = 'Required';
      if (!shipperEmail.trim()) e.shipperEmail = 'Required';
      if (!shipperPhone.trim()) e.shipperPhone = 'Required';
    }
    if (step === 2) {
      if (!consigneeName.trim())  e.consigneeName  = 'Required';
      if (!consigneeEmail.trim()) e.consigneeEmail = 'Required';
      if (!consigneePhone.trim()) e.consigneePhone = 'Required';
    }
    if (step === 3) {
      if (!goodsDesc.trim())  e.goodsDesc  = 'Required';
      if (!invoiceNo.trim())  e.invoiceNo  = 'Required';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const goToStep = (step: number) => { setErrors({}); setCurrentStep(step); };
  const nextStep = () => { if (validateStep(currentStep)) setCurrentStep(s => Math.min(s+1, 4)); };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;
    if (!selectedResult || !originalFormData) return;

    setLoading(true);
    const bookingId = `SEA-${Date.now().toString().slice(-6)}`;

    try {
      await bookingAPI.create({
        booking_number: bookingId,
        service_type: 'Sea',
        origin: selectedResult.originPort,
        destination: selectedResult.destinationPort,
        cargo_type: (originalFormData as any).cargoType || 'General',
        weight: (originalFormData as any).weight || 0,
        container_type: selectedResult.containerSize,
        booking_date: new Date().toISOString().split('T')[0],
        estimated_price: selectedResult.price,
        special_instructions: specialInstr,
        status: 'confirmed',
      });
    } catch (err) {
      console.error('Backend save failed:', err);
    } finally {
      setLoading(false);
    }

    navigate('/booking-confirmation', {
      state: {
        bookingDetails: {
          selectedResult: {
            id: selectedResult.id,
            serviceName: selectedResult.serviceName,
            originStation: selectedResult.originPort,
            destinationStation: selectedResult.destinationPort,
            transitTime: selectedResult.transitTime,
            price: selectedResult.price,
            features: selectedResult.features,
            operator: selectedResult.carrier,
            status: selectedResult.status,
            mode: 'sea',
          },
          originalFormData,
          kycDetails: { companyName: shipperCompany||'N/A', gstin: shipperGstin||'N/A', mobile: shipperPhone, email: shipperEmail },
          bookingDate: new Date().toLocaleDateString('en-IN'),
          bookingTime: new Date().toLocaleTimeString('en-IN'),
          bookingId,
          finalAmount: selectedResult.price,
        },
      },
    });
  };

  if (!selectedResult || !originalFormData) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center p-10 bg-white rounded-2xl shadow">
          <p className="text-red-600 mb-4">Booking details missing. Please go back to search results.</p>
          <button onClick={() => navigate('/sea-results')} className="bg-brand-gradient text-white px-6 py-2 rounded-lg">Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6">

        {/* ── LEFT ── */}
        <div className="flex-grow space-y-4">

          {/* Header */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <button onClick={() => navigate(-1)}
              className="flex items-center text-blue-500 hover:text-blue-600 text-sm font-medium mb-5 transition">
              <FaArrowLeft className="mr-2 text-xs" /> Back to Search Results
            </button>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-blue-50"><FaShip className="text-xl text-blue-500" /></div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Complete Your Sea Booking</h1>
                <p className="text-gray-400 text-sm">Click any section to fill in details</p>
              </div>
            </div>
          </div>

          {/* Stepper */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-5">
            <div className="flex items-center justify-between">
              {STEPS.map((step, idx) => {
                const Icon = step.icon;
                const isActive = currentStep === step.id;
                const isDone   = currentStep > step.id;
                return (
                  <React.Fragment key={step.id}>
                    <button onClick={() => goToStep(step.id)} className="flex flex-col items-center gap-1.5 group">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                        isDone ? 'bg-green-500 text-white' :
                        isActive ? `${step.activeBg} text-white shadow-lg` :
                        'bg-gray-100 text-gray-400 group-hover:bg-gray-200'
                      }`}>
                        {isDone ? <FaCheckCircle className="text-sm" /> : <Icon className="text-sm" />}
                      </div>
                      <span className={`text-xs font-semibold ${isActive ? step.color : isDone ? 'text-green-500' : 'text-gray-400'}`}>
                        {step.label}
                      </span>
                    </button>
                    {idx < STEPS.length-1 && (
                      <div className={`flex-1 h-0.5 mx-2 transition-all ${currentStep > step.id ? 'bg-green-400' : 'bg-gray-200'}`} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* All steps visible */}
          {STEPS.map(step => {
            const Icon     = step.icon;
            const isActive = currentStep === step.id;
            const isDone   = currentStep > step.id;

            return (
              <div key={step.id} className={`bg-white rounded-2xl shadow-sm border transition-all ${
                isActive ? `border-2 ${
                  step.id===1?'border-blue-200':step.id===2?'border-green-200':step.id===3?'border-orange-200':'border-purple-200'
                }` : 'border-gray-100'
              }`}>
                {/* Section header */}
                <button onClick={() => goToStep(step.id)} className="w-full flex items-center justify-between px-6 py-4 text-left">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isDone ? 'bg-green-500' : isActive ? step.activeBg : 'bg-gray-100'
                    }`}>
                      {isDone ? <FaCheckCircle className="text-white text-xs" /> : <Icon className={`text-xs ${isActive ? 'text-white' : 'text-gray-400'}`} />}
                    </div>
                    <div>
                      <p className={`text-sm font-bold ${isActive ? 'text-gray-800' : 'text-gray-500'}`}>
                        Step {step.id} — {step.label} Details
                      </p>
                      {!isActive && <p className="text-xs text-gray-400 mt-0.5">{isDone ? '✓ Filled in' : 'Click to fill'}</p>}
                    </div>
                  </div>
                  {!isActive && (
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${isDone ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                      {isDone ? 'Done ✓' : 'Pending'}
                    </span>
                  )}
                </button>

                {/* Active form */}
                {isActive && (
                  <div className="px-6 pb-6 border-t border-gray-50">

                    {/* ── SHIPPER ── */}
                    {step.id === 1 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Full Name <span className="text-red-400">*</span></label>
                          <input type="text" value={shipperName} onChange={e=>setShipperName(e.target.value)} placeholder="e.g., Raj Textiles Pvt Ltd" className={inp(!!errors.shipperName)} />
                          {errors.shipperName && <p className="text-xs text-red-500 mt-1">{errors.shipperName}</p>}
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Email <span className="text-red-400">*</span></label>
                          <input type="email" value={shipperEmail} onChange={e=>setShipperEmail(e.target.value)} placeholder="e.g., shipper@company.com" className={inp(!!errors.shipperEmail)} />
                          {errors.shipperEmail && <p className="text-xs text-red-500 mt-1">{errors.shipperEmail}</p>}
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Phone <span className="text-red-400">*</span></label>
                          <input type="tel" value={shipperPhone} onChange={e=>setShipperPhone(e.target.value)} placeholder="e.g., 9876543210" className={inp(!!errors.shipperPhone)} />
                          {errors.shipperPhone && <p className="text-xs text-red-500 mt-1">{errors.shipperPhone}</p>}
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Company Name</label>
                          <input type="text" value={shipperCompany} onChange={e=>setShipperCompany(e.target.value)} placeholder="e.g., Raj Textiles Pvt Ltd" className={inp()} />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">GSTIN (optional)</label>
                          <input type="text" value={shipperGstin} onChange={e=>setShipperGstin(e.target.value)} placeholder="e.g., 33AAAAA0000A1Z5" className={inp()} />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">City</label>
                          <input type="text" value={shipperCity} onChange={e=>setShipperCity(e.target.value)} placeholder="e.g., Chennai" className={inp()} />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Address</label>
                          <input type="text" value={shipperAddress} onChange={e=>setShipperAddress(e.target.value)} placeholder="Street address, locality" className={inp()} />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Country</label>
                          <input type="text" value={shipperCountry} onChange={e=>setShipperCountry(e.target.value)} placeholder="e.g., India" className={inp()} />
                        </div>
                      </div>
                    )}

                    {/* ── CONSIGNEE ── */}
                    {step.id === 2 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Full Name <span className="text-red-400">*</span></label>
                          <input type="text" value={consigneeName} onChange={e=>setConsigneeName(e.target.value)} placeholder="e.g., Singapore Imports Ltd" className={inp(!!errors.consigneeName)} />
                          {errors.consigneeName && <p className="text-xs text-red-500 mt-1">{errors.consigneeName}</p>}
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Email <span className="text-red-400">*</span></label>
                          <input type="email" value={consigneeEmail} onChange={e=>setConsigneeEmail(e.target.value)} placeholder="e.g., consignee@company.com" className={inp(!!errors.consigneeEmail)} />
                          {errors.consigneeEmail && <p className="text-xs text-red-500 mt-1">{errors.consigneeEmail}</p>}
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Phone <span className="text-red-400">*</span></label>
                          <input type="tel" value={consigneePhone} onChange={e=>setConsigneePhone(e.target.value)} placeholder="e.g., +65 9876 5432" className={inp(!!errors.consigneePhone)} />
                          {errors.consigneePhone && <p className="text-xs text-red-500 mt-1">{errors.consigneePhone}</p>}
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Company Name</label>
                          <input type="text" value={consigneeCompany} onChange={e=>setConsigneeCompany(e.target.value)} placeholder="e.g., Singapore Imports Ltd" className={inp()} />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Address</label>
                          <input type="text" value={consigneeAddress} onChange={e=>setConsigneeAddress(e.target.value)} placeholder="Street address, locality" className={inp()} />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">City</label>
                          <input type="text" value={consigneeCity} onChange={e=>setConsigneeCity(e.target.value)} placeholder="e.g., Singapore" className={inp()} />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Country</label>
                          <input type="text" value={consigneeCountry} onChange={e=>setConsigneeCountry(e.target.value)} placeholder="e.g., Singapore" className={inp()} />
                        </div>
                      </div>
                    )}

                    {/* ── CARGO ── */}
                    {step.id === 3 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Description of Goods <span className="text-red-400">*</span></label>
                          <input type="text" value={goodsDesc} onChange={e=>setGoodsDesc(e.target.value)} placeholder="e.g., Cotton fabric rolls, automotive spare parts" className={inp(!!errors.goodsDesc)} />
                          {errors.goodsDesc && <p className="text-xs text-red-500 mt-1">{errors.goodsDesc}</p>}
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">HSN Code (optional)</label>
                          <input type="text" value={hsnCode} onChange={e=>setHsnCode(e.target.value)} placeholder="e.g., 5208" className={inp()} />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Invoice Number <span className="text-red-400">*</span></label>
                          <input type="text" value={invoiceNo} onChange={e=>setInvoiceNo(e.target.value)} placeholder="e.g., INV-2026-001" className={inp(!!errors.invoiceNo)} />
                          {errors.invoiceNo && <p className="text-xs text-red-500 mt-1">{errors.invoiceNo}</p>}
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Invoice Date</label>
                          <input type="date" value={invoiceDate} onChange={e=>setInvoiceDate(e.target.value)} className={inp()} />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Invoice Value (₹) <span className="text-gray-400 font-normal">(optional)</span></label>
                          <input type="number" value={invoiceValue} onChange={e=>setInvoiceValue(e.target.value)} placeholder="e.g., 500000" className={inp()} />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Bill of Lading No.</label>
                          <input type="text" value={blNo} onChange={e=>setBlNo(e.target.value)} placeholder="e.g., MAEU123456789" className={inp()} />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">KYC Document Type</label>
                          <select value={kycDocType} onChange={e=>setKycDocType(e.target.value)} className={inp()}>
                            {['Passport','Aadhaar Card','Driving License','PAN Card','Other'].map(o=><option key={o}>{o}</option>)}
                          </select>
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Special Instructions</label>
                          <textarea value={specialInstr} onChange={e=>setSpecialInstr(e.target.value)}
                            placeholder="Any special handling requirements, fragile items, temperature, hazardous..."
                            rows={3} className={`${inp()} resize-none`} />
                        </div>
                      </div>
                    )}

                    {/* ── PAYMENT ── */}
                    {step.id === 4 && (
                      <div className="mt-4 space-y-3">
                        {[
                          { value:'online', label:'Online Payment',  sub:'Credit/Debit Card · Net Banking · UPI' },
                          { value:'bank',   label:'Bank Transfer',   sub:'NEFT / RTGS / IMPS' },
                          { value:'credit', label:'Credit Account',  sub:'Carrier credit account (existing customers)' },
                        ].map(opt => (
                          <label key={opt.value} className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition ${
                            paymentMode===opt.value ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
                          }`}>
                            <input type="radio" name="payMode" value={opt.value} checked={paymentMode===opt.value}
                              onChange={()=>setPaymentMode(opt.value as any)} className="h-4 w-4 text-blue-600" />
                            <div>
                              <p className="text-sm font-semibold text-gray-800">{opt.label}</p>
                              <p className="text-xs text-gray-400">{opt.sub}</p>
                            </div>
                          </label>
                        ))}
                        {paymentMode==='credit' && (
                          <div className="mt-2">
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Credit Account Number</label>
                            <input type="text" value={creditAcct} onChange={e=>setCreditAcct(e.target.value)} placeholder="e.g., MSC-CRED-001234" className={inp()} />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Nav buttons */}
                    <div className="flex justify-between mt-6 pt-4 border-t border-gray-100">
                      <button type="button" onClick={()=>goToStep(Math.max(currentStep-1,1))}
                        disabled={currentStep===1}
                        className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition ${
                          currentStep===1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-100'
                        }`}>
                        <FaArrowLeft className="text-xs" /> Previous
                      </button>
                      {currentStep < 4 ? (
                        <button type="button" onClick={nextStep}
                          className="flex items-center gap-2 px-7 py-2.5 bg-brand-gradient hover:opacity-90 text-white font-bold rounded-xl transition text-sm">
                          Next →
                        </button>
                      ) : (
                        <button type="button" onClick={handleSubmit} disabled={loading}
                          className="flex items-center gap-2 px-7 py-2.5 bg-brand-gradient hover:opacity-90 text-white font-bold rounded-xl transition text-sm disabled:opacity-50">
                          {loading ? <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"/> : <FaCheckCircle />}
                          {loading ? 'Saving...' : 'Confirm Booking'}
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Collapsed preview pills */}
                {!isActive && (
                  <div className="px-6 pb-4">
                    <div className="flex flex-wrap gap-2">
                      {previewFields[step.id].map((f,i) => (
                        <span key={i} className={`text-xs px-2.5 py-1 rounded-full border ${
                          f.endsWith('*') ? 'bg-red-50 text-red-400 border-red-100' : 'bg-gray-50 text-gray-400 border-gray-100'
                        }`}>{f}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── RIGHT sticky summary ── */}
        <div className="w-full lg:w-[320px] flex-shrink-0">
          <div className="sticky top-6 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-800">Order Summary</h3>
              <p className="text-xs text-gray-400 mt-0.5">{selectedResult.containerSize} · Sea Freight</p>
            </div>
            <div className="px-5 py-4 space-y-4">
              <button onClick={()=>setShowBreakup(!showBreakup)}
                className="w-full flex items-center justify-between text-xs font-semibold text-gray-400 uppercase tracking-wide hover:text-blue-500 transition">
                <span>Charges Breakup</span>
                {showBreakup ? <FaChevronUp /> : <FaChevronDown />}
              </button>
              {showBreakup && (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Ocean Freight</span><span className="font-semibold">{fmt(selectedResult.price)}</span></div>
                  <div className="flex justify-between text-xs text-gray-400 italic"><span>Excl. GST &amp; port charges</span></div>
                </div>
              )}
              <div className="border-t border-dashed border-gray-200 pt-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-800">Total</span>
                  <span className="text-xl font-extrabold text-blue-700">{fmt(selectedResult.price)}</span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">Port charges billed separately</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 space-y-1.5 text-xs text-gray-500">
                <div className="flex justify-between"><span>Carrier</span><span className="font-semibold text-gray-700">{selectedResult.carrier}</span></div>
                <div className="flex justify-between"><span>From</span><span className="font-semibold text-gray-700">{selectedResult.originPort}</span></div>
                <div className="flex justify-between"><span>To</span><span className="font-semibold text-gray-700">{selectedResult.destinationPort}</span></div>
                <div className="flex justify-between"><span>Departure</span><span className="font-semibold text-gray-700">{selectedResult.departureDate}</span></div>
                <div className="flex justify-between"><span>Transit</span><span className="font-semibold text-gray-700">{selectedResult.transitTime}</span></div>
                <div className="flex justify-between"><span>Container</span><span className="font-semibold text-gray-700">{selectedResult.containerSize}</span></div>
              </div>
              <p className="text-xs text-gray-400">*Prices indicative, subject to change on actuals.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SeaBookingDetailsPage;
