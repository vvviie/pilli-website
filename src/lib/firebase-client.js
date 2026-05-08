import { getApp, getApps, initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const firebaseConfigValues = Object.values(firebaseConfig);
const hasFirebaseConfig = firebaseConfigValues.every(Boolean);
const firebaseApp = hasFirebaseConfig
  ? getApps().length > 0
    ? getApp()
    : initializeApp(firebaseConfig)
  : null;

export { firebaseApp, hasFirebaseConfig };
