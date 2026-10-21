import { Router } from "express";
import cartController from "../controllers/cart.controller";
import Passport from "../middlewares/passport";

const cartRoute = Router();

cartRoute.get("/", Passport.auth, cartController.get);
cartRoute.post("/items", Passport.auth, cartController.addItem);
cartRoute.patch(
  "/items/:itemId",
  Passport.auth,
  cartController.updateItem,
);
cartRoute.delete(
  "/items/:itemId",
  Passport.auth,
  cartController.removeItem,
);
cartRoute.delete("/", Passport.auth, cartController.clear);

export default cartRoute;
