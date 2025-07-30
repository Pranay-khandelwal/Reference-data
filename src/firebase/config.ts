import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyCgK8fg7tXgaU-0oWcCGO9bdHWnwImLBmQ",
  authDomain: "barclays-network-management.firebaseapp.com",
  projectId: "barclays-network-management",
  storageBucket: "barclays-network-management.firebasestorage.app",
  messagingSenderId: "308811523712",
  appId: "1:308811523712:web:69e0bc7919d1057cbc2865",
  measurementId: "G-X0HKTS2D3E"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const analytics = getAnalytics(app);

export default app; 