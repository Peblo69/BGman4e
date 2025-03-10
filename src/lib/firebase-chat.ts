import { 
  collection, 
  addDoc, 
  updateDoc, 
  getDocs, 
  getDoc, 
  doc, 
  query, 
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
  runTransaction,
  deleteDoc,
  limit
} from 'firebase/firestore';
import { firestore } from './firebase';
import { Message, ImageAttachment } from '../types/chat';

export type ChatSession = {
  id: string;
  userId: string;
  title: string;
  messages: Message[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  deleted?: boolean;
};

// Collection references
const SESSIONS_COLLECTION = 'chatSessions';

// In-memory cache for chat sessions
const sessionCache = new Map<string, {data: ChatSession, timestamp: number}>();
const SESSION_CACHE_TTL = 60000; // 1 minute cache TTL

// Save a new chat session
export async function saveChatSession(userId: string, messages: Message[], title: string = "New Chat"): Promise<string> {
  try {
    if (!firestore) throw new Error("Firestore not initialized");
    
    // Sanitize messages to ensure they're Firestore-compatible
    const sanitizedMessages = sanitizeMessagesForFirestore(messages);
    
    const sessionsRef = collection(firestore, SESSIONS_COLLECTION);
    const docRef = await addDoc(sessionsRef, {
      userId,
      title,
      messages: sanitizedMessages,
      deleted: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return docRef.id;
  } catch (error) {
    console.error("Error saving chat session:", error);
    throw error;
  }
}

// Update an existing chat session
export async function updateChatSession(sessionId: string, messages: Message[]): Promise<boolean> {
  try {
    if (!firestore) throw new Error("Firestore not initialized");
    
    // Sanitize messages to ensure they're Firestore-compatible
    const sanitizedMessages = sanitizeMessagesForFirestore(messages);
    
    const sessionRef = doc(firestore, SESSIONS_COLLECTION, sessionId);
    
    try {
      await updateDoc(sessionRef, {
        messages: sanitizedMessages,
        updatedAt: serverTimestamp()
      });
      
      // Update cache if exists
      if (sessionCache.has(sessionId)) {
        const cachedSession = sessionCache.get(sessionId);
        if (cachedSession) {
          sessionCache.set(sessionId, {
            data: {
              ...cachedSession.data,
              messages: sanitizedMessages,
              updatedAt: Timestamp.now()
            },
            timestamp: Date.now()
          });
        }
      }
    } catch (error) {
      console.error("Transaction failed:", error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error("Error updating chat session:", error);
    throw error;
  }
}

/**
 * Sanitize messages to ensure they can be stored in Firestore
 * This creates a deep copy with only serializable properties
 */
function sanitizeMessagesForFirestore(messages: Message[]): any[] {
  return messages.map(message => {
    // Create a new clean message object
    const cleanMessage: any = {
      id: message.id,
      content: message.content,
      role: message.role,
      timestamp: message.timestamp
    };
    
    // Handle images if present
    if (message.images && message.images.length > 0) {
      cleanMessage.images = message.images.map(img => sanitizeImageForFirestore(img));
    }
    
    return cleanMessage;
  });
}

/**
 * Sanitize image attachment for Firestore
 * This creates a clean copy with only serializable properties
 */
function sanitizeImageForFirestore(image: ImageAttachment): any {
  // Create a clean image object with only the properties we need
  const cleanImage: any = {
    id: image.id,
    url: image.url,
    filename: image.filename,
    contentType: image.contentType,
    size: image.size
  };
  
  // Only add optional properties if they exist
  if (image.thumbnailUrl) cleanImage.thumbnailUrl = image.thumbnailUrl;
  if (image.width) cleanImage.width = image.width;
  if (image.height) cleanImage.height = image.height;
  
  // Handle analysis result if present
  if (image.analysisResult) {
    cleanImage.analysisResult = {
      description: image.analysisResult.description || '',
      source: image.analysisResult.source || 'local'
    };
    
    // Handle labels array separately to ensure it's clean
    if (image.analysisResult.labels && Array.isArray(image.analysisResult.labels)) {
      cleanImage.analysisResult.labels = image.analysisResult.labels
        .filter(label => typeof label === 'string')
        .slice(0, 20); // Limit to 20 labels max
    } else {
      cleanImage.analysisResult.labels = ['image'];
    }
  }
  
  return cleanImage;
}

// Update just the title of a chat session
export async function updateChatSessionTitle(sessionId: string, title: string): Promise<boolean> {
  try {
    if (!firestore) throw new Error("Firestore not initialized");
    
    const sessionRef = doc(firestore, SESSIONS_COLLECTION, sessionId);
    
    await updateDoc(sessionRef, {
      title,
      updatedAt: serverTimestamp()
    });
    
    // Update cache if exists
    if (sessionCache.has(sessionId)) {
      const cachedSession = sessionCache.get(sessionId);
      if (cachedSession) {
        sessionCache.set(sessionId, {
          data: {
            ...cachedSession.data,
            title,
            updatedAt: Timestamp.now()
          },
          timestamp: Date.now()
        });
      }
    }
    
    return true;
  } catch (error) {
    console.error("Error updating chat session title:", error);
    throw error;
  }
}

// Get a specific chat session by ID with caching
export async function getChatSessionById(sessionId: string): Promise<ChatSession | null> {
  try {
    if (!firestore) throw new Error("Firestore not initialized");
    
    // Check cache first
    const cachedSession = sessionCache.get(sessionId);
    if (cachedSession && (Date.now() - cachedSession.timestamp < SESSION_CACHE_TTL)) {
      console.log("Using cached chat session:", sessionId);
      return cachedSession.data;
    }
    
    const sessionRef = doc(firestore, SESSIONS_COLLECTION, sessionId);
    const sessionSnap = await getDoc(sessionRef);
    
    if (!sessionSnap.exists()) {
      return null;
    }
    
    const data = sessionSnap.data();
    
    // If marked as deleted, return null
    if (data.deleted === true) {
      return null;
    }
    
    const sessionData = {
      id: sessionSnap.id,
      userId: data.userId,
      title: data.title,
      messages: data.messages || [],
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      deleted: data.deleted || false
    };
    
    // Update cache
    sessionCache.set(sessionId, {
      data: sessionData,
      timestamp: Date.now()
    });
    
    return sessionData;
  } catch (error) {
    console.error("Error getting chat session:", error);
    throw error;
  }
}

// Get all chat sessions for a user with optimized loading
let userSessionsCache: {userId: string, sessions: ChatSession[], timestamp: number} | null = null;
const USER_SESSIONS_CACHE_TTL = 30000; // 30 seconds cache TTL

export async function getUserChatSessions(userId: string): Promise<ChatSession[]> {
  try {
    if (!firestore) throw new Error("Firestore not initialized");
    if (!userId) throw new Error("User ID is required");
    
    // Check cache first
    if (userSessionsCache && 
        userSessionsCache.userId === userId && 
        (Date.now() - userSessionsCache.timestamp < USER_SESSIONS_CACHE_TTL)) {
      console.log("Using cached user chat sessions");
      return userSessionsCache.sessions;
    }
    
    const sessionsRef = collection(firestore, SESSIONS_COLLECTION);
    
    // First try two-condition query - this is simpler but requires a composite index
    try {
      // Try the query with composite index first
      const q = query(
        sessionsRef, 
        where("userId", "==", userId),
        where("deleted", "==", false),
        orderBy("updatedAt", "desc"),
        limit(20) // Limit to recent chats for better performance
      );
      
      const sessionsSnap = await getDocs(q);
      const sessions = processQuerySnapshot(sessionsSnap, true);
      
      // Update cache
      userSessionsCache = {
        userId,
        sessions,
        timestamp: Date.now()
      };
      
      return sessions;
    } catch (indexError) {
      console.warn("Composite index query failed:", indexError);
      
      // Fallback to simpler query if composite index doesn't exist
      try {
        // Simpler query that doesn't need composite index
        const q = query(
          sessionsRef, 
          where("userId", "==", userId),
          orderBy("updatedAt", "desc"),
          limit(15) // Lower limit for fallback query
        );
        
        const sessionsSnap = await getDocs(q);
        // Filter deleted items client-side
        const sessions = processQuerySnapshot(sessionsSnap, true);
        const filteredSessions = sessions.filter(session => session.deleted !== true);
        
        // Update cache
        userSessionsCache = {
          userId,
          sessions: filteredSessions,
          timestamp: Date.now()
        };
        
        return filteredSessions;
      } catch (fallbackError) {
        console.error("Fallback query failed:", fallbackError);
        
        // Last resort - try without ordering
        try {
          const q = query(
            sessionsRef, 
            where("userId", "==", userId),
            limit(10) // Even lower limit for last resort
          );
          
          const sessionsSnap = await getDocs(q);
          const sessions = processQuerySnapshot(sessionsSnap, true);
          
          // Filter and sort client-side
          const filteredSortedSessions = sessions
            .filter(session => session.deleted !== true)
            .sort((a, b) => {
              // Try to sort by updatedAt timestamp if available
              if (a.updatedAt && b.updatedAt) {
                return b.updatedAt.seconds - a.updatedAt.seconds;
              }
              return 0;
            });
          
          // Update cache
          userSessionsCache = {
            userId,
            sessions: filteredSortedSessions,
            timestamp: Date.now()
          };
          
          return filteredSortedSessions;
        } catch (lastResortError) {
          console.error("Last resort query failed:", lastResortError);
          return [];
        }
      }
    }
  } catch (error) {
    console.error("Error getting user chat sessions:", error);
    return []; // Return empty array instead of throwing
  }
}

// Helper to process query snapshots
function processQuerySnapshot(snapshot: any, skipMessages = false): ChatSession[] {
  const sessions: ChatSession[] = [];
  
  snapshot.forEach((doc: any) => {
    const data = doc.data();
    
    // For sidebar rendering, we don't need the messages at all
    const messages = skipMessages ? [] : 
      (data.messages && Array.isArray(data.messages) ? 
        data.messages.slice(-50) : // Only keep the most recent 50 messages for performance
        []);
    
    sessions.push({
      id: doc.id,
      userId: data.userId,
      title: data.title || "Unnamed Chat",
      messages: messages,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      deleted: data.deleted || false
    });
  });
  
  return sessions;
}

// Delete a chat session (soft delete)
export async function deleteChatSession(sessionId: string): Promise<boolean> {
  try {
    if (!firestore) throw new Error("Firestore not initialized");
    
    const sessionRef = doc(firestore, SESSIONS_COLLECTION, sessionId);
    
    // Remove from cache first
    sessionCache.delete(sessionId);
    
    // Also update user sessions cache if needed
    if (userSessionsCache) {
      userSessionsCache.sessions = userSessionsCache.sessions.filter(s => s.id !== sessionId);
    }
    
    // First try to safely soft-delete
    try {
      await updateDoc(sessionRef, {
        deleted: true,
        updatedAt: serverTimestamp()
      });
    } catch (updateError) {
      // If update fails, try hard delete as fallback
      console.warn("Soft delete failed, attempting hard delete:", updateError);
      await deleteDoc(sessionRef);
    }
    
    return true;
  } catch (error) {
    console.error("Error deleting chat session:", error);
    return false; // Return false instead of throwing
  }
}

// Clear all caches
export function clearChatCaches() {
  sessionCache.clear();
  userSessionsCache = null;
  console.log("Chat caches cleared");
}