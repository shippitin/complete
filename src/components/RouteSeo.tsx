// src/components/RouteSeo.tsx
//
// Central per-route SEO. Rendered once inside the Router; on every navigation it
// looks up the current path and updates the document title, meta description,
// Open Graph / Twitter tags and the canonical link (via useSeo). This gives each
// public page unique, keyword-rich metadata for Google (which renders JS) instead
// of every route sharing the homepage's static tags.
import React from 'react';
import { useLocation } from 'react-router-dom';
import { useSeo } from '../hooks/useSeo';

interface Meta { title: string; description: string; }

const DEFAULT: Meta = {
  title: 'Shippitin — Rail Freight Booking & Logistics',
  description: 'Book rail container freight across India and worldwide with Shippitin — instant CONCOR quotes, door-to-door service, documentation, and live shipment tracking.',
};

const META: Record<string, Meta> = {
  '/': DEFAULT,
  '/services': {
    title: 'Logistics Services — Rail, Sea, Air, Road & More',
    description: "Explore Shippitin's freight services — rail container, sea, air, truck, door-to-door, parcel, LCL, customs clearance and cargo insurance across India and worldwide.",
  },
  '/rail-details': {
    title: 'Rail Container Freight Booking — CONCOR',
    description: 'Book CONCOR rail container freight with Shippitin — domestic & international (EXIM) movements, instant tariff-based quotes, door-to-door first/last mile, and live tracking.',
  },
  '/sea-details': {
    title: 'Sea Freight & Ocean Cargo Shipping',
    description: 'Ship FCL and LCL ocean cargo with Shippitin — competitive sea freight rates, port-to-port and door-to-door, with customs and documentation support.',
  },
  '/air-details': {
    title: 'Air Freight & Air Cargo',
    description: 'Fast air freight with Shippitin — express and standard air cargo, instant quotes, customs clearance and end-to-end tracking.',
  },
  '/truck-details': {
    title: 'Road Freight & Truck Transport',
    description: 'Book road freight and FTL/LTL truck transport across India with Shippitin — reliable first/last-mile and long-haul trucking with live tracking.',
  },
  '/door-to-door-details': {
    title: 'Door-to-Door Freight',
    description: 'End-to-end door-to-door freight with Shippitin — pickup, main haul, customs and final delivery handled across rail, sea, air and road.',
  },
  '/parcel-details': {
    title: 'Parcel & Express Shipping',
    description: 'Send parcels and small shipments with Shippitin — fast, trackable parcel delivery across India.',
  },
  '/lcl-details': {
    title: 'LCL — Less than Container Load Shipping',
    description: 'Ship LCL (less-than-container-load) cargo with Shippitin — consolidated freight, cost-effective rates and full tracking.',
  },
  '/customs-details': {
    title: 'Customs Clearance Services',
    description: 'Customs clearance and documentation with Shippitin — CHA-assisted import/export clearance, shipping bills and e-Forwarding Note filing.',
  },
  '/cargo-insurance-details': {
    title: 'Cargo Insurance',
    description: 'Protect your shipments with Shippitin cargo insurance — all-risk cover for rail, sea, air and road freight.',
  },
  '/aboutus': {
    title: 'About Shippitin',
    description: 'Learn about Shippitin — a technology-driven rail-freight logistics platform making CONCOR container shipping simple, transparent and trackable.',
  },
  '/investors': {
    title: 'Investors',
    description: "Shippitin investor information — our mission to digitise India's rail-freight logistics, our traction and the growth opportunity ahead.",
  },
  '/support': {
    title: 'Support & Help',
    description: 'Get help with bookings, documentation, payments and tracking on Shippitin — rail-freight logistics support for shippers across India.',
  },
  '/track': {
    title: 'Track Your Shipment',
    description: 'Track your Shippitin rail, sea, air or road freight shipment live with your booking number.',
  },
  '/careers': {
    title: 'Careers',
    description: "Join Shippitin — help build the platform digitising India's rail-freight logistics.",
  },
  '/media': {
    title: 'Media & Press',
    description: 'Shippitin in the news — press, announcements and media resources.',
  },
  '/blog': {
    title: 'Blog — Rail Freight & Logistics Insights',
    description: 'Insights on rail freight, CONCOR tariffs, container logistics and shipping in India from the Shippitin team.',
  },
  '/offers': {
    title: 'Offers & Deals',
    description: 'Current offers and deals on rail and multimodal freight bookings with Shippitin.',
  },
  '/terms': {
    title: 'Terms & Conditions',
    description: "Shippitin's terms and conditions of service.",
  },
  '/privacy': {
    title: 'Privacy Policy',
    description: "Shippitin's privacy policy — how we collect, use and protect your data.",
  },
  '/cookies': {
    title: 'Cookie Policy',
    description: "Shippitin's cookie policy.",
  },
};

const RouteSeo: React.FC = () => {
  const { pathname } = useLocation();
  const meta = META[pathname] || DEFAULT;
  useSeo({ title: meta.title, description: meta.description, path: pathname });
  return null;
};

export default RouteSeo;
