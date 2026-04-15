// src/types/QuoteFormHandle.ts

// Define specific service types for each domain
export type RailServiceType = "terminalToTerminal" | "doorToDoor" | "doorToTerminal" | "terminalToDoor";
export type CustomsServiceType = 'import' | 'export' | 'transit';
export type FirstLastMileServiceType = 'first-mile' | 'last-mile';

// A unified service type that includes all specific service types
export type UnifiedServiceType = RailServiceType | CustomsServiceType | FirstLastMileServiceType;

export type ContainerMode = "domestic" | "international";

// ===========================================
// 1. Base Form Data Interface
// ===========================================
export interface BaseFormData {
  readyDate: string; 
  cargoType: string;
  totalWeight: number;
  promoCode?: string;            
  hazardousCargo?: boolean;
  originStation?: string;
  destinationStation?: string;
  originTerminal?: string;
  destinationTerminal?: string;
  originAddress?: string;
  destinationAddress?: string;
  serviceType?: UnifiedServiceType;
  specialInstructions?: string;
  dimensions?: string;
  detailedDescriptionOfGoods?: string;
  hsCode?: string;
  incoterms?: string;
  numberOfPieces?: number;
  insuranceRequired?: boolean;
  cargoValue?: number;
}

// ===========================================
// 2. Individual Form Data Interfaces
// ===========================================

export interface PortServicesFormData extends BaseFormData {
  bookingType: 'Port Services';
  serviceCategory: 'technical' | 'bunkering' | 'logistics' | string;
  vesselName: string;
  portLocation: string;
  serviceDate: string;
  specificService: string;
}

export interface DoorToDoorFormData extends BaseFormData {
  bookingType: 'Door to Door';
  originAddress: string;
  destinationAddress: string;
  hazardousCargo: boolean;
  insuranceRequired: boolean;
  cargoValue: number;
  dimensions: string;
}

export interface TrainContainerFormData extends BaseFormData {
  bookingType: 'Train Container Booking';
  isDomestic: boolean;
  containerType: string;
  numberOfContainers: number;
  serviceType: RailServiceType;
  originStation: string;
  destinationStation: string;
  customsClearanceRequired?: boolean;
  volumetricWeight?: number;
}

export interface TrainGoodsFormData extends BaseFormData {
  bookingType: 'Train Goods Booking';
  isDomestic: boolean;
  wagonType: 'Open Wagon' | 'Covered Wagon' | 'Flat Wagon' | 'Hopper Wagon' | string;
  numberOfWagons: number;
  serviceType: RailServiceType;
  originStation: string;
  destinationStation: string;
  wagonCode?: string;
}

export interface TrainParcelFormData extends BaseFormData {
  bookingType: 'Train Parcel Booking';
  isDomestic: boolean;
  parcelCount: number;
  dimensions: string;
  detailedDescriptionOfGoods: string;
  serviceType: RailServiceType;
  originStation: string;
  destinationStation: string;
}

export interface SeaFormData extends BaseFormData {
  bookingType: 'Sea';
  activityType: 'Port to Port' | 'Port to Door' | 'Door to Port' | 'Door to Door';
  shipmentMode: 'LCL' | 'FCL';
  originPort?: string;
  originCity?: string;
  originAddress?: string;
  originPincode?: string;
  destinationPort?: string;
  destinationCity?: string;
  destinationAddress?: string;
  destinationPincode?: string;
  containerType?: string;
  numberOfContainers?: number;
  stuffingPoint?: string;
  commodityCategory: string;
  commodity: string;
  hazardousCargo: boolean;
  insuranceRequired: boolean;
  volumeCBM?: number;
}

export interface AirFormData extends BaseFormData {
  bookingType: 'Air';
  activityType: 'Airport to Airport' | 'Airport to Door' | 'Door to Airport' | 'Door to Door';
  originAirport?: string;
  originCity?: string;
  originAddress?: string;
  destinationAirport: string;
  destinationCity?: string;
  destinationAddress?: string;
  volumeWeight: number;
  commodityCategory: string;
  commodity: string;
  hazardousCargo: boolean;
  insuranceRequired: boolean;
}

