// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD8i2vkeVQ-dGTkCLVnAZYVaajIWA0igdA",
  authDomain: "angieaustin-95d86.firebaseapp.com",
  projectId: "angieaustin",
  storageBucket: "angieaustin.firebasestorage.app",
  messagingSenderId: "1088113525015",
  appId: "1:1088113525015:web:cdbd1453101718861bb752",
  measurementId: "G-ZX2YB3JRJY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

export { app, analytics, db };