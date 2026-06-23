// src/pages/SeaBookingDetailsPage.tsx
// Full ocean-freight booking flow — the sea counterpart of RailBookingConfirmationPage.
//   • Fresh booking: Shipper → Consignee → Cargo → Add-ons → Payment (+ charges breakdown + B/L preview)
//   • Existing booking ("Complete documentation" from My Shipments): document filing on top —
//     International = Shipping Bill (verify with Customs/ICEGATE) + VGM & Shipping Instructions (file);
//     Domestic (coastal) = VGM & Shipping Instructions only.
// Filing progress is persisted to bookingDetailOverrides immediately (reusing the same
// filing_number / efn_filed keys as rail) so My Shipments status logic works unchanged.
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  FaArrowLeft, FaArrowRight, FaCheckCircle, FaShip, FaUser, FaMapMarkerAlt,
  FaBox, FaTag, FaCreditCard, FaChevronDown, FaChevronUp, FaTruck,
  FaFileUpload, FaFileAlt, FaTimes, FaFileSignature, FaAnchor,
} from 'react-icons/fa';
import type { AllFormData, SeaFormData } from '../types/QuoteFormHandle';
import LocationAutocomplete from '../components/LocationAutocomplete';

// Per-container port charges by container size (₹). Falls back to the 40' rate.
const SEA_ORIGIN_THC: Record<'20' | '40', number> = { '20': 18000, '40': 29900 };
const SEA_DEST_THC:   Record<'20' | '40', number> = { '20': 28000, '40': 45650 };
const SEA_FIRST_MILE: Record<'20' | '40', number> = { '20': 10500, '40': 12000 };
const SEA_LAST_MILE:  Record<'20' | '40', number> = { '20': 12000, '40': 12000 };
const SEA_CUSTOMS   = 2000;   // CHA-assisted customs clearance (flat / shipment)
const SEA_PLATFORM  = 1500;   // Shippitin platform fee

const fmt = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;
const ckey = (ct?: string): '20' | '40' => ((ct || '').includes('40') ? '40' : '20');

// err → failed validation (stronger red). empty → required but not yet filled (soft red).
const inp = (err?: boolean, empty?: boolean) =>
  `w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 transition ${
    err ? 'border-red-400 bg-red-50' : empty ? 'border-red-200 bg-red-50/60' : 'border-gray-200 bg-white'
  }`;

// Remember the last shipper / consignee (per logged-in user) so the customer doesn't
// re-enter them every booking. Shares the same keys as rail's sender/receiver, so a
// returning customer's saved profile prefills across modes.
const partyKey = (kind: string) => {
  let who = 'guest';
  try { const u = JSON.parse(localStorage.getItem('shippitin_user') || 'null'); who = u?.id || u?.email || 'guest'; } catch { /* ignore */ }
  return `shippitin_party_${kind}_${who}`;
};
const saveParty = (kind: 'sender' | 'receiver', data: Record<string, string>) => {
  try { localStorage.setItem(partyKey(kind), JSON.stringify(data)); } catch { /* quota */ }
};
const loadParty = (kind: 'sender' | 'receiver'): Record<string, string> | null => {
  try { return JSON.parse(localStorage.getItem(partyKey(kind)) || 'null'); } catch { return null; }
};

interface SeaServiceResult {
  id: string;
  serviceName: string;
  carrier: string;
  originPort: string;
  destinationPort: string;
  departureDate?: string;
  transitTime: string;
  price: number;
  containerSize?: string;
  features?: string[];
  status?: string;
}

const STEPS = [
  { id: 1, label: 'Shipper',   icon: FaUser,         color: 'text-blue-500',   border: 'border-blue-200',   activeBg: 'bg-brand-gradient' },
  { id: 2, label: 'Consignee', icon: FaMapMarkerAlt, color: 'text-green-500',  border: 'border-green-200',  activeBg: 'bg-green-600'  },
  { id: 3, label: 'Cargo',     icon: FaBox,          color: 'text-orange-500', border: 'border-orange-200', activeBg: 'bg-orange-500' },
  { id: 4, label: 'Add-ons',   icon: FaTag,          color: 'text-teal-500',   border: 'border-teal-200',   activeBg: 'bg-teal-600'   },
  { id: 5, label: 'Payment',   icon: FaCreditCard,   color: 'text-purple-500', border: 'border-purple-200', activeBg: 'bg-purple-600' },
];

const SeaBookingDetailsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [formData, setFormData]             = useState<SeaFormData | null>(null);
  const [selectedResult, setSelectedResult] = useState<SeaServiceResult | null>(null);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState<string | null>(null);
  const [currentStep, setCurrentStep]       = useState(0);   // 0 = all sections collapsed until clicked
  const [showBreakup, setShowBreakup]       = useState(true);
  const [errors, setErrors]                 = useState<Record<string, string>>({});

  // When opened from My Shipments to complete an existing booking, this carries the
  // booking's id/number so we update THAT booking instead of creating a new one.
  const [existingBooking, setExistingBooking] = useState<{ id?: string; booking_number?: string } | null>(null);

  // Document filing — shown only when completing documentation for an EXISTING booking.
  // International = Shipping Bill verify + VGM/Shipping Instructions; domestic = VGM only.
  const [filingNumber, setFilingNumber] = useState('');     // 7-digit Shipping Bill no. (international)
  const [sbVerifying,  setSbVerifying]  = useState(false);  // Shipping Bill verifying with Customs/ICEGATE
  const [sbVerified,   setSbVerified]   = useState(false);  // Shipping Bill verified
  const [vgmFiled,     setVgmFiled]     = useState(false);  // VGM & Shipping Instructions filed

  // Shipper (exporter)
  const [shipperName,    setShipperName]    = useState('');
  const [shipperPhone,   setShipperPhone]   = useState('');
  const [shipperEmail,   setShipperEmail]   = useState('');
  const [shipperGstin,   setShipperGstin]   = useState('');   // GSTIN / IEC / Tax ID
  const [shipperAddress, setShipperAddress] = useState('');
  const [shipperCity,    setShipperCity]    = useState('');
  const [shipperState,   setShipperState]   = useState('');
  const [shipperPincode, setShipperPincode] = useState('');
  const [shipperCountry, setShipperCountry] = useState('India');

  // Consignee (importer)
  const [consigneeName,    setConsigneeName]    = useState('');
  const [consigneePhone,   setConsigneePhone]   = useState('');
  const [consigneeEmail,   setConsigneeEmail]   = useState('');
  const [consigneeGstin,   setConsigneeGstin]   = useState('');  // Tax ID / EIN
  const [consigneeAddress, setConsigneeAddress] = useState('');
  const [consigneeCity,    setConsigneeCity]    = useState('');
  const [consigneeState,   setConsigneeState]   = useState('');
  const [consigneePincode, setConsigneePincode] = useState('');
  const [consigneeCountry, setConsigneeCountry] = useState('');

  // Cargo
  const [goodsDescription,    setGoodsDescription]    = useState('');
  const [hsnCode,             setHsnCode]             = useState('');
  const [natureOfPacking,     setNatureOfPacking]     = useState('');
  const [grossWeight,         setGrossWeight]         = useState('');   // total gross weight (kg)
  const [invoiceNumber,       setInvoiceNumber]       = useState('');
  const [invoiceDate,         setInvoiceDate]         = useState('');
  const [invoiceValue,        setInvoiceValue]        = useState('');   // commercial value
  const [incoterms,           setIncoterms]           = useState('');
  const [numPackages,         setNumPackages]         = useState('');
  const [packageSize,         setPackageSize]         = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [hazardousUN,         setHazardousUN]         = useState('');
  const [hazardousClass,      setHazardousClass]      = useState('');
  // FCL specifics — optional at booking, can be submitted up to 48h before sailing.
  // Shared with the VGM filing step when completing documentation.
  const [containerNo, setContainerNo] = useState('');
  const [sealNo,      setSealNo]      = useState('');
  const [vgmWeight,   setVgmWeight]   = useState('');   // Verified Gross Mass (kg)
  const [bolNo,       setBolNo]       = useState('');   // Bill of Lading no.
  const [uploadedDocs, setUploadedDocs] = useState<File[]>([]);

  // Add-ons
  const [addFirstMile, setAddFirstMile] = useState(false);
  const [addLastMile,  setAddLastMile]  = useState(false);
  const [addCustoms,   setAddCustoms]   = useState(false);
  const [addInsurance, setAddInsurance] = useState(false);
  const [addCO2,       setAddCO2]       = useState(false);
  const [addMiles,     setAddMiles]     = useState(false);
  const [addOriginPort, setAddOriginPort] = useState(false);
  const [addDestPort,   setAddDestPort]   = useState(false);
  const [firstMileAddr, setFirstMileAddr] = useState('');
  const [lastMileAddr,  setLastMileAddr]  = useState('');
  const [insuranceCargoValue, setInsuranceCargoValue] = useState('');

  // Payment
  const [paymentMode,   setPaymentMode]   = useState<'online' | 'bank' | 'credit'>('online');
  const [creditAccount, setCreditAccount] = useState('');
  const [approveBL,     setApproveBL]     = useState(false);  // "I approve the draft B/L details"

  // Insurance cargo value defaults to the declared commercial value (still editable).
  useEffect(() => {
    if (addInsurance && !insuranceCargoValue && invoiceValue) setInsuranceCargoValue(invoiceValue);
  }, [addInsurance, invoiceValue]);

  useEffect(() => {
    const state = location.state as {
      selectedResult?: SeaServiceResult;
      originalFormData?: AllFormData;
      initialStep?: number;
      existing?: { id?: string; booking_number?: string };
      prefill?: { shipper?: any; consignee?: any; cargo?: any; filing?: any; vgmFiled?: any };
    } | undefined;

    if (state?.selectedResult && state?.originalFormData) {
      const fd = state.originalFormData as any;
      setSelectedResult(state.selectedResult);
      setFormData(fd as SeaFormData);
      setExistingBooking(state.existing || null);

      // Carry the value-added services chosen on Recommended Services so they start ON here.
      const act = (fd.activityType as string) || 'Port to Port';
      setAddFirstMile(!!fd.addFirstMile || act.startsWith('Door'));
      setAddLastMile(!!fd.addLastMile || act.endsWith('Door'));
      setAddCustoms(!!fd.addCustomsBrokerage || !!fd.addCustoms);
      setAddOriginPort(!!fd.addOriginPortCharges);
      setAddDestPort(!!fd.addDestinationPortCharges);
      const wantsInsurance = !!fd.addInsurance || !!fd.insuranceRequired;
      setAddInsurance(wantsInsurance);

      // Auto-fill the last saved shipper / consignee (existing-booking prefill overrides below).
      const savedS = loadParty('sender');
      if (savedS) {
        if (savedS.name) setShipperName(savedS.name); if (savedS.phone) setShipperPhone(savedS.phone);
        if (savedS.email) setShipperEmail(savedS.email); if (savedS.gstin) setShipperGstin(savedS.gstin);
        if (savedS.address) setShipperAddress(savedS.address); if (savedS.city) setShipperCity(savedS.city);
        if (savedS.state) setShipperState(savedS.state); if (savedS.pincode) setShipperPincode(savedS.pincode);
        if (savedS.country) setShipperCountry(savedS.country);
      }
      const savedR = loadParty('receiver');
      if (savedR) {
        if (savedR.name) setConsigneeName(savedR.name); if (savedR.phone) setConsigneePhone(savedR.phone);
        if (savedR.email) setConsigneeEmail(savedR.email); if (savedR.gstin) setConsigneeGstin(savedR.gstin);
        if (savedR.address) setConsigneeAddress(savedR.address); if (savedR.city) setConsigneeCity(savedR.city);
        if (savedR.state) setConsigneeState(savedR.state); if (savedR.pincode) setConsigneePincode(savedR.pincode);
        if (savedR.country) setConsigneeCountry(savedR.country);
      }

      // Prefill from an existing booking (completing it from My Shipments).
      const pf = state.prefill;
      if (pf?.shipper) {
        const s = pf.shipper;
        if (s.name) setShipperName(s.name); if (s.phone) setShipperPhone(s.phone);
        if (s.email) setShipperEmail(s.email); if (s.gstin) setShipperGstin(s.gstin);
        if (s.address) setShipperAddress(s.address); if (s.city) setShipperCity(s.city);
        if (s.state) setShipperState(s.state); if (s.pincode) setShipperPincode(s.pincode);
        if (s.country) setShipperCountry(s.country);
      }
      if (pf?.consignee) {
        const c = pf.consignee;
        if (c.name) setConsigneeName(c.name); if (c.phone) setConsigneePhone(c.phone);
        if (c.email) setConsigneeEmail(c.email); if (c.gstin) setConsigneeGstin(c.gstin);
        if (c.address) setConsigneeAddress(c.address); if (c.city) setConsigneeCity(c.city);
        if (c.state) setConsigneeState(c.state); if (c.pincode) setConsigneePincode(c.pincode);
        if (c.country) setConsigneeCountry(c.country);
      }
      if (pf?.cargo) {
        const c = pf.cargo;
        if (c.goodsDescription) setGoodsDescription(c.goodsDescription);
        if (c.hsnCode) setHsnCode(c.hsnCode);
        if (c.natureOfPacking) setNatureOfPacking(c.natureOfPacking);
        if (c.grossWeight) setGrossWeight(String(c.grossWeight));
        if (c.invoiceNumber) setInvoiceNumber(c.invoiceNumber);
        if (c.invoiceDate) setInvoiceDate(c.invoiceDate);
        if (c.invoiceValue) setInvoiceValue(String(c.invoiceValue));
        if (c.numPackages) setNumPackages(String(c.numPackages));
        if (c.packageSize) setPackageSize(c.packageSize);
        if (c.containerNo) setContainerNo(c.containerNo);
        if (c.sealNo) setSealNo(c.sealNo);
        if (c.vgmWeight) setVgmWeight(String(c.vgmWeight));
        if (c.bolNo) setBolNo(c.bolNo);
        if (c.specialInstructions) setSpecialInstructions(c.specialInstructions);
      }
      if (pf?.filing) { setFilingNumber(String(pf.filing)); setSbVerified(true); }
      if (pf?.vgmFiled) setVgmFiled(true);
      if (state.initialStep) setCurrentStep(state.initialStep);
      setLoading(false);
    } else {
      setError('Booking details not found.');
      setLoading(false);
    }
  }, [location.state]);

  // Sea export defaults to international; My Shipments passes is_domestic for existing coastal bookings.
  const isDomestic = (formData as any)?.isDomestic === true;
  const isCompletingDocs = !!existingBooking;
  const isHazardous = !!formData?.hazardousCargo;

  const getBreakdown = () => {
    if (!selectedResult || !formData) return null;
    const n   = formData.numberOfContainers || 1;
    const ck  = ckey(formData.containerType);
    const act = formData.activityType || 'Port to Port';
    const doorO = addFirstMile || act.startsWith('Door');
    const doorD = addLastMile  || act.endsWith('Door');
    const base     = selectedResult.price;
    const originThc = addOriginPort ? SEA_ORIGIN_THC[ck] * n : 0;
    const destThc   = addDestPort   ? SEA_DEST_THC[ck]   * n : 0;
    const fm       = doorO ? SEA_FIRST_MILE[ck] * n : 0;
    const lm       = doorD ? SEA_LAST_MILE[ck]  * n : 0;
    const customs  = addCustoms ? SEA_CUSTOMS : 0;
    // All-risk marine cargo insurance — 0.25% of the declared cargo value (matches rail).
    const ins      = addInsurance ? Math.round((Number(insuranceCargoValue) || 0) * 0.0025) : 0;
    const pf       = SEA_PLATFORM;
    const gFreight = Math.round(base * 0.05);            // ocean freight (concessional)
    const gPort    = Math.round((originThc + destThc) * 0.18);
    const gMile    = Math.round((fm + lm) * 0.05);
    const gCustoms = Math.round(customs * 0.18);
    const gPlat    = Math.round(pf * 0.18);
    const gIns     = Math.round(ins * 0.18);
    const totalGST = gFreight + gPort + gMile + gCustoms + gPlat + gIns;
    const subtotal = base + originThc + destThc + fm + lm + customs + pf;
    const grand    = subtotal + totalGST + ins;
    return { base, originThc, destThc, fm, lm, customs, ins, pf, gFreight, gPort, gMile, gCustoms, gPlat, gIns, totalGST, subtotal, grand, n, ck, doorO, doorD };
  };
  const bd = getBreakdown();

  const validateStep = (step: number) => {
    const e: Record<string, string> = {};
    if (step === 1) {
      if (!shipperName.trim())    e.shipperName    = 'Required';
      if (!shipperPhone.trim())   e.shipperPhone   = 'Required';
      if (!shipperEmail.trim())   e.shipperEmail   = 'Required';
      if (!shipperAddress.trim()) e.shipperAddress = 'Required';
      if (!shipperCity.trim())    e.shipperCity    = 'Required';
    }
    if (step === 2) {
      if (!consigneeName.trim())    e.consigneeName    = 'Required';
      if (!consigneePhone.trim())   e.consigneePhone   = 'Required';
      if (!consigneeEmail.trim())   e.consigneeEmail   = 'Required';
      if (!consigneeAddress.trim()) e.consigneeAddress = 'Required';
      if (!consigneeCity.trim())    e.consigneeCity    = 'Required';
    }
    if (step === 3) {
      if (!goodsDescription.trim()) e.goodsDescription = 'Required';
      if (!invoiceNumber.trim())    e.invoiceNumber    = 'Required';
      if (!invoiceValue.trim())     e.invoiceValue     = 'Required';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const collectShipper = () => ({
    name: shipperName, phone: shipperPhone, email: shipperEmail, gstin: shipperGstin,
    address: shipperAddress, city: shipperCity, state: shipperState, pincode: shipperPincode, country: shipperCountry,
  });
  const collectConsignee = () => ({
    name: consigneeName, phone: consigneePhone, email: consigneeEmail, gstin: consigneeGstin,
    address: consigneeAddress, city: consigneeCity, state: consigneeState, pincode: consigneePincode, country: consigneeCountry,
  });

  const goToStep = (step: number) => { setErrors({}); setCurrentStep(step); };
  const nextStep = () => {
    if (!validateStep(currentStep)) return;
    if (currentStep === 1) saveParty('sender', collectShipper());     // shipper saved under sender key
    if (currentStep === 2) saveParty('receiver', collectConsignee()); // consignee saved under receiver key
    setCurrentStep(s => Math.min(s + 1, 5));
  };

  // Persist filing progress to the booking's detail overrides immediately (not only on
  // final Confirm), so a verified Shipping Bill / filed VGM survives leaving and returning.
  const persistFiling = (patch: Record<string, any>) => {
    if (!existingBooking?.id) return;
    try {
      const dov = JSON.parse(localStorage.getItem('bookingDetailOverrides') || '{}');
      dov[existingBooking.id] = { ...(dov[existingBooking.id] || {}), ...patch };
      localStorage.setItem('bookingDetailOverrides', JSON.stringify(dov));
    } catch { /* ignore quota/parse */ }
  };

  // Simulated Customs/ICEGATE Shipping Bill verification (no live API yet — swap in the real call here).
  const verifyShippingBill = () => {
    if (filingNumber.length !== 7 || sbVerifying || sbVerified) return;
    setSbVerifying(true);
    setTimeout(() => {
      setSbVerifying(false); setSbVerified(true);
      persistFiling({ filing_number: filingNumber });   // remember the verified SB
      toast.success('Shipping Bill verified with Customs / ICEGATE');
    }, 1200);
  };
  // File the VGM (Verified Gross Mass) + Shipping Instructions; the carrier then issues the draft B/L.
  const fileVGM = () => {
    if (!containerNo.trim() || !vgmWeight.trim() || vgmFiled) return;
    setVgmFiled(true);
    persistFiling({ efn_filed: true, container_no: containerNo, seal_no: sealNo, vgm: vgmWeight });
    toast.success('VGM & Shipping Instructions filed');
  };

  // A selected city suggestion fills City + State + Country (Google secondaryText is "State, Country").
  const applyPlace = (
    loc: { name?: string; state?: string; country?: string; pincode?: string },
    setCity: (v: string) => void,
    setStateFn: (v: string) => void,
    setCountryFn: (v: string) => void,
    setPincodeFn?: (v: string) => void,
  ) => {
    const cityName = loc.name || '';
    let stateName = loc.country ? (loc.state || '') : '';
    let countryName = loc.country || '';
    if (!loc.country && loc.state) {
      const parts = loc.state.split(',').map(s => s.trim()).filter(Boolean);
      if (parts.length >= 2) { countryName = parts[parts.length - 1]; stateName = parts.slice(0, -1).join(', '); }
      else if (parts.length === 1) { countryName = parts[0]; }
    }
    if (cityName) setCity(cityName);
    if (stateName) setStateFn(stateName);
    if (countryName) setCountryFn(countryName);
    if (loc.pincode && setPincodeFn) setPincodeFn(loc.pincode);
  };

  const handleConfirm = () => {
    if (!validateStep(5)) return;
    if (!approveBL) {
      toast.error('Please approve the draft Bill of Lading details to continue.');
      return;
    }
    const isExisting = !!existingBooking?.booking_number;
    // Completing documentation for an existing booking → filing must be done first.
    if (isExisting) {
      const filingDone = isDomestic ? vgmFiled : (sbVerified && vgmFiled);
      if (!filingDone) {
        toast.error(isDomestic
          ? 'Please file the VGM & Shipping Instructions above to complete documentation.'
          : 'Please verify the Shipping Bill and file the VGM & Shipping Instructions above to complete documentation.');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }

    saveParty('sender', collectShipper());
    saveParty('receiver', collectConsignee());
    const bookingId = existingBooking?.booking_number || `SEA-${Date.now().toString().slice(-6)}`;

    // Reflect completed documentation + details on My Shipments via localStorage overrides.
    if (existingBooking?.id) {
      try {
        const dov = JSON.parse(localStorage.getItem('bookingDetailOverrides') || '{}');
        dov[existingBooking.id] = {
          ...(dov[existingBooking.id] || {}),
          sender_name: shipperName, sender_phone: shipperPhone, sender_email: shipperEmail, sender_gstin: shipperGstin,
          sender_address: shipperAddress, sender_city: shipperCity, sender_state: shipperState, sender_pincode: shipperPincode, sender_country: shipperCountry,
          receiver_name: consigneeName, receiver_phone: consigneePhone, receiver_email: consigneeEmail, receiver_gstin: consigneeGstin,
          receiver_address: consigneeAddress, receiver_city: consigneeCity, receiver_state: consigneeState, receiver_pincode: consigneePincode, receiver_country: consigneeCountry,
          goods_description: goodsDescription, hsn_code: hsnCode, nature_of_packing: natureOfPacking,
          weight_per_container: grossWeight, invoice_number: invoiceNumber, invoice_date: invoiceDate, invoice_value: invoiceValue,
          num_packages: numPackages, package_size: packageSize, special_instructions: specialInstructions,
          container_no: containerNo, seal_no: sealNo, vgm: vgmWeight, bol_no: bolNo,
          route_type: (formData as any)?.activityType, container_type: formData?.containerType, number_of_containers: formData?.numberOfContainers,
          is_domestic: isDomestic, operator: selectedResult?.carrier, transit_time: selectedResult?.transitTime,
          insurance_required: addInsurance, charges_breakdown: bd,
          filing_number: filingNumber || undefined, efn_filed: vgmFiled || undefined,
        };
        localStorage.setItem('bookingDetailOverrides', JSON.stringify(dov));
      } catch { /* ignore quota/parse */ }
    }

    const finalBooking = {
      skipPersist: isExisting,   // existing booking → don't re-POST (no update endpoint yet)
      selectedResult: {
        ...selectedResult!,
        originPort:      selectedResult!.originPort,
        destinationPort: selectedResult!.destinationPort,
        transitTime:     selectedResult!.transitTime,
        operator:        selectedResult!.carrier,
        mode:            'sea',
      },
      // Shape originalFormData so BookingConfirmationPage POSTs the sea booking correctly.
      originalFormData: {
        ...(formData as any),
        bookingType:        'Sea',
        isDomestic,
        serviceType:        (formData as any)?.activityType,
        containerType:      formData?.containerType,
        numberOfContainers: formData?.numberOfContainers,
        cargoType:          (formData as any)?.commodity || 'General',
        totalWeight:        Number(grossWeight) || 0,
      },
      senderDetails:   { senderName: shipperName, senderPhone: shipperPhone, senderEmail: shipperEmail, senderGstin: shipperGstin, senderAddress: shipperAddress, senderCity: shipperCity, senderState: shipperState, senderPincode: shipperPincode, senderCountry: shipperCountry },
      receiverDetails: { receiverName: consigneeName, receiverPhone: consigneePhone, receiverEmail: consigneeEmail, receiverGstin: consigneeGstin, receiverAddress: consigneeAddress, receiverCity: consigneeCity, receiverState: consigneeState, receiverPincode: consigneePincode, receiverCountry: consigneeCountry },
      cargoDetails:    { goodsDescription, hsnCode, natureOfPacking, grossWeight, invoiceNumber, invoiceDate, invoiceValue, incoterms, containerNo, sealNo, vgmWeight, bolNo, specialInstructions, hazardousUN, hazardousClass, documents: uploadedDocs.map(f => f.name) },
      paymentDetails:  { paymentMode, creditAccount },
      bookingDate:     new Date().toLocaleDateString('en-IN'),
      bookingTime:     new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      bookingId,
      finalAmount:     bd?.grand || 0,
      insuranceRequired: addInsurance,
      charges:         bd,
      filingNumber:    filingNumber || undefined,
      vgmFiled:        vgmFiled || undefined,
    };

    if (isExisting) {
      try { localStorage.setItem('myShipmentsTab', isDomestic ? 'domestic' : 'international'); } catch { /* quota */ }
      toast.success('Documentation completed. Complete the payment to confirm your shipment.');
      navigate('/my-bookings');
      return;
    }
    sessionStorage.setItem('lastBookingDetails', JSON.stringify(finalBooking));
    navigate('/booking-confirmation', { state: { bookingDetails: finalBooking } });
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
    </div>
  );
  if (error || !formData || !selectedResult) return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="text-center p-10 bg-white rounded-2xl shadow">
        <p className="text-red-600 mb-4">{error || 'Booking details missing. Please go back to search results.'}</p>
        <button onClick={() => navigate('/sea-results')} className="bg-brand-gradient text-white px-6 py-2 rounded-lg">Go Back</button>
      </div>
    </div>
  );

  const previewFields: Record<number, string[]> = {
    1: ['Full Name / Company *', 'Mobile Number *', 'Email ID *', 'Tax ID / GSTIN', 'Address *', 'City *', 'State', 'Country'],
    2: ['Full Name / Company *', 'Mobile Number *', 'Email ID *', 'Tax ID / EIN', 'Address *', 'City *', 'State', 'Country'],
    3: ['Description of Goods *', 'HS Code', 'Commercial Value (₹) *', 'Invoice Number *', 'Incoterms', 'Container # / Seal # / VGM', 'B/L No'],
    4: ['First Mile Pickup', 'Last Mile Delivery', ...(!isDomestic ? ['Customs Clearance ₹2,000'] : []), 'Marine Insurance — 0.25%', 'CO₂ Credits', 'Miles Credits'],
    5: ['Payment Mode', 'Approve draft Bill of Lading'],
  };

  return (
    <div className="min-h-screen bg-gray-50 py-5 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-4">

        <div className="flex-grow space-y-3">

          {/* Document filing — only when completing documentation for an existing booking.
              International: verify Shipping Bill then file VGM & Shipping Instructions.
              Domestic (coastal): VGM only. Required before returning to My Shipments. */}
          {isCompletingDocs && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-5 py-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                <FaFileSignature className="text-blue-500" /> Document filing
              </p>
              <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                {isDomestic ? 'Coastal (Domestic)' : 'International'}
              </span>
            </div>

            {/* Step 1 — Shipping Bill (international only) */}
            {!isDomestic && (
              <div className="mb-3">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Shipping Bill No.</label>
                <div className="flex gap-2">
                  <input
                    type="text" inputMode="numeric" maxLength={7}
                    value={filingNumber}
                    disabled={sbVerified}
                    onChange={e => setFilingNumber(e.target.value.replace(/\D/g, '').slice(0, 7))}
                    placeholder="Enter 7-digit Shipping Bill number"
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:bg-gray-50 disabled:text-gray-500"
                  />
                  {sbVerified ? (
                    <span className="px-3 py-2 rounded-xl bg-green-50 text-green-700 text-sm font-semibold flex items-center gap-1.5 whitespace-nowrap"><FaCheckCircle /> Verified</span>
                  ) : (
                    <button type="button" onClick={verifyShippingBill} disabled={filingNumber.length !== 7 || sbVerifying}
                      className="px-4 py-2 rounded-xl bg-brand-gradient hover:opacity-90 text-white text-sm font-semibold transition disabled:opacity-50 whitespace-nowrap">
                      {sbVerifying ? 'Verifying…' : 'Verify'}
                    </button>
                  )}
                </div>
                <p className={`text-[11px] mt-1 ${sbVerified ? 'text-green-600' : 'text-gray-400'}`}>
                  {sbVerifying ? 'Verifying with Customs / ICEGATE…' : sbVerified ? 'Successfully verified with Customs / ICEGATE.' : 'Enter your 7-digit Shipping Bill number to verify with Customs / ICEGATE.'}
                </p>
              </div>
            )}

            {/* Step 2 — VGM & Shipping Instructions. Domestic: only step.
                International: unlocks after the Shipping Bill is verified. */}
            {(isDomestic || sbVerified) && (
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">VGM &amp; Shipping Instructions</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input type="text" value={containerNo} disabled={vgmFiled} onChange={e => setContainerNo(e.target.value.toUpperCase())}
                    placeholder="Container No." className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:bg-gray-50 disabled:text-gray-500" />
                  <input type="text" value={sealNo} disabled={vgmFiled} onChange={e => setSealNo(e.target.value.toUpperCase())}
                    placeholder="Seal No." className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:bg-gray-50 disabled:text-gray-500" />
                  <input type="number" value={vgmWeight} disabled={vgmFiled} onChange={e => setVgmWeight(e.target.value)}
                    placeholder="VGM (kg)" className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:bg-gray-50 disabled:text-gray-500" />
                </div>
                <div className="flex items-center justify-between mt-2">
                  <p className={`text-[11px] ${vgmFiled ? 'text-green-600' : 'text-gray-400'}`}>
                    {vgmFiled ? 'VGM & Shipping Instructions filed — draft B/L issued.' : 'Container No. and VGM are required (can be submitted up to 48h before sailing).'}
                  </p>
                  {vgmFiled ? (
                    <span className="px-3 py-2 rounded-xl bg-green-50 text-green-700 text-sm font-semibold flex items-center gap-1.5 whitespace-nowrap"><FaCheckCircle /> Filed</span>
                  ) : (
                    <button type="button" onClick={fileVGM} disabled={!containerNo.trim() || !vgmWeight.trim()}
                      className="px-4 py-2 rounded-xl bg-brand-gradient hover:opacity-90 text-white text-sm font-semibold transition disabled:opacity-50 whitespace-nowrap">
                      File VGM
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
          )}

          {/* Header + stepper */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-5 py-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-2 rounded-lg bg-blue-50 flex-shrink-0"><FaShip className="text-base text-blue-500" /></div>
                <div className="min-w-0">
                  <h1 className="text-base font-bold text-gray-800 leading-tight">Complete Your Sea Booking</h1>
                  <p className="text-gray-400 text-xs">Click any section to fill in details</p>
                </div>
              </div>
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
                    {idx < STEPS.length - 1 && (
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

                    {/* SHIPPER */}
                    {step.id === 1 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Full Name / Company <span className="text-sky-400">*</span></label>
                          <input type="text" value={shipperName} onChange={e=>setShipperName(e.target.value)} placeholder="e.g., ABC Exports Pvt Ltd" className={inp(!!errors.shipperName, !shipperName)} />
                          {errors.shipperName && <p className="text-xs text-red-500 mt-1">{errors.shipperName}</p>}
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Mobile Number <span className="text-sky-400">*</span></label>
                          <input type="tel" value={shipperPhone} onChange={e=>setShipperPhone(e.target.value)} placeholder="e.g., 9876543210" className={inp(!!errors.shipperPhone, !shipperPhone)} />
                          {errors.shipperPhone && <p className="text-xs text-red-500 mt-1">{errors.shipperPhone}</p>}
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Email ID <span className="text-sky-400">*</span></label>
                          <input type="email" value={shipperEmail} onChange={e=>setShipperEmail(e.target.value)} placeholder="e.g., exports@company.com" className={inp(!!errors.shipperEmail, !shipperEmail)} />
                          {errors.shipperEmail && <p className="text-xs text-red-500 mt-1">{errors.shipperEmail}</p>}
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Tax ID / GSTIN / IEC</label>
                          <input type="text" value={shipperGstin} onChange={e=>setShipperGstin(e.target.value.toUpperCase())} placeholder="e.g., 33AAAAA0000A1Z5" className={inp()} />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Address <span className="text-sky-400">*</span></label>
                          <input type="text" value={shipperAddress} onChange={e=>setShipperAddress(e.target.value)} placeholder="Street address, locality" className={inp(!!errors.shipperAddress, !shipperAddress)} />
                          {errors.shipperAddress && <p className="text-xs text-red-500 mt-1">{errors.shipperAddress}</p>}
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">City <span className="text-sky-400">*</span></label>
                          <LocationAutocomplete value={shipperCity} onChange={setShipperCity} onSelect={loc => applyPlace(loc, setShipperCity, setShipperState, setShipperCountry, setShipperPincode)} locationType="city" global={!isDomestic} placeholder="e.g., Chennai" invalid={!shipperCity} />
                          {errors.shipperCity && <p className="text-xs text-red-500 mt-1">{errors.shipperCity}</p>}
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">State</label>
                          <input type="text" value={shipperState} onChange={e=>setShipperState(e.target.value)} placeholder="e.g., Tamil Nadu" className={inp()} />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Pincode</label>
                          <input type="text" value={shipperPincode} onChange={e=>setShipperPincode(e.target.value)} placeholder="e.g., 600001" className={inp()} />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Country</label>
                          <input type="text" value={shipperCountry} onChange={e=>setShipperCountry(e.target.value)} placeholder="e.g., India" className={inp()} />
                        </div>
                      </div>
                    )}

                    {/* CONSIGNEE */}
                    {step.id === 2 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Full Name / Company <span className="text-sky-400">*</span></label>
                          <input type="text" value={consigneeName} onChange={e=>setConsigneeName(e.target.value)} placeholder="e.g., XYZ Logistics Ltd" className={inp(!!errors.consigneeName, !consigneeName)} />
                          {errors.consigneeName && <p className="text-xs text-red-500 mt-1">{errors.consigneeName}</p>}
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Mobile Number <span className="text-sky-400">*</span></label>
                          <input type="tel" value={consigneePhone} onChange={e=>setConsigneePhone(e.target.value)} placeholder="e.g., +1 213 555 0100" className={inp(!!errors.consigneePhone, !consigneePhone)} />
                          {errors.consigneePhone && <p className="text-xs text-red-500 mt-1">{errors.consigneePhone}</p>}
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Email ID <span className="text-sky-400">*</span></label>
                          <input type="email" value={consigneeEmail} onChange={e=>setConsigneeEmail(e.target.value)} placeholder="e.g., imports@company.com" className={inp(!!errors.consigneeEmail, !consigneeEmail)} />
                          {errors.consigneeEmail && <p className="text-xs text-red-500 mt-1">{errors.consigneeEmail}</p>}
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Tax ID / EIN (optional)</label>
                          <input type="text" value={consigneeGstin} onChange={e=>setConsigneeGstin(e.target.value)} placeholder="e.g., 98-7654321" className={inp()} />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Address <span className="text-sky-400">*</span></label>
                          <input type="text" value={consigneeAddress} onChange={e=>setConsigneeAddress(e.target.value)} placeholder="Street address, locality" className={inp(!!errors.consigneeAddress, !consigneeAddress)} />
                          {errors.consigneeAddress && <p className="text-xs text-red-500 mt-1">{errors.consigneeAddress}</p>}
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">City <span className="text-sky-400">*</span></label>
                          <LocationAutocomplete value={consigneeCity} onChange={setConsigneeCity} onSelect={loc => applyPlace(loc, setConsigneeCity, setConsigneeState, setConsigneeCountry, setConsigneePincode)} locationType="city" global placeholder="e.g., Los Angeles" invalid={!consigneeCity} />
                          {errors.consigneeCity && <p className="text-xs text-red-500 mt-1">{errors.consigneeCity}</p>}
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">State / Province</label>
                          <input type="text" value={consigneeState} onChange={e=>setConsigneeState(e.target.value)} placeholder="e.g., California" className={inp()} />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">ZIP / Postal Code</label>
                          <input type="text" value={consigneePincode} onChange={e=>setConsigneePincode(e.target.value)} placeholder="e.g., 90001" className={inp()} />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Country</label>
                          <input type="text" value={consigneeCountry} onChange={e=>setConsigneeCountry(e.target.value)} placeholder="e.g., United States" className={inp()} />
                        </div>
                      </div>
                    )}

                    {/* CARGO */}
                    {step.id === 3 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Description of Goods <span className="text-sky-400">*</span></label>
                          <input type="text" value={goodsDescription} onChange={e=>setGoodsDescription(e.target.value)} placeholder="e.g., Cotton fabric rolls, automotive spare parts" className={inp(!!errors.goodsDescription, !goodsDescription)} />
                          {errors.goodsDescription && <p className="text-xs text-red-500 mt-1">{errors.goodsDescription}</p>}
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">HS Code (optional)</label>
                          <input type="text" value={hsnCode} onChange={e=>setHsnCode(e.target.value)} placeholder="Search HS code or keyword, e.g., 5208" className={inp()} />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Incoterms</label>
                          <select value={incoterms} onChange={e=>setIncoterms(e.target.value)} className={inp()}>
                            <option value="">Select Incoterms</option>
                            {[['EXW','EXW — Ex Works'],['FCA','FCA — Free Carrier'],['FOB','FOB — Free On Board'],['CFR','CFR — Cost and Freight'],['CIF','CIF — Cost Insurance Freight'],['CPT','CPT — Carriage Paid To'],['DAP','DAP — Delivered at Place'],['DDP','DDP — Delivered Duty Paid']].map(([v,l])=><option key={v} value={v}>{l}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Nature of Packing</label>
                          <select value={natureOfPacking} onChange={e=>setNatureOfPacking(e.target.value)} className={inp()}>
                            <option value="">Select packing type</option>
                            {['Loose','Palletized','Bundled','Cartons','Bags','Drums','Other'].map(v=><option key={v}>{v}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Gross Weight (kg)</label>
                          <input type="number" value={grossWeight} onChange={e=>setGrossWeight(e.target.value)} placeholder="e.g., 18000" className={inp()} />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Invoice Number <span className="text-sky-400">*</span></label>
                          <input type="text" value={invoiceNumber} onChange={e=>setInvoiceNumber(e.target.value)} placeholder="e.g., INV-2026-001" className={inp(!!errors.invoiceNumber, !invoiceNumber)} />
                          {errors.invoiceNumber && <p className="text-xs text-red-500 mt-1">{errors.invoiceNumber}</p>}
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Invoice Date</label>
                          <input type="date" value={invoiceDate} onChange={e=>setInvoiceDate(e.target.value)} className={inp()} />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Commercial Value (₹) <span className="text-sky-400">*</span></label>
                          <input type="number" value={invoiceValue} onChange={e=>setInvoiceValue(e.target.value)} placeholder="e.g., 830000" className={inp(!!errors.invoiceValue, !invoiceValue)} />
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
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">No. of Packages</label>
                          <input type="number" value={numPackages} onChange={e=>setNumPackages(e.target.value)} placeholder="e.g., 120" className={inp()} />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Package Size (L×W×H cm)</label>
                          <input type="text" value={packageSize} onChange={e=>setPackageSize(e.target.value)} placeholder="e.g., 60×40×40" className={inp()} />
                        </div>

                        {/* FCL specifics — optional, can be submitted up to 48h before sailing */}
                        <div className="sm:col-span-2 border-t border-gray-100 pt-3 mt-1">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">FCL specifics <span className="text-gray-400 normal-case font-normal">(optional — can be submitted up to 48h before sailing)</span></p>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Container No.</label>
                          <input type="text" value={containerNo} onChange={e=>setContainerNo(e.target.value.toUpperCase())} placeholder="e.g., MSCU1234567" className={inp()} />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Seal No.</label>
                          <input type="text" value={sealNo} onChange={e=>setSealNo(e.target.value.toUpperCase())} placeholder="e.g., SL-998877" className={inp()} />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">VGM (kg)</label>
                          <input type="number" value={vgmWeight} onChange={e=>setVgmWeight(e.target.value)} placeholder="Verified Gross Mass" className={inp()} />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Bill of Lading No.</label>
                          <input type="text" value={bolNo} onChange={e=>setBolNo(e.target.value.toUpperCase())} placeholder="e.g., MAEU123456789" className={inp()} />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Special Handling Instructions</label>
                          <textarea value={specialInstructions} onChange={e=>setSpecialInstructions(e.target.value)} placeholder="Any special requirements, reefer temperature, fragile, hazmat handling..." rows={2} className={`${inp()} resize-none`} />
                        </div>
                        <div className="sm:col-span-2 border-t border-gray-100 pt-3 mt-1">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Documents (optional)</p>
                        </div>
                        <div className="sm:col-span-2">
                          <label htmlFor="sea-docs" className="flex flex-col items-center justify-center gap-1 border-2 border-dashed border-gray-200 rounded-xl px-4 py-4 cursor-pointer hover:border-blue-300 hover:bg-blue-50/40 transition text-center">
                            <FaFileUpload className="text-blue-400 text-lg" />
                            <span className="text-xs font-semibold text-gray-600">Click to upload documents</span>
                            <span className="text-[11px] text-gray-400">Commercial invoice, packing list, LC, certificate of origin, etc. · PDF / JPG / PNG</span>
                            <input id="sea-docs" type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
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
                      </div>
                    )}

                    {/* ADD-ONS */}
                    {step.id === 4 && (
                      <div className="mt-3 space-y-2.5">
                        <p className="text-xs text-gray-400 mb-3">Select optional services to add to your booking.</p>
                        {[
                          { state: addFirstMile, setter: setAddFirstMile, label: 'First Mile Pickup', icon: <FaTruck className="text-teal-500" />, price: `${fmt(SEA_FIRST_MILE[ckey(formData?.containerType)])} / container`, desc: 'Door pickup from factory/warehouse to origin port', hasAddr: true, addr: firstMileAddr, setAddr: setFirstMileAddr, addrPlaceholder: 'Factory/warehouse address' },
                          { state: addLastMile,  setter: setAddLastMile,  label: 'Last Mile Delivery', icon: <FaTruck className="text-teal-500" />, price: `${fmt(SEA_LAST_MILE[ckey(formData?.containerType)])} / container`, desc: 'Delivery from destination port to consignee\'s door', hasAddr: true, addr: lastMileAddr, setAddr: setLastMileAddr, addrPlaceholder: 'Delivery address' },
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
                        {/* Port charges (origin/destination terminal handling) */}
                        {[
                          { state: addOriginPort, setter: setAddOriginPort, label: '⚓ Origin Port Charges', price: `${fmt(SEA_ORIGIN_THC[ckey(formData?.containerType)])} / container`, desc: 'Origin terminal handling + documentation at load port' },
                          { state: addDestPort,   setter: setAddDestPort,   label: '⚓ Destination Port Charges', price: `${fmt(SEA_DEST_THC[ckey(formData?.containerType)])} / container`, desc: 'Destination terminal handling + local charges' },
                          ...(!isDomestic ? [{ state: addCustoms, setter: setAddCustoms, label: '🛃 Customs Clearance', price: `${fmt(SEA_CUSTOMS)} / shipment`, desc: 'CHA-assisted import/export customs documentation' }] : []),
                          { state: addInsurance, setter: setAddInsurance, label: '🛡️ Marine Cargo Insurance', price: '0.25% of cargo value', desc: 'All-risk marine cargo insurance', hasValue: true },
                          { state: addCO2,       setter: setAddCO2,        label: '🌱 CO₂ Credits', price: 'Earn green credits', desc: 'Ocean freight emits far less CO₂ per tonne-km than air' },
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
                            {item.state && (item as any).hasValue && (
                              <div className="mt-3 ml-7">
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Cargo Value (₹)</label>
                                <input type="number" min="0" value={insuranceCargoValue}
                                  onChange={e=>setInsuranceCargoValue(e.target.value)}
                                  placeholder="e.g., 830000" className={inp()} />
                                {Number(insuranceCargoValue) > 0 && (
                                  <p className="text-xs text-gray-500 mt-1">Insurance @ 0.25% = <span className="font-semibold text-gray-700">{fmt(Number(insuranceCargoValue)*0.0025)}</span></p>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* PAYMENT */}
                    {step.id === 5 && (
                      <div className="mt-4 space-y-3">
                        {[
                          { value:'online', label:'Online Payment',  sub:'Credit/Debit Card · Net Banking · UPI' },
                          { value:'bank',   label:'Bank Transfer',   sub:'NEFT / RTGS / IMPS / Wire' },
                          { value:'credit', label:'Credit Account',  sub:'Corporate credit line (existing customers)' },
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
                            <input type="text" value={creditAccount} onChange={e=>setCreditAccount(e.target.value)} placeholder="e.g., MSC-CRED-001234" className={inp()} />
                          </div>
                        )}
                        {/* Draft Bill of Lading approval */}
                        <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition ${approveBL ? 'border-green-300 bg-green-50' : 'border-amber-200 bg-amber-50'}`}>
                          <input type="checkbox" checked={approveBL} onChange={e=>setApproveBL(e.target.checked)} className="mt-0.5 h-4 w-4 text-green-600 rounded" />
                          <div>
                            <p className="text-sm font-semibold text-gray-800">I approve the draft Bill of Lading details</p>
                            <p className="text-xs text-gray-500 mt-0.5">Confirm the shipper, consignee and vessel details shown in the B/L preview are correct.</p>
                          </div>
                        </label>
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
                          className="flex items-center gap-2 px-7 py-2.5 bg-brand-gradient hover:opacity-90 text-white font-bold rounded-xl transition text-sm">
                          Next <FaArrowRight className="text-xs" />
                        </button>
                      ) : (
                        <button type="button" onClick={handleConfirm}
                          className="flex items-center gap-2 px-7 py-2.5 bg-brand-gradient hover:opacity-90 text-white font-bold rounded-xl transition text-sm">
                          {isCompletingDocs ? 'Complete Documentation' : 'Confirm Booking'} <FaCheckCircle />
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {!isActive && (
                  <div className="px-6 pb-4">
                    <div className="flex flex-wrap gap-2">
                      {previewFields[step.id].map((f, i) => (
                        <span key={i} className={`text-xs px-2.5 py-1 rounded-full border ${f.endsWith('*') ? 'bg-sky-50 text-sky-500 border-sky-100' : 'bg-gray-50 text-gray-400 border-gray-100'}`}>{f}</span>
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
          <div className="sticky top-6 space-y-3">
            {/* Charges */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100">
                <h3 className="text-base font-bold text-gray-800">Order Summary</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  {formData?.numberOfContainers || 1} × {formData?.containerType || '40ft Standard'} · {isDomestic ? 'Coastal' : 'International'} · Ocean Freight
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
                    <div className="flex justify-between"><span className="text-gray-500">Base Ocean Freight</span><span className="font-semibold">{fmt(bd.base)}</span></div>
                    {bd.originThc>0 && <div className="flex justify-between"><span className="text-gray-500">Origin Port Charges ({bd.n}×)</span><span className="font-semibold">{fmt(bd.originThc)}</span></div>}
                    {bd.destThc>0 && <div className="flex justify-between"><span className="text-gray-500">Destination Port Charges ({bd.n}×)</span><span className="font-semibold">{fmt(bd.destThc)}</span></div>}
                    {bd.fm>0 && <div className="flex justify-between"><span className="text-gray-500">First Mile</span><span className="font-semibold">{fmt(bd.fm)}</span></div>}
                    {bd.lm>0 && <div className="flex justify-between"><span className="text-gray-500">Last Mile</span><span className="font-semibold">{fmt(bd.lm)}</span></div>}
                    {bd.customs>0 && <div className="flex justify-between"><span className="text-gray-500">Customs Brokerage</span><span className="font-semibold">{fmt(bd.customs)}</span></div>}
                    {bd.ins>0 && <div className="flex justify-between"><span className="text-gray-500">Marine Insurance</span><span className="font-semibold">{fmt(bd.ins)}</span></div>}
                    <div className="flex justify-between"><span className="text-gray-500">Platform Fee</span><span className="font-semibold">{fmt(bd.pf)}</span></div>
                  </div>
                )}
                {bd && (
                  <div className="flex justify-between py-2 border-t border-dashed border-gray-200 text-sm font-semibold">
                    <span className="text-gray-600">Subtotal (excl. GST)</span><span>{fmt(bd.subtotal + bd.ins)}</span>
                  </div>
                )}
                {bd && (
                  <div className="bg-amber-50 rounded-xl p-3 space-y-1.5 text-xs">
                    <div className="flex justify-between text-gray-600"><span>Ocean Freight GST @5%</span><span>{fmt(bd.gFreight)}</span></div>
                    {(bd.originThc>0||bd.destThc>0) && <div className="flex justify-between text-gray-600"><span>Port Charges GST @18%</span><span>{fmt(bd.gPort)}</span></div>}
                    {(bd.fm>0||bd.lm>0) && <div className="flex justify-between text-gray-600"><span>First/Last Mile GST @5%</span><span>{fmt(bd.gMile)}</span></div>}
                    {bd.customs>0 && <div className="flex justify-between text-gray-600"><span>Customs GST @18%</span><span>{fmt(bd.gCustoms)}</span></div>}
                    <div className="flex justify-between text-gray-600"><span>Platform Fee GST @18%</span><span>{fmt(bd.gPlat)}</span></div>
                    {bd.ins>0 && <div className="flex justify-between text-gray-600"><span>Insurance GST @18%</span><span>{fmt(bd.gIns)}</span></div>}
                    <div className="flex justify-between font-bold text-gray-700 pt-1 border-t border-amber-200"><span>Total GST</span><span>{fmt(bd.totalGST)}</span></div>
                  </div>
                )}
                {bd && (
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-800">Grand Total</span>
                      <span className="text-xl font-extrabold text-blue-700">{fmt(bd.grand)}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">Inclusive of all taxes · port charges as applicable</p>
                  </div>
                )}
                <div className="bg-gray-50 rounded-xl p-3 space-y-1.5 text-xs text-gray-500">
                  <div className="flex justify-between"><span>Carrier</span><span className="font-semibold text-gray-700">{selectedResult.carrier}</span></div>
                  <div className="flex justify-between"><span>From</span><span className="font-semibold text-gray-700">{selectedResult.originPort}</span></div>
                  <div className="flex justify-between"><span>To</span><span className="font-semibold text-gray-700">{selectedResult.destinationPort}</span></div>
                  <div className="flex justify-between"><span>Transit</span><span className="font-semibold text-gray-700">{selectedResult.transitTime}</span></div>
                </div>
                <p className="text-xs text-gray-400">*Prices indicative, subject to change on actuals.</p>
              </div>
            </div>

            {/* Bill of Lading preview */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2">
                <FaAnchor className="text-blue-500 text-sm" />
                <h3 className="text-sm font-bold text-gray-800">Bill of Lading — Draft</h3>
              </div>
              <div className="px-5 py-3 space-y-2 text-xs">
                <div className="flex justify-between gap-2"><span className="text-gray-400">Shipper</span><span className="font-semibold text-gray-700 text-right truncate">{shipperName || '—'}</span></div>
                <div className="flex justify-between gap-2"><span className="text-gray-400">Consignee</span><span className="font-semibold text-gray-700 text-right truncate">{consigneeName || '—'}</span></div>
                <div className="flex justify-between gap-2"><span className="text-gray-400">Vessel / Carrier</span><span className="font-semibold text-gray-700 text-right truncate">{selectedResult.carrier}</span></div>
                <div className="flex justify-between gap-2"><span className="text-gray-400">Port of Loading</span><span className="font-semibold text-gray-700 text-right truncate">{selectedResult.originPort}</span></div>
                <div className="flex justify-between gap-2"><span className="text-gray-400">Port of Discharge</span><span className="font-semibold text-gray-700 text-right truncate">{selectedResult.destinationPort}</span></div>
                {bolNo && <div className="flex justify-between gap-2"><span className="text-gray-400">B/L No.</span><span className="font-semibold text-gray-700 text-right truncate">{bolNo}</span></div>}
                <p className={`text-[11px] pt-1 ${approveBL ? 'text-green-600' : 'text-amber-600'}`}>
                  {approveBL ? '✓ Draft details approved' : 'Approve the draft at the Payment step to confirm.'}
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SeaBookingDetailsPage;
