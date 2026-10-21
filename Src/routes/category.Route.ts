import { Router } from "express";
import categoryController from "../controllers/category.controller";
import upload from "../middlewares/upload";
import Passport from "../middlewares/passport";
import requireRoles from "../middlewares/role";

const categoryRoute = Router();

categoryRoute.get("/", Passport.auth, categoryController.list);
categoryRoute.get("/all", Passport.auth, requireRoles("admin"), categoryController.listAll);
categoryRoute.post(
  "/",
  Passport.auth,
  requireRoles("admin"),
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "banner", maxCount: 1 },
  ]),
  categoryController.create,
);
categoryRoute.patch(
  "/:categoryId",
  Passport.auth,
  requireRoles("admin"),
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "banner", maxCount: 1 },
  ]),
  categoryController.update,
);

export default categoryRoute;
