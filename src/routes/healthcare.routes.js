import { Router } from 'express';
import { healthcare } from "../controllers/healthcare.controllers.js"

const router = Router();

router.route('/').get(healthcare);

export default router