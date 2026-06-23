// src/booking/parcel.config.ts — Courier / parcel.
// Documents: International non-doc = KYC (verify) + Air Waybill; Domestic / docs = AWB only.
import { FaUser, FaMapMarkerAlt, FaBoxOpen, FaTag, FaCreditCard } from 'react-icons/fa';
import type { ModeConfig } from './types';

export const parcelConfig: ModeConfig = {
  mode: 'parcel',
  bookingType: 'Parcel',
  title: 'Complete Your Parcel Booking',
  icon: FaBoxOpen,
  idPrefix: 'PCL',
  resultsRoute: '/parcel-results',
  defaultInternational: true,
  partyALabel: 'Sender',
  partyBLabel: 'Receiver',
  docPreviewTitle: 'Air Waybill — Draft',
  docPreviewVesselLabel: 'Courier',
  steps: [
    {
      id: 1, label: 'Sender', icon: FaUser, party: 'sender',
      activeBg: 'bg-brand-gradient', color: 'text-blue-500', border: 'border-blue-200',
      fields: [
        { key: 'senderName', label: 'Full Name / Company', required: true, placeholder: 'e.g., Priya Sharma', prefillFromUser: 'full_name' },
        { key: 'senderPhone', label: 'Mobile Number', type: 'tel', required: true, placeholder: 'e.g., 9876543210', prefillFromUser: 'phone' },
        { key: 'senderEmail', label: 'Email ID', type: 'email', required: true, placeholder: 'e.g., me@email.com', prefillFromUser: 'email' },
        { key: 'senderGstin', label: 'GSTIN (optional)', placeholder: 'e.g., 33AAAAA0000A1Z5', upper: true, prefillFromUser: 'gstin' },
        { key: 'senderAddress', label: 'Pickup Address', required: true, colSpan: 2, placeholder: 'Street address, locality' },
        { key: 'senderCity', label: 'City', type: 'city', required: true, placeholder: 'e.g., Mumbai' },
        { key: 'senderPincode', label: 'Pincode', placeholder: 'e.g., 400001' },
        { key: 'senderCountry', label: 'Country', placeholder: 'e.g., India' },
      ],
    },
    {
      id: 2, label: 'Receiver', icon: FaMapMarkerAlt, party: 'receiver',
      activeBg: 'bg-green-600', color: 'text-green-500', border: 'border-green-200',
      fields: [
        { key: 'receiverName', label: 'Full Name / Company', required: true, placeholder: 'e.g., John Doe' },
        { key: 'receiverPhone', label: 'Mobile Number', type: 'tel', required: true, placeholder: 'e.g., +44 7700 900123' },
        { key: 'receiverEmail', label: 'Email ID', type: 'email', required: true, placeholder: 'e.g., john@email.com' },
        { key: 'receiverKyc', label: 'KYC ID (Aadhaar/Passport/PAN)', placeholder: 'Required for international non-docs', when: (_v, ctx) => !ctx.isDomestic },
        { key: 'receiverAddress', label: 'Delivery Address', required: true, colSpan: 2, placeholder: 'Street address, locality (no PO Box)' },
        { key: 'receiverCity', label: 'City', type: 'city', required: true, placeholder: 'e.g., London' },
        { key: 'receiverPincode', label: 'ZIP / Postal Code', placeholder: 'e.g., EC1A 1BB' },
        { key: 'receiverCountry', label: 'Country', placeholder: 'e.g., United Kingdom' },
      ],
    },
    {
      id: 3, label: 'Parcel', icon: FaBoxOpen,
      activeBg: 'bg-orange-500', color: 'text-orange-500', border: 'border-orange-200',
      fields: [
        { key: 'contentsDescription', label: 'Contents Description', required: true, colSpan: 2, placeholder: 'e.g., Documents / personal clothing / electronics' },
        { key: 'courierMode', label: 'Shipment Type', type: 'select', options: [{ value: 'DOC', label: 'Document' }, { value: 'NON', label: 'Non-document (parcel)' }] },
        { key: 'hsCode', label: 'HS Code (non-docs)', placeholder: 'e.g., 6109', when: (v) => v.courierMode !== 'DOC' },
        { key: 'declaredValue', label: 'Declared Value (₹)', type: 'number', required: true, placeholder: 'e.g., 12000' },
        { key: 'weight', label: 'Weight (kg)', type: 'number', placeholder: 'e.g., 2.5' },
        { key: 'dimensions', label: 'Dimensions (L×W×H cm)', placeholder: 'e.g., 30×20×15' },
        { key: 'numPieces', label: 'No. of Pieces', type: 'number', placeholder: 'e.g., 1' },
        { key: 'specialInstructions', label: 'Special Instructions', type: 'textarea', colSpan: 2, placeholder: 'Fragile, signature on delivery...' },
      ],
    },
    { id: 4, label: 'Add-ons', icon: FaTag, activeBg: 'bg-teal-600', color: 'text-teal-500', border: 'border-teal-200', fields: [] },
    { id: 5, label: 'Payment', icon: FaCreditCard, activeBg: 'bg-purple-600', color: 'text-purple-500', border: 'border-purple-200', fields: [] },
  ],
  addons: [
    { key: 'insurance', label: '🛡️ Shipment Protection', price: '0.25% of declared value', desc: 'Cover against loss or damage in transit', insurance: true, valueField: { key: 'insuranceValue', placeholder: 'e.g., 12000' } },
    { key: 'signature', label: '✍️ Signature on Delivery', price: '₹150', desc: 'Recipient signature captured on delivery' },
    { key: 'express', label: '⚡ Priority Express', price: '₹400', desc: 'Fastest available transit time' },
    { key: 'co2', label: '🌱 CO₂ Credits', price: 'Earn green credits', desc: 'Offset this shipment’s emissions' },
    { key: 'miles', label: '⭐ Miles Credits', price: 'Earn reward miles', desc: 'Redeem for discounts on future bookings' },
  ],
  documents: [
    { kind: 'verify', label: 'KYC Document No.', placeholder: 'Consignee Aadhaar / Passport / PAN',
      verifyingToast: 'Verifying KYC for customs clearance…', doneToast: 'KYC verified for customs clearance',
      hint: 'Indian customs require consignee KYC for all international non-document imports.', when: (ctx) => !ctx.isDomestic },
    { kind: 'file', label: 'Air Waybill (AWB)', fields: [{ key: 'awbNo', placeholder: 'Courier AWB / tracking number' }],
      hint: 'Generate the courier Air Waybill for tracking.', doneToast: 'Air Waybill generated' },
  ],
  computeCharges: (v, selected, ctx) => {
    const base = Number(selected?.price) || 0;
    const a = ctx.addons || {};
    const rows = [
      { label: 'Courier Charge', amount: base, gst: 0.18, freight: true },
      { label: 'Fuel Surcharge', amount: Math.round(base * 0.10), gst: 0.18 },
    ];
    if (a.signature) rows.push({ label: 'Signature on Delivery', amount: 150, gst: 0.18 });
    if (a.express) rows.push({ label: 'Priority Express', amount: 400, gst: 0.18 });
    rows.push({ label: 'Platform Fee', amount: 300, gst: 0.18 });
    const insurance = a.insurance ? Math.round((Number(v.insuranceValue) || 0) * 0.0025) : 0;
    return { rows, insurance };
  },
};
