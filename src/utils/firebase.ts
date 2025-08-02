// src/utils/firebase.ts

import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// Declare global variables provided by the Canvas environment.
// These are essential for Firebase initialization in this specific setup.
declare const __firebase_config: string;
declare const __initial_auth_token: string;
declare const __app_id: string; // App ID for Firestore collection paths

let firebaseAppInstance: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;

/**
 * Initializes the Firebase application and returns its instances.
 * This function ensures Firebase is only initialized once.
 * @returns An object containing the Firebase app, auth, and firestore instances.
 */
export const initializeFirebase = () => {
  if (firebaseAppInstance) {
    // If Firebase is already initialized, return existing instances
    return {
      app: firebaseAppInstance,
      auth: authInstance!,
      db: dbInstance!,
    };
  }

  try {
    // Parse the Firebase configuration from the global variable
    const firebaseConfig = JSON.parse(__firebase_config);

    // Initialize Firebase app
    firebaseAppInstance = initializeApp(firebaseConfig);

    // Get Auth and Firestore instances
    authInstance = getAuth(firebaseAppInstance);
    dbInstance = getFirestore(firebaseAppInstance);

    console.log('Firebase initialized successfully.');

    return {
      app: firebaseAppInstance,
      auth: authInstance,
      db: dbInstance,
    };
  } catch (error) {
    console.error('Error initializing Firebase:', error);
    // Re-throw the error to be handled by the calling component (e.g., App.tsx)
    throw error;
  }
};

// Export the instances directly for convenience after potential initialization
// Note: These will be null until initializeFirebase is called.
// In App.tsx, we ensure it's called before rendering child components.
export const getFirebaseInstances = () => {
  if (!firebaseAppInstance || !authInstance || !dbInstance) {
    console.warn('Firebase instances accessed before initialization. Call initializeFirebase first.');
    // Attempt to initialize if not already, or throw if it fails
    return initializeFirebase();
  }
  return {
    app: firebaseAppInstance,
    auth: authInstance,
    db: dbInstance,
  };
};

// Export global app ID for use in Firestore paths
export const getAppId = (): string => {
  return typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
};
