// src/components/dashboards/personaDashboards.ts
//
// Per-persona dashboard configs (mock data — wire to real role APIs later).
// One distinct screen per signup persona; CONCOR varies by its sub-role.
//
import type { DashboardConfig } from './PersonaDashboard';

const DEMO_NOTE = 'Demo data — connects to live operations data once the role APIs are available.';

export const PERSONA_DASHBOARDS: Record<string, DashboardConfig> = {
  importer_exporter: {
    title: 'My Shipments',
    subtitle: 'Quote, book and track your cargo across rail, sea and road.',
    actions: [{ label: 'Get a quote', to: '/services' }, { label: 'Track shipment', to: '/track' }],
    stats: [
      { label: 'In transit', value: '3' },
      { label: 'Delivered', value: '12' },
      { label: 'Awaiting payment', value: '1' },
      { label: 'Saved quotes', value: '5' },
    ],
    tableTitle: 'Active shipments',
    columns: [
      { key: 'booking', label: 'Booking' },
      { key: 'route', label: 'Route' },
      { key: 'mode', label: 'Mode' },
      { key: 'eta', label: 'ETA' },
      { key: 'status', label: 'Status' },
    ],
    statusKey: 'status',
    rows: [
      { booking: 'SHP-IR-100482', route: 'ICD Tughlakabad → JNPT', mode: 'Rail', eta: '18 Jun', status: 'In Transit' },
      { booking: 'SHP-SE-100455', route: 'Mundra → Jebel Ali', mode: 'Sea', eta: '24 Jun', status: 'At Port' },
      { booking: 'SHP-IR-100460', route: 'ICD Whitefield → Chennai', mode: 'Rail', eta: '19 Jun', status: 'Customs' },
      { booking: 'SHP-IR-100398', route: 'Dadri → Mundra', mode: 'Rail', eta: '12 Jun', status: 'Delivered' },
    ],
    note: DEMO_NOTE,
  },

  freight_forwarder: {
    title: 'Forwarding Desk',
    subtitle: 'Manage client consignments end to end.',
    actions: [{ label: 'New quote', to: '/services' }, { label: 'Track', to: '/track' }],
    stats: [
      { label: 'Open consignments', value: '7' },
      { label: 'Clients', value: '18' },
      { label: 'Quotes to send', value: '4' },
      { label: 'Margin (MTD)', value: '₹3.2L' },
    ],
    tableTitle: 'Client consignments',
    columns: [
      { key: 'ref', label: 'Ref' },
      { key: 'client', label: 'Client' },
      { key: 'lane', label: 'Lane' },
      { key: 'mode', label: 'Mode' },
      { key: 'status', label: 'Status' },
    ],
    statusKey: 'status',
    rows: [
      { ref: 'FF-2207', client: 'Aarav Exports', lane: 'Delhi → Hamburg', mode: 'Rail+Sea', status: 'Booking' },
      { ref: 'FF-2206', client: 'Sunrise Agro', lane: 'Dadri → Mundra', mode: 'Rail', status: 'In Transit' },
      { ref: 'FF-2204', client: 'TechNova', lane: 'Mundra → TKD', mode: 'Rail', status: 'Customs' },
      { ref: 'FF-2201', client: 'Global Pharma', lane: 'Sanand → JNPT', mode: 'Rail', status: 'Quote Pending' },
    ],
    note: DEMO_NOTE,
  },

  cto: {
    title: 'Train Operations',
    subtitle: 'Rakes, schedules and indents for your container trains.',
    stats: [
      { label: 'Rakes in service', value: '9' },
      { label: 'Routes', value: '14' },
      { label: 'Indents today', value: '22' },
      { label: 'Utilisation', value: '86%' },
    ],
    tableTitle: 'Train schedule',
    columns: [
      { key: 'train', label: 'Train' },
      { key: 'route', label: 'Route' },
      { key: 'departure', label: 'Departure' },
      { key: 'rake', label: 'Rake' },
      { key: 'status', label: 'Status' },
    ],
    statusKey: 'status',
    rows: [
      { train: 'CT-2041', route: 'TKD → JNPT', departure: 'Today 14:30', rake: 'BLCA-12', status: 'Loading' },
      { train: 'CT-2038', route: 'Dadri → Mundra', departure: 'Today 19:00', rake: 'BLCA-07', status: 'Scheduled' },
      { train: 'CT-2035', route: 'Whitefield → Chennai', departure: 'In transit', rake: 'BLCA-03', status: 'En Route' },
      { train: 'CT-2030', route: 'Sanand → JNPT', departure: 'Completed', rake: 'BLCA-09', status: 'Delivered' },
    ],
    note: DEMO_NOTE,
  },

  cha: {
    title: 'Customs Clearance',
    subtitle: 'Bills of entry, shipping bills and duty.',
    stats: [
      { label: 'BE filed', value: '6' },
      { label: 'Pending assessment', value: '3' },
      { label: 'Under examination', value: '2' },
      { label: 'Cleared today', value: '9' },
    ],
    tableTitle: 'Clearance queue',
    columns: [
      { key: 'doc', label: 'BE / SB No.' },
      { key: 'client', label: 'Importer / Exporter' },
      { key: 'port', label: 'Port' },
      { key: 'type', label: 'Type' },
      { key: 'status', label: 'Status' },
    ],
    statusKey: 'status',
    rows: [
      { doc: 'BE-7789021', client: 'TechNova Imports', port: 'JNPT', type: 'Import', status: 'Under Examination' },
      { doc: 'BE-7788944', client: 'Global Pharma', port: 'Chennai', type: 'Import', status: 'Assessed' },
      { doc: 'SB-5521088', client: 'Aarav Exports', port: 'Mundra', type: 'Export', status: 'Filed' },
      { doc: 'BE-7788710', client: 'Coastal Traders', port: 'Visakhapatnam', type: 'Import', status: 'Query Raised' },
      { doc: 'BE-7788655', client: 'Sunrise Agro', port: 'Mundra', type: 'Export', status: 'Cleared' },
    ],
    note: DEMO_NOTE,
  },

  shipping_line: {
    title: 'Vessel & Bookings',
    subtitle: 'Schedules, containers and bills of lading.',
    stats: [
      { label: 'Vessels', value: '5' },
      { label: 'Port calls (wk)', value: '11' },
      { label: 'Bookings', value: '34' },
      { label: 'Empty containers', value: '1,240' },
    ],
    tableTitle: 'Vessel schedule',
    columns: [
      { key: 'vessel', label: 'Vessel' },
      { key: 'voyage', label: 'Voyage' },
      { key: 'route', label: 'Route' },
      { key: 'etd', label: 'ETD' },
      { key: 'status', label: 'Status' },
    ],
    statusKey: 'status',
    rows: [
      { vessel: 'MV Bay of Bengal', voyage: '024E', route: 'JNPT → Jebel Ali', etd: '18 Jun', status: 'Loading' },
      { vessel: 'MV Konkan', voyage: '019W', route: 'Mundra → Singapore', etd: '20 Jun', status: 'Scheduled' },
      { vessel: 'MV Coromandel', voyage: '031E', route: 'Chennai → Colombo', etd: 'At sea', status: 'Sailing' },
      { vessel: 'MV Malabar', voyage: '012W', route: 'JNPT → Rotterdam', etd: 'Arrived', status: 'Delivered' },
    ],
    note: DEMO_NOTE,
  },

  transporter: {
    title: 'Fleet & Trips',
    subtitle: 'Trucks, trips, drivers and e-way bills.',
    stats: [
      { label: 'Trucks', value: '25' },
      { label: 'On trip', value: '14' },
      { label: 'Available', value: '8' },
      { label: 'Maintenance', value: '3' },
    ],
    tableTitle: 'Active trips',
    columns: [
      { key: 'trip', label: 'Trip' },
      { key: 'vehicle', label: 'Vehicle' },
      { key: 'route', label: 'Route' },
      { key: 'driver', label: 'Driver' },
      { key: 'status', label: 'Status' },
    ],
    statusKey: 'status',
    rows: [
      { trip: 'TR-9921', vehicle: 'HR55 AB 1234', route: 'TKD → Gurugram', driver: 'Ramesh K.', status: 'En Route' },
      { trip: 'TR-9918', vehicle: 'MH04 CD 5678', route: 'JNPT → Pune', driver: 'Suresh P.', status: 'At Pickup' },
      { trip: 'TR-9915', vehicle: 'GJ01 EF 9012', route: 'Mundra → Ahmedabad', driver: 'Imran S.', status: 'Assigned' },
      { trip: 'TR-9908', vehicle: 'TN09 GH 3456', route: 'Chennai → Hosur', driver: 'Velan M.', status: 'Delivered' },
    ],
    note: DEMO_NOTE,
  },

  customer: {
    title: 'Welcome back',
    subtitle: 'Track, quote and manage your shipments.',
    actions: [{ label: 'Track a shipment', to: '/track' }, { label: 'Get a quote', to: '/services' }],
    stats: [
      { label: 'Active', value: '2' },
      { label: 'Delivered', value: '7' },
      { label: 'Saved quotes', value: '3' },
      { label: 'Wallet', value: '₹0' },
    ],
    tableTitle: 'Your shipments',
    columns: [
      { key: 'booking', label: 'Booking' },
      { key: 'route', label: 'Route' },
      { key: 'eta', label: 'ETA' },
      { key: 'status', label: 'Status' },
    ],
    statusKey: 'status',
    rows: [
      { booking: 'SHP-IR-100488', route: 'Delhi → Mumbai', eta: '19 Jun', status: 'In Transit' },
      { booking: 'SHP-PR-100477', route: 'Bengaluru → Hyderabad', eta: '17 Jun', status: 'Out for Delivery' },
      { booking: 'SHP-IR-100401', route: 'Pune → Nagpur', eta: '11 Jun', status: 'Delivered' },
    ],
    note: DEMO_NOTE,
  },
};

