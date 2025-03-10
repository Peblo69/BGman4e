import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User as FirebaseUser, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  updateEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { auth, firestore } from './firebase';
import { getUserProfile, createOrUpdateUserProfile, incrementUserMessageCount, incrementUserImageCount } from './firebase-firestore';
import { getFirebaseErrorMessage } from './firebase-error-messages';

// Define the User type
type User = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
};

type ProfileUpdateData = {
  name?: string;
  photoURL?: string;
};

// Define the context type
type FirebaseAuthContextType = {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<User>;
  signUp: (email: string, password: string, name?: string) => Promise<User>;
  logOut: () => Promise<void>;
  imageCount: number;
  incrementImageCount: () => void;
  messageCount: number;
  incrementMessageCount: () => void;
  hasReachedMessageLimit: boolean;
  updateUserProfile: (data: ProfileUpdateData) => Promise<boolean>;
  updateUserEmail: (newEmail: string, password: string) => Promise<boolean>;
  updateUserPassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
};

// Message limit for unauthenticated users
const MESSAGE_LIMIT_FOR_UNAUTHENTICATED = 5;

// Create context with default values
const FirebaseAuthContext = createContext<FirebaseAuthContextType>({
  user: null,
  isLoading: true,
  signIn: async () => { throw new Error('Not implemented'); },
  signUp: async () => { throw new Error('Not implemented'); },
  logOut: async () => { throw new Error('Not implemented'); },
  imageCount: 0,
  incrementImageCount: () => {},
  messageCount: 0,
  incrementMessageCount: () => {},
  hasReachedMessageLimit: false,
  updateUserProfile: async () => false,
  updateUserEmail: async () => false,
  updateUserPassword: async () => false
});

// Convert FirebaseUser to our User type
const formatUser = (user: FirebaseUser): User => ({
  uid: user.uid,
  email: user.email,
  displayName: user.displayName,
  photoURL: user.photoURL
});

// Provider component
export function FirebaseAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [imageCount, setImageCount] = useState(0);
  const [messageCount, setMessageCount] = useState(0);

  // Sign in with email and password
  const signIn = async (email: string, password: string): Promise<User> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const formattedUser = formatUser(userCredential.user);
      
      // Update user profile with login timestamp
      await createOrUpdateUserProfile({
        userId: formattedUser.uid,
        email: formattedUser.email,
        displayName: formattedUser.displayName
      });
      
      return formattedUser;
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw new Error(getFirebaseErrorMessage(error));
    }
  };

  // Sign up with email and password
  const signUp = async (email: string, password: string, name?: string): Promise<User> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update profile with display name if provided
      if (name) {
        await updateProfile(user, {
          displayName: name
        });
      }
      
      // Create user profile
      await createOrUpdateUserProfile({
        userId: user.uid,
        email: user.email,
        displayName: name || null
      });
      
      return formatUser(user);
    } catch (error: any) {
      console.error('Sign up error:', error);
      throw new Error(getFirebaseErrorMessage(error));
    }
  };

  // Sign out
  const logOut = async (): Promise<void> => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Sign out error:', error);
      throw new Error(getFirebaseErrorMessage(error));
    }
  };

  // Update user profile
  const updateUserProfile = async (data: ProfileUpdateData): Promise<boolean> => {
    if (!auth.currentUser) return false;
    
    try {
      await updateProfile(auth.currentUser, {
        displayName: data.name || auth.currentUser.displayName,
        photoURL: data.photoURL || auth.currentUser.photoURL
      });
      
      // Update local user state
      setUser(prev => {
        if (!prev) return null;
        return {
          ...prev,
          displayName: data.name || prev.displayName,
          photoURL: data.photoURL || prev.photoURL
        };
      });
      
      // Update in Firestore if needed
      if (user) {
        await createOrUpdateUserProfile({
          userId: user.uid,
          displayName: data.name || user.displayName
        });
      }
      
      return true;
    } catch (error) {
      console.error("Failed to update profile:", error);
      throw new Error(getFirebaseErrorMessage(error));
    }
  };

  // Update user email
  const updateUserEmail = async (newEmail: string, password: string): Promise<boolean> => {
    if (!auth.currentUser || !auth.currentUser.email) return false;
    
    try {
      // Re-authenticate user first
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email, 
        password
      );
      await reauthenticateWithCredential(auth.currentUser, credential);
      
      // Update email
      await updateEmail(auth.currentUser, newEmail);
      
      // Update local state
      setUser(prev => {
        if (!prev) return null;
        return {
          ...prev,
          email: newEmail
        };
      });
      
      return true;
    } catch (error) {
      console.error("Failed to update email:", error);
      throw new Error(getFirebaseErrorMessage(error));
    }
  };

  // Update user password
  const updateUserPassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    if (!auth.currentUser || !auth.currentUser.email) return false;
    
    try {
      // Re-authenticate user first
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email, 
        currentPassword
      );
      await reauthenticateWithCredential(auth.currentUser, credential);
      
      // Update password
      await updatePassword(auth.currentUser, newPassword);
      
      return true;
    } catch (error) {
      console.error("Failed to update password:", error);
      throw new Error(getFirebaseErrorMessage(error));
    }
  };

  // Function to increment image count
  const incrementImageCount = () => {
    setImageCount((prevCount) => {
      const newCount = prevCount + 1;
      // If user is authenticated, update the count in Firestore
      if (user) {
        incrementUserImageCount(user.uid).catch(console.error);
      }
      return newCount;
    });
  };

  // Function to increment message count
  const incrementMessageCount = () => {
    setMessageCount((prevCount) => {
      const newCount = prevCount + 1;
      // If user is authenticated, update the count in Firestore
      if (user) {
        incrementUserMessageCount(user.uid).catch(console.error);
      }
      return newCount;
    });
  };

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setIsLoading(true);
      
      try {
        if (firebaseUser) {
          // User is signed in
          const formattedUser = formatUser(firebaseUser);
          setUser(formattedUser);
          
          // Get user profile from Firestore
          const userProfile = await getUserProfile(formattedUser.uid);
          if (userProfile) {
            // Set counts from user profile
            setMessageCount(userProfile.messageCount || 0);
            setImageCount(userProfile.imageCount || 0);
          }
        } else {
          // User is signed out
          setUser(null);
          setMessageCount(0);
          setImageCount(0);
        }
      } catch (error) {
        console.error("Error processing auth change:", error);
      } finally {
        setIsLoading(false);
      }
    });
    
    return () => unsubscribe();
  }, []);

  // Check if user has reached the message limit
  const hasReachedMessageLimit = !user && messageCount >= MESSAGE_LIMIT_FOR_UNAUTHENTICATED;

  const value = {
    user,
    isLoading,
    signIn,
    signUp,
    logOut,
    imageCount,
    incrementImageCount,
    messageCount,
    incrementMessageCount,
    hasReachedMessageLimit,
    updateUserProfile,
    updateUserEmail,
    updateUserPassword
  };

  return (
    <FirebaseAuthContext.Provider value={value}>
      {children}
    </FirebaseAuthContext.Provider>
  );
}

// Hook for using the auth context
export function useFirebaseAuth() {
  const context = useContext(FirebaseAuthContext);
  if (context === undefined) {
    throw new Error('useFirebaseAuth must be used within a FirebaseAuthProvider');
  }
  return context;
}