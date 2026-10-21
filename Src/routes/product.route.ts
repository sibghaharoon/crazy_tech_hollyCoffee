import { Router } from "express";
import productController from "../controllers/product.controller";
import Passport from "../middlewares/passport";
import upload from "../middlewares/upload";
import requireRoles from "../middlewares/role";

const productRoute = Router();

productRoute.get("/", Passport.auth, productController.list);
productRoute.get(
  "/all",
  Passport.auth,
  requireRoles("admin"),
  productController.listAll,
);
productRoute.get("/:productId", Passport.auth, productController.getById);
productRoute.post(
  "/",
  Passport.auth,
  requireRoles("admin"),
  upload.single("image"),
  productController.create,
);
productRoute.patch(
  "/:productId",
  Passport.auth,
  requireRoles("admin"),
  upload.single("image"),
  productController.update,
);

export default productRoute;
