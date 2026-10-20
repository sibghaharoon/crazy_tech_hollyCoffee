import type { NextFunction, Request, Response } from "express";
import type { Types } from "mongoose";
import UserRepository from "../repositories/User.Repository";
import AuthService from "../services/Auth.Service";
import type { IUser } from "../interfaces/IUser";

export type AuthenticatedUser = IUser.CreateObj & {
  _id: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
};

const Passport = {
  async auth(req: Request, res: Response, next: NextFunction) {
    const header = req.header("Authorization");
    if (!header?.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({
          success: false,
          message: "Authentication required",
          code: "AUTH_REQUIRED",
        });
    }

    try {
      const token = await AuthService.verifyToken(header.slice(7).trim());
      const user = await UserRepository.findOrCreateByFirebaseUid(token.uid, {
        firebaseUid: token.uid,
        name: token.name,
        email: token.email,
        phoneNumber: token.phone_number,
        photoUrl: token.picture,
      });

      if (user.status === "inactive") {
        return res
          .status(403)
          .json({
            success: false,
            message: "User is inactive",
            code: "USER_INACTIVE",
          });
      }

      req.user = user;
      return next();
    } catch {
      return res
        .status(401)
        .json({
          success: false,
          message: "Invalid or expired authentication token",
          code: "AUTH_INVALID",
        });
    }
  },
};

export default Passport;
