// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, collection, addDoc, onSnapshot } from 'firebase/firestore';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDwGABZdLCYjneWgqeGevGyjDY4EBEvvRg",
  authDomain: "react-cursos-44513.firebaseapp.com",
  projectId: "react-cursos-44513",
  storageBucket: "react-cursos-44513.appspot.com",
  messagingSenderId: "816025142660",
  appId: "1:816025142660:web:c6943ecfffa55b4cab89d1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

const db = getFirestore(app);

export { auth, googleProvider, db };