// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCUDyfexHxUYagOIaSvitSVERmXFtCF0w8",
  authDomain: "apptesis-713fb.firebaseapp.com",
  projectId: "apptesis-713fb",
  storageBucket: "apptesis-713fb.appspot.com",
  messagingSenderId: "1098047156877",
  appId: "1:1098047156877:web:378d2f7b37631ac539e8c4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);