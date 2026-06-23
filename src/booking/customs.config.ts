// src/booking/customs.config.ts — Customs clearance (CHA service).
// Documents: IEC (verify with DGFT) + Bill of Entry (import) / Shipping Bill (export) on ICEGATE.
import { FaBuilding, FaBox, FaTag, FaCreditCard, FaFileInvoiceDollar } from 'react-icons/fa';
import type { ModeConfig } from './types';

const INCOTERMS = [
  { value: 'FOB', label: 'FOB — Free On Board' }, { value: 'CIF', label: 'CIF — Cost Insurance Freight' },
  { value: 'CFR', label: 'CFR — Cost and Freight' }, { value: 'EXW', label: 'EXW — Ex Works' },
  { value: 'DAP', label: 'DAP — Delivered at Place' }, { value: 'DDP', label: 'DDP — Delivered Duty Paid' },
];

export const customsConfig: ModeConfig = {
  mode: 'customs',
  bookingType: 'Customs',
  title: 'Complete Your Customs Clearance',
  icon: FaFileInvoiceDollar,
  idPrefix: 'CUS',
  resultsRoute: '/customs-results',
  defaultInternational: true,
  partyALabel: 'Client',
  partyBLabel: 'Client',
  steps: [
    {
      id: 1, label: 'Client (IEC)', icon: FaBuilding, party: 'sender',
      activeBg: 'bg-brand-gradient', color: 'text-blue-500', border: 'border-blue-200',
      fields: [
        { key: 'clientCompany', label: 'Company Name', required: true, placeholder: 'e.g., ABC Imports Pvt Ltd', prefillFromUser: 'company_name' },
        { key: 'clientIec', label: 'IEC Code', required: true, placeholder: '10-digit Importer-Exporter Code', upper: true },
        { key: 'clientGstin', label: 'GSTIN', required: true, placeholder: 'e.g., 33AAAAA0000A1Z5', upper: true, prefillFromUser: 'gstin' },
        { key: 'clientContactName', label: 'Contact Person', required: true, placeholder: 'e.g., Ravi Kumar', prefillFromUser: 'full_name' },
        { key: 'clientEmail', label: 'Email ID', type: 'email', required: true, placeholder: 'e.g., trade@company.com', prefillFromUser: 'email' },
        { key: 'clientPhone', label: 'Mobile Number', type: 'tel', required: true, placeholder: 'e.g., 9876543210', prefillFromUser: 'phone' },
        { key: 'clientAddress', label: 'Registered Address', colSpan: 2, placeholder: 'Street address, locality' },
      ],
    },
    {
      id: 2, label: 'Shipment & Goods', icon: FaBox,
      activeBg: 'bg-orange-500', color: 'text-orange-500', border: 'border-orange-200',
      fields: [
        { key: 'serviceType', label: 'Clearance Type', type: 'select', required: true, options: [{ value: 'import', label: 'Import (Bill of Entry)' }, { value: 'export', label: 'Export (Shipping Bill)' }, { value: 'transit', label: 'Transit / Transhipment' }] },
        { key: 'goodsDescription', label: 'Description of Goods', required: true, colSpan: 2, placeholder: 'e.g., Industrial pumps and spares' },
        { key: 'hsCode', label: 'HS Code', required: true, placeholder: 'e.g., 8413' },
        { key: 'cargoValue', label: 'Assessable Value (₹)', type: 'number', required: true, placeholder: 'e.g., 2500000' },
        { key: 'countryOfOrigin', label: 'Country of Origin', placeholder: 'e.g., Germany' },
        { key: 'portICD', label: 'Port / ICD', placeholder: 'e.g., INNSA / Nhava Sheva' },
        { key: 'incoterms', label: 'Incoterms', type: 'select', placeholder: 'Select Incoterms', options: INCOTERMS },
        { key: 'blAwbNo', label: 'B/L or AWB No.', upper: true, placeholder: 'e.g., MAEU123456789' },
        { key: 'remarks', label: 'Remarks / Special Requirements', type: 'textarea', colSpan: 2, placeholder: 'Licences, exemptions, PGA clearances...' },
      ],
    },
    { id: 3, label: 'Add-ons', icon: FaTag, activeBg: 'bg-teal-600', color: 'text-teal-500', border: 'border-teal-200', fields: [] },
    { id: 4, label: 'Payment', icon: FaCreditCard, activeBg: 'bg-purple-600', color: 'text-purple-500', border: 'border-purple-200', fields: [] },
  ],
  addons: [
    { key: 'examination', label: '🔍 Examination & Assessment Support', price: '₹2,500', desc: 'CHA representative for customs examination' },
    { key: 'duty', label: '💳 Duty Payment Handling', price: '₹1,500', desc: 'We pay duty on your behalf and reconcile' },
    { key: 'adcode', label: '🏦 AD Code / Bank Registration', price: '₹1,500', desc: 'One-time AD code registration at the port' },
    { key: 'miles', label: '⭐ Miles Credits', price: 'Earn reward miles', desc: 'Redeem for discounts on future bookings' },
  ],
  documents: [
    { kind: 'verify', label: 'IEC Code', maxLen: 10, placeholder: 'Enter 10-character IEC',
      verifyingToast: 'Verifying IEC with DGFT…', doneToast: 'IEC verified with DGFT',
      hint: 'Enter the Importer-Exporter Code to verify with DGFT.' },
    { kind: 'file', label: 'Bill of Entry / Shipping Bill No.', fields: [{ key: 'boeNo', placeholder: 'BoE (import) / Shipping Bill (export) number' }],
      hint: 'File the Bill of Entry (import) or Shipping Bill (export) on ICEGATE.', doneToast: 'Filed on ICEGATE' },
  ],
  computeCharges: (_v, selected, ctx) => {
    const base = Number(selected?.price) || 0;
    const a = ctx.addons || {};
    const rows = [{ label: 'Customs Brokerage (CHA)', amount: base, gst: 0.18, freight: true }];
    if (a.examination) rows.push({ label: 'Examination & Assessment', amount: 2500, gst: 0.18 });
    if (a.duty) rows.push({ label: 'Duty Payment Handling', amount: 1500, gst: 0.18 });
    if (a.adcode) rows.push({ label: 'AD Code Registration', amount: 1500, gst: 0.18 });
    rows.push({ label: 'Platform Fee', amount: 1000, gst: 0.18 });
    return { rows };
  },
};
