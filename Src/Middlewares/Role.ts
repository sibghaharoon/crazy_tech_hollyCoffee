import type { NextFunction, Request, Response } from "express";
import type { IUser } from "../interfaces/IUser";

const requireRoles = (...allowedRoles: IUser.Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const role = req.user?.role;

    if (!role || !allowedRoles.includes(role)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to access this resource",
        code: "FORBIDDEN",
      });
    }

    return next();
  };
};

export default requireRoles;
