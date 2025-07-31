// src/services/userService.ts
import { db } from '../firebase/firebaseConfig';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export const saveUserProfile = async (uid: string, profileData: any) => {
  const userRef = doc(db, 'users', uid);
  await setDoc(userRef, profileData, { merge: true });
};

export const getUserProfile = async (uid: string) => {
  const userRef = doc(db, 'users', uid);
  const snapshot = await getDoc(userRef);
  return snapshot.exists() ? snapshot.data() : null;
};