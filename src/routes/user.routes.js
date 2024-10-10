import {Router} from "express.js"
import userRegister from "../controllers/user.controllers.js"

const router = Router();

router.route("/register").post(userRegister)

export {router}