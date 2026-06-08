// src/types/QuoteFormHandle.ts

// ── Rail service types ────────────────────────────────────────────────────────
// Domestic
// terminalToTerminal | doorToDoor | doorToTerminal | terminalToDoor
// International Export
// terminalToPort | terminalToTerminal | doorToPort | doorToTerminal
// International Import
// portToTerminal | terminalToTerminal | portToDoor | terminalToDoor
export type RailServiceType =
  | 'terminalToTerminal'
  | 'doorToDoor'
  | 'doorToTerminal'
  | 'terminalToDoor'
  | 'terminalToPort'   // export: ICD → seaport
  | 'doorToPort'       // export: door → seaport
  | 'portToTerminal'   // import: seaport → ICD
  | 'portToDoor';      // import: seaport → door

export type CustomsServiceType     = 'import' | 'export' | 'transit';
export type FirstLastMileServiceType = 'first-mile' | 'last-mile';

export type UnifiedServiceType =
  | RailServiceType
  | CustomsServiceType
  | FirstLastMileServiceType;

export type ContainerMode  = 'domestic' | 'international';
export type MovementType   = 'export' | 'import';

// ===========================================
// 1. Base Form Data
// ===========================================
export interface BaseFormData {
  readyDate:                string;
  cargoType:                string;
  totalWeight:              number;
  promoCode?:               string;
  hazardousCargo?:          boolean;
  originStation?:           string;
  destinationStation?:      string;
  originTerminal?:          string;
  destinationTerminal?:     string;
  originAddress?:           string;
  destinationAddress?:      string;
  serviceType?:             UnifiedServiceType;
  specialInstructions?:     string;
  dimensions?:              string;
  detailedDescriptionOfGoods?: string;
  hsCode?:                  string;
  incoterms?:               string;
  numberOfPieces?:          number;
  insuranceRequired?:       boolean;
  cargoValue?:              number;
}

// ===========================================
// 2. Individual Form Data Interfaces
// ===========================================

export interface TrainContainerFormData extends BaseFormData {
  bookingType:                'Train Container Booking';
  isDomestic:                 boolean;
  containerType:              string;
  numberOfContainers:         number;
  serviceType:                RailServiceType;
  originStation:              string;
  destinationStation:         string;
  etmsMovementType?:          MovementType;   // 'export' | 'import' for international
  customsClearanceRequired?:  boolean;
  volumetricWeight?:          number;
}

export interface TrainGoodsFormData extends BaseFormData {
  bookingType:        'Train Goods Booking';
  isDomestic:         boolean;
  wagonType:          'Open Wagon' | 'Covered Wagon' | 'Flat Wagon' | 'Hopper Wagon' | string;
  numberOfWagons:     number;
  serviceType:        RailServiceType;
  originStation:      string;
  destinationStation: string;
  wagonCode?:         string;
}

export interface TrainParcelFormData extends BaseFormData {
  bookingType:                'Train Parcel Booking';
  isDomestic:                 boolean;
  parcelCount:                number;
  dimensions:                 string;
  detailedDescriptionOfGoods: string;
  serviceType:                RailServiceType;
  originStation:              string;
  destinationStation:         string;
}

export interface DoorToDoorFormData extends BaseFormData {
  bookingType:        'Door to Door';
  isDomestic:         boolean;
  origin:             string;
  destination:        string;
  originAddress:      string;
  destinationAddress: string;
  hazardousCargo:     boolean;
  insuranceRequired:  boolean;
  cargoValue:         number;
  dimensions:         string;
  weight:             number;
}

export interface SeaFormData extends BaseFormData {
  bookingType:          'Sea';
  activityType:         'Port to Port' | 'Port to Door' | 'Door to Port' | 'Door to Door';
  shipmentMode:         'LCL' | 'FCL';
  originPort?:          string;
  originCity?:          string;
  originAddress?:       string;
  originPincode?:       string;
  destinationPort?:     string;
  destinationCity?:     string;
  destinationAddress?:  string;
  destinationPincode?:  string;
  containerType?:       string;
  numberOfContainers?:  number;
  stuffingPoint?:       string;
  commodityCategory:    string;
  commodity:            string;
  hazardousCargo:       boolean;
  insuranceRequired:    boolean;
  volumeCBM?:           number;
}

export interface AirFormData extends BaseFormData {
  bookingType:          'Air';
  activityType:         'Airport to Airport' | 'Airport to Door' | 'Door to Airport' | 'Door to Door';
  originAirport?:       string;
  originCity?:          string;
  originAddress?:       string;
  destinationAirport:   string;
  destinationCity?:     string;
  destinationAddress?:  string;
  volumeWeight:         number;
  commodityCategory:    string;
  commodity:            string;
  hazardousCargo:       boolean;
  insuranceRequired:    boolean;
}

export interface TruckFormData extends BaseFormData {
  bookingType:      'Truck';
  pickupPincode:    string;
  dropoffPincode:   string;
  loadType:         'PTL' | 'FTL';
  truckType?:       string;
  numberOfTrucks:   number;
  vehicleType?:     string;
  hazardousCargo:   boolean;
  insuranceRequired:boolean;
}

export interface LCLFormData extends BaseFormData {
  bookingType:       'LCL';
  origin:            string;
  destination:       string;
  date:              string;
  totalVolume:       number;
  numberOfPackages:  number;
  weight:            number;
  cargoValue:        number;
  hazardousCargo:    boolean;
  insuranceRequired: boolean;
}

export interface ParcelFormData extends BaseFormData {
  bookingType:       'Parcel';
  isDomestic:        boolean;
  courierMode:       'DOC' | 'NON' | string;
  origin:            string;
  destination:       string;
  parcelCount:       number;
  parcelLength?:     number;
  parcelWidth?:      number;
  parcelHeight?:     number;
  volumetricWeight?: number;
  cargoValue?:       number;
  hazardousCargo:    boolean;
  insuranceRequired?:boolean;
}

