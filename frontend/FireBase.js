// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth} from "firebase/auth"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "dashbite-food-delivery.firebaseapp.com",
  projectId: "dashbite-food-delivery",
  storageBucket: "dashbite-food-delivery.firebasestorage.app",
  messagingSenderId: "411744376565",
  appId: "1:411744376565:web:4af34af032a759ed5917bc"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export {app,auth}