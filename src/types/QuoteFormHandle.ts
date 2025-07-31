// src/types/QuoteFormHandle.ts

// Define specific service types for each domain
export type RailServiceType = "terminalToTerminal" | "doorToDoor" | "doorToTerminal" | "terminalToDoor";
export type CustomsServiceType = 'import' | 'export' | 'transit';
export type FirstLastMileServiceType = 'first-mile' | 'last-mile';

// NEW: A unified service type that includes all specific service types
export type UnifiedServiceType = RailServiceType | CustomsServiceType | FirstLastMileServiceType;

export type ContainerMode = "domestic" | "international";

// ===========================================
// 1. Base Form Data Interface
// ===========================================
// Common fields for all relevant booking types
export interface BaseFormData {
  readyDate: string; // YYYY-MM-DD format, consistent with DatePicker output (used for 'Date' field)
  cargoType: string;
  totalWeight: number;
  hazardousCargo?: boolean; // Made optional as it's a radio button default

  // FIX: Make originStation and destinationStation optional in BaseFormData
  // They are only required for specific sub-types (like Train bookings).
  originStation?: string;
  destinationStation?: string;

  originTerminal?: string; // Kept optional
  destinationTerminal?: string; // Kept optional

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

export interface DoorToDoorFormData extends BaseFormData {
  bookingType: 'Door to Door';
  originAddress: string;
  destinationAddress: string;
  hazardousCargo: boolean;
  insuranceRequired: boolean; // Kept as required for DoorToDoor
  cargoValue: number; // Kept as required for DoorToDoor
  dimensions: string; // Kept as required for DoorToDoor
  // No need to explicitly set originStation/destinationStation to undefined here.
  // Since they are optional in BaseFormData, if DoorToDoorFormData doesn't set them,
  // they will implicitly be optional/undefined for DoorToDoorFormData instances.
}


export interface TrainContainerFormData extends BaseFormData {
  bookingType: 'Train Container Booking';
  isDomestic: boolean;
  containerType: string;
  numberOfContainers: number;
  serviceType: RailServiceType;
  // FIX: Make originStation and destinationStation REQUIRED here for Train types
  originStation: string;
  destinationStation: string;
  customsClearanceRequired?: boolean; // Added this previously, keeping it
  volumetricWeight?: number; // Added this previously, keeping it
}

export interface TrainGoodsFormData extends BaseFormData {
  bookingType: 'Train Goods Booking';
  isDomestic: boolean;
  wagonType: 'Open Wagon' | 'Covered Wagon' | 'Flat Wagon' | 'Hopper Wagon' | string;
  numberOfWagons: number;
  serviceType: RailServiceType;
  // FIX: Make originStation and destinationStation REQUIRED here for Train types
  originStation: string;
  destinationStation: string;
  wagonCode?: string; // Added this previously, keeping it
}

export interface TrainParcelFormData extends BaseFormData {
  bookingType: 'Train Parcel Booking';
  isDomestic: boolean;
  parcelCount: number;
  dimensions: string; // Kept as required for Parcel
  detailedDescriptionOfGoods: string; // Kept as required for Parcel
  serviceType: RailServiceType;
  // FIX: Make originStation and destinationStation REQUIRED here for Train types
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
  containerType?: 'ALL' | '' | '20ft Standard' | '40ft Standard' | '40ft High Cube' | '40ft Open Top High'; // Made optional, updated types
  numberOfContainers?: number; // Made optional for FCL
  stuffingPoint?: 'Factory Shipper' | 'Warehouse/Depot/Third Party Address'; // Added for FCL
  commodityCategory: string;
  commodity: string;
  hazardousCargo: boolean;
  insuranceRequired: boolean;
  volumeCBM?: number;
  // No need to explicitly set originStation/destinationStation to undefined here.
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
  volumeWeight: number; // Volumetric Weight (KG)
  commodityCategory: string;
  commodity: string;
  hazardousCargo: boolean;
  insuranceRequired: boolean;
  // No need to explicitly set originStation/destinationStation to undefined here.
}

export interface TruckFormData extends BaseFormData {
  bookingType: 'Truck';
  pickupPincode: string;
  dropoffPincode: string;
  loadType: 'PTL' | 'FTL';
  truckType?: 'open' | 'closed' | 'flatbed' | 'reefer' | string;
  numberOfTrucks: number;
  vehicleType?: 'Bike' | 'Van' | 'Mini Truck' | 'Truck' | '14 ft Truck' | '17 ft Truck' | '20 ft Truck' | '32 ft SXL' | '32 ft MXL' | 'Container Truck' | 'Trailer' | string;
  hazardousCargo: boolean;
  insuranceRequired: boolean;
  // No need to explicitly set originStation/destinationStation to undefined here.
}

export interface LCLFormData extends BaseFormData {
  bookingType: 'LCL';
  origin: string;
  destination: string;
  totalVolume: number; // In CBM
  numberOfPackages: number;
  cargoValue: number;
  hazardousCargo: boolean;
  insuranceRequired: boolean;
  // No need to explicitly set originStation/destinationStation to undefined here.
}

export interface ParcelFormData extends BaseFormData {
  bookingType: 'Parcel';
  isDomestic: boolean;
  courierMode: 'DOC' | 'NON' | string;
  origin: string; // This will map to originPincode or originCity from ParsedVoiceCommand
  destination: string; // This will map to destinationPincode or destinationCity from ParsedVoiceCommand
  parcelCount: number;
  parcelLength?: number; // Made optional as it's part of dimensions string
  parcelWidth?: number; // Made optional as it's part of dimensions string
  parcelHeight?: number; // Made optional as it's part of dimensions string
  volumetricWeight?: number; // in Kgs (calculated from dimensions) - Made optional
  cargoValue?: number; // Made optional
  hazardousCargo: boolean;
  insuranceRequired?: boolean; // Made optional
  // No need to explicitly set originStation/destinationStation to undefined here.
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
  documentType?: 'Bill of Lading' | 'Air Waybill' | 'Commercial Invoice' | 'Packing List' | 'Other' | string;
  country?: string;
  customsServiceType?: 'Import Clearance' | 'Export Clearance' | 'Consultation' | 'Other' | string;
  // No need to explicitly set originStation/destinationStation to undefined here.
}

export interface InsuranceFormData extends BaseFormData {
  bookingType: 'Insurance';
  cargoValue: number;
  origin: string;
  destination: string;
  modeOfTransport: 'air' | 'sea' | 'road' | 'rail' | string;
  policyType: 'all-risk' | 'fpa' | 'wa' | string;
  startDate: string;
  endDate: string;
  hazardousCargo: boolean;
  insuranceRequired: boolean;
  coverageType?: 'All Risk' | 'Named Perils' | 'Total Loss' | 'Other' | string;
  // No need to explicitly set originStation/destinationStation to undefined here.
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
  deliveryInstructions?: string;
  // No need to explicitly set originStation/destinationStation to undefined here.
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
  | FirstLastMileFormData;

// ===========================================
// 4. Imperative Handle for Form Components
// ===========================================

// Defines the methods that a form component should expose via ref
export interface QuoteFormHandle {
  submit: () => AllFormData | null;
  reset: () => void;
}

// ===========================================
// 5. BookingType Union (for LLM schema `enum`)
// ===========================================
export type BookingType =
  'Door to Door'
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
  | 'First/Last Mile';

// ===========================================
// 6. Form Props Interfaces (for HeroSection.tsx)
// These interfaces are specifically for the props passed to the form components
// from HeroSection.tsx, including the showButtons prop.
// ===========================================
export interface DoorToDoorQuoteFormProps {
  prefillData?: ParsedVoiceCommand;
  showButtons?: boolean;
}

export interface TrainContainerQuoteFormProps {
  prefillData?: ParsedVoiceCommand;
  showButtons?: boolean;
}

export interface TrainGoodsQuoteFormProps {
  prefillData?: ParsedVoiceCommand;
  showButtons?: boolean;
}

export interface TrainParcelQuoteFormProps {
  prefillData?: ParsedVoiceCommand;
  showButtons?: boolean;
}

export interface SeaQuoteFormProps {
  prefillData?: ParsedVoiceCommand;
  showButtons?: boolean;
}

export interface AirQuoteFormProps {
  prefillData?: ParsedVoiceCommand;
  showButtons?: boolean;
}

export interface TruckQuoteFormProps {
  prefillData?: ParsedVoiceCommand;
  showButtons?: boolean;
}

export interface LCLQuoteFormProps {
  prefillData?: ParsedVoiceCommand;
  showButtons?: boolean;
}

export interface ParcelQuoteFormProps {
  prefillData?: ParsedVoiceCommand;
  showButtons?: boolean;
}

export interface CustomsQuoteFormProps {
  prefillData?: ParsedVoiceCommand;
  showButtons?: boolean;
}

export interface InsuranceQuoteFormProps {
  prefillData?: ParsedVoiceCommand;
  showButtons?: boolean;
}

export interface FirstLastMileQuoteFormProps {
  prefillData?: ParsedVoiceCommand;
  showButtons?: boolean;
}


// ===========================================
// 7. Parsed Voice Command Interface (DEFINITIVE LOCATION)
// This interface defines the structure of data parsed from voice commands.
// It uses more flexible types (string | number) because voice input can be less precise
// and will be validated by the form components themselves.
// ===========================================
export interface ParsedVoiceCommand {
  service?: BookingType | 'Track' | 'unknown' | 'home' | 'quote' | 'train' | 'Rail';
  origin?: string; // General origin (port or city/address/pincode)
  destination?: string; // General destination (port or city/address/pincode)
  readyDate?: string; // Date string (for internal consistency with AllFormData)
  date?: string; // Alternative for readyDate (for voice input)

