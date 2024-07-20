// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBIGdubYQk3ZltkP6bje-0Fw1dX0zfYgoo",
  authDomain: "weblink-cf07c.firebaseapp.com",
  projectId: "weblink-cf07c",
  storageBucket: "weblink-cf07c.appspot.com",
  messagingSenderId: "978377539601",
  appId: "1:978377539601:web:729735fb9c4b62049ff1b0",
  measurementId: "G-FP7T0FEKN4"
};

// Initialize Firebase
const appfirebase = initializeApp(firebaseConfig);
const analytics = getAnalytics(appfirebase);
export default appfirebase;