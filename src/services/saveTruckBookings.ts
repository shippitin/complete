// src/services/saveTruckBookings.ts
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import type { TruckBookingData } from '../types/TruckBookingData';

export async function saveTruckBookingToFirebase(data: TruckBookingData) {
  const docRef = await addDoc(collection(db, 'truckBookings'), data);
  return docRef.id;
}