  // Common cargo details
  cargoType?: string;
  commodity?: string;
  cargoWeight?: number | string;
  totalWeight?: number | string;
  cargoDimensions?: string;
  dimensions?: string;
  detailedDescriptionOfGoods?: string;
  description?: string; // Alternative for detailedDescriptionOfGoods/specialInstructions
  hazardousCargo?: boolean;


  // Sea Freight specific
  containerType?: string;
  numberOfContainers?: number | string;
  originPort?: string;
  destinationPort?: string;
  stuffingPoint?: string;
  commodityCategory?: string;
  shipmentMode?: string;

  // Air Freight specific
  activityType?: string;
  originAirport?: string;
  originAirportName?: string;
  originCity?: string;
  originAddress?: string;
  destinationAirport?: string;
  destinationCity?: string;
  destinationAddress?: string;
  volumetricWeight?: number | string;
  numberOfPieces?: number | string;

  // Truck Freight specific
  pickupPincode?: string;
  dropoffPincode?: string;
  loadType?: 'PTL' | 'FTL' | string;
  truckType?: string;
  vehicleType?: string;
  numberOfTrucks?: number | string;

  // Customs specific (kept as is, not part of rail form simplification)
  serviceType?: UnifiedServiceType | string;
  hsCode?: string;
  hsnCode?: string;
  countryOfOrigin?: string;
  destinationPortICD?: string;
  documentType?: string;
  country?: string;
  customsServiceType?: string;
  incoterms?: string;

