import { Router } from "express";
import AuthController from "../controllers/Auth.Controller";
import Passport from "../middlewares/Passport";

const authRoute = Router();
authRoute.get("/me", Passport.auth, AuthController.me);
authRoute.patch("/me", Passport.auth, AuthController.updateMe);

export default authRoute;
