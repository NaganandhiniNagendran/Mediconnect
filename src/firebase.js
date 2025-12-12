import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Prefer env vars; fall back to provided defaults so the app keeps working
// even if .env is missing locally.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyCQUOIzRALTsVlq_uAgNMyJ8FdGgvwLCQ4',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'medi-connect-2ab99.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'medi-connect-2ab99',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'medi-connect-2ab99.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '161240780012',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:161240780012:web:0c2a6ab3afaf628643a9c9',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-K0SY990N54',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;

