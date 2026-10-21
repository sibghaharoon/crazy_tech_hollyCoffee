import { Router } from "express";
import userController from '../controllers/user.controller'
import Passport from "../middlewares/passport";
import profileUpload from "../middlewares/profile-upload";

const authRoute = Router();
authRoute.get("/profile", Passport.auth, userController.getProfile);
authRoute.patch("/profile", Passport.auth, profileUpload.single("image"), userController.updateMe);

export default authRoute;
