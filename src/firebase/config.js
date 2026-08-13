import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getMessaging, isSupported } from 'firebase/messaging';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const isFirebaseConfigured = !!(
  firebaseConfig.apiKey &&
  firebaseConfig.apiKey !== '' &&
  firebaseConfig.apiKey !== 'YOUR_FIREBASE_API_KEY' &&
  !firebaseConfig.apiKey.startsWith('mock-')
);

// Initialize Firebase Services placeholder
let app = null;
let auth = null;
let db = null;
let storage = null;
let messaging = null;
let functions = null;
let googleProvider = null;

if (isFirebaseConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager()
      })
    });
    storage = getStorage(app);
    functions = getFunctions(app);
    
    // Providers
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({ prompt: 'select_account' });

    // Initialize messaging with isSupported checks (non-blocking for SSR / unsupported browsers)
    isSupported().then((supported) => {
      if (supported) {
        messaging = getMessaging(app);
      }
    }).catch((err) => {
      console.warn('Firebase Messaging is not supported in this environment.', err);
    });
  } catch (err) {
    console.error('Error initializing Firebase services:', err);
  }
}

export {
  app,
  auth,
  db,
  storage,
  messaging,
  functions,
  googleProvider,
  isFirebaseConfigured,
};
