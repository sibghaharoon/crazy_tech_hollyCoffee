import { Router } from "express";
import userController from '../controllers/user.controller'
import locationController from '../controllers/location.controller'
import Passport from "../middlewares/Passport";

const authRoute = Router();
authRoute.get("/profile", Passport.auth, userController.getProfile);
authRoute.patch("/profile", Passport.auth, userController.updateMe);
authRoute.patch("/location", Passport.auth, locationController.update);

export default authRoute;
