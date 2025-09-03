import { CONFIG } from '../config.js';

export async function getVideoFeed(req, res) {
  try {
    // For now, return the first camera feed as placeholder
    res.json({ feedUrl: CONFIG.cameraFeeds[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
