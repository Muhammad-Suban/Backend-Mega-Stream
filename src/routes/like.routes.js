import { Router } from "express";
import {
  toggleCommentLike,
  toggleTweetLike,
  toggleVideoLike,
  getLikedVideos,
} from "../controllers/like.controllers.js";
import { JWTVerify } from "../midllewares/auth.middleware.js";

const router = Router();

router.route("/c/:videoId/toggleVideoLike").post(JWTVerify, toggleVideoLike);
router.route("/c/:videoId/toggleCommentLike").post(JWTVerify, toggleCommentLike);
router.route("/c/:videoId/toggleTweetLike").post(JWTVerify, toggleTweetLike);
router.route("getAllLikedVideos").get(JWTVerify, getLikedVideos);

export default router;
