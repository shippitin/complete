// src/booking/doorToDoor.config.ts — End-to-end door-to-door (first mile + main leg + last mile).
// Documents: International = Shipping Bill (verify) + main-leg transport document (B/L / AWB / LR);
// Domestic = transport document only.
import { FaUser, FaMapMarkerAlt, FaBox, FaTag, FaCreditCard, FaDoorOpen } from 'react-icons/fa';
import type { ModeConfig } from './types';

const INCOTERMS = [
  { value: 'EXW', label: 'EXW — Ex Works' }, { value: 'FOB', label: 'FOB — Free On Board' },
  { value: 'CIF', label: 'CIF — Cost Insurance Freight' }, { value: 'DAP', label: 'DAP — Delivered at Place' },
  { value: 'DDP', label: 'DDP — Delivered Duty Paid' },
];

export const doorToDoorConfig: ModeConfig = {
  mode: 'doortodoor',
  bookingType: 'Door to Door',
  title: 'Complete Your Door-to-Door Booking',
  icon: FaDoorOpen,
  idPrefix: 'D2D',
  resultsRoute: '/door-to-door-results',
  defaultInternational: false,
  partyALabel: 'Shipper',
  partyBLabel: 'Consignee',
  docPreviewTitle: 'Shipping Document — Draft',
  docPreviewVesselLabel: 'Carrier',
  steps: [
    {
      id: 1, label: 'Shipper', icon: FaUser, party: 'sender',
      activeBg: 'bg-brand-gradient', color: 'text-blue-500', border: 'border-blue-200',
      fields: [
        { key: 'shipperName', label: 'Full Name / Company', required: true, placeholder: 'e.g., ABC Traders', prefillFromUser: 'full_name' },
        { key: 'shipperPhone', label: 'Mobile Number', type: 'tel', required: true, placeholder: 'e.g., 9876543210', prefillFromUser: 'phone' },
        { key: 'shipperEmail', label: 'Email ID', type: 'email', required: true, placeholder: 'e.g., ops@company.com', prefillFromUser: 'email' },
        { key: 'shipperGstin', label: 'GSTIN / Tax ID', placeholder: 'e.g., 33AAAAA0000A1Z5', upper: true, prefillFromUser: 'gstin' },
        { key: 'shipperAddress', label: 'Pickup Address', required: true, colSpan: 2, placeholder: 'Full door pickup address' },
        { key: 'shipperCity', label: 'City', type: 'city', required: true, placeholder: 'e.g., Surat' },
        { key: 'shipperState', label: 'State', placeholder: 'e.g., Gujarat' },
        { key: 'shipperCountry', label: 'Country', placeholder: 'e.g., India' },
      ],
    },
    {
      id: 2, label: 'Consignee', icon: FaMapMarkerAlt, party: 'receiver',
      activeBg: 'bg-green-600', color: 'text-green-500', border: 'border-green-200',
      fields: [
        { key: 'consigneeName', label: 'Full Name / Company', required: true, placeholder: 'e.g., Global Buyers Inc' },
        { key: 'consigneePhone', label: 'Mobile Number', type: 'tel', required: true, placeholder: 'e.g., +1 213 555 0100' },
        { key: 'consigneeEmail', label: 'Email ID', type: 'email', required: true, placeholder: 'e.g., buy@company.com' },
        { key: 'consigneeTaxId', label: 'Tax ID (optional)', placeholder: 'e.g., EIN / VAT' },
        { key: 'consigneeAddress', label: 'Delivery Address', required: true, colSpan: 2, placeholder: 'Full door delivery address' },
        { key: 'consigneeCity', label: 'City', type: 'city', required: true, placeholder: 'e.g., New York' },
        { key: 'consigneeState', label: 'State / Province', placeholder: 'e.g., NY' },
        { key: 'consigneeCountry', label: 'Country', placeholder: 'e.g., United States' },
      ],
    },
    {
      id: 3, label: 'Cargo', icon: FaBox,
      activeBg: 'bg-orange-500', color: 'text-orange-500', border: 'border-orange-200',
      fields: [
        { key: 'goodsDescription', label: 'Description of Goods', required: true, colSpan: 2, placeholder: 'e.g., Textile rolls' },
        { key: 'hsCode', label: 'HS Code (optional)', placeholder: 'e.g., 5208' },
        { key: 'incoterms', label: 'Incoterms', type: 'select', placeholder: 'Select Incoterms', options: INCOTERMS, when: (_v, ctx) => !ctx.isDomestic },
        { key: 'weight', label: 'Gross Weight (kg)', type: 'number', placeholder: 'e.g., 3000' },
        { key: 'dimensions', label: 'Dimensions (L×W×H cm)', placeholder: 'e.g., 200×120×150' },
        { key: 'numPackages', label: 'No. of Packages', type: 'number', placeholder: 'e.g., 40' },
        { key: 'invoiceNumber', label: 'Invoice Number', required: true, placeholder: 'e.g., INV-2026-001' },
        { key: 'invoiceValue', label: 'Commercial Value (₹)', type: 'number', required: true, placeholder: 'e.g., 750000' },
        { key: 'specialInstructions', label: 'Special Instructions', type: 'textarea', colSpan: 2, placeholder: 'Pickup window, fragile, customs notes...' },
      ],
    },
    { id: 4, label: 'Add-ons', icon: FaTag, activeBg: 'bg-teal-600', color: 'text-teal-500', border: 'border-teal-200', fields: [] },
    { id: 5, label: 'Payment', icon: FaCreditCard, activeBg: 'bg-purple-600', color: 'text-purple-500', border: 'border-purple-200', fields: [] },
  ],
  addons: [
    { key: 'firstMile', label: 'First Mile Pickup', price: 'Included', desc: 'Door pickup from origin', addrField: { key: 'firstMileAddr', placeholder: 'Pickup address (if different)' }, defaultOn: () => true },
    { key: 'lastMile', label: 'Last Mile Delivery', price: 'Included', desc: 'Delivery to consignee door', addrField: { key: 'lastMileAddr', placeholder: 'Delivery address (if different)' }, defaultOn: () => true },
    { key: 'customs', label: '🛃 Customs Clearance', price: '₹2,000 / shipment', desc: 'Origin + destination customs handling', when: (ctx) => !ctx.isDomestic, defaultOn: (ctx) => !ctx.isDomestic },
    { key: 'insurance', label: '🛡️ Cargo Insurance', price: '0.25% of cargo value', desc: 'All-risk door-to-door insurance', insurance: true, valueField: { key: 'insuranceValue', placeholder: 'e.g., 750000' } },
    { key: 'co2', label: '🌱 CO₂ Credits', price: 'Earn green credits', desc: 'Offset this shipment’s emissions' },
    { key: 'miles', label: '⭐ Miles Credits', price: 'Earn reward miles', desc: 'Redeem for discounts on future bookings' },
  ],
  documents: [
    { kind: 'verify', label: 'Shipping Bill No.', numeric: true, maxLen: 7, placeholder: 'Enter 7-digit Shipping Bill number',
      verifyingToast: 'Verifying with Customs / ICEGATE…', doneToast: 'Shipping Bill verified with Customs / ICEGATE',
      hint: 'Enter your 7-digit Shipping Bill number to verify with Customs / ICEGATE.', when: (ctx) => !ctx.isDomestic },
    { kind: 'file', label: 'Transport Document (B/L / AWB / LR)', fields: [{ key: 'mainDocNo', placeholder: 'Main-leg transport document number' }],
      hint: 'Link the main-leg transport document for the shipment.', doneToast: 'Transport document linked' },
  ],
  computeCharges: (v, selected, ctx) => {
    const base = Number(selected?.price) || 0;
    const a = ctx.addons || {};
    const rows = [{ label: 'Door-to-Door Freight', amount: base, gst: 0.05, freight: true }];
    if (!ctx.isDomestic && a.customs) rows.push({ label: 'Customs Clearance', amount: 2000, gst: 0.18 });
    rows.push({ label: 'Platform Fee', amount: 1500, gst: 0.18 });
    const insurance = a.insurance ? Math.round((Number(v.insuranceValue) || 0) * 0.0025) : 0;
    return { rows, insurance };
  },
};
