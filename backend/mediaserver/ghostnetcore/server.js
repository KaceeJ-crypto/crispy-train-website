import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

// Routes and controllers
import streamRoutes from "./routes/streamRoutes.js";
import videoRoutes from "./routes/videoRoutes.js";

// Socket handlers
import { videoSocket } from "./sockets/videoSocket.js";
import { ghostNetSocket } from "./sockets/ghostNetSocket.js";

// Config loader (stream keys, etc.)
import { loadConfig } from "./config.js";

const app = express();
const server = http.createServer(app);

// Socket.IO server
const io = new Server(server, {
  cors: { origin: "*" }, // allow frontend access
  transports: ["websocket"],
});

app.use(cors());
app.use(express.json());

// Load routes
app.use("/api/stream", streamRoutes);  // start/stop streams, update keys
app.use("/api/video", videoRoutes);    // video chat endpoints

// Socket.IO real-time connections
io.on("connection", (socket) => {
  console.log("✅ New client connected:", socket.id);

  // MiroTalk video chat socket
  videoSocket(io, socket);

  // GhostNet nodes socket
  ghostNetSocket(io, socket);

  socket.on("disconnect", () => {
    console.log("⚠️ Client disconnected:", socket.id);
  });
});

// Load config (stream keys, camera feeds, etc.)
loadConfig();

const PORT = process.env.PORT || 5150;
server.listen(PORT, () => {
  console.log(`🚀 GhostNetCore running on port ${PORT}`);
});
