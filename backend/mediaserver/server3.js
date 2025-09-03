const { io } = require("socket.io-client");
const { spawn } = require("child_process");
const express = require("express");
const path = require("path");

const SERVER_NAME = "server3";
const BACKEND_URL = "http://localhost:5000";
const PREVIEW_PORT = 8083;
let currentConfig = { streamKey: null, feedUrl: null };

const socket = io(BACKEND_URL);
socket.on("connect", () => console.log(`[${SERVER_NAME}] Connected to backend`));

socket.on("configUpdate", ({ serverName, streamKey, feedUrl }) => {
  if (serverName === SERVER_NAME) {
    currentConfig = { streamKey, feedUrl };
    console.log(`[${SERVER_NAME}] Updated config:`, currentConfig);
    sendPreviewUpdate("stream.m3u8");
  }
});

socket.on("startStream", ({ serverName, streamKey, feedUrl }) => {
  if (serverName === SERVER_NAME && streamKey && feedUrl) {
    console.log(`[${SERVER_NAME}] Starting stream to Twitch...`);
    const ffmpeg = spawn("ffmpeg", [
      "-re",
      "-i", feedUrl,
      "-c:v", "libx264",
      "-preset", "veryfast",
      "-maxrate", "3000k",
      "-bufsize", "6000k",
      "-pix_fmt", "yuv420p",
      "-g", "50",
      "-f", "flv",
      `rtmp://live.twitch.tv/app/${streamKey}`
    ]);
    ffmpeg.stderr.on("data", (d) => console.log(`[FFmpeg] ${d}`));
    ffmpeg.on("close", (code) => console.log(`[FFmpeg] exited with code ${code}`));
  }
});

const previewApp = express();
const PREVIEW_DIR = path.join(__dirname, "preview_stream");
previewApp.use('/preview', express.static(PREVIEW_DIR));
previewApp.listen(PREVIEW_PORT, () => console.log(`[${SERVER_NAME}] Preview server running on port ${PREVIEW_PORT}`));

function sendPreviewUpdate(fileName) {
  const previewUrl = `http://localhost:${PREVIEW_PORT}/preview/${fileName}`;
  socket.emit("updatePreview", { serverName: SERVER_NAME, previewUrl });
  console.log(`[${SERVER_NAME}] Sent preview URL: ${previewUrl}`);
}
