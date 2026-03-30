import { createContext, useContext, useState, useEffect } from 'react';
import {
  auth,
  db,
  registerUser,
  loginUser,
  loginWithGoogle,
  logoutUser,
  resetPassword,
  onAuthStateChanged
} from '../services/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { USER_ROLES } from '../utils/constants';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Create or get user profile from Firestore
  const getUserProfile = async (firebaseUser) => {
    if (!firebaseUser) return null;

    const userRef = doc(db, 'users', firebaseUser.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return { id: userSnap.id, ...userSnap.data() };
    }

    // Create new user profile (default = USER)
    const newProfile = {
      email: firebaseUser.email,
      displayName: firebaseUser.displayName || '',
      photoURL: firebaseUser.photoURL || '',
      role: USER_ROLES.USER,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(userRef, newProfile);
    return { id: firebaseUser.uid, ...newProfile };
  };

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      try {
        if (firebaseUser) {
          setUser(firebaseUser);
          const profile = await getUserProfile(firebaseUser);
          setUserProfile(profile);
        } else {
          setUser(null);
          setUserProfile(null);
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Register new user
  const register = async (email, password, displayName) => {
    setError(null);
    try {
      const firebaseUser = await registerUser(email, password, displayName);

      const userRef = doc(db, 'users', firebaseUser.uid);
      const newProfile = {
        email: firebaseUser.email,
        displayName: displayName,
        photoURL: '',
        role: USER_ROLES.USER,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(userRef, newProfile);

      return firebaseUser;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Login
  const login = async (email, password) => {
    setError(null);
    try {
      const firebaseUser = await loginUser(email, password);
      return firebaseUser;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Google Login
  const googleLogin = async () => {
    setError(null);
    try {
      const firebaseUser = await loginWithGoogle();
      return firebaseUser;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Logout
  const logout = async () => {
    setError(null);
    try {
      await logoutUser();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Reset password
  const forgotPassword = async (email) => {
    setError(null);
    try {
      await resetPassword(email);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Admin check (based on Firestore role)
  const isAdmin = userProfile?.role === USER_ROLES.ADMIN;

  // Update profile
  const updateUserProfile = async (data) => {
    if (!user) return;

    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, {
      ...userProfile,
      ...data,
      updatedAt: serverTimestamp(),
    }, { merge: true });

    setUserProfile(prev => ({ ...prev, ...data }));
  };

  const value = {
    user,
    userProfile,
    loading,
    error,
    register,
    login,
    googleLogin,
    logout,
    forgotPassword,
    isAdmin,
    updateUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;