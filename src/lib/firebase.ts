import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'
import { getAuth, signInAnonymously, onAuthStateChanged, type Auth, type User } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'

// All values come from Vite env vars (VITE_FIREBASE_*), read at build time.
// See README.md for the exact .env.local you need to create — nothing
// secret is hardcoded here, and none of these values are sensitive server
// credentials (Firebase web config is meant to be public; access is
// controlled by Firestore security rules + auth, not by hiding this).
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId,
)

let app: FirebaseApp | null = null
let auth: Auth | null = null
let db: Firestore | null = null

if (isFirebaseConfigured) {
  app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)
  auth = getAuth(app)
  db = getFirestore(app)
}

export { app, auth, db }

/**
 * Resolves once an anonymous Firebase user exists, and calls back on every
 * subsequent auth state change. This is the "simplest secure" approach for
 * a single-user personal app: no password to manage, but every read/write
 * still requires a signed-in uid, which Firestore security rules can pin
 * data access to (see README.md for the exact rules to paste in).
 */
export function watchAuth(onChange: (user: User | null) => void): () => void {
  if (!auth) {
    onChange(null)
    return () => {}
  }
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    if (!user) {
      signInAnonymously(auth!).catch((err) => {
        console.error('Anonymous sign-in failed', err)
        onChange(null)
      })
      return
    }
    onChange(user)
  })
  return unsubscribe
}
