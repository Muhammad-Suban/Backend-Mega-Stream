import { Router } from "express";
import {
  userRegister,
  userLogin,
  userLogout,
} from "../controllers/user.controllers.js";
import { upload } from "../midllewares/multer.middleware.js";
import { JWTVerify } from "../midllewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    // upload middleware for handling file uploads
    { name: "avator", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),

  userRegister // Controller to handle the rest of the registration logic
);

router.route("/login").post(userLogin);

//secure route
router.route("/logout").post(JWTVerify, userLogout);

export default router;
