import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'
import {
  getAuth,
  onAuthStateChanged,
  signInAnonymously,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  linkWithCredential,
  linkWithPopup,
  signInWithPopup,
  EmailAuthProvider,
  GoogleAuthProvider,
  signOut,
  type Auth,
  type User,
} from 'firebase/auth'
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

function requireAuth(): Auth {
  if (!auth) throw new Error('Firebase is not configured. Add your config to .env.local (see README.md).')
  return auth
}

/**
 * Resolves once *some* Firebase user exists (anonymous or permanent), and
 * calls back on every subsequent auth state change. The app always keeps an
 * anonymous session running in the background the moment Firebase is
 * configured — that's what makes account linking possible: signing up or
 * logging in from an anonymous session upgrades the *same* uid in place
 * rather than starting from a blank account, so existing Firestore data
 * under users/{uid} is preserved automatically. Whether that uid belongs to
 * a permanent account is exposed separately via `user.isAnonymous` — the UI
 * (AppDataContext) uses that to decide whether to show the Login page.
 */
export function watchAuth(onChange: (user: User | null, error?: string) => void): () => void {
  if (!auth) {
    onChange(null)
    return () => {}
  }
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    if (!user) {
      signInAnonymously(auth!).catch((err) => {
        console.error('Anonymous sign-in failed', err)
        onChange(null, err instanceof Error ? err.message : 'Anonymous sign-in failed.')
      })
      return
    }
    onChange(user)
  })
  return unsubscribe
}

/**
 * Sign up with email/password. If the current session is anonymous, this
 * *links* the new credential to it (same uid, data preserved) instead of
 * creating a separate account. If that email already belongs to a real
 * account, linking fails with `auth/email-already-in-use` /
 * `auth/credential-already-in-use` — the caller should tell the person to
 * log in instead rather than losing their anonymous data silently.
 */
export async function signUpWithEmail(email: string, password: string): Promise<User> {
  const a = requireAuth()
  const current = a.currentUser
  if (current?.isAnonymous) {
    const credential = EmailAuthProvider.credential(email, password)
    const result = await linkWithCredential(current, credential)
    return result.user
  }
  const result = await createUserWithEmailAndPassword(a, email, password)
  return result.user
}

/** Log in with an existing email/password account. */
export async function signInWithEmail(email: string, password: string): Promise<User> {
  const a = requireAuth()
  const result = await signInWithEmailAndPassword(a, email, password)
  return result.user
}

/**
 * Sign in with Google. Same linking behavior as signUpWithEmail: if the
 * current session is anonymous, link the Google credential to preserve the
 * uid and its data. If that Google account is already a separate permanent
 * account, fall back to a normal sign-in to it.
 */
export async function signInWithGoogle(): Promise<User> {
  const a = requireAuth()
  const provider = new GoogleAuthProvider()
  const current = a.currentUser
  if (current?.isAnonymous) {
    try {
      const result = await linkWithPopup(current, provider)
      return result.user
    } catch (err) {
      const code = (err as { code?: string }).code
      if (code === 'auth/credential-already-in-use' || code === 'auth/email-already-in-use') {
        const result = await signInWithPopup(a, provider)
        return result.user
      }
      throw err
    }
  }
  const result = await signInWithPopup(a, provider)
  return result.user
}

/**
 * Signs out of the permanent account. A fresh anonymous session starts
 * right after (see watchAuth), so the app has somewhere to write to again,
 * but with none of the signed-out account's data — the person lands back
 * on the Login page.
 */
export async function signOutUser(): Promise<void> {
  if (!auth) return
  await signOut(auth)
}
