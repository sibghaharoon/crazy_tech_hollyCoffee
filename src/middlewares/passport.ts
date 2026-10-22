import type { NextFunction, Request, Response } from "express";
import type { Types } from "mongoose";
import UserRepository from "../repositories/user.repository";
import AuthService from "../services/auth.service";
import type { IUserModule } from "../interfaces/iuser";

export type AuthenticatedUser = IUserModule.ICreateUser & {
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

    let token;
    try {
      token = await AuthService.verifyToken(header.slice(7).trim());
    } catch {
      return res
        .status(401)
        .json({
          success: false,
          message: "Invalid or expired authentication token",
          code: "AUTH_INVALID",
        });
    }

    const user = await UserRepository.findOrCreateByFirebaseUid(token.uid, {
      firebaseUid: token.uid,
      name: token.name,
      email: token.email,
      phoneNumber: token.phone_number,
      profileImage: token.picture,
    });

    if (user.status === "inactive") {
      return res.status(403).json({
        success: false,
        message: "User is inactive",
        code: "USER_INACTIVE",
      });
    }

    req.user = user;
    return next();
  },
};

export default Passport;
