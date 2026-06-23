// src/booking/air.config.ts — Air freight (line-haul, international by default).
// Documents: International = Shipping Bill (verify, Customs/ICEGATE) + Air Waybill (MAWB/HAWB);
// Domestic = Air Waybill only.
import { FaUser, FaMapMarkerAlt, FaBox, FaTag, FaCreditCard, FaPlane } from 'react-icons/fa';
import type { ModeConfig } from './types';

const INCOTERMS = [
  { value: 'EXW', label: 'EXW — Ex Works' }, { value: 'FCA', label: 'FCA — Free Carrier' },
  { value: 'FOB', label: 'FOB — Free On Board' }, { value: 'CIF', label: 'CIF — Cost Insurance Freight' },
  { value: 'CPT', label: 'CPT — Carriage Paid To' }, { value: 'DAP', label: 'DAP — Delivered at Place' },
  { value: 'DDP', label: 'DDP — Delivered Duty Paid' },
];

export const airConfig: ModeConfig = {
  mode: 'air',
  bookingType: 'Air',
  title: 'Complete Your Air Booking',
  icon: FaPlane,
  idPrefix: 'AIR',
  resultsRoute: '/air-results',
  defaultInternational: true,
  partyALabel: 'Shipper',
  partyBLabel: 'Consignee',
  docPreviewTitle: 'Air Waybill — Draft',
  docPreviewVesselLabel: 'Airline',
  steps: [
    {
      id: 1, label: 'Shipper', icon: FaUser, party: 'sender',
      activeBg: 'bg-brand-gradient', color: 'text-blue-500', border: 'border-blue-200',
      fields: [
        { key: 'shipperName', label: 'Full Name / Company', required: true, placeholder: 'e.g., ABC Exports Pvt Ltd', prefillFromUser: 'full_name' },
        { key: 'shipperPhone', label: 'Mobile Number', type: 'tel', required: true, placeholder: 'e.g., 9876543210', prefillFromUser: 'phone' },
        { key: 'shipperEmail', label: 'Email ID', type: 'email', required: true, placeholder: 'e.g., exports@company.com', prefillFromUser: 'email' },
        { key: 'shipperGstin', label: 'Tax ID / GSTIN / IEC', placeholder: 'e.g., 33AAAAA0000A1Z5', upper: true, prefillFromUser: 'gstin' },
        { key: 'shipperAddress', label: 'Address', required: true, colSpan: 2, placeholder: 'Street address, locality' },
        { key: 'shipperCity', label: 'City', type: 'city', required: true, placeholder: 'e.g., Chennai' },
        { key: 'shipperState', label: 'State', placeholder: 'e.g., Tamil Nadu' },
        { key: 'shipperCountry', label: 'Country', placeholder: 'e.g., India' },
      ],
    },
    {
      id: 2, label: 'Consignee', icon: FaMapMarkerAlt, party: 'receiver',
      activeBg: 'bg-green-600', color: 'text-green-500', border: 'border-green-200',
      fields: [
        { key: 'consigneeName', label: 'Full Name / Company', required: true, placeholder: 'e.g., XYZ Imports Ltd' },
        { key: 'consigneePhone', label: 'Mobile Number', type: 'tel', required: true, placeholder: 'e.g., +1 213 555 0100' },
        { key: 'consigneeEmail', label: 'Email ID', type: 'email', required: true, placeholder: 'e.g., imports@company.com' },
        { key: 'consigneeTaxId', label: 'Tax ID / EIN (optional)', placeholder: 'e.g., 98-7654321' },
        { key: 'consigneeAddress', label: 'Address', required: true, colSpan: 2, placeholder: 'Street address, locality' },
        { key: 'consigneeCity', label: 'City', type: 'city', required: true, placeholder: 'e.g., Los Angeles' },
        { key: 'consigneeState', label: 'State / Province', placeholder: 'e.g., California' },
        { key: 'consigneeCountry', label: 'Country', placeholder: 'e.g., United States' },
      ],
    },
    {
      id: 3, label: 'Cargo', icon: FaBox,
      activeBg: 'bg-orange-500', color: 'text-orange-500', border: 'border-orange-200',
      fields: [
        { key: 'goodsDescription', label: 'Description of Goods', required: true, colSpan: 2, placeholder: 'e.g., Electronic components, garments' },
        { key: 'hsCode', label: 'HS Code (optional)', placeholder: 'Search HS code or keyword, e.g., 8542' },
        { key: 'incoterms', label: 'Incoterms', type: 'select', placeholder: 'Select Incoterms', options: INCOTERMS, when: (_v, ctx) => !ctx.isDomestic },
        { key: 'grossWeight', label: 'Gross Weight (kg)', type: 'number', placeholder: 'e.g., 480' },
        { key: 'chargeableWeight', label: 'Chargeable / Volumetric Weight (kg)', type: 'number', placeholder: 'e.g., 600' },
        { key: 'numPackages', label: 'No. of Packages', type: 'number', placeholder: 'e.g., 12' },
        { key: 'packageSize', label: 'Package Size (L×W×H cm)', placeholder: 'e.g., 120×80×100' },
        { key: 'invoiceNumber', label: 'Invoice Number', required: true, placeholder: 'e.g., INV-2026-001' },
        { key: 'invoiceDate', label: 'Invoice Date', type: 'date' },
        { key: 'invoiceValue', label: 'Commercial Value (₹)', type: 'number', required: true, placeholder: 'e.g., 830000' },
        { key: 'hawbNo', label: 'House Air Waybill No. (optional)', upper: true, placeholder: 'e.g., HAWB-00012345' },
        { key: 'dgUN', label: 'UN Number (DG)', placeholder: 'e.g., UN3480', when: (_v, ctx) => !!ctx.formData?.hazardousCargo },
        { key: 'dgClass', label: 'Hazard Class (IATA DGR)', placeholder: 'e.g., Class 9', when: (_v, ctx) => !!ctx.formData?.hazardousCargo },
        { key: 'specialInstructions', label: 'Special Handling Instructions', type: 'textarea', colSpan: 2, placeholder: 'Temperature, fragile, DG handling...' },
      ],
    },
    { id: 4, label: 'Add-ons', icon: FaTag, activeBg: 'bg-teal-600', color: 'text-teal-500', border: 'border-teal-200', fields: [] },
    { id: 5, label: 'Payment', icon: FaCreditCard, activeBg: 'bg-purple-600', color: 'text-purple-500', border: 'border-purple-200', fields: [] },
  ],
  addons: [
    { key: 'firstMile', label: 'First Mile Pickup', price: '₹4,500', desc: 'Door pickup to origin airport', addrField: { key: 'firstMileAddr', placeholder: 'Factory/warehouse address' }, defaultOn: (ctx) => /^Door/.test(ctx.formData?.activityType || '') },
    { key: 'lastMile', label: 'Last Mile Delivery', price: '₹5,000', desc: 'Destination airport to consignee door', addrField: { key: 'lastMileAddr', placeholder: 'Delivery address' }, defaultOn: (ctx) => /Door$/.test(ctx.formData?.activityType || '') },
    { key: 'customs', label: '🛃 Customs Clearance', price: '₹2,000 / shipment', desc: 'CHA-assisted customs documentation', when: (ctx) => !ctx.isDomestic },
    { key: 'insurance', label: '🛡️ Cargo Insurance', price: '0.25% of cargo value', desc: 'All-risk air cargo insurance', insurance: true, valueField: { key: 'insuranceValue', placeholder: 'e.g., 830000' } },
    { key: 'co2', label: '🌱 CO₂ Credits', price: 'Earn green credits', desc: 'Offset the flight emissions of your shipment' },
    { key: 'miles', label: '⭐ Miles Credits', price: 'Earn reward miles', desc: 'Redeem for discounts on future bookings' },
  ],
  documents: [
    { kind: 'verify', label: 'Shipping Bill No.', numeric: true, maxLen: 7, placeholder: 'Enter 7-digit Shipping Bill number',
      verifyingToast: 'Verifying with Customs / ICEGATE…', doneToast: 'Shipping Bill verified with Customs / ICEGATE',
      hint: 'Enter your 7-digit Shipping Bill number to verify with Customs / ICEGATE.', when: (ctx) => !ctx.isDomestic },
    { kind: 'file', label: 'Air Waybill (MAWB / HAWB)', fields: [{ key: 'awbNo', placeholder: 'Air Waybill number' }],
      hint: 'Enter the Air Waybill number issued by the airline / forwarder.', doneToast: 'Air Waybill issued' },
  ],
  computeCharges: (v, selected, ctx) => {
    const base = Number(selected?.price) || 0;
    const a = ctx.addons || {};
    const rows = [
      { label: 'Air Freight', amount: base, gst: 0.05, freight: true },
      { label: 'Fuel Surcharge (FSC)', amount: Math.round(base * 0.12), gst: 0.05 },
      { label: 'Security Surcharge (SSC)', amount: Math.round(base * 0.04), gst: 0.18 },
      { label: 'AWB / Handling Fee', amount: 850, gst: 0.18 },
    ];
    if (a.firstMile) rows.push({ label: 'First Mile Pickup', amount: 4500, gst: 0.05 });
    if (a.lastMile) rows.push({ label: 'Last Mile Delivery', amount: 5000, gst: 0.05 });
    if (!ctx.isDomestic && a.customs) rows.push({ label: 'Customs Clearance', amount: 2000, gst: 0.18 });
    rows.push({ label: 'Platform Fee', amount: 1500, gst: 0.18 });
    const insurance = a.insurance ? Math.round((Number(v.insuranceValue) || 0) * 0.0025) : 0;
    return { rows, insurance };
  },
};
