// src/utils/railCharges.ts
// Single source of truth for the CONCOR rail charge model, shared by the
// results list (TrainResultsPage) and the service-details / checkout page
// (RailServiceDetailsPage) so the indicative price shown on the list always
// matches the order summary at checkout.

import type { RailServiceType } from '../types/QuoteFormHandle';

export const DOMESTIC_THC = 3000;

export const INTL_THC: Record<string, number> = {
  '20ft Standard':         6000,
  '20ft High Cube':        6000,
  '20ft High Cube Reefer': 6000,
  '40ft Standard':        10800,
  '40ft High Cube':       10800,
  '40ft High Cube Reefer':10800,
  '40ft Open Top High':   10800,
};

export const INTL_OTHER: Record<string, number> = {
  '20ft Standard':         3500,
  '20ft High Cube':        3500,
  '20ft High Cube Reefer': 3500,
  '40ft Standard':         7000,
  '40ft High Cube':        7000,
  '40ft High Cube Reefer': 7000,
  '40ft Open Top High':    7000,
};

// First-mile (pickup) and last-mile (delivery) trucking, per container.
// Kept as two maps so the two legs can differ (e.g. 20ft last mile costs more).
export const FIRST_MILE: Record<string, number> = {
  '20ft Standard':         10500,
  '20ft High Cube':        10500,
  '20ft High Cube Reefer': 10500,
  '40ft Standard':         12000,
  '40ft High Cube':        12000,
  '40ft High Cube Reefer': 12000,
  '40ft Open Top High':    12000,
};
export const LAST_MILE: Record<string, number> = {
  '20ft Standard':         12000,
  '20ft High Cube':        12000,
  '20ft High Cube Reefer': 12000,
  '40ft Standard':         12000,
  '40ft High Cube':        12000,
  '40ft High Cube Reefer': 12000,
  '40ft Open Top High':    12000,
};

export interface RailChargeInput {
  baseRailFreight: number;   // tiered CONCOR base haulage (from the quote)
  isDomestic: boolean;
  containerType: string;
  numContainers: number;
  doorOrigin: boolean;       // pickup at sender's door (first mile)
  doorDest: boolean;         // delivery to receiver's door (last mile)
  originPort: boolean;       // journey starts at a port (import) — no origin THC
  destPort: boolean;         // journey ends at a port (export) — no dest THC
}

export interface RailCharges {
  baseRailFreight: number;
  thcPerSide: number;
  thcOrigin: number;
  thcDest: number;
  otherCharges: number;
  firstMile: number;
  lastMile: number;
  platformFee: number;
  subtotal: number;          // excl. GST and excl. optional add-ons (insurance / customs)
}

// The CONCOR charge model: base haulage + terminal handling (both ends) +
// first/last-mile trucking for door legs + Shippitin platform fee.
export const computeRailCharges = ({
  baseRailFreight, isDomestic, containerType, numContainers,
  doorOrigin, doorDest, originPort, destPort,
}: RailChargeInput): RailCharges => {
  const thcPerSide   = isDomestic ? DOMESTIC_THC : (INTL_THC[containerType] || 8700);
  const thcOrigin    = originPort ? 0 : thcPerSide * numContainers;
  const thcDest      = destPort   ? 0 : thcPerSide * numContainers;
  const otherCharges = isDomestic ? 0 : (INTL_OTHER[containerType] || 1000) * numContainers;
  const firstMile    = doorOrigin ? (FIRST_MILE[containerType] || 10500) * numContainers : 0;
  const lastMile     = doorDest   ? (LAST_MILE[containerType]  || 12000) * numContainers : 0;
  const platformFee  = isDomestic ? 1000 : 1500;
  const subtotal     = baseRailFreight + thcOrigin + thcDest + otherCharges + firstMile + lastMile + platformFee;
  return { baseRailFreight, thcPerSide, thcOrigin, thcDest, otherCharges, firstMile, lastMile, platformFee, subtotal };
};

// Resolve the door/port flags from a service type alone (no optional add-ons).
// Used by the results list, which doesn't know about Recommended-Services add-ons.
export const doorPortFlags = (isContainer: boolean, serviceType: RailServiceType) => ({
  doorOrigin: isContainer && (serviceType === 'doorToDoor' || serviceType === 'doorToTerminal' || serviceType === 'doorToPort'),
  doorDest:   isContainer && (serviceType === 'doorToDoor' || serviceType === 'terminalToDoor' || serviceType === 'portToDoor'),
  originPort: isContainer && (serviceType === 'portToTerminal' || serviceType === 'portToDoor'),
  destPort:   isContainer && (serviceType === 'terminalToPort' || serviceType === 'doorToPort'),
});
