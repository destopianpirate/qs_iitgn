// Firebase Configuration and Initialization

const firebaseConfig = {
  apiKey: "AIzaSyBivrKhw5V8Yt0qaB8lGEf_zRRq6xoM2YM",
  authDomain: "qsiitgn.firebaseapp.com",
  databaseURL: "https://qsiitgn-default-rtdb.firebaseio.com",
  projectId: "qsiitgn",
  storageBucket: "qsiitgn.firebasestorage.app",
  messagingSenderId: "92027146304",
  appId: "1:92027146304:web:c17825653d2d71081d0fa5"
};

// Initialize Firebase using the compat libraries loaded in HTML
firebase.initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
const db = firebase.firestore();

// Initialize Realtime Database
let rtdb = null;
try {
  rtdb = firebase.database();
} catch(e) {
  console.warn("RTDB initialization failed", e);
}

// Make the databases accessible globally
window.db = db;
window.rtdb = rtdb;
