import { initializeApp } from 'firebase/app';
import { getAuth, getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: 'AIzaSyDb8eusYyPQageh43ZaHDs8iWgCc_a69oU',
  authDomain: 'prashworld-4897b.firebaseapp.com',
  projectId: 'prashworld-4897b',
  storageBucket: 'prashworld-4897b.firebasestorage.app',
  messagingSenderId: '742724782485',
  appId: '1:742724782485:web:REPLACE_WITH_WEB_APP_ID',
};

const app = initializeApp(firebaseConfig);

// On web, use getAuth() with default browser persistence
// On native (iOS/Android), use initializeAuth with AsyncStorage
let auth;
if (Platform.OS === 'web') {
  auth = getAuth(app);
} else {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
}

export { auth };
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
