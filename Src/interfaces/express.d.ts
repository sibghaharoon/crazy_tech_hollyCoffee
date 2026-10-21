import type { AuthenticatedUser } from "../middlewares/passport";

export {};

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}
