import { Router } from "express";
import Passport from "../middlewares/Passport";
import locationController from "../controllers/location.controller";
const locationRoute=Router();
locationRoute.patch("/location", Passport.auth, locationController.update);
export default locationRoute;