// src/booking/truck.config.ts — Road freight (domestic line-haul).
// Documents: E-way Bill (verify on GST portal) + Lorry Receipt / Consignment Note.
import { FaUser, FaMapMarkerAlt, FaBox, FaTag, FaCreditCard, FaTruck } from 'react-icons/fa';
import type { ModeConfig } from './types';

export const truckConfig: ModeConfig = {
  mode: 'truck',
  bookingType: 'Truck',
  title: 'Complete Your Road Freight Booking',
  icon: FaTruck,
  idPrefix: 'TRK',
  resultsRoute: '/truck-results',
  defaultInternational: false,
  partyALabel: 'Consignor',
  partyBLabel: 'Consignee',
  docPreviewTitle: 'Consignment Note — Draft',
  docPreviewVesselLabel: 'Transporter',
  steps: [
    {
      id: 1, label: 'Consignor', icon: FaUser, party: 'sender',
      activeBg: 'bg-brand-gradient', color: 'text-blue-500', border: 'border-blue-200',
      fields: [
        { key: 'consignorName', label: 'Full Name / Company', required: true, placeholder: 'e.g., Raj Industries', prefillFromUser: 'full_name' },
        { key: 'consignorPhone', label: 'Mobile Number', type: 'tel', required: true, placeholder: 'e.g., 9876543210', prefillFromUser: 'phone' },
        { key: 'consignorEmail', label: 'Email ID', type: 'email', required: true, placeholder: 'e.g., ops@company.com', prefillFromUser: 'email' },
        { key: 'consignorGstin', label: 'GSTIN', required: true, placeholder: 'e.g., 33AAAAA0000A1Z5', upper: true, prefillFromUser: 'gstin' },
        { key: 'consignorAddress', label: 'Pickup Address', required: true, colSpan: 2, placeholder: 'Street address, locality' },
        { key: 'consignorCity', label: 'City', type: 'city', required: true, placeholder: 'e.g., Pune' },
        { key: 'consignorState', label: 'State', placeholder: 'e.g., Maharashtra' },
        { key: 'consignorPincode', label: 'Pincode', placeholder: 'e.g., 411001' },
      ],
    },
    {
      id: 2, label: 'Consignee', icon: FaMapMarkerAlt, party: 'receiver',
      activeBg: 'bg-green-600', color: 'text-green-500', border: 'border-green-200',
      fields: [
        { key: 'consigneeName', label: 'Full Name / Company', required: true, placeholder: 'e.g., Delhi Distributors' },
        { key: 'consigneePhone', label: 'Mobile Number', type: 'tel', required: true, placeholder: 'e.g., 9811122233' },
        { key: 'consigneeEmail', label: 'Email ID', type: 'email', required: true, placeholder: 'e.g., store@company.com' },
        { key: 'consigneeGstin', label: 'GSTIN (optional)', placeholder: 'e.g., 07BBBBB0000B1Z3', upper: true },
        { key: 'consigneeAddress', label: 'Delivery Address', required: true, colSpan: 2, placeholder: 'Street address, locality' },
        { key: 'consigneeCity', label: 'City', type: 'city', required: true, placeholder: 'e.g., Delhi' },
        { key: 'consigneeState', label: 'State', placeholder: 'e.g., Delhi' },
        { key: 'consigneePincode', label: 'Pincode', placeholder: 'e.g., 110001' },
      ],
    },
    {
      id: 3, label: 'Goods', icon: FaBox,
      activeBg: 'bg-orange-500', color: 'text-orange-500', border: 'border-orange-200',
      fields: [
        { key: 'goodsDescription', label: 'Description of Goods', required: true, colSpan: 2, placeholder: 'e.g., FMCG cartons, machinery parts' },
        { key: 'hsnCode', label: 'HSN Code (optional)', placeholder: 'e.g., 8708' },
        { key: 'weight', label: 'Gross Weight (kg)', type: 'number', placeholder: 'e.g., 9000' },
        { key: 'numPackages', label: 'No. of Packages', type: 'number', placeholder: 'e.g., 200' },
        { key: 'packageSize', label: 'Package Size (L×W×H cm)', placeholder: 'e.g., 60×40×40' },
        { key: 'invoiceNumber', label: 'Invoice Number', required: true, placeholder: 'e.g., INV-2026-001' },
        { key: 'invoiceDate', label: 'Invoice Date', type: 'date' },
        { key: 'invoiceValue', label: 'Invoice Value (₹)', type: 'number', required: true, placeholder: 'e.g., 500000' },
        { key: 'ewayBillNo', label: 'E-way Bill No. (if available)', placeholder: 'e.g., 1234 5678 9012' },
        { key: 'specialInstructions', label: 'Special Instructions', type: 'textarea', colSpan: 2, placeholder: 'Loading help, fragile, appointment delivery...' },
      ],
    },
    { id: 4, label: 'Add-ons', icon: FaTag, activeBg: 'bg-teal-600', color: 'text-teal-500', border: 'border-teal-200', fields: [] },
    { id: 5, label: 'Payment', icon: FaCreditCard, activeBg: 'bg-purple-600', color: 'text-purple-500', border: 'border-purple-200', fields: [] },
  ],
  addons: [
    { key: 'loading', label: '📦 Loading / Unloading', price: '₹1,500', desc: 'Labour for loading and unloading at both ends' },
    { key: 'insurance', label: '🛡️ Goods (FOV) Insurance', price: '0.25% of cargo value', desc: 'Full-value protection against transit loss/damage', insurance: true, valueField: { key: 'insuranceValue', placeholder: 'e.g., 500000' } },
    { key: 'express', label: '⚡ Express / Priority', price: '₹3,000', desc: 'Dedicated faster transit, fewer stops' },
    { key: 'co2', label: '🌱 CO₂ Credits', price: 'Earn green credits', desc: 'Offset the road emissions of this trip' },
    { key: 'miles', label: '⭐ Miles Credits', price: 'Earn reward miles', desc: 'Redeem for discounts on future bookings' },
  ],
  documents: [
    { kind: 'verify', label: 'E-way Bill No.', numeric: true, maxLen: 12, placeholder: 'Enter 12-digit E-way bill number',
      verifyingToast: 'Validating on the GST e-way bill portal…', doneToast: 'E-way bill validated on the GST portal',
      hint: 'Mandatory for consignments over ₹50,000. Enter the 12-digit e-way bill number to validate.' },
    { kind: 'file', label: 'Lorry Receipt / Consignment Note', fields: [{ key: 'lrNo', placeholder: 'LR / GR number' }],
      hint: 'Generate the Lorry Receipt (consignment note) for this trip.', doneToast: 'Consignment note generated' },
  ],
  computeCharges: (v, selected, ctx) => {
    const base = Number(selected?.price) || 0;
    const a = ctx.addons || {};
    const rows = [
      { label: 'Road Freight', amount: base, gst: 0.05, freight: true },
      { label: 'Diesel / Fuel Surcharge', amount: Math.round(base * 0.10), gst: 0.05 },
      { label: 'Toll & Permits', amount: Math.round(base * 0.05), gst: 0.18 },
    ];
    if (a.loading) rows.push({ label: 'Loading / Unloading', amount: 1500, gst: 0.18 });
    if (a.express) rows.push({ label: 'Express / Priority', amount: 3000, gst: 0.05 });
    rows.push({ label: 'Platform Fee', amount: 1500, gst: 0.18 });
    const insurance = a.insurance ? Math.round((Number(v.insuranceValue) || 0) * 0.0025) : 0;
    return { rows, insurance };
  },
};
