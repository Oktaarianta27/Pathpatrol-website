import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
} from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  onSnapshot,
  collection,
  deleteField,
  deleteDoc,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

import {
  getStorage,
  deleteObject,
  ref,
  getDownloadURL,
  uploadBytes,
} from "https://www.gstatic.com/firebasejs/10.9.0/firebase-storage.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB4XzhCeCEmLzDc4T_ZuZMop-zCQAu6-DI",
  authDomain: "composed-strata-441002-a4.firebaseapp.com",
  databaseURL:
    "https://composed-strata-441002-a4-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "composed-strata-441002-a4",
  storageBucket: "composed-strata-441002-a4.firebasestorage.app",
  messagingSenderId: "575457987017",
  appId: "1:575457987017:web:bae0414211ca5a48ea8018",
  measurementId: "G-DL66WWC20F",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);
const storage = getStorage(app);

export {
  auth,
  provider,
  db,
  doc,
  getDoc,
  updateDoc,
  onSnapshot,
  collection,
  storage,
  deleteObject,
  ref,
  deleteField,
  deleteDoc,
  getDownloadURL,
  uploadBytes,
  getDocs,
};
