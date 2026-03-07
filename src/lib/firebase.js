import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: 'AIzaSyDLYgqo2E1UiHoydEB6-WfFc119HES2U5c',
    authDomain: 'tk-design-f43f6.firebaseapp.com',
    projectId: 'tk-design-f43f6',
    storageBucket: 'tk-design-f43f6.firebasestorage.app',
    messagingSenderId: '729667300921',
    appId: '1:729667300921:web:5061be8d41f10707a727e8'
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
