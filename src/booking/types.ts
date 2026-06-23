// src/booking/types.ts
// Config schema for the shared BookingFlow engine. Every transport mode (Air, Truck,
// Parcel, Customs, First/Last Mile, Door-to-Door, Port) describes itself with a ModeConfig;
// the engine in src/components/BookingFlow.tsx renders the multi-step flow, document
// filing, charges breakdown, persistence and confirmation from that config alone.
import type { IconType } from 'react-icons';

export interface FlowCtx {
  isDomestic: boolean;          // international vs domestic (drives which docs/fields show)
  isCompletingDocs: boolean;    // opened via "Complete documentation" for an existing booking
  selected: any;                // the chosen quote/offer (selectedResult / selectedOffer)
  formData: any;                // the original search form data
  addons: Record<string, boolean>;  // current add-on toggle state (for charge computation)
}

export type FieldType = 'text' | 'email' | 'tel' | 'number' | 'date' | 'select' | 'textarea' | 'city';

export interface FieldDef {
  key: string;                  // unique key within the flow's value map
  label: string;
  type?: FieldType;             // default 'text'
  required?: boolean;
  placeholder?: string;
  options?: Array<string | { value: string; label: string }>;  // for 'select'
  colSpan?: 1 | 2;              // grid columns (default 1; 2 = full width)
  upper?: boolean;             // force-uppercase the value
  prefillFromUser?: 'full_name' | 'email' | 'phone' | 'company_name' | 'gstin';
  when?: (v: Record<string, string>, ctx: FlowCtx) => boolean;  // conditional visibility
}

export interface StepDef {
  id: number;
  label: string;                // 'Shipper'
  icon: IconType;
  activeBg: string;             // tailwind class for the active step circle
  color: string;                // tailwind text color for the active label
  border: string;               // tailwind border for the active card
  party?: 'sender' | 'receiver';// persist/restore this step as a saved party
  intro?: string;               // small helper line under the step
  fields: FieldDef[];
}

export interface AddonDef {
  key: string;                  // value-map key for the on/off boolean
  label: string;
  price: string;                // display string, e.g. '0.25% of cargo value'
  desc: string;
  addrField?: { key: string; placeholder: string };                 // address input when on
  valueField?: { key: string; placeholder: string };                // numeric input when on (insurance value)
  insurance?: boolean;          // this add-on is the 0.25% cargo insurance
  when?: (ctx: FlowCtx) => boolean;                                  // e.g. customs only when international
  defaultOn?: (ctx: FlowCtx) => boolean;
}

export interface DocDef {
  kind: 'verify' | 'file';      // verify → persists filing_number; file → persists efn_filed
  label: string;
  hint?: string;
  placeholder?: string;
  numeric?: boolean;            // restrict the verify input to digits
  maxLen?: number;
  verifyingToast?: string;      // shown while "verifying"
  doneToast?: string;           // shown on success
  fields?: Array<{ key: string; placeholder: string; numeric?: boolean }>;  // for 'file' docs (e.g. VGM/container/seal)
  when?: (ctx: FlowCtx) => boolean;   // e.g. Shipping Bill only when international
}

export interface ChargeRow {
  label: string;
  amount: number;
  gst?: number;                 // GST rate for this row (default 0.18; freight rows pass 0.05)
  freight?: boolean;            // shown as the base line
}

export interface ChargeResult {
  rows: ChargeRow[];            // every billable line except insurance
  insurance?: number;           // insurance amount (taxed @18%, shown separately)
}

export interface ModeConfig {
  mode: string;                 // 'air'
  bookingType: string;          // 'Air' — stored as service_type
  title: string;                // 'Complete Your Air Booking'
  icon: IconType;
  idPrefix: string;             // 'AIR' → booking number AIR-123456
  resultsRoute: string;         // where "Go back" returns
  stateKey?: 'selectedResult' | 'selectedOffer';  // results-page state key (default selectedResult)
  defaultInternational?: boolean;                 // true unless the mode is domestic-only (truck/first-last-mile)
  partyALabel: string;          // 'Shipper'
  partyBLabel: string;          // 'Consignee'
  docPreviewTitle?: string;     // e.g. 'Air Waybill — Draft' (omit to hide the preview card)
  docPreviewVesselLabel?: string;  // e.g. 'Carrier' / 'Vessel / Carrier'
  steps: StepDef[];
  addons: AddonDef[];
  documents: DocDef[];          // [] = no "Complete documentation" filing for this mode
  computeCharges: (v: Record<string, string>, selected: any, ctx: FlowCtx) => ChargeResult;
}
