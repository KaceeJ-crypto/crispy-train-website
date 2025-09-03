// ================== IMPORTS ==================
const { io } = require("socket.io-client");
const { spawn } = require("child_process");
const express = require("express");
const path = require("path");
const fs = require("fs");

// ================== CONFIG ==================
const SERVER_NAME = "server2";
const BACKEND_URL = "http://localhost:5000";
const PREVIEW_PORT = 8082;
const RECORDINGS_DIR = path.join(__dirname, "recordings");
const SNAPSHOTS_DIR = path.join(__dirname, "snapshots");
const PREVIEW_DIR = path.join(__dirname, "preview_stream");
const MUSIC_DIR = path.join(__dirname, "music");

// Ensure directories exist
[RECORDINGS_DIR, SNAPSHOTS_DIR, PREVIEW_DIR, MUSIC_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

let currentConfig = { streamKey: null, feedUrl: null, musicFile: null };

// ================== SOCKET.IO ==================
const socket = io(BACKEND_URL);
socket.on("connect", () => console.log(`[${SERVER_NAME}] Connected to backend`));

socket.on("configUpdate", ({ serverName, streamKey, feedUrl }) => {
  if (serverName === SERVER_NAME) {
    currentConfig.streamKey = streamKey;
    currentConfig.feedUrl = feedUrl;
    console.log(`[${SERVER_NAME}] Updated config:`, currentConfig);
    sendPreviewUpdate("stream.m3u8");
  }
});

socket.on("startStream", ({ serverName, streamKey, feedUrl }) => {
  if (serverName === SERVER_NAME && streamKey && feedUrl) {
    console.log(`[${SERVER_NAME}] Starting stream to Twitch...`);

    const ffmpegArgs = ["-re", "-i", feedUrl];

    // If music file is set, add it as overlay
    if (currentConfig.musicFile) {
      ffmpegArgs.push(
        "-i",
        path.join(MUSIC_DIR, currentConfig.musicFile),
        "-filter_complex",
        "[0:v][1:a]concat=n=1:v=1:a=1[outv][outa]",
        "-map",
        "[outv]",
        "-map",
        "[outa]"
      );
    }

    ffmpegArgs.push(
      "-c:v",
      "libx264",
      "-preset",
      "veryfast",
      "-maxrate",
      "3000k",
      "-bufsize",
      "6000k",
      "-pix_fmt",
      "yuv420p",
      "-g",
      "50",
      "-f",
      "flv",
      `rtmp://live.twitch.tv/app/${streamKey}`
    );

    const ffmpeg = spawn("ffmpeg", ffmpegArgs);
    ffmpeg.stderr.on("data", (d) => console.log(`[FFmpeg] ${d}`));
    ffmpeg.on("close", (code) => console.log(`[FFmpeg] exited with code ${code}`));
  }
});

// ================== LOCAL PREVIEW SERVER ==================
const previewApp = express();
previewApp.use('/preview', express.static(PREVIEW_DIR));
previewApp.listen(PREVIEW_PORT, () => console.log(`[${SERVER_NAME}] Preview server running on port ${PREVIEW_PORT}`));

// ================== FUNCTIONS ==================

// Send preview URL to backend
function sendPreviewUpdate(fileName) {
  const previewUrl = `http://localhost:${PREVIEW_PORT}/preview/${fileName}`;
  socket.emit("updatePreview", { serverName: SERVER_NAME, previewUrl });
  console.log(`[${SERVER_NAME}] Sent preview URL: ${previewUrl}`);
}

// Start recording feed
function startRecording(outputFormat = "mp4") {
  if (!currentConfig.feedUrl) return console.log(`[${SERVER_NAME}] No feed to record`);

  const fileName = path.join(RECORDINGS_DIR, `${SERVER_NAME}_${Date.now()}.${outputFormat}`);
  const ffmpegArgs = ["-i", currentConfig.feedUrl, "-c:v", "libx264", "-preset", "fast", fileName];

  if (currentConfig.musicFile) {
    ffmpegArgs.splice(1, 0, "-i", path.join(MUSIC_DIR, currentConfig.musicFile));
    ffmpegArgs.splice(3, 0, "-filter_complex", "[0:v][1:a]concat=n=1:v=1:a=1[outv][outa]", "-map", "[outv]", "-map", "[outa]");
  }

  const ffmpeg = spawn("ffmpeg", ffmpegArgs);
  ffmpeg.stderr.on("data", (d) => console.log(`[FFmpeg] ${d}`));
  ffmpeg.on("close", (code) => console.log(`[${SERVER_NAME}] Recording finished: ${fileName}`));
}

// Take snapshot
function takeSnapshot() {
  if (!currentConfig.feedUrl) return console.log(`[${SERVER_NAME}] No feed for snapshot`);

  const fileName = path.join(SNAPSHOTS_DIR, `${SERVER_NAME}_${Date.now()}.png`);
  const ffmpeg = spawn("ffmpeg", ["-i", currentConfig.feedUrl, "-vframes", "1", "-q:v", "2", fileName]);
  ffmpeg.stderr.on("data", (d) => console.log(`[FFmpeg] ${d}`));
  ffmpeg.on("close", (code) => console.log(`[${SERVER_NAME}] Snapshot saved: ${fileName}`));
}

// ================== EXPOSE COMMANDS VIA SOCKET.IO ==================
socket.on("startRecording", () => startRecording());
socket.on("takeSnapshot", () => takeSnapshot());
socket.on("setMusic", ({ musicFile }) => {
  currentConfig.musicFile = musicFile;
  console.log(`[${SERVER_NAME}] Music set: ${musicFile}`);
});
