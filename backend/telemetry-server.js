import 'dotenv/config';
import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import si from "systeminformation";

const PORT = process.env.TELEMETRY_PORT || 5000;
const AUTH_TOKEN = process.env.GHOST_AUTH || "GhostShip86";
const INTERVAL = Number(process.env.TELEMETRY_INTERVAL_MS) || 2000;

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("tiny"));

let shieldState = {
  enabled: true,
  charge: 100,
  integrity: 100,
  lastAnomalies: [],
};

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// Auth middleware
function checkAuth(req, res, next) {
  const token = req.headers["x-ghost-token"] || req.query.token;
  if (token !== AUTH_TOKEN) return res.status(401).json({ error: "Unauthorized" });
  next();
}

// Shield API
app.post("/api/shield/activate", checkAuth, (req, res) => {
  shieldState.enabled = true;
  io.emit("shield:control", { action: "activate", state: shieldState });
  res.json({ ok: true, shieldState });
});

app.post("/api/shield/deactivate", checkAuth, (req, res) => {
  shieldState.enabled = false;
  io.emit("shield:control", { action: "deactivate", state: shieldState });
  res.json({ ok: true, shieldState });
});

app.post("/api/shield/setCharge", checkAuth, (req, res) => {
  const { charge } = req.body;
  if (typeof charge !== "number") return res.status(400).json({ error: "Invalid charge" });
  shieldState.charge = Math.max(0, Math.min(100, charge));
  io.emit("shield:update", { shieldState });
  res.json({ ok: true, shieldState });
});

// Telemetry loop: real system metrics
async function telemetryLoop() {
  try {
    const cpuLoad = await si.currentLoad();
    const mem = await si.mem();
    const cpu = cpuLoad?.currentload || 0;
    const memUsedMB = mem?.total && mem?.available ? Math.round((mem.total - mem.available)/1024/1024) : 0;
    const memTotalMB = mem?.total ? Math.round(mem.total/1024/1024) : 0;

    io.emit("telemetry", {
      timestamp: Date.now(),
      cpu: Number(cpu.toFixed(2)),
      memUsedMB,
      memTotalMB,
      shield: { ...shieldState },
      entropy: Math.floor(Math.random() * 1000) // placeholder real entropy engine
    });

  } catch(err) {
    console.error("Telemetry loop error:", err);
  }
}

setInterval(telemetryLoop, INTERVAL);

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  const token = socket.handshake.auth?.token || socket.handshake.query?.token;
  if (token && token !== AUTH_TOKEN) {
    socket.emit("error", { msg: "Unauthorized" });
    socket.disconnect(true);
    return;
  }

  socket.emit("shield:init", shieldState);
  socket.emit("telemetry:init", { message: "Telemetry ready" });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

server.listen(PORT, () => console.log(`Telemetry server listening on :${PORT}`));


