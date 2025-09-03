import express from 'express';
import { startStreamsController, stopStreamsController, updateKeysController } from '../controllers/streamController.js';

const router = express.Router();

router.post('/start', startStreamsController);
router.post('/stop', stopStreamsController);
router.post('/keys', updateKeysController);

export default router;
