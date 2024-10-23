import { userRegister } from "../controllers/user.controllers.js";
import { upload } from "../midllewares/multer.middleware.js";
import { Router } from "express";

const router = Router();

router.route("/register").post(
  upload.fields([
    // upload middleware for handling file uploads
    { name: "avator", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  
  userRegister // Controller to handle the rest of the registration logic
);

export default router;