export interface CustomsFormData extends BaseFormData {
  bookingType:        'Customs';
  serviceType:        CustomsServiceType;
  cargoValue:         number;
  hsCode:             string;
  countryOfOrigin:    string;
  destinationPortICD: string;
  incoterms:          string;
  documentType:       string;
  country:            string;
  hazardousCargo:     boolean;
  insuranceRequired:  boolean;
}

export interface InsuranceFormData extends BaseFormData {
  bookingType:      'Insurance';
  cargoValue:       number;
  insuranceValue:   number;
  coverageType:     string;
  origin:           string;
  destination:      string;
  modeOfTransport:  string;
  policyType:       string;
  startDate:        string;
  endDate:          string;
  date:             string;
  weight:           number;
  hazardousCargo:   boolean;
  insuranceRequired:boolean;
}

export interface FirstLastMileFormData extends BaseFormData {
  bookingType:         'First/Last Mile';
  serviceType:         FirstLastMileServiceType;
  pickupLocation:      string;
  deliveryLocation:    string;
  pickupDate:          string;
  deliveryDate?:       string;
  vehicleType:         'Van' | 'Pickup Truck' | 'Small Truck (e.g., Tata Ace)' | 'Medium Truck (e.g., Eicher)' | 'Large Truck (e.g., Ashok Leyland)';
  vehicleTypeRequired?:string;
  origin:              string;
  destination:         string;
  date:                string;
  weight:              number;
  cargoValue:          number;
  hazardousCargo:      boolean;
  insuranceRequired:   boolean;
}

export interface PortServicesFormData extends BaseFormData {
  bookingType:     'Port Services';
  serviceCategory: 'technical' | 'bunkering' | 'logistics' | string;
  vesselName:      string;
  portLocation:    string;
  serviceDate:     string;
  specificService: string;
}

// ===========================================
// 3. Union Type
// ===========================================
export type AllFormData =
  | DoorToDoorFormData
  | TrainContainerFormData
  | TrainGoodsFormData
  | TrainParcelFormData
  | SeaFormData
  | AirFormData
  | TruckFormData
  | LCLFormData
  | ParcelFormData
  | CustomsFormData
  | InsuranceFormData
  | FirstLastMileFormData
  | PortServicesFormData;

// ===========================================
// 4. Imperative Handle
// ===========================================
export interface QuoteFormHandle {
  submit: () => AllFormData | null | Promise<AllFormData | null>;
  reset:  () => void;
}

// ===========================================
// 5. BookingType Union
// ===========================================
export type BookingType =
  | 'Rail'
  | 'Door to Door'
  | 'Train Container Booking'
  | 'Train Goods Booking'
  | 'Train Parcel Booking'
  | 'Sea'
  | 'Air'
  | 'Truck'
  | 'LCL'
  | 'Parcel'
  | 'Customs'
  | 'Insurance'
  | 'First/Last Mile'
  | 'Port Services';

// ===========================================
// 6. Parsed Voice Command Interface
// ===========================================
export interface ParsedVoiceCommand {
  numberOfTrucks?:       number | string;
  productDeclaredValue?: number | string;
  numberOfPieces?:       number | string;
  vehicleType?:          string;
  insuranceRequired?:    boolean;
  specialInstructions?:  string;
  loadType?:             'PTL' | 'FTL';
  service?:              BookingType | 'Track' | 'unknown' | 'home' | 'quote' | 'train' | 'Rail';
  origin?:               string;
  destination?:          string;
  readyDate?:            string;
  date?:                 string;
  promoCode?:            string;

  // Rail specific
  isDomestic?:           boolean | string;
  etmsMovementType?:     MovementType;
  originStation?:        string;
  destinationStation?:   string;
  originStationCity?:    string;
  destinationStationCity?:string;
  originTerminal?:       string;
  destinationTerminal?:  string;
  originAddress?:        string;
  destinationAddress?:   string;
  wagonType?:            string;
  numberOfWagons?:       number | string;
  parcelCount?:          number | string;
  serviceType?:          UnifiedServiceType | string;

  // Cargo details
  cargoType?:            string;
  commodity?:            string;
  cargoWeight?:          number | string;
  totalWeight?:          number | string;
  cargoDimensions?:      string;
  dimensions?:           string;
  detailedDescriptionOfGoods?: string;
  description?:          string;
  hazardousCargo?:       boolean;

  // Port Services
  vesselName?:           string;
  portLocation?:         string;
  serviceCategory?:      string;
  specificService?:      string;
  serviceDate?:          string;

  // Other freight
  containerType?:        string;
  numberOfContainers?:   number | string;
  activityType?:         string;
  pickupPincode?:        string;
  dropoffPincode?:       string;
  shipmentId?:           string;
}

// ===========================================
// 7. Freight Train Result
// ===========================================
export interface FreightTrainResult {
  id:                   string;
  serviceName:          string;
  operator:             string;
  originStation:        string;
  destinationStation:   string;
  departureTime:        string;
  arrivalTime:          string;
  transitDuration:      string;
  availableCapacity:    string;
  price:                number;
  features:             string[];
  cargoType:            string;
  isHazardousCompatible:boolean;
  // Breakdown fields (optional — from DB rate card)
  thcOrigin?:           number;
  thcDestination?:      number;
  otherCharges?:        number;
  firstMile?:           number;
  lastMile?:            number;
  gstRailPct?:          number;
  gstThcPct?:           number;
  gstFlmlPct?:          number;
  sourceDocument?:      string;
  isDomestic?:          boolean;
}
