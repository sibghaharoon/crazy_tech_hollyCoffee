import type { AuthenticatedUser } from "../middlewares/Passport";

export {};

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}
