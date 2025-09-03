import express from 'express';
import { getVideoFeed } from '../controllers/videoController.js';

const router = express.Router();

router.get('/feed', getVideoFeed);

export default router;
