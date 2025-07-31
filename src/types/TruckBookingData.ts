// src/types/TruckBookingData.ts
export type TruckBookingData = {
  pickupLocation: string;
  deliveryLocation: string;
  truckType: string;
  goodsType: string;
  weight: string;
  dimensions: string;
  additionalInfo?: string;
  bookingId?: string;
  createdAt?: string;
};
