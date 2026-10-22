import type { DecodedIdToken } from "firebase-admin/auth";
import firebaseAuth from "../configs/firebase";

class AuthService {
  verifyToken(idToken: string): Promise<DecodedIdToken> {
    return firebaseAuth.verifyIdToken(idToken, true);
  }
}

export default new AuthService();
