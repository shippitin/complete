// src/booking/port.config.ts — Port / marine services (vessel-based).
// Document: IGM / berth allocation. Charges come from the selected offer's charge breakdown.
import { FaShip, FaCogs, FaTag, FaCreditCard, FaAnchor } from 'react-icons/fa';
import type { ModeConfig } from './types';

export const portConfig: ModeConfig = {
  mode: 'port',
  bookingType: 'Port Services',
  title: 'Complete Your Port Services Booking',
  icon: FaAnchor,
  idPrefix: 'PRT',
  resultsRoute: '/port-results',
  stateKey: 'selectedOffer',
  defaultInternational: false,
  partyALabel: 'Vessel / Agent',
  partyBLabel: 'Agent',
  steps: [
    {
      id: 1, label: 'Vessel & Agent', icon: FaShip, party: 'sender',
      activeBg: 'bg-brand-gradient', color: 'text-blue-500', border: 'border-blue-200',
      fields: [
        { key: 'vesselName', label: 'Vessel Name', required: true, placeholder: 'e.g., MV Pacific Star' },
        { key: 'imoNumber', label: 'IMO Number', placeholder: 'e.g., 9785622' },
        { key: 'agentCompany', label: 'Agent / Company', required: true, placeholder: 'e.g., Oceanic Shipping Agency', prefillFromUser: 'company_name' },
        { key: 'agentContact', label: 'Contact Person', required: true, placeholder: 'e.g., Capt. Mehta', prefillFromUser: 'full_name' },
        { key: 'agentEmail', label: 'Email ID', type: 'email', required: true, placeholder: 'e.g., agency@company.com', prefillFromUser: 'email' },
        { key: 'agentPhone', label: 'Mobile Number', type: 'tel', required: true, placeholder: 'e.g., 9876543210', prefillFromUser: 'phone' },
        { key: 'portLocation', label: 'Port', required: true, placeholder: 'e.g., JNPT / Nhava Sheva' },
      ],
    },
    {
      id: 2, label: 'Service', icon: FaCogs,
      activeBg: 'bg-orange-500', color: 'text-orange-500', border: 'border-orange-200',
      fields: [
        { key: 'serviceCategory', label: 'Service Category', type: 'select', required: true, placeholder: 'Select category', options: [
          { value: 'pilotage', label: 'Pilotage & Towage' }, { value: 'berthing', label: 'Berthing & Mooring' },
          { value: 'bunkering', label: 'Bunkering' }, { value: 'technical', label: 'Technical / Repairs' },
          { value: 'logistics', label: 'Cargo Handling / Logistics' },
        ] },
        { key: 'specificService', label: 'Specific Service', colSpan: 2, placeholder: 'e.g., Pilot + 2 tugs for berthing at Berth 4' },
        { key: 'serviceDate', label: 'Service Date', type: 'date', required: true },
        { key: 'eta', label: 'Vessel ETA', type: 'date' },
        { key: 'berthPreference', label: 'Berth Preference', placeholder: 'e.g., Berth 4 / Liquid jetty' },
        { key: 'remarks', label: 'Remarks', type: 'textarea', colSpan: 2, placeholder: 'Draft, LOA, special equipment, hazardous cargo on board...' },
      ],
    },
    { id: 3, label: 'Add-ons', icon: FaTag, activeBg: 'bg-teal-600', color: 'text-teal-500', border: 'border-teal-200', fields: [] },
    { id: 4, label: 'Payment', icon: FaCreditCard, activeBg: 'bg-purple-600', color: 'text-purple-500', border: 'border-purple-200', fields: [] },
  ],
  addons: [
    { key: 'bunkering', label: '⛽ Bunkering Coordination', price: '₹25,000', desc: 'Fuel supply coordination alongside' },
    { key: 'waste', label: '♻️ Waste Reception (MARPOL)', price: '₹8,000', desc: 'Garbage / sludge reception services' },
    { key: 'security', label: '🛡️ ISPS Security', price: '₹12,000', desc: 'Port facility security compliance' },
    { key: 'miles', label: '⭐ Miles Credits', price: 'Earn reward miles', desc: 'Redeem for discounts on future bookings' },
  ],
  documents: [
    { kind: 'file', label: 'IGM / Berth Allocation No.', fields: [{ key: 'igmNo', placeholder: 'IGM / berth allocation number' }],
      hint: 'Record the IGM / berth allocation confirmation for the call.', doneToast: 'Berth allocation confirmed' },
  ],
  computeCharges: (_v, selected, ctx) => {
    const c = selected?.charges || {};
    const a = ctx.addons || {};
    const rows: Array<{ label: string; amount: number; gst?: number }> = [];
    const add = (label: string, amount: any) => { const n = Number(amount) || 0; if (n > 0) rows.push({ label, amount: n, gst: 0.18 }); };
    add('Port Dues', c.portDues);
    add('Pilotage', c.pilotage);
    add('Tug Charges', c.tugCharges);
    add('Berthing Charges', c.berthingCharges);
    add('Storage Charges', c.storageCharges);
    add('Misc. Charges', c.miscCharges);
    if (rows.length === 0) rows.push({ label: 'Port Services', amount: Number(selected?.totalAmount || selected?.price) || 0, gst: 0.18 });
    if (a.bunkering) rows.push({ label: 'Bunkering Coordination', amount: 25000, gst: 0.18 });
    if (a.waste) rows.push({ label: 'Waste Reception', amount: 8000, gst: 0.18 });
    if (a.security) rows.push({ label: 'ISPS Security', amount: 12000, gst: 0.18 });
    rows.push({ label: 'Platform Fee', amount: 2000, gst: 0.18 });
    return { rows };
  },
};
