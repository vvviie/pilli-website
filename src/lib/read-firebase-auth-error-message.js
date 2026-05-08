const firebaseAuthErrorMessageMap = {
  "auth/network-request-failed":
    "Network request failed. Check your internet, disable VPN/ad-blockers, and verify Firebase project settings.",
  "auth/operation-not-allowed":
    "Email/Password sign-in is disabled in Firebase Console. Enable it under Authentication > Sign-in method.",
  "auth/unauthorized-domain":
    "This domain is not authorized in Firebase. Add localhost to Authentication > Settings > Authorized domains.",
  "auth/invalid-api-key": "Invalid Firebase API key. Recheck NEXT_PUBLIC_FIREBASE_API_KEY in your env file.",
  "auth/email-already-in-use": "This email is already in use.",
  "auth/weak-password": "Password is too weak. Use a stronger password and try again.",
  "auth/user-not-found": "No account found for this email.",
  "auth/wrong-password": "Incorrect password.",
  "auth/invalid-credential": "Invalid login credentials.",
};

export default function readFirebaseAuthErrorMessage(firebaseError, fallbackMessage) {
  const errorCode = firebaseError?.code;
  if (errorCode && firebaseAuthErrorMessageMap[errorCode]) {
    return firebaseAuthErrorMessageMap[errorCode];
  }

  return fallbackMessage;
}
