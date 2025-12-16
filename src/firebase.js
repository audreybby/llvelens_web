// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { setPersistence, browserLocalPersistence } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCyuJGkLBL0H30oXbwSzpGP2EebKPhsRyM",
  authDomain: "llvelens.firebaseapp.com",
  projectId: "llvelens",
  storageBucket: "llvelens.firebasestorage.app",
  messagingSenderId: "775748614459",
  appId: "1:775748614459:web:a68cbfce95eb29b8e19f1e",
  measurementId: "G-YQJ6EWGZPH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getFirestore(app); 
const auth = getAuth(app);

  setPersistence(auth, browserLocalPersistence)
  .then(() => console.log("Persistence enabled"))
  .catch(error => console.error("Persistence error:", error));

export {auth};