import { Router } from "express.js";
import { JWTVerify } from "../middlewares/auth.middlewares.js";
import { upload } from "../middlewares/multer.middlewares.js";
import {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
} from "../controllers/video.controllers.js";

const router = Router();

router.route("/publish-video").post(
  upload.fields([
    { name: "videoFile", maxCount: 1 },
    { name: "thumbnailFile", maxCount: 1 },
  ]),
  JWTVerify,
  publishAVideo
);
router.route("/get-all-videos").get(JWTVerify,getAllVideos);
router.route("/c/:videoId/update-video").patch(JWTVerify,upload.single("thumbnail"),updateVideo);
router.route("/c/:videoId/delete-video").post(JWTVerify,deleteVideo)
router.route("/c/:videoId/get-video").get(JWTVerify,getVideoById)
router.route("/c/:videoId/publish-status").post(JWTVerify,togglePublishStatus

)


export default router;
