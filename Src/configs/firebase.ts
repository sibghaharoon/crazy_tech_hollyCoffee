import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import environment from "./environment";

const firebaseApp =
  getApps()[0] ??
  initializeApp({
    credential: cert({
      projectId: environment.firebaseProjectId,
      clientEmail: environment.firebaseClientEmail,
      privateKey: environment.firebasePrivateKey,
    }),
  });

export default getAuth(firebaseApp);
