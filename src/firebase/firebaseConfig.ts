// src/firebase/firebaseConfig.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyD4kOUGRE9JT2dKRSrBYacCNc8towIfIzo',
  authDomain: 'shippitin-7be0f.firebaseapp.com',
  projectId: 'shippitin-7be0f',
  storageBucket: 'shippitin-7be0f.appspot.com',
  messagingSenderId: '887744065570',
  appId: '1:887744065570:web:6cc435ccd12a18bd965a7b',
  measurementId: 'G-2N62FXPHWV',
};

// ✅ Prevent multiple Firebase initializations in dev
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { app, db, auth, storage };