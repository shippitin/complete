// src/services/fetchBookings.ts
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import type { QuoteFormData } from '../types/QuoteData';

export const fetchBookingHistory = async (): Promise<QuoteFormData[]> => {
  const snapshot = await getDocs(collection(db, 'quotes'));
  return snapshot.docs.map((doc) => {
    const raw = doc.data();
    return {
      bookingId: doc.id,
      baseRate: raw.baseRate ?? 0,
      weightCharge: raw.weightCharge ?? 0,
      serviceCharge: raw.serviceCharge ?? 0,
      insurance: raw.insurance ?? 0,
      taxes: raw.taxes ?? 0,
      total: raw.total ?? 0,
      from: raw.from ?? '',
      to: raw.to ?? '',
      weight: raw.weight ?? 0,
      date: raw.date ?? '',
      mode: raw.mode ?? 'Road',
    };
  });
};