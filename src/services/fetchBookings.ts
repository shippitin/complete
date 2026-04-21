// src/services/fetchBookings.ts
import type { QuoteFormData } from '../types/QuoteData';

export const fetchBookingHistory = async (): Promise<QuoteFormData[]> => {
  const token = localStorage.getItem('shippitin_token');
  
  if (!token) {
    return [];
  }

  const response = await fetch('http://localhost:5000/api/bookings', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch bookings');
  }

  const result = await response.json();
  
  return result.data.map((booking: any) => ({
    bookingId: booking.id,
    bookingNumber: booking.booking_number,
    baseRate: 0,
    weightCharge: 0,
    serviceCharge: 0,
    insurance: 0,
    taxes: 0,
    total: booking.estimated_price ?? 0,
    from: booking.origin ?? '',
    to: booking.destination ?? '',
    weight: booking.weight ?? 0,
    date: booking.booking_date ?? '',
    mode: booking.service_type ?? 'Rail',
  }));
};