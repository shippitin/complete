import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  FaCheckCircle, FaHome, FaHistory, FaInfoCircle,
  FaTrain, FaTruck, FaPlane, FaShip,
  FaCalendarAlt, FaClock, FaDownload, FaCreditCard,
  FaEnvelope, FaPhone, FaPrint,
} from 'react-icons/fa';

import API_BASE_URL from '../config/api';

const fmt = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;

const formatServiceType = (st: string) => {
  if (st === 'terminalToTerminal') return 'Terminal to Terminal';
  if (st === 'doorToDoor')         return 'Door to Door';
  if (st === 'doorToTerminal')     return 'Door to Terminal';
  if (st === 'terminalToDoor')     return 'Terminal to Door';
  return st || 'Terminal to Terminal';
};

const buildInvoiceHTML = (d: any): string => {
  const b  = d.selectedResult      || {};
  const fd = d.originalFormData    || {};
  const sd = d.senderDetails       || {};
  const rd = d.receiverDetails     || {};
  const cd = d.cargoDetails        || {};
  const pd = d.paymentDetails      || {};
  const fa = d.finalAmount         || 0;
  const numContainers = fd.numberOfContainers || 1;
  const containerType = fd.containerType      || '20ft Standard';
  const isDomestic    = fd.isDomestic !== false;
  const thcSide       = isDomestic ? 3000 : (containerType.includes('40ft') ? 12100 : 8700);
  const base          = b.price || fa;
  const thcO          = thcSide * numContainers;
  const thcD          = thcSide * numContainers;
  const pf            = isDomestic ? 1000 : 1500;
  const gRail         = Math.round(base * 0.05);
  const gTHC          = Math.round((thcO + thcD) * 0.18);
  const gPlat         = Math.round(pf * 0.18);
  const totalGST      = gRail + gTHC + gPlat;
  const subtotal      = base + thcO + thcD + pf;
  const insAmt        = d.insuranceRequired ? Math.round(base * 0.01) : 0;
  const grand         = subtotal + totalGST + insAmt;

  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"/>
<title>Shippitin Invoice — ${d.bookingId}</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box;}
  body{font-family:Arial,sans-serif;background:#fff;color:#1a1a2e;font-size:13px;}
  .page{max-width:800px;margin:0 auto;padding:40px;}
  .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px;padding-bottom:24px;border-bottom:3px solid #2563eb;}
  .logo{font-size:28px;font-weight:900;letter-spacing:-1px;color:#1e3a8a;}
  .logo span{color:#2563eb;}
  .invoice-meta{text-align:right;}
  .invoice-meta h2{font-size:22px;font-weight:800;color:#1e3a8a;margin-bottom:4px;}
  .badge{display:inline-block;background:#dcfce7;color:#166534;font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px;margin-top:6px;}
  .info-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-bottom:28px;}
  .info-box{background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:14px 16px;}
  .info-box h4{font-size:9px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#94a3b8;margin-bottom:8px;}
  .route{background:#1e3a8a;color:#fff;border-radius:12px;padding:16px 24px;margin-bottom:28px;display:flex;justify-content:space-between;align-items:center;}
  .route-city{font-size:18px;font-weight:800;}
  .section-title{font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#64748b;margin-bottom:10px;margin-top:24px;}
  table{width:100%;border-collapse:collapse;margin-bottom:20px;}
  th{background:#f1f5f9;font-size:10px;font-weight:700;padding:10px 14px;text-align:left;border-bottom:2px solid #e2e8f0;}
  td{padding:10px 14px;border-bottom:1px solid #f1f5f9;font-size:12px;}
  .total-row{background:#1e3a8a!important;color:#fff;}
  .total-row td{color:#fff!important;font-weight:800;font-size:15px;padding:14px!important;}
  .footer{border-top:1px solid #e2e8f0;padding-top:20px;margin-top:24px;display:flex;justify-content:space-between;}
  @media print{body{-webkit-print-color-adjust:exact;}}
</style></head><body><div class="page">
  <div class="header">
    <div>
      <div class="logo">SHIPP<span>ITIN</span></div>
      <p style="color:#64748b;font-size:11px;margin-top:4px;">India's First Rail Freight Aggregator</p>
      <p style="color:#64748b;font-size:11px;">shippitin.co | info@shippitin.co</p>
    </div>
    <div class="invoice-meta">
      <h2>BOOKING INVOICE</h2>
      <p>Invoice No: <strong>${d.bookingId}</strong></p>
      <p>Date: ${d.bookingDate} | Time: ${d.bookingTime}</p>
      <div class="badge">✓ BOOKING CONFIRMED</div>
    </div>
  </div>
  <div class="info-grid">
    <div class="info-box"><h4>Booking Reference</h4><p><strong style="font-size:16px;color:#1e3a8a">${d.bookingId}</strong></p><p>Operator: <strong>${b.operator || b.carrier || 'CONCOR'}</strong></p><p>Transit: <strong>${b.transitDuration || b.transitTime || '4 Days'}</strong></p></div>
    <div class="info-box"><h4>Cargo Details</h4><p><strong>${numContainers} × ${containerType}</strong></p><p>${isDomestic ? 'Domestic' : 'International'} · ${formatServiceType(fd.serviceType || '')}</p><p>Weight: <strong>${fd.totalWeight ? fd.totalWeight + ' KG' : 'N/A'}</strong></p></div>
    <div class="info-box"><h4>Payment</h4><p>Mode: <strong>${pd.paymentMode === 'online' ? 'Online' : pd.paymentMode === 'bank' ? 'Bank Transfer' : 'Credit Account'}</strong></p><p>Status: <strong style="color:#166534;">Pending</strong></p><p>Amount: <strong style="color:#1e3a8a;">${fmt(grand)}</strong></p></div>
  </div>
  <div class="route">
    <div><div class="route-city">${b.originStation || b.originPort || 'Origin'}</div></div>
    <div style="text-align:center"><p>━━━━━━ 🚂 ━━━━━━</p><strong>${b.transitDuration || b.transitTime || '4 Days'}</strong></div>
    <div style="text-align:right"><div class="route-city">${b.destinationStation || b.destinationPort || 'Destination'}</div></div>
  </div>
  <div class="section-title">Charges Breakup</div>
  <table>
    <thead><tr><th>Charge</th><th style="text-align:right">Amount</th></tr></thead>
    <tbody>
      <tr><td>Base Freight</td><td style="text-align:right">${fmt(base)}</td></tr>
      <tr><td>THC Origin (${numContainers} × ${fmt(thcSide)})</td><td style="text-align:right">${fmt(thcO)}</td></tr>
      <tr><td>THC Destination (${numContainers} × ${fmt(thcSide)})</td><td style="text-align:right">${fmt(thcD)}</td></tr>
      <tr><td>Platform Fee</td><td style="text-align:right">${fmt(pf)}</td></tr>
      <tr><td>GST (Rail @5%, THC @18%, Platform @18%)</td><td style="text-align:right">${fmt(totalGST)}</td></tr>
      ${insAmt > 0 ? `<tr><td>Cargo Insurance (1%)</td><td style="text-align:right">${fmt(insAmt)}</td></tr>` : ''}
    </tbody>
  </table>
  <table><tbody><tr class="total-row"><td>GRAND TOTAL (Inclusive of all taxes)</td><td style="text-align:right">${fmt(grand)}</td></tr></tbody></table>
  <div class="footer">
    <div><p><strong>Shippitin Logistics Private Limited</strong></p><p>shippitin.co | support@shippitin.co</p></div>
    <div style="text-align:right"><p>System-generated invoice.</p></div>
  </div>
</div></body></html>`;
};

const BookingConfirmationPage: React.FC = () => {
  const location = useLocation();
  const navigate  = useNavigate();
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  const [loading, setLoading]               = useState(true);
  const [emailSent, setEmailSent]           = useState(false);
  const [smsSent, setSmsSent]               = useState(false);
  const [sending, setSending]               = useState<'email' | 'sms' | null>(null);

  // Land at the top so the payment banner / header is the first thing seen
  // (SPA navigation otherwise keeps the previous page's scroll offset).
  useEffect(() => { window.scrollTo(0, 0); }, []);

  useEffect(() => {
    let details = location.state?.bookingDetails;
    if (!details) {
      const stored = sessionStorage.getItem('lastBookingDetails');
      if (stored) details = JSON.parse(stored);
    }
    if (details) {
      setBookingDetails(details);
      sessionStorage.setItem('lastBookingDetails', JSON.stringify(details));
      (async () => {
        try {
          const token = localStorage.getItem('shippitin_token');
          if (token && details.bookingId) {
            await fetch(`${API_BASE_URL}/api/bookings`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
              body: JSON.stringify({
                booking_number:       details.bookingId,
                service_type:         details.originalFormData?.bookingType || 'Train Container Booking',
                origin:               details.selectedResult?.originStation || details.selectedResult?.originPort || 'Origin',
                destination:          details.selectedResult?.destinationStation || details.selectedResult?.destinationPort || 'Destination',
                cargo_type:           details.originalFormData?.cargoType    || 'General',
                weight:               details.originalFormData?.totalWeight  || 0,
                booking_date:         new Date().toISOString().split('T')[0],
                estimated_price:      details.finalAmount || 0,
                status:               'pending',
                container_type:       details.originalFormData?.containerType || null,
                number_of_containers: details.originalFormData?.numberOfContainers || 1,
                // ── Extended details so the full booking shows in My Bookings ──
                route_type:           details.originalFormData?.serviceType || null,   // doorToDoor / terminalToTerminal …
                is_domestic:          details.originalFormData?.isDomestic !== false,
                shipping_line:        details.shippingLine || null,
                operator:             details.selectedResult?.operator || null,
                transit_time:         details.selectedResult?.transitDuration || null,
                hazardous:            !!details.originalFormData?.hazardousCargo,
                insurance_required:   !!details.insuranceRequired,
                sender_name:          details.senderDetails?.senderName    || null,
                sender_phone:         details.senderDetails?.senderPhone    || null,
                sender_email:         details.senderDetails?.senderEmail    || null,
                sender_gstin:         details.senderDetails?.senderGstin    || null,
                sender_address:       details.senderDetails?.senderAddress  || null,
                receiver_name:        details.receiverDetails?.receiverName    || null,
                receiver_phone:       details.receiverDetails?.receiverPhone    || null,
                receiver_email:       details.receiverDetails?.receiverEmail    || null,
                receiver_address:     details.receiverDetails?.receiverAddress  || null,
                charges_breakdown:    details.charges || null,   // JSON: base, THC, mile, insurance, GST, grand
              }),
            });
          }
        } catch (e) { console.error('Save booking failed:', e); }
      })();
    }
    setLoading(false);
  }, [location.state]);

  const handleDownload = () => {
    if (!bookingDetails) return;
    const html = buildInvoiceHTML(bookingDetails);
    const blob = new Blob([html], { type: 'text/html' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `Shippitin-Invoice-${bookingDetails.bookingId}.html`; a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    if (!bookingDetails) return;
    const win = window.open('', '_blank');
    if (win) { win.document.write(buildInvoiceHTML(bookingDetails)); win.document.close(); win.print(); }
  };

  const handleSendEmail = async () => {
    const email = bookingDetails?.senderDetails?.senderEmail || bookingDetails?.kycDetails?.email;
    if (!email) { alert('No email address found.'); return; }
    setSending('email');
    try {
      const token = localStorage.getItem('shippitin_token');
      await fetch(`${API_BASE_URL}/api/bookings/send-confirmation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ bookingId: bookingDetails.bookingId, email, type: 'email' }),
      });
      setEmailSent(true);
    } catch (e) { setEmailSent(true); }
    finally { setSending(null); }
  };

  const handleSendSMS = async () => {
    const phone = bookingDetails?.senderDetails?.senderPhone || bookingDetails?.kycDetails?.mobile;
    if (!phone) { alert('No phone number found.'); return; }
    setSending('sms');
    try {
      const token = localStorage.getItem('shippitin_token');
      await fetch(`${API_BASE_URL}/api/bookings/send-confirmation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ bookingId: bookingDetails.bookingId, phone, type: 'sms' }),
      });
      setSmsSent(true);
    } catch (e) { setSmsSent(true); }
    finally { setSending(null); }
  };

  const handlePayNow = () => {
    navigate('/payment', {
      state: {
        bookingId:     bookingDetails.bookingId,
        amount:        bookingDetails.finalAmount,
        bookingNumber: bookingDetails.bookingId,
        serviceType:   bookingDetails.originalFormData?.bookingType || 'Rail Freight',
      },
    });
  };

  // ── Navigate to track with booking ID + route info ──
  if (loading) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-10">
      <div className="animate-spin rounded-full h-14 w-14 border-4 border-blue-600 border-t-transparent mb-4"></div>
      <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Securing Booking...</p>
    </div>
  );

  if (!bookingDetails) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="bg-white p-12 rounded-3xl shadow-xl text-center max-w-md border border-slate-200">
        <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <FaInfoCircle size={32} />
        </div>
        <h2 className="text-2xl font-black text-slate-900">Data Unavailable</h2>
        <p className="text-slate-500 mt-3 mb-8">We couldn't retrieve your booking. Please go back and try again.</p>
        <button onClick={() => navigate('/')} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-black transition">Return to Homepage</button>
      </div>
    </div>
  );

  const { selectedResult = {}, senderDetails = {}, bookingDate, bookingTime, bookingId, finalAmount = 0, originalFormData = {} } = bookingDetails;
  const senderEmail = senderDetails.senderEmail || bookingDetails?.kycDetails?.email || '';
  const senderPhone = senderDetails.senderPhone || bookingDetails?.kycDetails?.mobile || '';

  const serviceType = originalFormData?.bookingType || '';
  const ServiceIcon = serviceType.includes('Sea') ? FaShip
    : serviceType.includes('Air') ? FaPlane
    : serviceType.includes('Truck') ? FaTruck
    : FaTrain;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-4 pb-8 px-4 font-sans">
      <div className="max-w-4xl mx-auto space-y-4">

        {/* Success banner */}
        <div className="bg-emerald-600 rounded-2xl p-5 text-center text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-7xl"><ServiceIcon /></div>
          <div className="inline-flex items-center justify-center w-11 h-11 bg-white/20 rounded-full mb-2">
            <FaCheckCircle className="text-xl" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{finalAmount > 0 ? 'Booking Created!' : 'Booking Confirmed!'}</h1>
          <p className="opacity-90 mt-1 text-sm font-medium">
            {finalAmount > 0 ? 'One step left — complete your payment to confirm the shipment.' : 'Your shipment has been successfully scheduled.'}
          </p>
        </div>

        {/* Payment Pending — primary call to action */}
        {finalAmount > 0 && (
          <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <p className="text-[11px] font-black uppercase tracking-widest text-amber-600 flex items-center gap-2 justify-center sm:justify-start">
                <FaInfoCircle /> Payment Pending
              </p>
              <p className="text-2xl font-black text-slate-900 mt-0.5">{fmt(finalAmount)}</p>
              <p className="text-xs text-slate-500">Pay now to confirm your booking — it stays pending until paid.</p>
            </div>
            <button onClick={handlePayNow}
              className="bg-blue-600 hover:bg-blue-700 text-white font-black px-6 py-3 rounded-xl shadow-lg shadow-blue-200 transition text-base flex items-center gap-2 whitespace-nowrap">
              <FaCreditCard /> Pay {fmt(finalAmount)} Now
            </button>
          </div>
        )}

        {/* Booking reference */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 text-center">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">Booking Reference</p>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tighter">{bookingId}</h2>
          <div className="flex items-center justify-center gap-3 mt-3">
            <span className="flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-full border border-slate-200 text-xs font-bold text-slate-500">
              <FaCalendarAlt className="text-blue-500" /> {bookingDate}
            </span>
            <span className="flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-full border border-slate-200 text-xs font-bold text-slate-500">
              <FaClock className="text-blue-500" /> {bookingTime}
            </span>
          </div>
        </div>

        {/* Shipment summary */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
          <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
            <ServiceIcon className="text-blue-500" /> Shipment Summary
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'From',      value: selectedResult.originStation      || selectedResult.originPort      || '—' },
              { label: 'To',        value: selectedResult.destinationStation || selectedResult.destinationPort || '—' },
              { label: 'Transit',   value: selectedResult.transitDuration    || selectedResult.transitTime     || '—' },
              { label: 'Operator',  value: selectedResult.operator           || selectedResult.carrier         || selectedResult.serviceName || '—' },
              { label: 'Container', value: `${originalFormData.numberOfContainers || 1} × ${originalFormData.containerType || '20ft Standard'}` },
              { label: 'Service',   value: serviceType.replace('Train ', '').replace(' Booking', '') || formatServiceType(originalFormData.serviceType || '') },
              { label: 'Sender',    value: senderDetails.senderName || bookingDetails?.kycDetails?.companyName || '—' },
              { label: 'Amount',    value: fmt(finalAmount) },
            ].map((row, i) => (
              <div key={i} className="bg-slate-50 rounded-xl p-3">
                <p className="text-xs text-slate-400 mb-0.5">{row.label}</p>
                <p className="text-sm font-bold text-slate-800 truncate">{row.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Invoice & Notifications */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
          <h3 className="text-sm font-bold text-slate-800 mb-0.5">Invoice & Notifications</h3>
          <p className="text-xs text-slate-400 mb-3">Download your invoice or send it to email / phone</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button onClick={handleDownload}
              className="flex items-center gap-3 p-3 border-2 border-blue-200 bg-blue-50 hover:bg-blue-100 rounded-2xl transition">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <FaDownload className="text-white text-sm" />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-blue-800">Download Invoice</p>
                <p className="text-xs text-blue-500">Save as HTML (print as PDF)</p>
              </div>
            </button>
            <button onClick={handlePrint}
              className="flex items-center gap-3 p-3 border-2 border-slate-200 bg-slate-50 hover:bg-slate-100 rounded-2xl transition">
              <div className="w-10 h-10 bg-slate-700 rounded-xl flex items-center justify-center flex-shrink-0">
                <FaPrint className="text-white text-sm" />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-slate-800">Print Invoice</p>
                <p className="text-xs text-slate-400">Opens print dialog directly</p>
              </div>
            </button>
            <button onClick={handleSendEmail} disabled={emailSent || sending === 'email'}
              className={`flex items-center gap-3 p-4 border-2 rounded-2xl transition ${emailSent ? 'border-green-200 bg-green-50 cursor-default' : 'border-emerald-200 bg-emerald-50 hover:bg-emerald-100'}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${emailSent ? 'bg-green-600' : 'bg-emerald-600'}`}>
                {sending === 'email' ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : emailSent ? <FaCheckCircle className="text-white text-sm" /> : <FaEnvelope className="text-white text-sm" />}
              </div>
              <div className="text-left">
                <p className={`text-sm font-bold ${emailSent ? 'text-green-800' : 'text-emerald-800'}`}>{emailSent ? 'Email Sent!' : 'Send to Email'}</p>
                <p className={`text-xs truncate max-w-[160px] ${emailSent ? 'text-green-500' : 'text-emerald-500'}`}>{emailSent ? `Sent to ${senderEmail}` : senderEmail || 'No email on file'}</p>
              </div>
            </button>
            <button onClick={handleSendSMS} disabled={smsSent || sending === 'sms'}
              className={`flex items-center gap-3 p-4 border-2 rounded-2xl transition ${smsSent ? 'border-green-200 bg-green-50 cursor-default' : 'border-violet-200 bg-violet-50 hover:bg-violet-100'}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${smsSent ? 'bg-green-600' : 'bg-violet-600'}`}>
                {sending === 'sms' ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : smsSent ? <FaCheckCircle className="text-white text-sm" /> : <FaPhone className="text-white text-sm" />}
              </div>
              <div className="text-left">
                <p className={`text-sm font-bold ${smsSent ? 'text-green-800' : 'text-violet-800'}`}>{smsSent ? 'SMS Sent!' : 'Send SMS'}</p>
                <p className={`text-xs ${smsSent ? 'text-green-500' : 'text-violet-500'}`}>{smsSent ? `Sent to ${senderPhone}` : senderPhone || 'No phone on file'}</p>
              </div>
            </button>
          </div>
        </div>

        {/* Bottom navigation */}
        <div className="bg-slate-900 rounded-2xl p-3 flex flex-col sm:flex-row gap-3">
          <button onClick={() => navigate('/')}
            className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition flex items-center justify-center gap-2 text-sm">
            <FaHome /> Back to Home
          </button>
          <button onClick={() => navigate('/my-bookings')}
            className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-xl transition flex items-center justify-center gap-2 text-sm">
            <FaHistory /> My Bookings
          </button>
        </div>

      </div>
    </div>
  );
};

export default BookingConfirmationPage;
