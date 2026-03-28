// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth, GoogleAuthProvider} from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "interviewiq-11cdc.firebaseapp.com",
  projectId: "interviewiq-11cdc",
  storageBucket: "interviewiq-11cdc.firebasestorage.app",
  messagingSenderId: "385374135597",
  appId: "1:385374135597:web:30ae4e569347027cf31fa4"
};

// Initialize Firebase
const App = initializeApp(firebaseConfig);
const auth = getAuth(App);
const provider = new GoogleAuthProvider();

export {auth, provider};