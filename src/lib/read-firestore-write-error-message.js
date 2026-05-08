const firestoreWriteErrorMap = {
  "permission-denied":
    "Firestore permission denied. Update your Firestore rules to allow this authenticated write path.",
  unauthenticated: "You are not authenticated. Please sign in again.",
  unavailable: "Firestore is temporarily unavailable. Please try again.",
  "failed-precondition":
    "Firestore is not enabled for this project yet. Enable Firestore in Firebase Console.",
};

export default function readFirestoreWriteErrorMessage(error, fallbackMessage) {
  const errorCode = typeof error?.code === "string" ? error.code.replace("firestore/", "") : "";
  if (errorCode && firestoreWriteErrorMap[errorCode]) {
    return firestoreWriteErrorMap[errorCode];
  }

  return fallbackMessage;
}
