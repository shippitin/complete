export type QuoteFormData = {
  name: any;
  email: any;
  cargoType: any;
  from: string;
  to: string;
  weight: number;
  date: string;
  mode: string;
  bookingId?: string;
  baseRate?: number;
  weightCharge?: number;
  serviceCharge?: number;
  insurance?: number;
  taxes?: number;
  total?: number;
};

export type Quote = {
  weight: number;
  from: string;
  to: string;
  date: string;
  mode: string;
  baseRate: number;
  weightCharge: number;
  serviceCharge: number;
  insurance: number;
  taxes: number;
  total: number;
};