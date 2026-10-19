import { FirebaseError } from 'firebase/app'

/**
 * Maps Firebase Auth error codes to messages a user can actually act on.
 * Falls back to the raw message for anything not explicitly handled here
 * (still better than a silent failure) or a generic network message for
 * non-Firebase errors (e.g. an actual network drop).
 */
export function getAuthErrorMessage(err: unknown): string {
  if (err instanceof FirebaseError) {
    switch (err.code) {
      case 'auth/invalid-email':
        return 'That email address doesn’t look right.'
      case 'auth/user-not-found':
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
        return 'Wrong email or password.'
      case 'auth/too-many-requests':
        return 'Too many attempts. Please wait a moment and try again.'
      case 'auth/email-already-in-use':
      case 'auth/credential-already-in-use':
        return 'An account with this email already exists. Try logging in instead.'
      case 'auth/weak-password':
        return 'Password is too weak — use at least 6 characters.'
      case 'auth/popup-closed-by-user':
      case 'auth/cancelled-popup-request':
        return 'Google sign-in was closed before finishing. Try again.'
      case 'auth/popup-blocked':
        return 'Your browser blocked the Google sign-in popup. Allow popups for this site and try again.'
      case 'auth/network-request-failed':
        return 'Network error — check your connection and try again.'
      case 'auth/user-disabled':
        return 'This account has been disabled.'
      case 'auth/operation-not-allowed':
        return 'This sign-in method isn’t enabled for this project yet.'
      case 'auth/requires-recent-login':
        return 'Please log in again to continue.'
      default:
        return err.message.replace(/^Firebase:\s*/, '').replace(/\s*\(auth\/[\w-]+\)\.?$/, '')
    }
  }
  if (err instanceof Error) return err.message
  return 'Something went wrong. Please try again.'
}
