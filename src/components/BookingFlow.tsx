// src/components/BookingFlow.tsx
// Shared, config-driven booking engine. Renders the full multi-step booking flow for any
// transport mode (Air, Truck, Parcel, Customs, First/Last Mile, Door-to-Door, Port) from a
// ModeConfig: stepper + field-driven steps + add-ons + payment + (for existing bookings) a
// "Complete documentation" filing card + charges sidebar + optional draft-document preview.
// Mirrors the bespoke Rail/Sea pages so all modes look and behave identically.
//
// Persistence convention (so My Shipments status logic is mode-agnostic): the verify document
// persists `filing_number`, the file document persists `efn_filed`; the full field map is stored
// under `flow_values` for round-tripping via "Complete documentation".
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  FaArrowLeft, FaArrowRight, FaCheckCircle, FaChevronDown, FaChevronUp,
  FaTruck, FaFileSignature, FaFileUpload, FaFileAlt, FaTimes, FaAnchor,
} from 'react-icons/fa';
import LocationAutocomplete from './LocationAutocomplete';
import type { ModeConfig, FieldDef, FlowCtx, ChargeResult } from '../booking/types';

const fmt = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;

const inp = (err?: boolean, empty?: boolean) =>
  `w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 transition ${
    err ? 'border-red-400 bg-red-50' : empty ? 'border-red-200 bg-red-50/60' : 'border-gray-200 bg-white'
  }`;

// Saved shipper/consignee — shared keys with Rail/Sea so a returning customer prefills across modes.
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

// A selected city suggestion fills City + State + Country (Google secondaryText = "State, Country").
const splitPlace = (loc: { name?: string; state?: string; country?: string }) => {
  let stateName = loc.country ? (loc.state || '') : '';
  let countryName = loc.country || '';
  if (!loc.country && loc.state) {
    const parts = loc.state.split(',').map(s => s.trim()).filter(Boolean);
    if (parts.length >= 2) { countryName = parts[parts.length - 1]; stateName = parts.slice(0, -1).join(', '); }
    else if (parts.length === 1) { countryName = parts[0]; }
  }
  return { city: loc.name || '', state: stateName, country: countryName };
};

