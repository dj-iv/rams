// src/firebase.js

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// PASTE THE CONFIG OBJECT YOU COPIED FROM FIREBASE HERE
const firebaseConfig = {
  apiKey: "AIzaSyA63j7dPv5yNNE-mLnWnEXisqDMttQxJTo",
  authDomain: "rams-generator-bdcb7.firebaseapp.com",
  projectId: "rams-generator-bdcb7",
  storageBucket: "rams-generator-bdcb7.firebasestorage.app",
  messagingSenderId: "226355463505",
  appId: "1:226355463505:web:e380c358213907de107f70"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);