import React, { useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { AuthContext } from './authContextValue';

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper to safely cache profile to localStorage
  const cacheProfile = (uid, profile) => {
    try {
      if (profile) {
        localStorage.setItem(`fixit_profile_${uid}`, JSON.stringify(profile));
      } else {
        localStorage.removeItem(`fixit_profile_${uid}`);
      }
    } catch (e) {
      console.warn('Failed to save profile to localStorage cache:', e);
    }
  };

  // Helper to load profile from localStorage cache
  const getCachedProfile = (uid) => {
    try {
      const cached = localStorage.getItem(`fixit_profile_${uid}`);
      return cached ? JSON.parse(cached) : null;
    } catch (e) {
      console.warn('Failed to retrieve profile from localStorage cache:', e);
      return null;
    }
  };

  // Sign up a new user
  const signup = async (email, password, name, role = 'customer') => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    const finalRole = email.trim().toLowerCase() === 'michaeloliyide86@gmail.com' ? 'admin' : role;
    
    // Initialize profile metadata document in Firestore
    const defaultProfile = {
      uid: user.uid,
      name,
      email,
      role: finalRole,
      walletBalance: finalRole === 'customer' ? 30000 : 0, // default gift starting balance for customers to test escrow
      avatarText: name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2),
      isVerified: finalRole === 'admin',
      isEmergency: false,
      createdAt: new Date().toISOString(),
      profile: finalRole === 'artisan' ? {
        bio: 'Professional trade artisan ready to resolve service issues.',
        skills: [],
        certifications: [],
        hourlyRate: 5000,
        location: 'Lekki, Lagos',
        rating: 5.0,
        completedJobs: 0,
        responseTime: '30 mins'
      } : {}
    };

    try {
      await setDoc(doc(db, 'users', user.uid), defaultProfile);
    } catch (err) {
      console.warn('Firestore setDoc failed on signup (offline mode). Caching profile locally.', err);
    }
    
    setUserProfile(defaultProfile);
    cacheProfile(user.uid, defaultProfile);
    return { user, profile: defaultProfile };
  };

  // Sign in existing user
  const login = async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;
    let finalProfile = null;
    
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const profileData = docSnap.data();
        setUserProfile(profileData);
        cacheProfile(uid, profileData);
        finalProfile = profileData;
      }
    } catch (err) {
      console.warn('Firestore getDoc failed on login. Checking local cache...', err);
      const cached = getCachedProfile(uid);
      if (cached) {
        setUserProfile(cached);
        finalProfile = cached;
      } else {
        // Fallback default structure
        const defaultProfile = {
          uid,
          name: userCredential.user.displayName || 'Fix-It User',
          email: userCredential.user.email,
          role: 'customer',
          walletBalance: 0,
          avatarText: 'FI',
          isVerified: false,
          isEmergency: false,
          createdAt: new Date().toISOString(),
          profile: {}
        };
        setUserProfile(defaultProfile);
        finalProfile = defaultProfile;
      }
    }
    return { user: userCredential.user, profile: finalProfile };
  };

  // Sign out user
  const logout = () => {
    if (currentUser) {
      cacheProfile(currentUser.uid, null);
    }
    setUserProfile(null);
    return signOut(auth);
  };

  // Reset password
  const resetPassword = (email) => {
    return sendPasswordResetEmail(auth, email);
  };

  // Update profile attributes in Firestore
  const updateProfile = async (updates) => {
    if (!currentUser) return;
    const docRef = doc(db, 'users', currentUser.uid);
    const updatedProfile = { ...userProfile, ...updates };
    
    try {
      await updateDoc(docRef, updates);
    } catch (err) {
      console.warn('Firestore updateDoc failed (offline mode). Syncing locally.', err);
    }
    
    setUserProfile(updatedProfile);
    cacheProfile(currentUser.uid, updatedProfile);
  };

  // Observe Authentication state transitions
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        setCurrentUser(user);
        if (user) {
          try {
            // Fetch profile
            const docRef = doc(db, 'users', user.uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              const profileData = docSnap.data();
              setUserProfile(profileData);
              cacheProfile(user.uid, profileData);
            } else {
              // Fallback if document does not exist yet (e.g. Google Sign In first time)
              const name = user.displayName || 'Fix-It User';
              const finalRole = user.email?.trim().toLowerCase() === 'michaeloliyide86@gmail.com' ? 'admin' : 'customer';
              const defaultProfile = {
                uid: user.uid,
                name,
                email: user.email,
                role: finalRole,
                walletBalance: 30000,
                avatarText: name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2),
                isVerified: finalRole === 'admin',
                isEmergency: false,
                createdAt: new Date().toISOString(),
                profile: {}
              };
              await setDoc(docRef, defaultProfile);
              setUserProfile(defaultProfile);
              cacheProfile(user.uid, defaultProfile);
            }
          } catch (err) {
            console.warn('Failed to fetch user profile from Firestore (possibly offline). Checking cache...', err);
            const cached = getCachedProfile(user.uid);
            if (cached) {
              setUserProfile(cached);
            } else {
              // Create a temporary offline profile fallback
              const name = user.displayName || 'Offline User';
              const fallbackProfile = {
                uid: user.uid,
                name,
                email: user.email,
                role: 'customer', // default fallback
                walletBalance: 0,
                avatarText: name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2),
                isVerified: false,
                isEmergency: false,
                createdAt: new Date().toISOString(),
                profile: {},
                isOfflineFallback: true
              };
              setUserProfile(fallbackProfile);
            }
          }
        } else {
          setUserProfile(null);
        }
      } catch (globalAuthErr) {
        console.error('Unexpected error in auth observer:', globalAuthErr);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    loading,
    signup,
    login,
    logout,
    resetPassword,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