// ── CONCOR — distinct dashboard per sub-role ──
export function concorDashboard(concorRole?: string): DashboardConfig {
  switch (concorRole) {
    case 'business_associate':
      return {
        title: 'CONCOR — Business Associate',
        subtitle: 'Bookings you have sourced and your commission.',
        stats: [
          { label: 'Bookings (MTD)', value: '41' },
          { label: 'Active clients', value: '12' },
          { label: 'Commission (MTD)', value: '₹2.7L' },
          { label: 'Pending payout', value: '₹64k' },
        ],
        tableTitle: 'Sourced bookings',
        columns: [
          { key: 'booking', label: 'Booking' },
          { key: 'client', label: 'Client' },
          { key: 'route', label: 'Route' },
          { key: 'value', label: 'Value' },
          { key: 'status', label: 'Status' },
        ],
        statusKey: 'status',
        rows: [
          { booking: 'SHP-IR-100482', client: 'Aarav Exports', route: 'TKD → JNPT', value: '₹1.4L', status: 'Confirmed' },
          { booking: 'SHP-IR-100471', client: 'Sunrise Agro', route: 'Dadri → Mundra', value: '₹2.1L', status: 'In Transit' },
          { booking: 'SHP-IR-100460', client: 'Meridian', route: 'Whitefield → Chennai', value: '₹0.9L', status: 'Booking' },
          { booking: 'SHP-IR-100398', client: 'TechNova', route: 'Mundra → TKD', value: '₹1.7L', status: 'Delivered' },
        ],
        note: DEMO_NOTE,
      };

    case 'terminal_manager':
      return {
        title: 'CONCOR — Terminal Manager',
        subtitle: 'Rake handling and yard status at your ICD.',
        stats: [
          { label: 'Rakes today', value: '6' },
          { label: 'Wagons in yard', value: '212' },
          { label: 'Avg dwell time', value: '1.8 d' },
          { label: 'Throughput (TEU)', value: '3,480' },
        ],
        tableTitle: 'Rake schedule — ICD Tughlakabad',
        columns: [
          { key: 'rake', label: 'Rake' },
          { key: 'route', label: 'Route' },
          { key: 'slot', label: 'Arrival / Departure' },
          { key: 'wagons', label: 'Wagons' },
          { key: 'status', label: 'Status' },
        ],
        statusKey: 'status',
        rows: [
          { rake: 'BLCA-12', route: 'ex JNPT', slot: 'Arr 13:10', wagons: '45', status: 'Unloading' },
          { rake: 'BLCA-07', route: 'to Mundra', slot: 'Dep 19:00', wagons: '45', status: 'Loading' },
          { rake: 'BLCA-03', route: 'ex Chennai', slot: 'Arr 21:40', wagons: '42', status: 'Scheduled' },
          { rake: 'BLCA-09', route: 'to JNPT', slot: 'Dep 06:00', wagons: '45', status: 'Departed' },
        ],
        note: DEMO_NOTE,
      };

    case 'administration':
      return {
        title: 'CONCOR — Administration',
        subtitle: 'Network-wide operations overview.',
        stats: [
          { label: 'Rakes in service', value: '128' },
          { label: 'Terminals (ICD/PFT)', value: '61' },
          { label: 'Indents today', value: '1,042' },
          { label: 'Revenue (MTD)', value: '₹742 Cr' },
        ],
        tableTitle: 'Terminal throughput (today)',
        columns: [
          { key: 'terminal', label: 'Terminal' },
          { key: 'region', label: 'Region' },
          { key: 'rakes', label: 'Rakes' },
          { key: 'teu', label: 'TEU' },
          { key: 'status', label: 'Status' },
        ],
        statusKey: 'status',
        rows: [
          { terminal: 'ICD Tughlakabad', region: 'North', rakes: '6', teu: '3,480', status: 'Active' },
          { terminal: 'ICD Dadri', region: 'North', rakes: '8', teu: '4,120', status: 'Active' },
          { terminal: 'CFS Mundra', region: 'West', rakes: '5', teu: '2,960', status: 'Active' },
          { terminal: 'ICD Whitefield', region: 'South', rakes: '3', teu: '1,540', status: 'Congested' },
        ],
        note: DEMO_NOTE,
      };

    case 'cha':
      return { ...PERSONA_DASHBOARDS.cha, title: 'CONCOR — CHA', subtitle: 'Customs clearance handled via CONCOR.' };

    case 'flml':
      return { ...PERSONA_DASHBOARDS.transporter, title: 'CONCOR — First & Last Mile', subtitle: 'Road bridging for CONCOR rail legs.' };

    case 'customer':
      return { ...PERSONA_DASHBOARDS.importer_exporter, title: 'CONCOR — Customer', subtitle: 'Your CONCOR rail bookings.' };

    default:
      return {
        title: 'CONCOR Operations',
        subtitle: 'Indents, rakes and terminal status.',
        stats: [
          { label: 'Rakes in service', value: '128' },
          { label: 'Indents today', value: '1,042' },
          { label: 'Wagons available', value: '5,860' },
          { label: 'Revenue (MTD)', value: '₹742 Cr' },
        ],
        tableTitle: 'Indents received',
        columns: [
          { key: 'indent', label: 'Indent' },
          { key: 'customer', label: 'Customer' },
          { key: 'origin', label: 'Origin ICD' },
          { key: 'destination', label: 'Destination' },
          { key: 'status', label: 'Status' },
        ],
        statusKey: 'status',
        rows: [
          { indent: 'IND-55021', customer: 'Aarav Exports', origin: 'TKD', destination: 'JNPT', status: 'Allotted' },
          { indent: 'IND-55018', customer: 'Sunrise Agro', origin: 'Dadri', destination: 'Mundra', status: 'In Transit' },
          { indent: 'IND-55012', customer: 'Meridian', origin: 'Whitefield', destination: 'Chennai', status: 'Received' },
          { indent: 'IND-54998', customer: 'TechNova', origin: 'Mundra', destination: 'TKD', status: 'Delivered' },
        ],
        note: DEMO_NOTE,
      };
  }
}

// Resolve the dashboard for a given persona (and CONCOR sub-role).
export function getDashboardConfig(role?: string, concorRole?: string): DashboardConfig | null {
  if (!role) return null;
  if (role === 'concor') return concorDashboard(concorRole);
  return PERSONA_DASHBOARDS[role] || null;
}
