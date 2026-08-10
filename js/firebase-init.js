import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, serverTimestamp, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

const firebaseConfig = {
    apiKey: 'AIzaSyDLYgqo2E1UiHoydEB6-WfFc119HES2U5c',
    authDomain: 'tk-design-f43f6.firebaseapp.com',
    projectId: 'tk-design-f43f6',
    storageBucket: 'tk-design-f43f6.firebasestorage.app',
    messagingSenderId: '729667300921',
    appId: '1:729667300921:web:5061be8d41f10707a727e8'
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, db, storage, googleProvider, signInWithPopup, signOut, onAuthStateChanged, collection, addDoc, getDocs, query, orderBy, serverTimestamp, ref, uploadBytesResumable, getDownloadURL, deleteDoc, doc, deleteObject };
