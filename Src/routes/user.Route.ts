import { Router } from "express";
import userController from '../controllers/user.controller'
import Passport from "../middlewares/passport";
import upload from "../middlewares/upload";

const authRoute = Router();
authRoute.get("/profile", Passport.auth, userController.getProfile);
authRoute.patch("/profile", Passport.auth, upload.single("image"), userController.updateMe);

export default authRoute;
