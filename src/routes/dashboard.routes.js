import { Router } from 'express';
import {
    getChannelStatus,
    getChannelVideos,
} from "../controllers/dashboard.controllers.js"
import {JWTVerify} from "../middlewares/auth.middleware.js"

const router = Router();

router.use(JWTVerify); // Apply verifyJWT middleware to all routes in this file

router.route("/status").get(getChannelStatus);  //TODO:  get successfull but total likes are not show 
router.route("/videos").get(getChannelVideos);

export default router