const BookingFlow: React.FC<{ config: ModeConfig }> = ({ config }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [selected, setSelected]   = useState<any>(null);
  const [formData, setFormData]   = useState<any>(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);   // 0 = all collapsed until clicked
  const [showBreakup, setShowBreakup] = useState(true);
  const [errors, setErrors]       = useState<Record<string, string>>({});
  const [existingBooking, setExistingBooking] = useState<{ id?: string; booking_number?: string } | null>(null);

  // All field values across all steps + add-on value/address fields.
  const [values, setValues]   = useState<Record<string, string>>({});
  const [addons, setAddons]   = useState<Record<string, boolean>>({});
  const set = (k: string, v: string) => setValues(prev => ({ ...prev, [k]: v }));
  const val = (k: string) => values[k] || '';

  // Document filing (existing bookings only)
  const [verifyInput, setVerifyInput] = useState('');
  const [verifying, setVerifying]     = useState(false);
  const [verified, setVerified]       = useState(false);
  const [docFiled, setDocFiled]       = useState(false);

  // Payment
  const [paymentMode, setPaymentMode]   = useState<'online' | 'bank' | 'credit'>('online');
  const [creditAccount, setCreditAccount] = useState('');
  const [approveDoc, setApproveDoc]     = useState(false);
  const [uploadedDocs, setUploadedDocs] = useState<File[]>([]);

  const stateKey = config.stateKey || 'selectedResult';
  const steps = config.steps;
  const lastStepId = steps.length ? steps[steps.length - 1].id : 1;

  useEffect(() => {
    const st = location.state as any;
    const sel = st?.[stateKey] ?? st?.selectedResult ?? st?.selectedOffer;
    if (sel && st?.originalFormData) {
      const fd = st.originalFormData;
      setSelected(sel);
      setFormData(fd);
      setExistingBooking(st.existing || null);

      // Prefill field values from the logged-in user, saved parties, then the existing booking.
      const user = (() => { try { return JSON.parse(localStorage.getItem('shippitin_user') || '{}'); } catch { return {}; } })();
      const seed: Record<string, string> = {};
      steps.forEach(step => step.fields.forEach(f => {
        if (f.prefillFromUser && user[f.prefillFromUser]) seed[f.key] = String(user[f.prefillFromUser]);
      }));
      const savedS = loadParty('sender'); const savedR = loadParty('receiver');
      steps.forEach(step => {
        const saved = step.party === 'sender' ? savedS : step.party === 'receiver' ? savedR : null;
        if (saved) step.fields.forEach(f => { const sk = f.key.replace(/^(shipper|consignee|consignor|sender|receiver|importer|exporter)/i, '').toLowerCase(); if (saved[sk]) seed[f.key] = saved[sk]; });
      });
      // Carry add-on choices from the search/recommended step.
      const ctx0: FlowCtx = { isDomestic: fd?.isDomestic === true, isCompletingDocs: !!st.existing, selected: sel, formData: fd, addons: {} };
      const addonSeed: Record<string, boolean> = {};
      config.addons.forEach(a => { if (a.defaultOn) addonSeed[a.key] = a.defaultOn(ctx0); });

      const pf = st.prefill;
      if (pf?.values) Object.assign(seed, pf.values);
      if (pf?.filing) { setVerifyInput(String(pf.filing)); setVerified(true); }
      if (pf?.docFiled) setDocFiled(true);

      setValues(seed);
      setAddons(addonSeed);
      if (st.initialStep) setCurrentStep(st.initialStep);
      setLoading(false);
    } else {
      setError('Booking details not found.');
      setLoading(false);
    }
  }, [location.state]);

  // International vs domestic: honour an explicit flag, else fall back to the mode default
  // (sea/air default international; truck/first-last-mile are domestic-only).
  const domestic = (() => {
    if (!formData) return false;
    if (formData.isDomestic === true) return true;
    if (formData.isDomestic === false) return false;
    return !config.defaultInternational;
  })();

  const ctx: FlowCtx = { isDomestic: domestic, isCompletingDocs: !!existingBooking, selected, formData, addons };

  const visibleFields = (fields: FieldDef[]) => fields.filter(f => !f.when || f.when(values, ctx));

  const validateStep = (stepId: number) => {
    const step = steps.find(s => s.id === stepId);
    if (!step) return true;
    const e: Record<string, string> = {};
    visibleFields(step.fields).forEach(f => { if (f.required && !val(f.key).trim()) e[f.key] = 'Required'; });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const goToStep = (s: number) => { setErrors({}); setCurrentStep(s); };
  const partySnapshot = (party: 'sender' | 'receiver') => {
    const step = steps.find(s => s.party === party);
    const out: Record<string, string> = {};
    step?.fields.forEach(f => { const sk = f.key.replace(/^(shipper|consignee|consignor|sender|receiver|importer|exporter)/i, '').toLowerCase(); out[sk] = val(f.key); });
    return out;
  };
  const nextStep = () => {
    if (!validateStep(currentStep)) return;
    const step = steps.find(s => s.id === currentStep);
    if (step?.party) saveParty(step.party, partySnapshot(step.party));
    setCurrentStep(s => Math.min(s + 1, lastStepId));
  };

  // ── Document filing ──
  const verifyDoc = config.documents.find(d => d.kind === 'verify' && (!d.when || d.when(ctx)));
  const fileDoc   = config.documents.find(d => d.kind === 'file'   && (!d.when || d.when(ctx)));
  const hasFiling = ctx.isCompletingDocs && (!!verifyDoc || !!fileDoc);

  const persistFiling = (patch: Record<string, any>) => {
    if (!existingBooking?.id) return;
    try {
      const dov = JSON.parse(localStorage.getItem('bookingDetailOverrides') || '{}');
      dov[existingBooking.id] = { ...(dov[existingBooking.id] || {}), ...patch };
      localStorage.setItem('bookingDetailOverrides', JSON.stringify(dov));
    } catch { /* quota */ }
  };

  const runVerify = () => {
    if (!verifyDoc) return;
    const len = (verifyDoc.maxLen || 0);
    if (len && verifyInput.length !== len) return;
    if (!verifyInput.trim() || verifying || verified) return;
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false); setVerified(true);
      persistFiling({ filing_number: verifyInput });
      toast.success(verifyDoc.doneToast || 'Document verified');
    }, 1200);
  };
  const runFile = () => {
    if (!fileDoc || docFiled) return;
    const reqs = fileDoc.fields || [];
    if (reqs.some(f => !val(f.key).trim())) return;
    setDocFiled(true);
    const patch: Record<string, any> = { efn_filed: true };
    reqs.forEach(f => { patch[f.key] = val(f.key); });
    persistFiling(patch);
    toast.success(fileDoc.doneToast || 'Document filed');
  };
  const verifyOk = !verifyDoc || verified;
  const filingComplete = (!verifyDoc || verified) && (!fileDoc || docFiled);

  const charges: ChargeResult | null = (selected && formData) ? config.computeCharges(values, selected, ctx) : null;
  const bd = (() => {
    if (!charges) return null;
    const ins = charges.insurance || 0;
    let subtotal = 0, gst = 0;
    charges.rows.forEach(r => { subtotal += r.amount; gst += Math.round(r.amount * (r.gst ?? 0.18)); });
    const gIns = Math.round(ins * 0.18);
    const totalGST = gst + gIns;
    const grand = subtotal + ins + totalGST;
    return { rows: charges.rows, ins, gIns, subtotal, totalGST, grand };
  })();

  // ── Display helpers (mode-agnostic origin/destination/carrier) ──
  const dOrigin = selected?.originAirport || selected?.originPort || selected?.origin || selected?.portName || formData?.origin || formData?.originCity || '—';
  const dDest   = selected?.destinationAirport || selected?.destinationPort || selected?.destination || formData?.destination || formData?.destinationCity || '—';
  const dCarrier = selected?.carrier || selected?.serviceProvider || selected?.serviceName || selected?.provider || '—';
  const dTransit = selected?.transitTime || selected?.estimatedTime || selected?.transitDuration || '—';

  const handleConfirm = () => {
    if (!validateStep(lastStepId)) return;
    if (config.docPreviewTitle && !approveDoc) {
      toast.error(`Please approve the draft ${config.docPreviewTitle.replace(/ —.*$/, '')} details to continue.`);
      return;
    }
    const isExisting = !!existingBooking?.booking_number;
    if (isExisting && hasFiling && !filingComplete) {
      toast.error('Please complete the document filing above before finishing.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const sSnap = steps.find(s => s.party === 'sender'); if (sSnap) saveParty('sender', partySnapshot('sender'));
    const rSnap = steps.find(s => s.party === 'receiver'); if (rSnap) saveParty('receiver', partySnapshot('receiver'));

    const bookingId = existingBooking?.booking_number || `${config.idPrefix}-${Date.now().toString().slice(-6)}`;
    const senderStep = steps.find(s => s.party === 'sender');
    const receiverStep = steps.find(s => s.party === 'receiver');
    const partyFieldVal = (step: typeof steps[number] | undefined, re: RegExp) => {
      const f = step?.fields.find(ff => re.test(ff.key));
      return f ? val(f.key) : '';
    };
    const nameOf = (step?: typeof steps[number]) => partyFieldVal(step, /name/i);

    if (existingBooking?.id) {
      try {
        const dov = JSON.parse(localStorage.getItem('bookingDetailOverrides') || '{}');
        dov[existingBooking.id] = {
          ...(dov[existingBooking.id] || {}),
          flow_values: values,
          sender_name: nameOf(senderStep), receiver_name: nameOf(receiverStep),
          route_type: formData?.activityType || formData?.serviceType,
          container_type: formData?.containerType, number_of_containers: formData?.numberOfContainers,
          is_domestic: domestic, operator: dCarrier, transit_time: dTransit,
          insurance_required: config.addons.some(a => a.insurance && addons[a.key]),
          charges_breakdown: bd, filing_number: verifyInput || undefined, efn_filed: docFiled || undefined,
        };
        localStorage.setItem('bookingDetailOverrides', JSON.stringify(dov));
      } catch { /* quota */ }
    }

    const finalBooking = {
      skipPersist: isExisting,
      selectedResult: { ...selected, originPort: dOrigin, destinationPort: dDest, transitTime: dTransit, operator: dCarrier, mode: config.mode },
      originalFormData: { ...formData, bookingType: config.bookingType, isDomestic: domestic, serviceType: formData?.activityType || formData?.serviceType, cargoType: formData?.commodity || formData?.cargoType || 'General' },
      senderDetails: {
        senderName: partyFieldVal(senderStep, /name/i), senderPhone: partyFieldVal(senderStep, /phone|mobile/i),
        senderEmail: partyFieldVal(senderStep, /email/i), senderGstin: partyFieldVal(senderStep, /gstin|tax|iec/i),
        senderAddress: partyFieldVal(senderStep, /address/i),
      },
      receiverDetails: {
        receiverName: partyFieldVal(receiverStep, /name/i), receiverPhone: partyFieldVal(receiverStep, /phone|mobile/i),
        receiverEmail: partyFieldVal(receiverStep, /email/i), receiverAddress: partyFieldVal(receiverStep, /address/i),
      },
      flowValues: values,
      paymentDetails: { paymentMode, creditAccount },
      bookingDate: new Date().toLocaleDateString('en-IN'),
      bookingTime: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      bookingId,
      finalAmount: bd?.grand || 0,
      insuranceRequired: config.addons.some(a => a.insurance && addons[a.key]),
      charges: bd,
    };

    if (isExisting) {
      try { localStorage.setItem('myShipmentsTab', domestic ? 'domestic' : 'international'); } catch { /* quota */ }
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
  if (error || !selected || !formData) return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="text-center p-10 bg-white rounded-2xl shadow">
        <p className="text-red-600 mb-4">{error || 'Booking details missing. Please go back to search results.'}</p>
        <button onClick={() => navigate(config.resultsRoute)} className="bg-brand-gradient text-white px-6 py-2 rounded-lg">Go Back</button>
      </div>
    </div>
  );

  const HeaderIcon = config.icon;

  const renderField = (f: FieldDef) => {
    const empty = !!f.required && !val(f.key);
    const err = !!errors[f.key];
    const opts = (f.options || []).map(o => typeof o === 'string' ? { value: o, label: o } : o);
    return (
      <div key={f.key} className={f.colSpan === 2 ? 'sm:col-span-2' : ''}>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
          {f.label} {f.required ? <span className="text-sky-400">*</span> : f.type === 'select' ? '' : ''}
        </label>
        {f.type === 'city' ? (
          <LocationAutocomplete
            value={val(f.key)} onChange={v => set(f.key, v)}
            onSelect={(loc: any) => { const p = splitPlace(loc); set(f.key, p.city); }}
            locationType="city" global={!domestic} placeholder={f.placeholder || ''} invalid={empty}
          />
        ) : f.type === 'select' ? (
          <select value={val(f.key)} onChange={e => set(f.key, e.target.value)} className={inp(err, empty)}>
            {f.placeholder && <option value="">{f.placeholder}</option>}
            {opts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        ) : f.type === 'textarea' ? (
          <textarea value={val(f.key)} onChange={e => set(f.key, e.target.value)} placeholder={f.placeholder} rows={2} className={`${inp(err, empty)} resize-none`} />
        ) : (
          <input
            type={f.type === 'number' ? 'number' : f.type === 'email' ? 'email' : f.type === 'tel' ? 'tel' : f.type === 'date' ? 'date' : 'text'}
            value={val(f.key)} onChange={e => set(f.key, f.upper ? e.target.value.toUpperCase() : e.target.value)}
            placeholder={f.placeholder} className={inp(err, empty)}
          />
        )}
        {err && <p className="text-xs text-red-500 mt-1">{errors[f.key]}</p>}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-5 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-4">

        <div className="flex-grow space-y-3">

          {/* Document filing — only when completing documentation for an existing booking */}
          {hasFiling && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-5 py-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                <FaFileSignature className="text-blue-500" /> Document filing
              </p>
              <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                {domestic ? 'Domestic' : 'International'}
              </span>
            </div>

            {verifyDoc && (
              <div className="mb-3">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{verifyDoc.label}</label>
                <div className="flex gap-2">
                  <input
                    type="text" inputMode={verifyDoc.numeric ? 'numeric' : undefined} maxLength={verifyDoc.maxLen}
                    value={verifyInput} disabled={verified}
                    onChange={e => setVerifyInput(verifyDoc.numeric ? e.target.value.replace(/\D/g, '').slice(0, verifyDoc.maxLen || 32) : e.target.value)}
                    placeholder={verifyDoc.placeholder}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:bg-gray-50 disabled:text-gray-500"
                  />
                  {verified ? (
                    <span className="px-3 py-2 rounded-xl bg-green-50 text-green-700 text-sm font-semibold flex items-center gap-1.5 whitespace-nowrap"><FaCheckCircle /> Verified</span>
                  ) : (
                    <button type="button" onClick={runVerify} disabled={verifying || (verifyDoc.maxLen ? verifyInput.length !== verifyDoc.maxLen : !verifyInput.trim())}
                      className="px-4 py-2 rounded-xl bg-brand-gradient hover:opacity-90 text-white text-sm font-semibold transition disabled:opacity-50 whitespace-nowrap">
                      {verifying ? 'Verifying…' : 'Verify'}
                    </button>
                  )}
                </div>
                <p className={`text-[11px] mt-1 ${verified ? 'text-green-600' : 'text-gray-400'}`}>
                  {verifying ? (verifyDoc.verifyingToast || 'Verifying…') : verified ? (verifyDoc.doneToast || 'Verified.') : (verifyDoc.hint || '')}
                </p>
              </div>
            )}

            {fileDoc && verifyOk && (
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{fileDoc.label}</label>
                <div className={`grid grid-cols-1 ${(fileDoc.fields?.length || 1) > 1 ? 'sm:grid-cols-3' : ''} gap-2`}>
                  {(fileDoc.fields || []).map(ff => (
                    <input key={ff.key} type={ff.numeric ? 'number' : 'text'} value={val(ff.key)} disabled={docFiled}
                      onChange={e => set(ff.key, e.target.value)} placeholder={ff.placeholder}
                      className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:bg-gray-50 disabled:text-gray-500" />
                  ))}
                </div>
                <div className="flex items-center justify-between mt-2">
                  <p className={`text-[11px] ${docFiled ? 'text-green-600' : 'text-gray-400'}`}>{docFiled ? (fileDoc.doneToast || 'Filed.') : (fileDoc.hint || '')}</p>
                  {docFiled ? (
                    <span className="px-3 py-2 rounded-xl bg-green-50 text-green-700 text-sm font-semibold flex items-center gap-1.5 whitespace-nowrap"><FaCheckCircle /> Filed</span>
                  ) : (
                    <button type="button" onClick={runFile} disabled={(fileDoc.fields || []).some(f => !val(f.key).trim())}
                      className="px-4 py-2 rounded-xl bg-brand-gradient hover:opacity-90 text-white text-sm font-semibold transition disabled:opacity-50 whitespace-nowrap">
                      File
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
          )}

          {/* Header + stepper */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-5 py-3">
            <div className="flex items-center gap-2.5 min-w-0 mb-3">
              <div className="p-2 rounded-lg bg-blue-50 flex-shrink-0"><HeaderIcon className="text-base text-blue-500" /></div>
              <div className="min-w-0">
                <h1 className="text-base font-bold text-gray-800 leading-tight">{config.title}</h1>
                <p className="text-gray-400 text-xs">Click any section to fill in details</p>
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-gray-50 pt-3">
              {steps.map((step, idx) => {
                const Icon = step.icon; const isActive = currentStep === step.id; const isDone = currentStep > step.id;
                return (
                  <React.Fragment key={step.id}>
                    <button onClick={() => goToStep(step.id)} className="flex flex-col items-center gap-1 group">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                        isDone ? 'bg-green-500 text-white' : isActive ? `${step.activeBg} text-white shadow-lg` : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200'}`}>
                        {isDone ? <FaCheckCircle className="text-sm" /> : <Icon className="text-sm" />}
                      </div>
                      <span className={`text-xs font-semibold transition ${isActive ? step.color : isDone ? 'text-green-500' : 'text-gray-400'}`}>{step.label}</span>
                    </button>
                    {idx < steps.length - 1 && <div className={`flex-1 h-0.5 mx-2 transition-all ${currentStep > step.id ? 'bg-green-400' : 'bg-gray-200'}`} />}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Steps */}
          {steps.map(step => {
            const Icon = step.icon; const isActive = currentStep === step.id; const isDone = currentStep > step.id;
            const isAddons = step.fields.length === 0 && step.label.toLowerCase().includes('add');
            const isPayment = step.id === lastStepId;
            return (
              <div key={step.id} className={`bg-white rounded-2xl shadow-sm border transition-all ${isActive ? `${step.border} border-2` : 'border-gray-100'}`}>
                <button onClick={() => goToStep(step.id)} className="w-full flex items-center justify-between px-5 py-3 text-left">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isDone ? 'bg-green-500' : isActive ? step.activeBg : 'bg-gray-100'}`}>
                      {isDone ? <FaCheckCircle className="text-white text-xs" /> : <Icon className={`text-xs ${isActive ? 'text-white' : 'text-gray-400'}`} />}
                    </div>
                    <div>
                      <p className={`text-sm font-bold ${isActive ? 'text-gray-800' : 'text-gray-500'}`}>Step {step.id} — {step.label}</p>
                      {!isActive && <p className="text-xs text-gray-400 mt-0.5">{isDone ? '✓ Filled in' : 'Click to fill'}</p>}
                    </div>
                  </div>
                  {!isActive && <span className={`text-xs px-3 py-1 rounded-full font-medium ${isDone ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}>{isDone ? 'Done ✓' : 'Pending'}</span>}
                </button>

                {isActive && (
                  <div className="px-5 pb-5 border-t border-gray-50">
                    {step.intro && <p className="text-xs text-gray-400 mt-3">{step.intro}</p>}

                    {/* Field grid */}
                    {step.fields.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                        {visibleFields(step.fields).map(renderField)}
                      </div>
                    )}

                    {/* Add-ons step */}
                    {isAddons && (
                      <div className="mt-3 space-y-2.5">
                        <p className="text-xs text-gray-400 mb-3">Select optional services to add to your booking.</p>
                        {config.addons.filter(a => !a.when || a.when(ctx)).map(a => (
                          <div key={a.key} className={`border rounded-xl p-3 transition ${addons[a.key] ? 'border-teal-300 bg-teal-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" checked={!!addons[a.key]} onChange={e => setAddons(p => ({ ...p, [a.key]: e.target.checked }))} className="mt-1 h-4 w-4 text-teal-600 rounded" />
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <p className="text-sm font-semibold text-gray-800 flex items-center gap-2">{a.addrField && <FaTruck className="text-teal-500" />}{a.label}</p>
                                  <span className="text-xs font-bold text-teal-600 bg-teal-100 px-2 py-0.5 rounded-full">{a.price}</span>
                                </div>
                                <p className="text-xs text-gray-400 mt-0.5">{a.desc}</p>
                              </div>
                            </label>
                            {addons[a.key] && a.addrField && (
                              <div className="mt-3 ml-7">
                                <input type="text" value={val(a.addrField.key)} onChange={e => set(a.addrField!.key, e.target.value)} placeholder={a.addrField.placeholder} className={inp()} />
                              </div>
                            )}
                            {addons[a.key] && a.valueField && (
                              <div className="mt-3 ml-7">
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Cargo Value (₹)</label>
                                <input type="number" min="0" value={val(a.valueField.key)} onChange={e => set(a.valueField!.key, e.target.value)} placeholder={a.valueField.placeholder} className={inp()} />
                                {a.insurance && Number(val(a.valueField.key)) > 0 && (
                                  <p className="text-xs text-gray-500 mt-1">Insurance @ 0.25% = <span className="font-semibold text-gray-700">{fmt(Number(val(a.valueField.key)) * 0.0025)}</span></p>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Payment step extras: payment modes + doc-upload + approval */}
                    {isPayment && (
                      <div className="mt-4 space-y-3">
                        {[
                          { value: 'online', label: 'Online Payment', sub: 'Credit/Debit Card · Net Banking · UPI' },
                          { value: 'bank',   label: 'Bank Transfer',  sub: 'NEFT / RTGS / IMPS / Wire' },
                          { value: 'credit', label: 'Credit Account',  sub: 'Corporate credit line (existing customers)' },
                        ].map(opt => (
                          <label key={opt.value} className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition ${paymentMode === opt.value ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                            <input type="radio" name="paymentMode" value={opt.value} checked={paymentMode === opt.value} onChange={() => setPaymentMode(opt.value as any)} className="h-4 w-4 text-blue-600" />
                            <div><p className="text-sm font-semibold text-gray-800">{opt.label}</p><p className="text-xs text-gray-400">{opt.sub}</p></div>
                          </label>
                        ))}
                        {paymentMode === 'credit' && (
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Credit Account Number</label>
                            <input type="text" value={creditAccount} onChange={e => setCreditAccount(e.target.value)} placeholder="e.g., CRED-001234" className={inp()} />
                          </div>
                        )}
                        {/* Optional document upload */}
                        <label htmlFor="flow-docs" className="flex flex-col items-center justify-center gap-1 border-2 border-dashed border-gray-200 rounded-xl px-4 py-4 cursor-pointer hover:border-blue-300 hover:bg-blue-50/40 transition text-center">
                          <FaFileUpload className="text-blue-400 text-lg" />
                          <span className="text-xs font-semibold text-gray-600">Upload supporting documents (optional)</span>
                          <span className="text-[11px] text-gray-400">Invoice, packing list, etc. · PDF / JPG / PNG</span>
                          <input id="flow-docs" type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx" onChange={e => { setUploadedDocs(prev => [...prev, ...Array.from(e.target.files || [])]); e.target.value = ''; }} className="hidden" />
                        </label>
                        {uploadedDocs.length > 0 && (
                          <div className="space-y-1.5">
                            {uploadedDocs.map((f, i) => (
                              <div key={i} className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-lg px-3 py-1.5">
                                <span className="text-xs text-gray-600 flex items-center gap-2 min-w-0"><FaFileAlt className="text-gray-400 flex-shrink-0" /><span className="truncate">{f.name}</span><span className="text-gray-300 flex-shrink-0">{(f.size / 1024).toFixed(0)} KB</span></span>
                                <button type="button" onClick={() => setUploadedDocs(prev => prev.filter((_, j) => j !== i))} className="text-gray-300 hover:text-red-500 transition flex-shrink-0 ml-2"><FaTimes className="text-xs" /></button>
                              </div>
                            ))}
                          </div>
                        )}
                        {config.docPreviewTitle && (
                          <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition ${approveDoc ? 'border-green-300 bg-green-50' : 'border-amber-200 bg-amber-50'}`}>
                            <input type="checkbox" checked={approveDoc} onChange={e => setApproveDoc(e.target.checked)} className="mt-0.5 h-4 w-4 text-green-600 rounded" />
                            <div><p className="text-sm font-semibold text-gray-800">I approve the draft {config.docPreviewTitle.replace(/ —.*$/, '')} details</p><p className="text-xs text-gray-500 mt-0.5">Confirm the parties and route shown in the preview are correct.</p></div>
                          </label>
                        )}
                      </div>
                    )}

                    {/* Nav */}
                    <div className="flex justify-between mt-5 pt-3 border-t border-gray-100">
                      <button type="button" onClick={() => goToStep(Math.max(currentStep - 1, steps[0].id))} disabled={currentStep === steps[0].id}
                        className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition ${currentStep === steps[0].id ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-100'}`}>
                        <FaArrowLeft className="text-xs" /> Previous
                      </button>
                      {currentStep < lastStepId ? (
                        <button type="button" onClick={nextStep} className="flex items-center gap-2 px-7 py-2.5 bg-brand-gradient hover:opacity-90 text-white font-bold rounded-xl transition text-sm">Next <FaArrowRight className="text-xs" /></button>
                      ) : (
                        <button type="button" onClick={handleConfirm} className="flex items-center gap-2 px-7 py-2.5 bg-brand-gradient hover:opacity-90 text-white font-bold rounded-xl transition text-sm">
                          {ctx.isCompletingDocs ? 'Complete Documentation' : 'Confirm Booking'} <FaCheckCircle />
                        </button>
                      )}
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
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100">
                <h3 className="text-base font-bold text-gray-800">Order Summary</h3>
                <p className="text-xs text-gray-400 mt-0.5">{config.bookingType} · {domestic ? 'Domestic' : 'International'}</p>
              </div>
              <div className="px-5 py-3 space-y-3">
                <button onClick={() => setShowBreakup(!showBreakup)} className="w-full flex items-center justify-between text-xs font-semibold text-gray-400 uppercase tracking-wide hover:text-blue-500 transition">
                  <span>Charges Breakup</span>{showBreakup ? <FaChevronUp /> : <FaChevronDown />}
                </button>
                {showBreakup && bd && (
                  <div className="space-y-2 text-sm">
                    {bd.rows.map((r, i) => r.amount > 0 && (
                      <div key={i} className="flex justify-between"><span className="text-gray-500">{r.label}</span><span className="font-semibold">{fmt(r.amount)}</span></div>
                    ))}
                    {bd.ins > 0 && <div className="flex justify-between"><span className="text-gray-500">Insurance</span><span className="font-semibold">{fmt(bd.ins)}</span></div>}
                  </div>
                )}
                {bd && <div className="flex justify-between py-2 border-t border-dashed border-gray-200 text-sm font-semibold"><span className="text-gray-600">Subtotal (excl. GST)</span><span>{fmt(bd.subtotal + bd.ins)}</span></div>}
                {bd && <div className="bg-amber-50 rounded-xl p-3 text-xs"><div className="flex justify-between font-bold text-gray-700"><span>Total GST</span><span>{fmt(bd.totalGST)}</span></div></div>}
                {bd && (
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between items-center"><span className="font-bold text-gray-800">Grand Total</span><span className="text-xl font-extrabold text-blue-700">{fmt(bd.grand)}</span></div>
                    <p className="text-xs text-gray-400 mt-0.5">Inclusive of all taxes</p>
                  </div>
                )}
                <div className="bg-gray-50 rounded-xl p-3 space-y-1.5 text-xs text-gray-500">
                  <div className="flex justify-between"><span>Provider</span><span className="font-semibold text-gray-700 text-right truncate max-w-[180px]">{dCarrier}</span></div>
                  <div className="flex justify-between"><span>From</span><span className="font-semibold text-gray-700">{dOrigin}</span></div>
                  <div className="flex justify-between"><span>To</span><span className="font-semibold text-gray-700">{dDest}</span></div>
                  <div className="flex justify-between"><span>Transit</span><span className="font-semibold text-gray-700">{dTransit}</span></div>
                </div>
                <p className="text-xs text-gray-400">*Prices indicative, subject to change on actuals.</p>
              </div>
            </div>

            {config.docPreviewTitle && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2"><FaAnchor className="text-blue-500 text-sm" /><h3 className="text-sm font-bold text-gray-800">{config.docPreviewTitle}</h3></div>
                <div className="px-5 py-3 space-y-2 text-xs">
                  <div className="flex justify-between gap-2"><span className="text-gray-400">{config.partyALabel}</span><span className="font-semibold text-gray-700 text-right truncate">{nameOfParty('sender')}</span></div>
                  <div className="flex justify-between gap-2"><span className="text-gray-400">{config.partyBLabel}</span><span className="font-semibold text-gray-700 text-right truncate">{nameOfParty('receiver')}</span></div>
                  <div className="flex justify-between gap-2"><span className="text-gray-400">{config.docPreviewVesselLabel || 'Carrier'}</span><span className="font-semibold text-gray-700 text-right truncate">{dCarrier}</span></div>
                  <div className="flex justify-between gap-2"><span className="text-gray-400">From</span><span className="font-semibold text-gray-700 text-right truncate">{dOrigin}</span></div>
                  <div className="flex justify-between gap-2"><span className="text-gray-400">To</span><span className="font-semibold text-gray-700 text-right truncate">{dDest}</span></div>
                  <p className={`text-[11px] pt-1 ${approveDoc ? 'text-green-600' : 'text-amber-600'}`}>{approveDoc ? '✓ Draft details approved' : 'Approve the draft at the Payment step to confirm.'}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  function nameOfParty(party: 'sender' | 'receiver') {
    const step = steps.find(s => s.party === party);
    if (!step) return '—';
    const nf = step.fields.find(f => /name/i.test(f.key));
    return (nf && val(nf.key)) || '—';
  }
};

export default BookingFlow;
