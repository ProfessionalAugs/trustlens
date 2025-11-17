// Import Firebase modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Firebase configuration
// IMPORTANT: Replace these placeholder values with your actual Firebase project credentials
// You can find these in your Firebase Console > Project Settings > General > Your apps
const firebaseConfig = {
   apiKey: "AIzaSyAUAcNc26zHQs987z8qxaeZOxZdIr4Ubl0",
  authDomain: "trustlens-7b01b.firebaseapp.com",
  projectId: "trustlens-7b01b",
  storageBucket: "trustlens-7b01b.firebasestorage.app",
  messagingSenderId: "639825344142",
  appId: "1:639825344142:web:ce919b1a4d457aad30fbdf",
  measurementId: "G-1EGCXYSBQ4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

console.log('Firebase initialized successfully');
