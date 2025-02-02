import { Router } from "express";
import {
  userRegister,
  userLogin,
  userLogout,
  accessRefreshTokens,  // Controller to handle refresh tokens
  changeCurrentPassword,
  currentUser,
  updateAccountDetails,
  updateUserAvator,
  updateUserCoverImage,
  getChannelDetails,
  getWatchHistory,
} from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";
import { JWTVerify } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(upload.fields([
    // upload middleware for handling file uploads
    { name: "avator", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  userRegister
);

router.route("/login").post(userLogin);

//secure route
router.route("/logout").post(JWTVerify, userLogout);
router.route("/refresh-token").post(accessRefreshTokens)

router.route("/change-password").post(JWTVerify,changeCurrentPassword)
router.route("/current-user").get(JWTVerify,currentUser)

// patch used to update neccassary data
router.route("/update-account").patch(JWTVerify,updateAccountDetails)
router.route("/avator").patch(JWTVerify,upload.single("avator"),updateUserAvator)
 
router.route("/coverImage").patch(JWTVerify,upload.single("coverImage"),updateUserCoverImage)
// useparams used in link
router.route("/c/:userName").get(JWTVerify,getChannelDetails)
router.route("/history").get(JWTVerify,getWatchHistory) 


export default router;
