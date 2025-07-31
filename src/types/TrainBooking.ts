// src/types/TrainBooking.ts

import { AllFormData } from './QuoteFormHandle'; // Corrected: Import AllFormData

export interface TrainSearchResult {
  id: string;
  trainName: string;
  trainType: string;
  carrierName: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  transitDuration: string;
  priceEstimate: number;
  availability: string;
}

export const MOCK_TRAIN_RESULTS: TrainSearchResult[] = [
  {
    id: 'TRN001',
    trainName: 'Express Freight 101',
    trainType: 'Goods',
    carrierName: 'Indian Railways',
    origin: 'Delhi',
    destination: 'Mumbai',
    departureTime: '10:00 AM',
    arrivalTime: '08:00 AM (Next Day)',
    transitDuration: '22 Hours',
    priceEstimate: 15000,
    availability: 'Available',
  },
  {
    id: 'TRN002',
    trainName: 'Container Express',
    trainType: 'Container',
    carrierName: 'Container Corp of India',
    origin: 'Mumbai',
    destination: 'Chennai',
    departureTime: '02:00 PM',
    arrivalTime: '06:00 PM (Next Day)',
    transitDuration: '28 Hours',
    priceEstimate: 25000,
    availability: 'Limited',
  },
  {
    id: 'TRN003',
    trainName: 'Parcel Fast Track',
    trainType: 'Parcel',
    carrierName: 'Rail Parcel Services',
    origin: 'Kolkata',
    destination: 'Bangalore',
    departureTime: '07:00 AM',
    arrivalTime: '11:00 AM (Day 3)',
    transitDuration: '52 Hours',
    priceEstimate: 8000,
    availability: 'Available',
  },
  {
    id: 'TRN004',
    trainName: 'Northern Freight',
    trainType: 'Goods',
    carrierName: 'Indian Railways',
    origin: 'Lucknow',
    destination: 'Chandigarh',
    departureTime: '09:00 PM',
    arrivalTime: '03:00 PM (Next Day)',
    transitDuration: '18 Hours',
    priceEstimate: 12000,
    availability: 'Full',
  },
];

export interface DetailedTrainBookingData {
  train: TrainSearchResult;
  quoteSummary: AllFormData; // Corrected: Use AllFormData
  fullName: string;
  email: string;
  phone: string;
  companyName?: string;
  gstNumber?: string;
  kycDocumentType?: string;
  kycDocumentNumber?: string;
  specialInstructions?: string;
}