  // LCL specific (kept as is, not part of rail form simplification)
  volumeCBM?: number | string;
  numberOfPackages?: number | string;

  // Parcel specific
  isDomestic?: boolean | string;
  packageType?: 'document' | 'parcel';
  parcelLength?: number | string;
  parcelWidth?: number | string;
  parcelHeight?: number | string;
  parcelCount?: number | string;
  courierMode?: 'DOC' | 'NON' | string;
  originPincode?: string;
  destinationPincode?: string;

  // Insurance specific (kept as is, not part of rail form simplification)
  policyType?: string;
  coverageType?: string;
  modeOfTransport?: string;
  startDate?: string;
  endDate?: string;

  // First Mile / Last Mile specific (kept as is, not part of rail form simplification)
  pickupLocation?: string;
  deliveryLocation?: string;
  pickupDate?: string;
  deliveryDate?: string;
  vehicleTypeRequired?: string;
  deliveryInstructions?: string;

  // Train specific - Updated to reflect 'Terminal' for internal use, but keep 'Station' for voice input
  originStation?: string; // Keep for voice input mapping
  destinationStation?: string; // Keep for voice input mapping
  originStationCity?: string; // Alternative for originStation
  destinationStationCity?: string; // Alternative for destinationStation
  originTerminal?: string; // Added for internal form data
  destinationTerminal?: string; // Added for internal form data
  wagonType?: string;
  numberOfWagons?: number | string;
  wagonCode?: string; // Removed from UI, but kept optional in type for flexibility

  // For Tracking
  shipmentId?: string;
}

// Interface for a single freight train search result - KEPT THIS HERE AS IT'S USED BY RailQuoteForm and TrainBookingFlow
export interface FreightTrainResult {
  id: string;
  serviceName: string;
  operator: string;
  originStation: string; // Keep as 'Station' here as it's for external data structure
  destinationStation: string; // Keep as 'Station' here as it's for external data structure
  departureTime: string;
  arrivalTime: string;
  transitDuration: string;
  availableCapacity: string;
  price: number;
  features: string[];
  cargoType: string; // ADDED THIS LINE
  isHazardousCompatible: boolean; // ADDED THIS LINE
}
