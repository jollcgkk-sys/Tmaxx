import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  doc,
  updateDoc,
  serverTimestamp, 
  getDocs, 
  query, 
  orderBy 
} from "firebase/firestore";

// Declare the global config injected by Vite
declare const __FIREBASE_CONFIG__: any;

// Resolve Config
const injected = typeof __FIREBASE_CONFIG__ !== 'undefined' ? __FIREBASE_CONFIG__ : {};

// Helper to safely access Vite env vars
const getEnv = (key: string) => {
  try {
    // @ts-ignore
    return import.meta.env[key] || "";
  } catch (e) {
    return "";
  }
};

const firebaseConfig = {
  apiKey: injected.apiKey || getEnv("VITE_FIREBASE_API_KEY"),
  authDomain: injected.authDomain || getEnv("VITE_FIREBASE_AUTH_DOMAIN"),
  projectId: injected.projectId || getEnv("VITE_FIREBASE_PROJECT_ID"),
  storageBucket: injected.storageBucket || getEnv("VITE_FIREBASE_STORAGE_BUCKET"),
  messagingSenderId: injected.messagingSenderId || getEnv("VITE_FIREBASE_MESSAGING_SENDER_ID"),
  appId: injected.appId || getEnv("VITE_FIREBASE_APP_ID"),
  measurementId: injected.measurementId || getEnv("VITE_FIREBASE_MEASUREMENT_ID")
};

let app;
let dbInstance;

try {
  app = initializeApp(firebaseConfig);
  dbInstance = getFirestore(app);
  console.log("🔥 Firebase Initialized");
} catch (e: any) {
  console.error("❌ Firebase Init Error (Silent):", e.message);
  // No alerts, just log
}

export const db = dbInstance;

// Collection Name
const COLLECTION_NAME = "tabarak_aws_memories"; 

export interface ConversationLog {
  id: string;
  tabarakMessage: string;
  awsReply?: string;
  type: string;
  createdAt: Date;
}

/**
 * 1. Start a conversation log (Tabarak sends a message)
 */
export const logUserMessage = async (
  text: string, 
  type: string
): Promise<string | null> => {
  if (!db) {
    console.warn("⚠️ Firebase not connected. Skipping log.");
    return null;
  }

  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      tabarak_sent: text,
      aws_answered: null, 
      type: type,
      timestamp: serverTimestamp(),
      clientTime: new Date().toISOString()
    });
    console.log("✅ Message saved to Cloud. ID:", docRef.id);
    return docRef.id;
  } catch (error: any) {
    console.error("❌ FAILED to save to Firebase:", error);
    return null;
  }
};

/**
 * 2. Complete the conversation log (Aws answers)
 */
export const logAiResponse = async (
  docId: string, 
  aiText: string
) => {
  if (!db || !docId) return;

  try {
    const docRef = doc(db, COLLECTION_NAME, docId);
    await updateDoc(docRef, {
      aws_answered: aiText,
      responseTime: new Date().toISOString()
    });
    console.log("✅ Response updated in Cloud for ID:", docId);
  } catch (error: any) {
    console.error("❌ FAILED to update response:", error);
  }
};

/**
 * Fetch memories
 */
export const getMemories = async (): Promise<ConversationLog[]> => {
  if (!db) {
    return [];
  }

  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy("timestamp", "asc"));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      let date = new Date();
      if (data.timestamp && typeof data.timestamp.toDate === 'function') {
        date = data.timestamp.toDate();
      } else if (data.clientTime) {
        date = new Date(data.clientTime);
      }

      return {
        id: doc.id,
        tabarakMessage: data.tabarak_sent || "", 
        awsReply: data.aws_answered || "",       
        type: data.type || "general",
        createdAt: date
      };
    });
  } catch (error: any) {
    console.error("❌ Error fetching memories:", error);
    return [];
  }
};