// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { type User, connectAuthEmulator, getAuth } from 'firebase/auth';
import {
	connectFirestoreEmulator,
	initializeFirestore,
	persistentLocalCache,
	persistentMultipleTabManager
} from 'firebase/firestore';

// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
	apiKey: 'AIzaSyDUetMIlbgGkHjMX1BcemFc6_BGJwvVkZo',
	authDomain: 'chat-os-narze.firebaseapp.com',
	projectId: 'chat-os-narze',
	storageBucket: 'chat-os-narze.appspot.com',
	messagingSenderId: '885484985120',
	appId: '1:885484985120:web:b5aa3a41d2d0dae8d19545',
	measurementId: 'G-7S1X0V3H4Z'
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const firestore = initializeFirestore(app, {
	localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
});

// Connect to Firebase Emulator
if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
	const firebaseEmulatorHost = import.meta.env.VITE_FIREBASE_EMULATOR_HOST || 'localhost';
	console.log({ firebaseEmulatorHost });

	connectAuthEmulator(auth, `http://${firebaseEmulatorHost}:9099`);
	connectFirestoreEmulator(firestore, firebaseEmulatorHost, 8080);
}

// Function to get the user state
export async function getUserAuthState(): Promise<User | null> {
	return new Promise((resolve, reject) => {
		const unsubscribe = auth.onAuthStateChanged((user) => {
			unsubscribe(); // Unsubscribe the listener once it's triggered
			resolve(user); // Resolve the promise with the user object
		}, reject);
	});
}
