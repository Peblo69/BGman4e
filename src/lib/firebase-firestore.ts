import { collection, query, where, orderBy, getDocs, addDoc, updateDoc, doc, serverTimestamp, getDoc, deleteDoc } from 'firebase/firestore';
import { firestore } from './firebase';
import { Message } from '../types/chat';

// Collection references
const chatSessionsCollection = collection(firestore, 'chatSessions');
const userProfilesCollection = collection(firestore, 'userProfiles');

// ChatSession type
export interface ChatSession {
  id: string;
  userId: string;
  title: string;
  messages: Message[];
  createdAt: any; // FirebaseFirestore.Timestamp
  updatedAt: any; // FirebaseFirestore.Timestamp
  deleted: boolean;
}

// UserProfile type
export interface UserProfile {
  userId: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  createdAt: any; // FirebaseFirestore.Timestamp
  lastLogin: any; // FirebaseFirestore.Timestamp
  messageCount: number;
  imageCount: number;
}

// Get user profile
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const userDocRef = doc(userProfilesCollection, userId);
    const userSnapshot = await getDoc(userDocRef);
    
    if (userSnapshot.exists()) {
      return { id: userSnapshot.id, ...userSnapshot.data() } as unknown as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
}

// Create or update user profile
export async function createOrUpdateUserProfile(userProfile: Partial<UserProfile>): Promise<string> {
  try {
    if (!userProfile.userId) {
      throw new Error('User ID is required');
    }
    
    const userDocRef = doc(userProfilesCollection, userProfile.userId);
    const userSnapshot = await getDoc(userDocRef);
    
    if (userSnapshot.exists()) {
      // Update existing profile
      await updateDoc(userDocRef, {
        ...userProfile,
        lastLogin: serverTimestamp()
      });
      return userProfile.userId;
    } else {
      // Create new profile
      await updateDoc(userDocRef, {
        ...userProfile,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        messageCount: 0,
        imageCount: 0
      });
      return userProfile.userId;
    }
  } catch (error) {
    console.error('Error creating/updating user profile:', error);
    throw error;
  }
}

// Get user's chat sessions
export async function getUserChatSessions(userId: string): Promise<ChatSession[]> {
  try {
    const q = query(
      chatSessionsCollection, 
      where('userId', '==', userId),
      where('deleted', '==', false),
      orderBy('updatedAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    } as unknown as ChatSession));
  } catch (error) {
    console.error('Error getting chat sessions:', error);
    return [];
  }
}

// Get chat session by ID
export async function getChatSessionById(id: string): Promise<ChatSession | null> {
  try {
    const docRef = doc(chatSessionsCollection, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as unknown as ChatSession;
    }
    return null;
  } catch (error) {
    console.error('Error getting chat session:', error);
    return null;
  }
}

// Create new chat session
export async function saveChatSession(userId: string, messages: Message[], title: string): Promise<string> {
  try {
    const docRef = await addDoc(chatSessionsCollection, {
      userId,
      title,
      messages,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      deleted: false
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error saving chat session:', error);
    throw error;
  }
}

// Update existing chat session
export async function updateChatSession(id: string, messages: Message[], title?: string): Promise<void> {
  try {
    const docRef = doc(chatSessionsCollection, id);
    const updateData: any = {
      messages,
      updatedAt: serverTimestamp()
    };
    
    if (title) {
      updateData.title = title;
    }
    
    await updateDoc(docRef, updateData);
  } catch (error) {
    console.error('Error updating chat session:', error);
    throw error;
  }
}

// Delete chat session (soft delete)
export async function deleteChatSession(id: string): Promise<void> {
  try {
    const docRef = doc(chatSessionsCollection, id);
    await updateDoc(docRef, {
      deleted: true,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error deleting chat session:', error);
    throw error;
  }
}

// Permanently delete chat session
export async function permanentlyDeleteChatSession(id: string): Promise<void> {
  try {
    const docRef = doc(chatSessionsCollection, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error permanently deleting chat session:', error);
    throw error;
  }
}

// Increment user message count
export async function incrementUserMessageCount(userId: string): Promise<void> {
  try {
    const userDocRef = doc(userProfilesCollection, userId);
    const userSnapshot = await getDoc(userDocRef);
    
    if (userSnapshot.exists()) {
      const userData = userSnapshot.data();
      await updateDoc(userDocRef, {
        messageCount: (userData.messageCount || 0) + 1,
        updatedAt: serverTimestamp()
      });
    }
  } catch (error) {
    console.error('Error incrementing message count:', error);
  }
}

// Increment user image count
export async function incrementUserImageCount(userId: string): Promise<void> {
  try {
    const userDocRef = doc(userProfilesCollection, userId);
    const userSnapshot = await getDoc(userDocRef);
    
    if (userSnapshot.exists()) {
      const userData = userSnapshot.data();
      await updateDoc(userDocRef, {
        imageCount: (userData.imageCount || 0) + 1,
        updatedAt: serverTimestamp()
      });
    }
  } catch (error) {
    console.error('Error incrementing image count:', error);
  }
}