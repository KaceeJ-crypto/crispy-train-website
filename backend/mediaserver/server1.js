const { io } = require("socket.io-client");
const { spawn } = require("child_process");

const SERVER_NAME = "server1";
let currentConfig = { streamKey: null, feedUrl: null };

// Connect to backend
const socket = io("http://localhost:5000");

socket.on("connect", () => {
  console.log(`${SERVER_NAME} connected to backend`);
});

// Receive updated config from frontend
socket.on("configUpdate", ({ serverName, streamKey, feedUrl }) => {
  if (serverName === SERVER_NAME) {
    currentConfig = { streamKey, feedUrl };
    console.log(`${SERVER_NAME} updated config:`, currentConfig);
  }
});

// Start stream command
socket.on("startStream", ({ serverName, streamKey, feedUrl }) => {
  if (serverName === SERVER_NAME && streamKey && feedUrl) {
    console.log(`Starting stream on ${SERVER_NAME} to Twitch`);

    const ffmpeg = spawn("ffmpeg", [
      "-re",
      "-i", feedUrl,       // now comes from dashboard
      "-c:v", "libx264",
      "-preset", "veryfast",
      "-maxrate", "3000k",
      "-bufsize", "6000k",
      "-pix_fmt", "yuv420p",
      "-g", "50",
      "-f", "flv",
      `rtmp://live.twitch.tv/app/${streamKey}`
    ]);

    ffmpeg.stderr.on("data", (d) => console.log(`FFmpeg: ${d.toString()}`));
    ffmpeg.on("close", (code) => console.log(`FFmpeg exited with code ${code}`));
  }
});
