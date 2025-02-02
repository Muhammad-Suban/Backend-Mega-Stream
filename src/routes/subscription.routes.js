import { Router } from 'express';
import {
    getSubscribedChannels,
    getUserChannelSubscribers,
    toggleSubscription,
} from "../controllers/subscription.controllers.js"
import {JWTVerify} from "../middlewares/auth.middleware.js"

const router = Router();
router.use(JWTVerify); // Apply verifyJWT middleware to all routes in this file

// TODO:   DOUTED response not100 satisfyed detail  debugto check
// TODO:   DOUTED response not100 satisfyed detail  debugto check
// TODO:   DOUTED response not100 satisfyed detail  debugto check
// TODO:   DOUTED response not100 satisfyed detail  debugto check


router
    .route("/c/:channelId")
    .get(getSubscribedChannels)
    .post(toggleSubscription);

router.route("/u/:subscriberId").get(getUserChannelSubscribers);

export default router