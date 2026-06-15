// src/pages/RailBookingConfirmationPage.tsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  FaArrowLeft, FaArrowRight, FaCheckCircle,
  FaTrain, FaCube, FaBoxOpen, FaCreditCard, FaUser,
  FaMapMarkerAlt, FaBox, FaChevronDown, FaChevronUp, FaTag, FaTruck,
  FaFileUpload, FaFileAlt, FaTimes, FaFileSignature,
} from 'react-icons/fa';
import type { AllFormData, FreightTrainResult, TrainContainerFormData } from '../types/QuoteFormHandle';

const DOMESTIC_THC = 3000;
const INTL_THC: Record<string, number> = {
  '20ft Standard': 6000, '20ft High Cube': 6000, '20ft High Cube Reefer': 6000,
  '40ft Standard': 10800, '40ft High Cube': 10800, '40ft High Cube Reefer': 10800, '40ft Open Top High': 10800,
};
const INTL_OTHER: Record<string, number> = {
  '20ft Standard': 3500, '20ft High Cube': 3500, '20ft High Cube Reefer': 3500,
  '40ft Standard': 7000, '40ft High Cube': 7000, '40ft High Cube Reefer': 7000, '40ft Open Top High': 7000,
};
// ── Corrected first/last mile rates per Charan ──
const FIRST_LAST_MILE_FIRST: Record<string, number> = {
  '20ft Standard': 10500, '20ft High Cube': 10500, '20ft High Cube Reefer': 10500,
  '40ft Standard': 12000, '40ft High Cube': 12000, '40ft High Cube Reefer': 12000, '40ft Open Top High': 12000,
};
const FIRST_LAST_MILE_LAST: Record<string, number> = {
  '20ft Standard': 12000, '20ft High Cube': 12000, '20ft High Cube Reefer': 12000,
  '40ft Standard': 12000, '40ft High Cube': 12000, '40ft High Cube Reefer': 12000, '40ft Open Top High': 12000,
};

const fmt = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;
const formatServiceType = (st: string) => {
  const m: Record<string,string> = {
    terminalToTerminal:'Terminal to Terminal', doorToDoor:'Door to Door',
    doorToTerminal:'Door to Terminal', terminalToDoor:'Terminal to Door',
    terminalToPort:'Terminal to Port', doorToPort:'Door to Port',
    portToTerminal:'Port to Terminal', portToDoor:'Port to Door',
  };
  return m[st] || st;
};

const inp = (err?: boolean) =>
  `w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 transition ${
    err ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'
  }`;

