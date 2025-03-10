import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Preinitialized instances for faster access
let firebaseApp: FirebaseApp | undefined;
let firebaseAuth: any;
let firebaseFirestore: any;

// Initialize Firebase with lazy loading pattern
const initializeFirebase = () => {
  if (typeof window === 'undefined') {
    return { app: undefined, auth: undefined, firestore: undefined };
  }
  
  // Return cached instances if already initialized
  if (firebaseApp && firebaseAuth && firebaseFirestore) {
    return { 
      app: firebaseApp, 
      auth: firebaseAuth, 
      firestore: firebaseFirestore 
    };
  }
  
  try {
    // Check if Firebase is already initialized
    if (!getApps().length) {
      // Initialize new instances
      firebaseApp = initializeApp(firebaseConfig);
      firebaseAuth = getAuth(firebaseApp);
      firebaseFirestore = getFirestore(firebaseApp);
      
      // Enable offline persistence but don't wait for it
      const enablePersistence = async () => {
        try {
          await enableIndexedDbPersistence(firebaseFirestore);
          console.log("Firebase persistence enabled");
        } catch (err: any) {
          // These errors are ok, don't need to show them
          if (err.code === 'failed-precondition') {
            // Multiple tabs open, persistence can only be enabled in one tab
            console.log("Persistence unavailable - multiple tabs");
          } else if (err.code === 'unimplemented') {
            // Current browser doesn't support persistence
            console.log("Persistence unavailable - unsupported browser");
          } else {
            console.warn("Firebase persistence error:", err);
          }
        }
      };
      
      // Enable persistence in the background without blocking
      if (typeof window !== 'undefined') {
        setTimeout(enablePersistence, 2000);
      }
    } else {
      // Return existing instances
      firebaseApp = getApps()[0];
      firebaseAuth = getAuth(firebaseApp);
      firebaseFirestore = getFirestore(firebaseApp);
    }
    
    return { 
      app: firebaseApp, 
      auth: firebaseAuth, 
      firestore: firebaseFirestore 
    };
  } catch (error) {
    console.error("Failed to initialize Firebase:", error);
    return { app: undefined, auth: undefined, firestore: undefined };
  }
};

// Initialize immediately but without blocking rendering
const { app, auth, firestore } = initializeFirebase();

// Expose a function to preload and initialize Firebase early
export function preloadFirebase() {
  if (!app || !auth || !firestore) {
    initializeFirebase();
  }
  return { app, auth, firestore };
}

// Export the instances
export { app, auth, firestore };