// src/services/loginUser.ts
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase/firebaseConfig';

export const loginUser = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Optional: Save login timestamp
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: user.email,
      lastLogin: serverTimestamp(),
    }, { merge: true });

    return user;
  } catch (error: any) {
    throw new Error(error.message || 'Login failed');
  }
};