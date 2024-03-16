// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { /* connectFirestoreEmulator, */ getFirestore } from 'firebase/firestore';
import { /* connectStorageEmulator, */ getStorage } from 'firebase/storage';
// import { isDev } from '../isDev';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: 'AIzaSyDiJx7fyOjFcxgalRBKhh1F4aa9Jwgwjks',
    authDomain: 'miniextensions-challenge-c978d.firebaseapp.com',
    projectId: 'miniextensions-challenge-c978d',
    storageBucket: 'miniextensions-challenge-c978d.appspot.com',
    messagingSenderId: '737761220861',
    appId: '1:737761220861:web:554101867cd9a5667d4694',
};

// Initialize Firebase
export const firebaseApp = initializeApp(firebaseConfig);

export const firestore = getFirestore(firebaseApp);
export const baseBucketName = 'miniExtensions-challenge';

/* if (isDev) {
    connectFirestoreEmulator(firestore, '127.0.0.1', 8081);
} */