export interface TruckFormData extends BaseFormData {
  bookingType: 'Truck';
  pickupPincode: string;
  dropoffPincode: string;
  loadType: 'PTL' | 'FTL';
  truckType?: string;
  numberOfTrucks: number;
  vehicleType?: string;
  hazardousCargo: boolean;
  insuranceRequired: boolean;
}

export interface LCLFormData extends BaseFormData {
  bookingType: 'LCL';
  origin: string;
  destination: string;
  totalVolume: number;
  numberOfPackages: number;
  cargoValue: number;
  hazardousCargo: boolean;
  insuranceRequired: boolean;
}

export interface ParcelFormData extends BaseFormData {
  bookingType: 'Parcel';
  isDomestic: boolean;
  courierMode: 'DOC' | 'NON' | string;
  origin: string;
  destination: string;
  parcelCount: number;
  parcelLength?: number;
  parcelWidth?: number;
  parcelHeight?: number;
  volumetricWeight?: number;
  cargoValue?: number;
  hazardousCargo: boolean;
  insuranceRequired?: boolean;
}

export interface CustomsFormData extends BaseFormData {
  bookingType: 'Customs';
  serviceType: CustomsServiceType;
  cargoValue: number;
  hsCode: string;
  countryOfOrigin: string;
  destinationPortICD: string;
  incoterms: string;
  hazardousCargo: boolean;
  insuranceRequired: boolean;
}

export interface InsuranceFormData extends BaseFormData {
  bookingType: 'Insurance';
  cargoValue: number;
  origin: string;
  destination: string;
  modeOfTransport: string;
  policyType: string;
  startDate: string;
  endDate: string;
  hazardousCargo: boolean;
  insuranceRequired: boolean;
}

export interface FirstLastMileFormData extends BaseFormData {
  bookingType: 'First/Last Mile';
  serviceType: FirstLastMileServiceType;
  pickupLocation: string;
  deliveryLocation: string;
  pickupDate: string;
  deliveryDate?: string;
  vehicleTypeRequired?: string;
  cargoValue: number;
  hazardousCargo: boolean;
  insuranceRequired: boolean;
}

// ===========================================
// 3. Union Type for All Form Data
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
  submit: () => AllFormData | null;
  reset: () => void;
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
// 6. Parsed Voice Command Interface (FIXED)
// ===========================================
export interface ParsedVoiceCommand {
  // FIXED: Changed these from function signatures to data types
  numberOfTrucks?: number | string;
  productDeclaredValue?: number | string;
  numberOfPieces?: number | string;
  
  vehicleType?: string;
  insuranceRequired?: boolean;
  specialInstructions?: string;
  loadType?: "PTL" | "FTL";
  service?: BookingType | 'Track' | 'unknown' | 'home' | 'quote' | 'train' | 'Rail';
  origin?: string;
  destination?: string;
  readyDate?: string;
  date?: string;
  promoCode?: string;

  // Rail Specific
  isDomestic?: boolean | string;
  originStation?: string;
  destinationStation?: string;
  originStationCity?: string;
  destinationStationCity?: string;
  originTerminal?: string;
  destinationTerminal?: string;
  originAddress?: string;
  destinationAddress?: string;
  wagonType?: string;
  numberOfWagons?: number | string;
  parcelCount?: number | string;
  serviceType?: UnifiedServiceType | string;

  // Common cargo details
  cargoType?: string;
  commodity?: string;
  cargoWeight?: number | string;
  totalWeight?: number | string;
  cargoDimensions?: string;
  dimensions?: string;
  detailedDescriptionOfGoods?: string;
  description?: string;
  hazardousCargo?: boolean;

  // Port Services
  vesselName?: string;
  portLocation?: string;
  serviceCategory?: string;
  specificService?: string;
  serviceDate?: string;

  // Other Freight
  containerType?: string;
  numberOfContainers?: number | string;
  activityType?: string;
  pickupPincode?: string;
  dropoffPincode?: string;
  shipmentId?: string;
}

export interface FreightTrainResult {
  id: string;
  serviceName: string;
  operator: string;
  originStation: string;
  destinationStation: string;
  departureTime: string;
  arrivalTime: string;
  transitDuration: string;
  availableCapacity: string;
  price: number;
  features: string[];
  cargoType: string;
  isHazardousCompatible: boolean;
}