const STEPS = [
  { id: 1, label: 'Sender',   icon: FaUser,        color: 'text-blue-500',   bg: 'bg-blue-50',   border: 'border-blue-200',   activeBg: 'bg-blue-600'   },
  { id: 2, label: 'Receiver', icon: FaMapMarkerAlt, color: 'text-green-500',  bg: 'bg-green-50',  border: 'border-green-200',  activeBg: 'bg-green-600'  },
  { id: 3, label: 'Cargo',    icon: FaBox,          color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-200', activeBg: 'bg-orange-500' },
  { id: 4, label: 'Add-ons',  icon: FaTag,          color: 'text-teal-500',   bg: 'bg-teal-50',   border: 'border-teal-200',   activeBg: 'bg-teal-600'   },
  { id: 5, label: 'Payment',  icon: FaCreditCard,   color: 'text-purple-500', bg: 'bg-purple-50', border: 'border-purple-200', activeBg: 'bg-purple-600' },
];

const RailBookingConfirmationPage: React.FC = () => {
  const location = useLocation();
  const navigate  = useNavigate();

  const [formData, setFormData]                       = useState<AllFormData | null>(null);
  const [selectedTrainResult, setSelectedTrainResult] = useState<FreightTrainResult | null>(null);
  const [loading, setLoading]                         = useState(true);
  const [error, setError]                             = useState<string | null>(null);
  const [insuranceRequired, setInsuranceRequired]     = useState(false);
  const [currentStep, setCurrentStep]                 = useState(1);
  const [showBreakup, setShowBreakup]                 = useState(true);
  const [errors, setErrors]                           = useState<Record<string, string>>({});
  const [claimGstInput, setClaimGstInput]             = useState(false);   // from service-details page; makes sender GSTIN required
  const [shippingLine,  setShippingLine]              = useState('');      // ocean carrier (international) from service-details page
  const [promoCode,     setPromoCode]                 = useState('');      // applied promo from service-details page
  const [promoDiscount, setPromoDiscount]             = useState(0);       // ₹ discount carried from service-details page
  // When opened from My Bookings to complete an existing booking, this carries the
  // booking's id/number so we update THAT booking instead of creating a new one.
  const [existingBooking, setExistingBooking]         = useState<{ id?: string; booking_number?: string } | null>(null);
  const [filingNumber, setFilingNumber]               = useState('');      // 7-digit Shipping Bill / e-Forwarding Note no.

  // Sender
  const [senderName,    setSenderName]    = useState('');
  const [senderPhone,   setSenderPhone]   = useState('');
  const [senderEmail,   setSenderEmail]   = useState('');
  const [senderGstin,   setSenderGstin]   = useState('');
  const [senderAddress, setSenderAddress] = useState('');
  const [senderCity,    setSenderCity]    = useState('');
  const [senderState,   setSenderState]   = useState('');
  const [senderPincode, setSenderPincode] = useState('');
  const [senderCountry, setSenderCountry] = useState('India');

  // Receiver
  const [receiverName,    setReceiverName]    = useState('');
  const [receiverPhone,   setReceiverPhone]   = useState('');
  const [receiverEmail,   setReceiverEmail]   = useState('');
  const [receiverGstin,   setReceiverGstin]   = useState('');
  const [receiverAddress, setReceiverAddress] = useState('');
  const [receiverCity,    setReceiverCity]    = useState('');
  const [receiverState,   setReceiverState]   = useState('');
  const [receiverPincode, setReceiverPincode] = useState('');
  const [receiverCountry, setReceiverCountry] = useState('India');

  // Cargo
  const [goodsDescription,    setGoodsDescription]    = useState('');
  const [hsnCode,             setHsnCode]             = useState('');
  const [natureOfPacking,     setNatureOfPacking]     = useState('');
  const [weightPerContainer,  setWeightPerContainer]  = useState('');
  const [invoiceNumber,       setInvoiceNumber]       = useState('');
  const [invoiceDate,         setInvoiceDate]         = useState('');
  const [invoiceValue,        setInvoiceValue]        = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [hazardousUN,         setHazardousUN]         = useState('');
  const [hazardousClass,      setHazardousClass]      = useState('');
  const [reeferTemp,          setReeferTemp]          = useState('');
  const [numPackages,         setNumPackages]         = useState('');
  const [packageSize,         setPackageSize]         = useState('');
  const [layoutPlan,          setLayoutPlan]          = useState('');
  const [incoterms,           setIncoterms]           = useState('');
  const [waybillNo,           setWaybillNo]           = useState('');
  const [bolNo,               setBolNo]               = useState('');
  const [poNo,                setPoNo]                = useState('');
  const [lcNo,                setLcNo]                = useState('');
  const [uploadedDocs,        setUploadedDocs]        = useState<File[]>([]);

  // Add-ons
  const [addFirstMile,  setAddFirstMile]  = useState(false);
  const [addLastMile,   setAddLastMile]   = useState(false);
  const [addCustoms,    setAddCustoms]    = useState(false);
  const [addInsurance,  setAddInsurance2] = useState(false);
  const [addCO2,        setAddCO2]        = useState(false);
  const [addMiles,      setAddMiles]      = useState(false);
  const [firstMileAddr, setFirstMileAddr] = useState('');
  const [lastMileAddr,  setLastMileAddr]  = useState('');

  // Payment
  const [paymentMode,   setPaymentMode]   = useState<'online'|'bank'|'credit'>('online');
  const [creditAccount, setCreditAccount] = useState('');

  useEffect(() => {
    const state = location.state as {
      formData: AllFormData;
      selectedTrainResult: FreightTrainResult;
      initialInsuranceRequired: boolean;
      claimGstInput?: boolean;
      shippingLine?: string;
      promoCode?: string;
      promoDiscount?: number;
      initialStep?: number;
      existing?: { id?: string; booking_number?: string };
      prefill?: { sender?: any; receiver?: any; cargo?: any };
    } | undefined;
    if (state?.formData && state?.selectedTrainResult) {
      setFormData(state.formData);
      setSelectedTrainResult(state.selectedTrainResult);
      setInsuranceRequired(state.initialInsuranceRequired || false);
      setAddInsurance2(state.initialInsuranceRequired || false); // keep the toggle in sync
      setClaimGstInput(state.claimGstInput || false);
      setShippingLine(state.shippingLine || '');
      setPromoCode(state.promoCode || '');
      setPromoDiscount(state.promoDiscount || 0);
      setExistingBooking(state.existing || null);
      // Carry over the add-ons the customer already picked on Recommended
      // Services so those toggles start ON here (domestic + international).
      const fd = state.formData as any;
      setAddFirstMile(!!fd.addFirstMile);
      setAddLastMile(!!fd.addLastMile);
      setAddCustoms(!!fd.addCustoms);
      // Prefill from an existing booking (completing it from My Bookings).
      const pf = state.prefill;
      if (pf?.sender) {
        const s = pf.sender;
        if (s.name) setSenderName(s.name); if (s.phone) setSenderPhone(s.phone);
        if (s.email) setSenderEmail(s.email); if (s.gstin) setSenderGstin(s.gstin);
        if (s.address) setSenderAddress(s.address); if (s.city) setSenderCity(s.city);
        if (s.state) setSenderState(s.state); if (s.pincode) setSenderPincode(s.pincode);
        if (s.country) setSenderCountry(s.country);
      }
      if (pf?.receiver) {
        const r = pf.receiver;
        if (r.name) setReceiverName(r.name); if (r.phone) setReceiverPhone(r.phone);
        if (r.email) setReceiverEmail(r.email); if (r.gstin) setReceiverGstin(r.gstin);
        if (r.address) setReceiverAddress(r.address); if (r.city) setReceiverCity(r.city);
        if (r.state) setReceiverState(r.state); if (r.pincode) setReceiverPincode(r.pincode);
        if (r.country) setReceiverCountry(r.country);
      }
      if (pf?.cargo) {
        const c = pf.cargo;
        if (c.goodsDescription) setGoodsDescription(c.goodsDescription);
        if (c.hsnCode) setHsnCode(c.hsnCode);
        if (c.natureOfPacking) setNatureOfPacking(c.natureOfPacking);
        if (c.weightPerContainer) setWeightPerContainer(String(c.weightPerContainer));
        if (c.invoiceNumber) setInvoiceNumber(c.invoiceNumber);
        if (c.invoiceDate) setInvoiceDate(c.invoiceDate);
        if (c.invoiceValue) setInvoiceValue(String(c.invoiceValue));
        if (c.numPackages) setNumPackages(String(c.numPackages));
        if (c.packageSize) setPackageSize(c.packageSize);
        if (c.specialInstructions) setSpecialInstructions(c.specialInstructions);
      }
      if (pf?.filing) setFilingNumber(String(pf.filing));
      if (state.initialStep) setCurrentStep(state.initialStep);
      setLoading(false);
    } else {
      setError('Booking details not found.');
      setLoading(false);
    }
  }, [location.state]);

  const getBreakdown = () => {
    if (!selectedTrainResult || !formData) return null;
    const cfd = formData as TrainContainerFormData;
    const isDomestic = cfd.isDomestic !== false;
    // Empty types ("20ft Empty"/"40ft Empty") reuse their loaded base rate card.
    const ct = (cfd.containerType || '20ft Standard').replace(/\bEmpty\b/i, 'Standard');
    const n  = cfd.numberOfContainers || 1;
    const st = cfd.serviceType || 'terminalToTerminal';
    // Honour both the service type and an explicitly toggled add-on (matches the
    // Service Details page) so first/last mile reflects the Add-ons selections.
    const isDoorO    = addFirstMile || st==='doorToDoor'||st==='doorToTerminal'||st==='doorToPort';
    const isDoorD    = addLastMile  || st==='doorToDoor'||st==='terminalToDoor'||st==='portToDoor';
    const isDestPort = st==='terminalToPort'||st==='doorToPort';
    const isOrigPort = st==='portToTerminal'||st==='portToDoor';
    const base    = selectedTrainResult.price;
    const thcSide = isDomestic ? DOMESTIC_THC : (INTL_THC[ct]||8700);
    const thcO    = isOrigPort ? 0 : thcSide*n;
    const thcD    = isDestPort ? 0 : thcSide*n;
    const other   = isDomestic ? 0 : (INTL_OTHER[ct]||1000)*n;
    const fm      = isDoorO ? (FIRST_LAST_MILE_FIRST[ct]||10500)*n : 0;
    const lm      = isDoorD ? (FIRST_LAST_MILE_LAST[ct]||12000)*n : 0;
    const pf      = isDomestic ? 1000 : 1500;
    const insAmt   = insuranceRequired ? 1000 : 0;
    // Claiming GST input → 18% on rail + first/last mile too; else concessional 5%.
    const rRate    = claimGstInput ? 0.18 : 0.05;
    const gRail   = Math.round(base*rRate);
    const gTHC    = Math.round((thcO+thcD+other)*0.18);
    const gFLML   = Math.round((fm+lm)*rRate);
    const gPlat   = Math.round(pf*0.18);
    const gIns    = Math.round(insAmt*0.18);
    const totalGST = gRail+gTHC+gFLML+gPlat+gIns;
    const subtotal = base+thcO+thcD+other+fm+lm+pf;
    const preDiscount = subtotal+totalGST+insAmt;
    // Promo discount carried from the Service Details page (e.g. SHIPPITINNEW −₹1,000).
    const discount = Math.min(promoDiscount || 0, preDiscount);
    const grand    = preDiscount - discount;
    return { base,thcO,thcD,other,fm,lm,pf,gRail,gTHC,gFLML,gPlat,gIns,totalGST,subtotal,insAmt,discount,grand,isDomestic,n,thcSide,isDoorO,isDoorD,isDestPort,isOrigPort };
  };
  const bd = getBreakdown();

  const validateStep = (step: number) => {
    const e: Record<string,string> = {};
    if (step===1) {
      if (!senderName.trim())    e.senderName    = 'Required';
      if (!senderPhone.trim())   e.senderPhone   = 'Required';
      if (!senderEmail.trim())   e.senderEmail   = 'Required';
      if (!senderAddress.trim()) e.senderAddress = 'Required';
      if (!senderCity.trim())    e.senderCity    = 'Required';
      if (!senderState.trim())   e.senderState   = 'Required';
      if (claimGstInput && !senderGstin.trim()) e.senderGstin = 'GSTIN required (you selected “I have a GST number”)';
    }
    if (step===2) {
      if (!receiverName.trim())    e.receiverName    = 'Required';
      if (!receiverPhone.trim())   e.receiverPhone   = 'Required';
      if (!receiverEmail.trim())   e.receiverEmail   = 'Required';
      if (!receiverAddress.trim()) e.receiverAddress = 'Required';
      if (!receiverCity.trim())    e.receiverCity    = 'Required';
      if (!receiverState.trim())   e.receiverState   = 'Required';
    }
    if (step===3) {
      if (!goodsDescription.trim())   e.goodsDescription   = 'Required';
      if (!invoiceNumber.trim())      e.invoiceNumber      = 'Required';
      if (!invoiceValue.trim())       e.invoiceValue       = 'Required';
      if (!weightPerContainer.trim()) e.weightPerContainer = 'Required';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const goToStep  = (step: number) => { setErrors({}); setCurrentStep(step); };
  const nextStep  = () => { if (validateStep(currentStep)) setCurrentStep(s => Math.min(s+1, 5)); };

  const handleConfirm = () => {
    if (!validateStep(5)) return;
    // Completing an existing booking → reuse its number (no duplicate); otherwise mint a new one.
    const isExisting = !!existingBooking?.booking_number;
    const bookingId = existingBooking?.booking_number || `TRN-${Date.now().toString().slice(-6)}`;

    // Reflect the completion on My Bookings. There's no backend update endpoint yet,
    // so persist the entered details + a "confirmed" status via the same localStorage
    // overrides the My Bookings page reads (keyed by the booking's id).
    if (existingBooking?.id) {
      try {
        const fdAny = formData as any;
        const dov = JSON.parse(localStorage.getItem('bookingDetailOverrides') || '{}');
        dov[existingBooking.id] = {
          ...(dov[existingBooking.id] || {}),
          sender_name: senderName, sender_phone: senderPhone, sender_email: senderEmail, sender_gstin: senderGstin,
          sender_address: senderAddress, sender_city: senderCity, sender_state: senderState, sender_pincode: senderPincode, sender_country: senderCountry,
          receiver_name: receiverName, receiver_phone: receiverPhone, receiver_email: receiverEmail, receiver_gstin: receiverGstin,
          receiver_address: receiverAddress, receiver_city: receiverCity, receiver_state: receiverState, receiver_pincode: receiverPincode, receiver_country: receiverCountry,
          goods_description: goodsDescription, hsn_code: hsnCode, nature_of_packing: natureOfPacking,
          weight_per_container: weightPerContainer, invoice_number: invoiceNumber, invoice_date: invoiceDate, invoice_value: invoiceValue,
          num_packages: numPackages, package_size: packageSize, special_instructions: specialInstructions,
          route_type: fdAny?.serviceType, container_type: fdAny?.containerType, number_of_containers: fdAny?.numberOfContainers,
          is_domestic: fdAny?.isDomestic !== false, operator: selectedTrainResult?.operator, transit_time: selectedTrainResult?.transitDuration,
          insurance_required: insuranceRequired, charges_breakdown: bd, filing_number: filingNumber || undefined,
        };
        localStorage.setItem('bookingDetailOverrides', JSON.stringify(dov));
        const sov = JSON.parse(localStorage.getItem('bookingStatusOverrides') || '{}');
        sov[existingBooking.id] = 'confirmed';
        localStorage.setItem('bookingStatusOverrides', JSON.stringify(sov));
      } catch { /* ignore quota/parse */ }
    }

    const finalBooking = {
      skipPersist: isExisting,   // existing booking → don't re-POST (would duplicate / there's no update endpoint)
      selectedResult: {
        ...selectedTrainResult!,
        // normalise field names so BookingConfirmationPage & TrackPage can read them
        originStation:      selectedTrainResult!.originStation,
        destinationStation: selectedTrainResult!.destinationStation,
        transitDuration:    selectedTrainResult!.transitDuration,
        operator:           selectedTrainResult!.operator,
        mode:               'rail',
      },
      originalFormData: formData!,
      senderDetails:   { senderName, senderPhone, senderEmail, senderGstin, senderAddress, senderCity, senderState, senderPincode, senderCountry },
      receiverDetails: { receiverName, receiverPhone, receiverEmail, receiverGstin, receiverAddress, receiverCity, receiverState, receiverPincode, receiverCountry },
      cargoDetails:    { goodsDescription, hsnCode, natureOfPacking, weightPerContainer, invoiceNumber, invoiceDate, invoiceValue, specialInstructions, hazardousUN, hazardousClass, reeferTemp, documents: uploadedDocs.map(f => f.name) },
      paymentDetails:  { paymentMode, creditAccount },
      bookingDate:     new Date().toLocaleDateString('en-IN'),
      bookingTime:     new Date().toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' }),
      bookingId,
      finalAmount:     bd?.grand || 0,
      insuranceRequired,
      shippingLine,
      claimGstInput,
      promoCode:       promoCode || undefined,
      promoDiscount:   bd?.discount || 0,
      charges:         bd,   // full charge breakdown (base, THC, mile, insurance, discount, GST, grand)
      filingNumber:    filingNumber || undefined,
    };
    sessionStorage.setItem('lastBookingDetails', JSON.stringify(finalBooking));
    navigate('/booking-confirmation', { state: { bookingDetails: finalBooking } });
  };

  const cfd        = formData as TrainContainerFormData;
  const isDomestic = cfd?.isDomestic !== false;
  const isReefer   = cfd?.containerType?.includes('Reefer');
  const isHazardous = formData?.hazardousCargo;
  const MainIcon   = formData?.bookingType==='Train Goods Booking' ? FaTrain
    : formData?.bookingType==='Train Container Booking' ? FaCube : FaBoxOpen;

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
    </div>
  );
  if (error || !formData || !selectedTrainResult) return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="text-center p-10 bg-white rounded-2xl shadow">
        <p className="text-red-600 mb-4">{error||'Details not found.'}</p>
        <button onClick={()=>navigate(-1)} className="bg-blue-600 text-white px-6 py-2 rounded-lg">Go Back</button>
      </div>
    </div>
  );

  const previewFields: Record<number, string[]> = {
    1: ['Full Name / Company *', 'Mobile Number *', 'Email ID *', 'GSTIN', 'Address *', 'City *', 'State *', 'Pincode', 'Country'],
    2: ['Full Name / Company *', 'Mobile Number *', 'Email ID *', 'GSTIN', 'Address *', 'City *', 'State *', 'Pincode', 'Country'],
    3: ['Description of Goods *', 'HSN Code', 'Nature of Packing', 'Weight / Container (MT) *', 'Invoice Number *', 'Invoice Date', 'Invoice Value (₹)', 'Special Instructions'],
    4: ['First Mile Pickup (optional)', 'Last Mile Delivery (optional)', ...(!isDomestic ? ['Customs Clearance ₹2,000 (optional)'] : []), 'Cargo Insurance ₹1,000 (optional)', 'CO₂ Credits', 'Miles Credits'],
    5: ['Payment Mode', 'Online / Bank Transfer / Credit Account'],
  };

  return (
    <div className="min-h-screen bg-gray-50 py-5 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-4">

        <div className="flex-grow space-y-3">

          {/* File the rail / customs document. International: Shipping Bill / e-FNote.
              Domestic: e-Forwarding Note only. User enters their existing 7-digit no. */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-5 py-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                <FaFileSignature className="text-blue-500" />
                File {isDomestic ? 'E-Forwarding Note' : 'Shipping Bill / E-Forwarding Note'}
              </p>
              <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                {isDomestic ? 'Domestic' : 'International'}
              </span>
            </div>
            <input
              type="text" inputMode="numeric" maxLength={7}
              value={filingNumber}
              onChange={e => setFilingNumber(e.target.value.replace(/\D/g, '').slice(0, 7))}
              placeholder="Enter 7-digit number"
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
            <p className="text-[11px] text-gray-400 mt-1">
              Enter the 7-digit {isDomestic ? 'E-Forwarding Note' : 'Shipping Bill / E-Forwarding Note'} number.
            </p>
          </div>

          {/* Header + stepper — single compact card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-5 py-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-2 rounded-lg bg-blue-50 flex-shrink-0"><MainIcon className="text-base text-blue-500" /></div>
                <div className="min-w-0">
                  <h1 className="text-base font-bold text-gray-800 leading-tight">Complete Your Booking</h1>
                  <p className="text-gray-400 text-xs">Click any section to fill in details</p>
                </div>
              </div>
              <button onClick={()=>navigate('/train-service-details',{state:{formData,selectedTrainResult}})}
                className="flex items-center text-blue-500 hover:text-blue-600 text-xs font-medium transition flex-shrink-0 ml-2">
                <FaArrowLeft className="mr-1.5 text-[10px]" /> Back
              </button>
            </div>
            <div className="flex items-center justify-between border-t border-gray-50 pt-3">
              {STEPS.map((step, idx) => {
                const Icon     = step.icon;
                const isActive = currentStep === step.id;
                const isDone   = currentStep > step.id;
                return (
                  <React.Fragment key={step.id}>
                    <button onClick={() => goToStep(step.id)} className="flex flex-col items-center gap-1 group">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                        isDone   ? 'bg-green-500 text-white' :
                        isActive ? `${step.activeBg} text-white shadow-lg` :
                                   'bg-gray-100 text-gray-400 group-hover:bg-gray-200'
                      }`}>
                        {isDone ? <FaCheckCircle className="text-sm" /> : <Icon className="text-sm" />}
                      </div>
                      <span className={`text-xs font-semibold transition ${
                        isActive ? step.color : isDone ? 'text-green-500' : 'text-gray-400'
                      }`}>{step.label}</span>
                    </button>
                    {idx < STEPS.length-1 && (
                      <div className={`flex-1 h-0.5 mx-2 transition-all ${currentStep > step.id ? 'bg-green-400' : 'bg-gray-200'}`} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Steps */}
          {STEPS.map(step => {
            const Icon     = step.icon;
            const isActive = currentStep === step.id;
            const isDone   = currentStep > step.id;
            return (
              <div key={step.id}
                className={`bg-white rounded-2xl shadow-sm border transition-all ${
                  isActive ? `${step.border} border-2` : 'border-gray-100'
                }`}>
                <button onClick={() => goToStep(step.id)}
                  className="w-full flex items-center justify-between px-5 py-3 text-left">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isDone ? 'bg-green-500' : isActive ? step.activeBg : 'bg-gray-100'
                    }`}>
                      {isDone
                        ? <FaCheckCircle className="text-white text-xs" />
                        : <Icon className={`text-xs ${isActive ? 'text-white' : 'text-gray-400'}`} />}
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

                {isActive && (
                  <div className="px-5 pb-5 border-t border-gray-50">

                    {/* SENDER */}
                    {step.id === 1 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Full Name / Company <span className="text-red-400">*</span></label>
                          <input type="text" value={senderName} onChange={e=>setSenderName(e.target.value)} placeholder="e.g., Raj Textiles Pvt Ltd" className={inp(!!errors.senderName)} />
                          {errors.senderName && <p className="text-xs text-red-500 mt-1">{errors.senderName}</p>}
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Mobile Number <span className="text-red-400">*</span></label>
                          <input type="tel" value={senderPhone} onChange={e=>setSenderPhone(e.target.value)} placeholder="e.g., 9876543210" className={inp(!!errors.senderPhone)} />
                          {errors.senderPhone && <p className="text-xs text-red-500 mt-1">{errors.senderPhone}</p>}
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Email ID <span className="text-red-400">*</span></label>
                          <input type="email" value={senderEmail} onChange={e=>setSenderEmail(e.target.value)} placeholder="e.g., sender@company.com" className={inp(!!errors.senderEmail)} />
                          {errors.senderEmail && <p className="text-xs text-red-500 mt-1">{errors.senderEmail}</p>}
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">GSTIN {claimGstInput ? <span className="text-red-400">*</span> : '(optional)'}</label>
                          <input type="text" value={senderGstin} onChange={e=>setSenderGstin(e.target.value.toUpperCase())} placeholder="e.g., 33AAAAA0000A1Z5" className={inp(!!errors.senderGstin)} />
                          {errors.senderGstin && <p className="text-xs text-red-500 mt-1">{errors.senderGstin}</p>}
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Address <span className="text-red-400">*</span></label>
                          <input type="text" value={senderAddress} onChange={e=>setSenderAddress(e.target.value)} placeholder="Street address, locality" className={inp(!!errors.senderAddress)} />
                          {errors.senderAddress && <p className="text-xs text-red-500 mt-1">{errors.senderAddress}</p>}
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">City <span className="text-red-400">*</span></label>
                          <input type="text" value={senderCity} onChange={e=>setSenderCity(e.target.value)} placeholder="e.g., Chennai" className={inp(!!errors.senderCity)} />
                          {errors.senderCity && <p className="text-xs text-red-500 mt-1">{errors.senderCity}</p>}
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">State <span className="text-red-400">*</span></label>
                          <input type="text" value={senderState} onChange={e=>setSenderState(e.target.value)} placeholder="e.g., Tamil Nadu" className={inp(!!errors.senderState)} />
                          {errors.senderState && <p className="text-xs text-red-500 mt-1">{errors.senderState}</p>}
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Pincode</label>
                          <input type="text" value={senderPincode} onChange={e=>setSenderPincode(e.target.value)} placeholder="e.g., 600001" className={inp()} />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Country</label>
                          <input type="text" value={senderCountry} onChange={e=>setSenderCountry(e.target.value)} placeholder="e.g., India" className={inp()} />
                        </div>
                      </div>
                    )}

                    {/* RECEIVER */}
                    {step.id === 2 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Full Name / Company <span className="text-red-400">*</span></label>
                          <input type="text" value={receiverName} onChange={e=>setReceiverName(e.target.value)} placeholder="e.g., Delhi Exports Ltd" className={inp(!!errors.receiverName)} />
                          {errors.receiverName && <p className="text-xs text-red-500 mt-1">{errors.receiverName}</p>}
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Mobile Number <span className="text-red-400">*</span></label>
                          <input type="tel" value={receiverPhone} onChange={e=>setReceiverPhone(e.target.value)} placeholder="e.g., 9876543210" className={inp(!!errors.receiverPhone)} />
                          {errors.receiverPhone && <p className="text-xs text-red-500 mt-1">{errors.receiverPhone}</p>}
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Email ID <span className="text-red-400">*</span></label>
                          <input type="email" value={receiverEmail} onChange={e=>setReceiverEmail(e.target.value)} placeholder="e.g., receiver@company.com" className={inp(!!errors.receiverEmail)} />
                          {errors.receiverEmail && <p className="text-xs text-red-500 mt-1">{errors.receiverEmail}</p>}
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">GSTIN (optional)</label>
                          <input type="text" value={receiverGstin} onChange={e=>setReceiverGstin(e.target.value)} placeholder="e.g., 07BBBBB0000B1Z3" className={inp()} />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Address <span className="text-red-400">*</span></label>
                          <input type="text" value={receiverAddress} onChange={e=>setReceiverAddress(e.target.value)} placeholder="Street address, locality" className={inp(!!errors.receiverAddress)} />
                          {errors.receiverAddress && <p className="text-xs text-red-500 mt-1">{errors.receiverAddress}</p>}
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">City <span className="text-red-400">*</span></label>
                          <input type="text" value={receiverCity} onChange={e=>setReceiverCity(e.target.value)} placeholder="e.g., Delhi" className={inp(!!errors.receiverCity)} />
                          {errors.receiverCity && <p className="text-xs text-red-500 mt-1">{errors.receiverCity}</p>}
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">State <span className="text-red-400">*</span></label>
                          <input type="text" value={receiverState} onChange={e=>setReceiverState(e.target.value)} placeholder="e.g., Delhi" className={inp(!!errors.receiverState)} />
                          {errors.receiverState && <p className="text-xs text-red-500 mt-1">{errors.receiverState}</p>}
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Pincode</label>
                          <input type="text" value={receiverPincode} onChange={e=>setReceiverPincode(e.target.value)} placeholder="e.g., 110001" className={inp()} />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Country</label>
                          <input type="text" value={receiverCountry} onChange={e=>setReceiverCountry(e.target.value)} placeholder="e.g., India" className={inp()} />
                        </div>
                      </div>
                    )}

                    {/* CARGO */}
                    {step.id === 3 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Description of Goods <span className="text-red-400">*</span></label>
                          <input type="text" value={goodsDescription} onChange={e=>setGoodsDescription(e.target.value)} placeholder="e.g., Cotton fabric rolls, automotive spare parts" className={inp(!!errors.goodsDescription)} />
                          {errors.goodsDescription && <p className="text-xs text-red-500 mt-1">{errors.goodsDescription}</p>}
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">HSN Code (optional)</label>
                          <input type="text" value={hsnCode} onChange={e=>setHsnCode(e.target.value)} placeholder="e.g., 5208" className={inp()} />
                        </div>
                        {!isDomestic && (
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Incoterms</label>
                            <select value={incoterms} onChange={e=>setIncoterms(e.target.value)} className={inp()}>
                              <option value="">Select Incoterms</option>
                              {[['EXW','EXW — Ex Works'],['FCA','FCA — Free Carrier'],['FOB','FOB — Free On Board'],['CFR','CFR — Cost and Freight'],['CIF','CIF — Cost Insurance Freight'],['CPT','CPT — Carriage Paid To'],['DAP','DAP — Delivered at Place'],['DDP','DDP — Delivered Duty Paid']].map(([v,l])=><option key={v} value={v}>{l}</option>)}
                            </select>
                          </div>
                        )}
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Nature of Packing</label>
                          <select value={natureOfPacking} onChange={e=>setNatureOfPacking(e.target.value)} className={inp()}>
                            <option value="">Select packing type</option>
                            {['Loose','Palletized','Bundled','Cartons','Bags','Drums','Other'].map(v=><option key={v}>{v}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Gross Weight / Container (MT) <span className="text-red-400">*</span></label>
                          <input type="number" value={weightPerContainer} onChange={e=>setWeightPerContainer(e.target.value)} placeholder="e.g., 22" className={inp(!!errors.weightPerContainer)} />
                          {errors.weightPerContainer && <p className="text-xs text-red-500 mt-1">{errors.weightPerContainer}</p>}
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Invoice Number <span className="text-red-400">*</span></label>
                          <input type="text" value={invoiceNumber} onChange={e=>setInvoiceNumber(e.target.value)} placeholder="e.g., INV-2026-001" className={inp(!!errors.invoiceNumber)} />
                          {errors.invoiceNumber && <p className="text-xs text-red-500 mt-1">{errors.invoiceNumber}</p>}
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Invoice Date</label>
                          <input type="date" value={invoiceDate} onChange={e=>setInvoiceDate(e.target.value)} className={inp()} />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Invoice Value (₹) <span className="text-red-400">*</span></label>
                          <input type="number" value={invoiceValue} onChange={e=>setInvoiceValue(e.target.value)} placeholder="e.g., 500000" className={inp(!!errors.invoiceValue)} />
                          {errors.invoiceValue && <p className="text-xs text-red-500 mt-1">{errors.invoiceValue}</p>}
                        </div>
                        {isHazardous && <>
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">UN Number</label>
                            <input type="text" value={hazardousUN} onChange={e=>setHazardousUN(e.target.value)} placeholder="e.g., UN1203" className={inp()} />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Hazard Class (IMDG)</label>
                            <input type="text" value={hazardousClass} onChange={e=>setHazardousClass(e.target.value)} placeholder="e.g., Class 3" className={inp()} />
                          </div>
                        </>}
                        {isReefer && (
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Required Temperature (°C)</label>
                            <input type="text" value={reeferTemp} onChange={e=>setReeferTemp(e.target.value)} placeholder="e.g., -18" className={inp()} />
                          </div>
                        )}
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">No. of Packages</label>
                          <input type="number" value={numPackages} onChange={e=>setNumPackages(e.target.value)} placeholder="e.g., 120" className={inp()} />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Package Size (L×W×H cm)</label>
                          <input type="text" value={packageSize} onChange={e=>setPackageSize(e.target.value)} placeholder="e.g., 60×40×40" className={inp()} />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Layout Plan / Stacking Instructions</label>
                          <textarea value={layoutPlan} onChange={e=>setLayoutPlan(e.target.value)} placeholder="e.g., 3 layers, 40 boxes per layer, fragile side up..." rows={2} className={`${inp()} resize-none`} />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Special Handling Instructions</label>
                          <textarea value={specialInstructions} onChange={e=>setSpecialInstructions(e.target.value)} placeholder="Any special requirements..." rows={2} className={`${inp()} resize-none`} />
                        </div>
                        <div className="sm:col-span-2 border-t border-gray-100 pt-3 mt-1">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Documents (optional)</p>
                        </div>
                        <div className="sm:col-span-2">
                          <label htmlFor="cargo-docs" className="flex flex-col items-center justify-center gap-1 border-2 border-dashed border-gray-200 rounded-xl px-4 py-4 cursor-pointer hover:border-blue-300 hover:bg-blue-50/40 transition text-center">
                            <FaFileUpload className="text-blue-400 text-lg" />
                            <span className="text-xs font-semibold text-gray-600">Click to upload documents</span>
                            <span className="text-[11px] text-gray-400">Invoice, packing list, e-way bill, etc. · PDF / JPG / PNG</span>
                            <input id="cargo-docs" type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                              onChange={e => { setUploadedDocs(prev => [...prev, ...Array.from(e.target.files || [])]); e.target.value = ''; }}
                              className="hidden" />
                          </label>
                          {uploadedDocs.length > 0 && (
                            <div className="mt-2 space-y-1.5">
                              {uploadedDocs.map((f, i) => (
                                <div key={i} className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-lg px-3 py-1.5">
                                  <span className="text-xs text-gray-600 flex items-center gap-2 min-w-0">
                                    <FaFileAlt className="text-gray-400 flex-shrink-0" />
                                    <span className="truncate">{f.name}</span>
                                    <span className="text-gray-300 flex-shrink-0">{(f.size/1024).toFixed(0)} KB</span>
                                  </span>
                                  <button type="button" onClick={() => setUploadedDocs(prev => prev.filter((_, j) => j !== i))} className="text-gray-300 hover:text-red-500 transition flex-shrink-0 ml-2">
                                    <FaTimes className="text-xs" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Waybill Number</label>
                          <input type="text" value={waybillNo} onChange={e=>setWaybillNo(e.target.value)} placeholder="e.g., WB-2026-001234" className={inp()} />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Bill of Lading No.</label>
                          <input type="text" value={bolNo} onChange={e=>setBolNo(e.target.value)} placeholder="e.g., MAEU123456789" className={inp()} />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Purchase Order No.</label>
                          <input type="text" value={poNo} onChange={e=>setPoNo(e.target.value)} placeholder="e.g., PO-2026-4521" className={inp()} />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Letter of Credit No.</label>
                          <input type="text" value={lcNo} onChange={e=>setLcNo(e.target.value)} placeholder="e.g., LC/2026/001" className={inp()} />
                        </div>
                      </div>
                    )}

                    {/* ADD-ONS */}
                    {step.id === 4 && (
                      <div className="mt-3 space-y-2.5">
                        <p className="text-xs text-gray-400 mb-3">Select optional services to add to your booking.</p>
                        {[
                          { state: addFirstMile, setter: setAddFirstMile, label: 'First Mile Pickup', icon: <FaTruck className="text-teal-500" />, price: '₹10,500 / container', desc: 'Door pickup from factory/warehouse to ICD/terminal', hasAddr: true, addr: firstMileAddr, setAddr: setFirstMileAddr, addrPlaceholder: 'Factory/warehouse address' },
                          { state: addLastMile,  setter: setAddLastMile,  label: 'Last Mile Delivery', icon: <FaTruck className="text-teal-500" />, price: '₹12,000 / container', desc: 'Delivery from ICD/terminal to receiver\'s door', hasAddr: true, addr: lastMileAddr, setAddr: setLastMileAddr, addrPlaceholder: 'Delivery address' },
                        ].map((item, i) => (
                          <div key={i} className={`border rounded-xl p-3 transition ${item.state ? 'border-teal-300 bg-teal-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" checked={item.state} onChange={e=>item.setter(e.target.checked)} className="mt-1 h-4 w-4 text-teal-600 rounded" />
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <p className="text-sm font-semibold text-gray-800 flex items-center gap-2">{item.icon} {item.label}</p>
                                  <span className="text-xs font-bold text-teal-600 bg-teal-100 px-2 py-0.5 rounded-full">{item.price}</span>
                                </div>
                                <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
                              </div>
                            </label>
                            {item.state && item.hasAddr && (
                              <div className="mt-3 ml-7">
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Address</label>
                                <input type="text" value={item.addr} onChange={e=>item.setAddr(e.target.value)} placeholder={item.addrPlaceholder} className={inp()} />
                              </div>
                            )}
                          </div>
                        ))}
                        {[
                          // Customs Clearance is an international-only service.
                          ...(!isDomestic ? [{ state: addCustoms, setter: setAddCustoms, label: '🛃 Customs Clearance', price: '₹2,000 / shipment', desc: 'CHA-assisted customs documentation' }] : []),
                          { state: addInsurance, setter: (v: boolean) => { setAddInsurance2(v); setInsuranceRequired(v); }, label: '🛡️ Cargo Insurance', price: '₹1,000 flat', desc: 'All-risk cargo insurance' },
                          { state: addCO2,       setter: setAddCO2,        label: '🌱 CO₂ Credits', price: 'Earn green credits', desc: 'Rail emits 75% less CO₂ than road' },
                          { state: addMiles,     setter: setAddMiles,      label: '⭐ Miles Credits', price: 'Earn reward miles', desc: 'Redeem for discounts on future bookings' },
                        ].map((item, i) => (
                          <div key={i} className={`border rounded-xl p-3 transition ${item.state ? 'border-teal-300 bg-teal-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" checked={item.state} onChange={e=>item.setter(e.target.checked)} className="mt-1 h-4 w-4 text-teal-600 rounded" />
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <p className="text-sm font-semibold text-gray-800">{item.label}</p>
                                  <span className="text-xs font-bold text-teal-600 bg-teal-100 px-2 py-0.5 rounded-full">{item.price}</span>
                                </div>
                                <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
                              </div>
                            </label>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* PAYMENT */}
                    {step.id === 5 && (
                      <div className="mt-4 space-y-3">
                        {[
                          { value:'online', label:'Online Payment',  sub:'Credit/Debit Card · Net Banking · UPI' },
                          { value:'bank',   label:'Bank Transfer',   sub:'NEFT / RTGS / IMPS' },
                          { value:'credit', label:'Credit Account',  sub:'CONCOR credit account (existing customers)' },
                        ].map(opt => (
                          <label key={opt.value} className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition ${paymentMode===opt.value ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                            <input type="radio" name="paymentMode" value={opt.value} checked={paymentMode===opt.value} onChange={()=>setPaymentMode(opt.value as any)} className="h-4 w-4 text-blue-600" />
                            <div>
                              <p className="text-sm font-semibold text-gray-800">{opt.label}</p>
                              <p className="text-xs text-gray-400">{opt.sub}</p>
                            </div>
                          </label>
                        ))}
                        {paymentMode==='credit' && (
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Credit Account Number</label>
                            <input type="text" value={creditAccount} onChange={e=>setCreditAccount(e.target.value)} placeholder="e.g., CONCOR-CRED-001234" className={inp()} />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Nav buttons */}
                    <div className="flex justify-between mt-5 pt-3 border-t border-gray-100">
                      <button type="button" onClick={()=>goToStep(Math.max(currentStep-1,1))} disabled={currentStep===1}
                        className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition ${currentStep===1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-100'}`}>
                        <FaArrowLeft className="text-xs" /> Previous
                      </button>
                      {currentStep < 5 ? (
                        <button type="button" onClick={nextStep}
                          className="flex items-center gap-2 px-7 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl transition text-sm">
                          Next <FaArrowRight className="text-xs" />
                        </button>
                      ) : (
                        <button type="button" onClick={handleConfirm}
                          className="flex items-center gap-2 px-7 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl transition text-sm">
                          Confirm Booking <FaCheckCircle />
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {!isActive && (
                  <div className="px-6 pb-4">
                    <div className="flex flex-wrap gap-2">
                      {previewFields[step.id].map((f, i) => (
                        <span key={i} className={`text-xs px-2.5 py-1 rounded-full border ${f.endsWith('*') ? 'bg-red-50 text-red-400 border-red-100' : 'bg-gray-50 text-gray-400 border-gray-100'}`}>{f}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* RIGHT sticky summary */}
        <div className="w-full lg:w-[340px] flex-shrink-0">
          <div className="sticky top-6 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-800">Order Summary</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                {cfd?.numberOfContainers||1} × {cfd?.containerType||'20ft Standard'} · {isDomestic?'Domestic':'International'}
              </p>
            </div>
            <div className="px-5 py-3 space-y-3">
              <button onClick={()=>setShowBreakup(!showBreakup)}
                className="w-full flex items-center justify-between text-xs font-semibold text-gray-400 uppercase tracking-wide hover:text-blue-500 transition">
                <span>Charges Breakup</span>
                {showBreakup ? <FaChevronUp /> : <FaChevronDown />}
              </button>
              {showBreakup && bd && (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Base Rail Freight</span><span className="font-semibold">{fmt(bd.base)}</span></div>
                  {!bd.isOrigPort && <div className="flex justify-between"><span className="text-gray-500">THC Origin ({bd.n}×{fmt(bd.thcSide)})</span><span className="font-semibold">{fmt(bd.thcO)}</span></div>}
                  {!bd.isDestPort && <div className="flex justify-between"><span className="text-gray-500">THC Destination ({bd.n}×{fmt(bd.thcSide)})</span><span className="font-semibold">{fmt(bd.thcD)}</span></div>}
                  {bd.other>0 && <div className="flex justify-between"><span className="text-gray-500">Other Terminal Charges</span><span className="font-semibold">{fmt(bd.other)}</span></div>}
                  {bd.isDoorO && <div className="flex justify-between"><span className="text-gray-500">First Mile</span><span className="font-semibold">{fmt(bd.fm)}</span></div>}
                  {bd.isDoorD && <div className="flex justify-between"><span className="text-gray-500">Last Mile</span><span className="font-semibold">{fmt(bd.lm)}</span></div>}
                  {bd.insAmt>0 && <div className="flex justify-between"><span className="text-gray-500">Cargo Insurance</span><span className="font-semibold">{fmt(bd.insAmt)}</span></div>}
                  <div className="flex justify-between"><span className="text-gray-500">Platform Fee</span><span className="font-semibold">{fmt(bd.pf)}</span></div>
                </div>
              )}
              {bd && (
                <div className="flex justify-between py-2 border-t border-dashed border-gray-200 text-sm font-semibold">
                  <span className="text-gray-600">Subtotal (excl. GST)</span><span>{fmt(bd.subtotal + bd.insAmt)}</span>
                </div>
              )}
              {bd && (
                <div className="bg-amber-50 rounded-xl p-3 space-y-1.5 text-xs">
                  <div className="flex justify-between text-gray-600"><span>Rail Freight GST @{claimGstInput ? '18' : '5'}%</span><span>{fmt(bd.gRail)}</span></div>
                  <div className="flex justify-between text-gray-600"><span>THC GST @18%</span><span>{fmt(bd.gTHC)}</span></div>
                  {(bd.isDoorO||bd.isDoorD) && <div className="flex justify-between text-gray-600"><span>First/Last Mile GST @{claimGstInput ? '18' : '5'}%</span><span>{fmt(bd.gFLML)}</span></div>}
                  <div className="flex justify-between text-gray-600"><span>Platform Fee GST @18%</span><span>{fmt(bd.gPlat)}</span></div>
                  {bd.insAmt>0 && <div className="flex justify-between text-gray-600"><span>Insurance GST @18%</span><span>{fmt(bd.gIns)}</span></div>}
                  <div className="flex justify-between font-bold text-gray-700 pt-1 border-t border-amber-200"><span>Total GST</span><span>{fmt(bd.totalGST)}</span></div>
                </div>
              )}
              {bd && bd.discount > 0 && (
                <div className="flex justify-between items-center text-green-600 text-sm">
                  <span className="font-medium">Discount{promoCode ? ` (${promoCode})` : ''}</span>
                  <span className="font-bold">− {fmt(bd.discount)}</span>
                </div>
              )}
              {bd && (
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-800">Grand Total</span>
                    <span className="text-xl font-extrabold text-blue-700">{fmt(bd.grand)}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">Inclusive of all taxes</p>
                </div>
              )}
              <div className="bg-gray-50 rounded-xl p-3 space-y-1.5 text-xs text-gray-500">
                <div className="flex justify-between"><span>From</span><span className="font-semibold text-gray-700">{selectedTrainResult.originStation}</span></div>
                <div className="flex justify-between"><span>To</span><span className="font-semibold text-gray-700">{selectedTrainResult.destinationStation}</span></div>
                <div className="flex justify-between"><span>Transit</span><span className="font-semibold text-gray-700">{selectedTrainResult.transitDuration}</span></div>
                <div className="flex justify-between"><span>Service</span><span className="font-semibold text-gray-700">{formatServiceType((cfd?.serviceType as string)||'')}</span></div>
                <div className="flex justify-between"><span>Operator</span><span className="font-semibold text-gray-700">{selectedTrainResult.operator}</span></div>
              </div>
              <p className="text-xs text-gray-400">*Prices indicative, subject to change on actuals.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default RailBookingConfirmationPage;
