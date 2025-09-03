import { spawn } from 'child_process';
import { CONFIG } from '../config.js';
import { startStreams } from '../services/ffmpegService.js';

let ffmpegProcesses = [];

export function startStreams(platform) {
  CONFIG.cameraFeeds.forEach((feedUrl, index) => {
    const rtmpUrl = platform === 'youtube'
      ? `rtmp://a.rtmp.youtube.com/live2/${CONFIG.youtubeKey}`
      : platform === 'facebook'
        ? `rtmps://live-api-s.facebook.com:443/rtmp/${CONFIG.facebookKey}`
        : null;

    if (!rtmpUrl) return;

    const ffmpeg = spawn('ffmpeg', [
      '-re',
      '-i', feedUrl,
      '-c:v', 'libx264',
      '-preset', 'veryfast',
      '-maxrate', '3000k',
      '-bufsize', '6000k',
      '-pix_fmt', 'yuv420p',
      '-g', '50',
      '-c:a', 'aac',
      '-b:a', '128k',
      '-f', 'flv',
      rtmpUrl
    ]);

    // FFmpeg stderr output
    ffmpeg.stderr.on('data', data => console.log(`FFmpeg camera ${index + 1}: ${data.toString()}`));

    // FFmpeg process close
    ffmpeg.on('close', () => console.log(`FFmpeg camera ${index + 1} exited`));

    ffmpegProcesses.push(ffmpeg);
  });
}
