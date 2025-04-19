import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { JWTVerify } from "../middlewares/auth.middleware.js";
import {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
} from "../controllers/video.controllers.js";

const router = Router();

// router.use(JWTVerify); // Apply verifyJWT middleware to all routes in this file

router
  .route("/")
  .get(getAllVideos)
  .post(
    upload.fields([
      { name: "videoFile", maxCount: 1 },
      { name: "thumbnailFile", maxCount: 1 }, 
    ]),
    publishAVideo,
    JWTVerify
  );

router
  .route("/:videoId")
  .get(getVideoById)
  .delete(deleteVideo,JWTVerify)
  .patch(upload.single("thumbnailFile"), updateVideo,JWTVerify);

router.route("/toggle/publish/:videoId").patch(togglePublishStatus,JWTVerify);

export default router;
