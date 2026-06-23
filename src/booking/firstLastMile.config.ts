// src/booking/firstLastMile.config.ts — First / Last mile road leg (domestic).
// Document: E-way bill / trip sheet (light — single file step). POD is captured on delivery.
import { FaMapMarkerAlt, FaFlagCheckered, FaBox, FaTag, FaCreditCard, FaTruck } from 'react-icons/fa';
import type { ModeConfig } from './types';

const VEHICLES = ['Van', 'Pickup Truck', 'Small Truck (Tata Ace)', 'Medium Truck (Eicher)', 'Large Truck (Ashok Leyland)'];

export const firstLastMileConfig: ModeConfig = {
  mode: 'firstlastmile',
  bookingType: 'First/Last Mile',
  title: 'Complete Your First / Last Mile Booking',
  icon: FaTruck,
  idPrefix: 'FLM',
  resultsRoute: '/first-last-mile-results',
  defaultInternational: false,
  partyALabel: 'Pickup',
  partyBLabel: 'Delivery',
  steps: [
    {
      id: 1, label: 'Pickup', icon: FaMapMarkerAlt, party: 'sender',
      activeBg: 'bg-brand-gradient', color: 'text-blue-500', border: 'border-blue-200',
      fields: [
        { key: 'pickupName', label: 'Pickup Contact', required: true, placeholder: 'e.g., Warehouse manager', prefillFromUser: 'full_name' },
        { key: 'pickupPhone', label: 'Mobile Number', type: 'tel', required: true, placeholder: 'e.g., 9876543210', prefillFromUser: 'phone' },
        { key: 'pickupEmail', label: 'Email ID', type: 'email', placeholder: 'e.g., ops@company.com', prefillFromUser: 'email' },
        { key: 'pickupAddress', label: 'Pickup Address', required: true, colSpan: 2, placeholder: 'Street address, locality' },
        { key: 'pickupCity', label: 'City', type: 'city', required: true, placeholder: 'e.g., Bengaluru' },
        { key: 'pickupPincode', label: 'Pincode', placeholder: 'e.g., 560001' },
      ],
    },
    {
      id: 2, label: 'Delivery', icon: FaFlagCheckered, party: 'receiver',
      activeBg: 'bg-green-600', color: 'text-green-500', border: 'border-green-200',
      fields: [
        { key: 'deliveryName', label: 'Delivery Contact', required: true, placeholder: 'e.g., Site supervisor' },
        { key: 'deliveryPhone', label: 'Mobile Number', type: 'tel', required: true, placeholder: 'e.g., 9811122233' },
        { key: 'deliveryEmail', label: 'Email ID', type: 'email', placeholder: 'e.g., site@company.com' },
        { key: 'deliveryAddress', label: 'Delivery Address', required: true, colSpan: 2, placeholder: 'Street address, locality' },
        { key: 'deliveryCity', label: 'City', type: 'city', required: true, placeholder: 'e.g., Hosur' },
        { key: 'deliveryPincode', label: 'Pincode', placeholder: 'e.g., 635109' },
      ],
    },
    {
      id: 3, label: 'Goods', icon: FaBox,
      activeBg: 'bg-orange-500', color: 'text-orange-500', border: 'border-orange-200',
      fields: [
        { key: 'goodsDescription', label: 'Description of Goods', required: true, colSpan: 2, placeholder: 'e.g., Pallets of finished goods' },
        { key: 'vehicleType', label: 'Vehicle Type', type: 'select', placeholder: 'Select vehicle', options: VEHICLES },
        { key: 'weight', label: 'Gross Weight (kg)', type: 'number', placeholder: 'e.g., 1200' },
        { key: 'numPackages', label: 'No. of Packages', type: 'number', placeholder: 'e.g., 8' },
        { key: 'invoiceValue', label: 'Goods Value (₹)', type: 'number', placeholder: 'e.g., 250000' },
        { key: 'ewayBillNo', label: 'E-way Bill No. (if applicable)', placeholder: 'e.g., 1234 5678 9012' },
        { key: 'specialInstructions', label: 'Special Instructions', type: 'textarea', colSpan: 2, placeholder: 'Loading help, time window, access notes...' },
      ],
    },
    { id: 4, label: 'Add-ons', icon: FaTag, activeBg: 'bg-teal-600', color: 'text-teal-500', border: 'border-teal-200', fields: [] },
    { id: 5, label: 'Payment', icon: FaCreditCard, activeBg: 'bg-purple-600', color: 'text-purple-500', border: 'border-purple-200', fields: [] },
  ],
  addons: [
    { key: 'loading', label: '📦 Loading / Unloading', price: '₹1,000', desc: 'Labour for loading and unloading' },
    { key: 'waiting', label: '⏱️ Waiting / Detention Cover', price: '₹800', desc: 'Free waiting beyond standard, then capped' },
    { key: 'insurance', label: '🛡️ Goods Insurance', price: '0.25% of goods value', desc: 'Cover against loss/damage on the leg', insurance: true, valueField: { key: 'insuranceValue', placeholder: 'e.g., 250000' } },
    { key: 'express', label: '⚡ Priority Slot', price: '₹500', desc: 'Earliest available pickup window' },
    { key: 'miles', label: '⭐ Miles Credits', price: 'Earn reward miles', desc: 'Redeem for discounts on future bookings' },
  ],
  documents: [
    { kind: 'file', label: 'E-way Bill / Trip Sheet No.', fields: [{ key: 'ewayTripNo', placeholder: 'E-way bill or trip sheet number' }],
      hint: 'Record the e-way bill (if applicable) and generate the trip sheet. Proof of delivery is captured on completion.', doneToast: 'Trip sheet generated' },
  ],
  computeCharges: (v, selected, ctx) => {
    const base = Number(selected?.price) || 0;
    const a = ctx.addons || {};
    const rows = [
      { label: 'Mile Charge', amount: base, gst: 0.05, freight: true },
      { label: 'Fuel Surcharge', amount: Math.round(base * 0.10), gst: 0.05 },
    ];
    if (a.loading) rows.push({ label: 'Loading / Unloading', amount: 1000, gst: 0.18 });
    if (a.waiting) rows.push({ label: 'Waiting / Detention Cover', amount: 800, gst: 0.18 });
    if (a.express) rows.push({ label: 'Priority Slot', amount: 500, gst: 0.05 });
    rows.push({ label: 'Platform Fee', amount: 500, gst: 0.18 });
    const insurance = a.insurance ? Math.round((Number(v.insuranceValue) || 0) * 0.0025) : 0;
    return { rows, insurance };
  },
};
