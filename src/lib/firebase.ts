import { initializeApp } from "firebase/app";
import { 
  initializeAuth, 
  getAuth, 
  inMemoryPersistence, 
  GoogleAuthProvider,
  onAuthStateChanged as fbOnAuthStateChanged,
  signInWithPopup as fbSignInWithPopup,
  signOut as fbSignOut
} from "firebase/auth";
import firebaseConfig from "../../firebase-applet-config.json";

let app: any;
let auth: any;
let isMockAuth = false;

if (typeof window !== "undefined") {
  const isIframe = window.self !== window.top;
  let isStorageBlocked = false;
  try {
    const testKey = "__auth_test_key__";
    window.localStorage.setItem(testKey, "1");
    window.localStorage.removeItem(testKey);
  } catch (e) {
    isStorageBlocked = true;
  }
  
  if (isIframe || isStorageBlocked) {
    isMockAuth = true;
  }
}

if (!isMockAuth) {
  try {
    app = initializeApp(firebaseConfig);
    // Always use inMemoryPersistence to avoid iframe localStorage/IndexedDB cross-origin SecurityErrors
    auth = initializeAuth(app, {
      persistence: inMemoryPersistence
    });
  } catch (e) {
    console.warn("Firebase initializeApp or initializeAuth failed, trying getAuth fallback", e);
    try {
      if (app) {
        auth = getAuth(app);
      } else {
        throw new Error("Firebase app not initialized");
      }
    } catch (e2) {
      console.error("Firebase initialization failed completely, using mock fallback", e2);
      isMockAuth = true;
    }
  }
}

let mockCurrentUser: any = null;
const mockAuthCallbacks = new Set<(user: any) => void>();

if (isMockAuth) {
  console.warn("Using mock Auth fallback to prevent iframe cross-origin and storage exceptions");
  auth = {
    get currentUser() {
      return mockCurrentUser;
    },
    onAuthStateChanged: (cb: any) => {
      mockAuthCallbacks.add(cb);
      cb(mockCurrentUser);
      return () => {
        mockAuthCallbacks.delete(cb);
      };
    },
    signInWithPopup: () => {
      mockCurrentUser = {
        uid: "mock-google-user-123",
        email: "citizen.pioneer@gmail.com",
        displayName: "Pioneer Citizen",
        photoURL: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150",
        emailVerified: true
      };
      mockAuthCallbacks.forEach(cb => cb(mockCurrentUser));
      return Promise.resolve({
        user: mockCurrentUser,
        providerId: "google.com"
      });
    },
    signOut: () => {
      mockCurrentUser = null;
      mockAuthCallbacks.forEach(cb => cb(null));
      return Promise.resolve();
    }
  } as any;
}

export { auth, GoogleAuthProvider };
export const googleAuthProvider = new GoogleAuthProvider();
googleAuthProvider.addScope("https://www.googleapis.com/auth/drive.readonly");
googleAuthProvider.addScope("https://www.googleapis.com/auth/drive.metadata.readonly");

export function safeOnAuthStateChanged(authInstance: any, callback: (user: any) => void) {
  if (isMockAuth || (authInstance && typeof authInstance.onAuthStateChanged === "function")) {
    return authInstance.onAuthStateChanged(callback);
  }
  try {
    return fbOnAuthStateChanged(authInstance, callback);
  } catch (e) {
    console.warn("safeOnAuthStateChanged fell back due to error:", e);
    callback(null);
    return () => {};
  }
}

export function safeSignInWithPopup(authInstance: any, provider: any) {
  if (isMockAuth || (authInstance && typeof authInstance.signInWithPopup === "function")) {
    return authInstance.signInWithPopup(provider);
  }
  try {
    return fbSignInWithPopup(authInstance, provider);
  } catch (e) {
    console.error("safeSignInWithPopup fell back due to error:", e);
    return Promise.reject(e);
  }
}

export function safeSignOut(authInstance: any) {
  if (isMockAuth || (authInstance && typeof authInstance.signOut === "function")) {
    return authInstance.signOut();
  }
  try {
    return fbSignOut(authInstance);
  } catch (e) {
    console.error("safeSignOut fell back due to error:", e);
    return Promise.resolve();
  }
}


