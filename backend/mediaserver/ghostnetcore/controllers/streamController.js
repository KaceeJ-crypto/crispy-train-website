import { startStreams, stopStreams } from '../services/ffmpegService.js';
import { saveConfig } from '../config.js';

export async function startStreamsController(req, res) {
  try {
    const { platform } = req.body; // 'youtube' or 'facebook'
    startStreams(platform);
    res.json({ message: `Streams started on ${platform}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function stopStreamsController(req, res) {
  try {
    stopStreams();
    res.json({ message: 'Streams stopped' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function updateKeysController(req, res) {
  try {
    saveConfig(req.body);
    res.json({ message: 'Keys updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
