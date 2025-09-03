// ================== IMPORTS ==================
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const { spawn } = require("child_process");

// ================== INIT ==================
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// ================== MIDDLEWARE ==================
app.use(bodyParser.json());

// Serve frontend dashboard
app.use("/videohub", express.static(path.join(__dirname, "../../../frontend/src/page/videohub")));

// Ensure folders exist
["recordings", "snapshots", "uploads/music"].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// ================== SERVER CONFIGS ==================
let serverConfigs = {
  server1: { streamKey: null, feedUrl: null, musicFile: null, previewUrl: null },
  server2: { streamKey: null, feedUrl: null, musicFile: null, previewUrl: null },
  server3: { streamKey: null, feedUrl: null, musicFile: null, previewUrl: null },
  server4: { streamKey: null, feedUrl: null, musicFile: null, previewUrl: null },
};

// ================== API ROUTES ==================

// Set/update server config
app.post("/set-config", (req, res) => {
  const { serverName, streamKey, feedUrl } = req.body;
  if (!serverConfigs[serverName]) return res.status(400).json({ error: "Invalid server" });

  serverConfigs[serverName] = { ...serverConfigs[serverName], streamKey, feedUrl };
  io.emit("configUpdate", { serverName, streamKey, feedUrl });
  console.log(`[CONFIG] ${serverName}:`, serverConfigs[serverName]);
  res.json({ success: true });
});

// Start stream
app.post("/start-stream", (req, res) => {
  const { serverName } = req.body;
  if (!serverConfigs[serverName]) return res.status(400).json({ error: "Invalid server" });

  io.emit("startStream", { serverName, ...serverConfigs[serverName] });
  console.log(`[START STREAM] ${serverName}`);
  res.json({ success: true });
});

// Switch feed dynamically
app.post("/switch-feed", (req, res) => {
  const { serverName, feedUrl, streamKey } = req.body;
  if (!serverConfigs[serverName]) return res.status(400).json({ error: "Invalid server" });

  serverConfigs[serverName] = { ...serverConfigs[serverName], feedUrl, streamKey };
  io.emit("switchFeed", { serverName, feedUrl, streamKey });
  console.log(`[SWITCH FEED] ${serverName}: ${feedUrl}`);
  res.json({ success: true });
});

// Update live preview URL
app.post("/update-preview", (req, res) => {
  const { serverName, previewUrl } = req.body;
  if (!serverConfigs[serverName]) return res.status(400).json({ error: "Invalid server" });

  serverConfigs[serverName].previewUrl = previewUrl;
  io.emit("updatePreview", { serverName, previewUrl });
  res.json({ success: true });
});

// ================== FILE MANAGEMENT ==================

// Music upload
const musicUpload = multer({ dest: "uploads/music/" });
app.post("/upload-music", musicUpload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  console.log(`[MUSIC UPLOAD] ${req.file.originalname}`);
  res.json({ success: true, path: req.file.path });
});

// Set music for a server
app.post("/set-music", (req, res) => {
  const { serverName, musicPath } = req.body;
  if (!serverConfigs[serverName]) return res.status(400).json({ error: "Invalid server" });

  serverConfigs[serverName].musicFile = musicPath;
  console.log(`[MUSIC SET] ${serverName} -> ${musicPath}`);
  res.json({ success: true });
});

// Start recording
app.post("/start-recording", (req, res) => {
  const { serverName, outputFormat } = req.body;
  if (!serverConfigs[serverName]) return res.status(400).json({ error: "Invalid server" });

  const feedUrl = serverConfigs[serverName].feedUrl;
  const musicFile = serverConfigs[serverName].musicFile;
  const fileName = `recordings/${serverName}_${Date.now()}.${outputFormat || "mp4"}`;

  const ffmpegArgs = ["-i", feedUrl];
  if (musicFile) {
    ffmpegArgs.push("-i", musicFile, "-filter_complex", "[0:v][1:a]concat=n=1:v=1:a=1[outv][outa]", "-map", "[outv]", "-map", "[outa]");
  }
  ffmpegArgs.push("-c:v", "libx264", "-preset", "fast", fileName);

  const ffmpeg = spawn("ffmpeg", ffmpegArgs);
  ffmpeg.stderr.on("data", (d) => console.log(`FFmpeg: ${d}`));
  ffmpeg.on("close", (code) => console.log(`Recording ${serverName} finished with code ${code}`));

  res.json({ success: true, path: fileName });
});

// Take snapshot
app.post("/snapshot", (req, res) => {
  const { serverName } = req.body;
  if (!serverConfigs[serverName]) return res.status(400).json({ error: "Invalid server" });

  const feedUrl = serverConfigs[serverName].feedUrl;
  const fileName = `snapshots/${serverName}_${Date.now()}.png`;

  const ffmpeg = spawn("ffmpeg", ["-i", feedUrl, "-vframes", "1", "-q:v", "2", fileName]);
  ffmpeg.stderr.on("data", (d) => console.log(`FFmpeg: ${d}`));
  ffmpeg.on("close", (code) => console.log(`Snapshot ${serverName} saved: ${fileName}`));

  res.json({ success: true, path: fileName });
});

// ================== SOCKET.IO ==================
io.on("connection", (socket) => {
  console.log(`[SOCKET CONNECT] ${socket.id}`);

  socket.on("status", (data) => io.emit("mediaStatus", data));
  socket.on("updatePreview", ({ serverName, previewUrl }) => {
    io.emit("updatePreview", { serverName, previewUrl });
  });
});

// ================== START SERVER ==================
const PORT = 5000;
server.listen(PORT, () => console.log(`[BACKEND RUNNING] http://localhost:${PORT}/videohub`));
