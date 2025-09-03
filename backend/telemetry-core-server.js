// backend/telemetry-core-server.js
// CommonJS (Termux-friendly)
require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const si = require("systeminformation");

const PORT = process.env.PORT || 5023;
const AUTH_TOKEN = process.env.GHOST_AUTH || "GhostShip86";
const TELEMETRY_INTERVAL_MS = Number(process.env.TELEMETRY_INTERVAL_MS) || 2000;

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("tiny"));

// In-memory shield/core state (persist externally for production)
let shieldState = {
  enabled: true,
  charge: 100.0,
  integrity: 100.0,
  lastAnomalies: [],
};

let coreHistory = []; // keep last N points for server-side quick access

// HTTP server + Socket.io
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// auth middleware
function checkAuth(req, res, next) {
  const token = req.headers["GhostShip86"] || req.query.token;
  if (token !== AUTH_TOKEN) return res.status(401).json({ error: "Unauthorized" });
  next();
}

// shield endpoints (same as before)
app.post("/api/shield/activate", checkAuth, (req, res) => {
  shieldState.enabled = true;
  io.emit("shield:update", shieldState);
  return res.json({ ok: true, shieldState });
});
app.post("/api/shield/deactivate", checkAuth, (req, res) => {
  shieldState.enabled = false;
  io.emit("shield:update", shieldState);
  return res.json({ ok: true, shieldState });
});
app.post("/api/shield/setCharge", checkAuth, (req, res) => {
  const { charge } = req.body;
  if (typeof charge !== "number") return res.status(400).json({ error: "Invalid charge value" });
  shieldState.charge = Math.max(0, Math.min(100, charge));
  io.emit("shield:update", shieldState);
  return res.json({ ok: true, shieldState });
});

// core endpoints
app.get("/api/core/status", (req, res) => {
  const latest = coreHistory[coreHistory.length - 1] || null;
  return res.json({ ok: true, core: latest, shield: shieldState });
});

// allow forcing an immediate sample (secured)
app.post("/api/core/forceScan", checkAuth, async (req, res) => {
  try {
    const sample = await sampleCoreTelemetry();
    io.emit("core:update", sample);
    return res.json({ ok: true, sample });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// socket.io connection
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  // allow optional auth check on handshake (non-fatal)
  const token = socket.handshake.auth?.token || socket.handshake.query?.token;
  if (token && token !== AUTH_TOKEN) {
    socket.emit("error", { msg: "Unauthorized token" });
    // do not force disconnect: allow read-only telemetry if you want
  }

  // send latest states on connect
  socket.emit("shield:init", shieldState);
  socket.emit("core:init", coreHistory.slice(-60));
});

// utility: compute "core level" heuristic
function computeCoreLevel({ cpuLoad, cpuTemp, memPct }) {
  // scale: 0-100 where higher means more stressed (lower core headroom)
  // heuristics: cpu 50% -> 50, temp safety: >70C adds weight
  const cpuScore = Math.min(100, Math.max(0, cpuLoad));
  const tempScore = cpuTemp ? Math.min(100, Math.max(0, (cpuTemp - 30) * 1.25)) : 0;
  const memScore = Math.min(100, Math.max(0, memPct));
  // weighted average
  const level = Math.round((cpuScore * 0.5) + (tempScore * 0.35) + (memScore * 0.15));
  return Math.max(0, Math.min(100, level));
}

// sample telemetry (real)
async function sampleCoreTelemetry() {
  const cpu = await si.currentLoad();
  const mem = await si.mem();
  const temp = await si.cpuTemperature().catch(() => ({ main: null })); // not all devices support it

  const cpuLoad = Number((cpu?.currentload ?? 0).toFixed(2));
  const memTotalMB = mem ? Math.round(mem.total / 1024 / 1024) : 0;
  const memUsedMB = mem ? Math.round((mem.total - mem.available) / 1024 / 1024) : 0;
  const memPct = memTotalMB ? Math.round((memUsedMB / memTotalMB) * 100) : 0;
  const cpuTemp = temp?.main ?? null;

  const coreLevel = computeCoreLevel({ cpuLoad, cpuTemp, memPct });

  const sample = {
    timestamp: Date.now(),
    cpuLoad,
    cpuTemp,
    memUsedMB,
    memTotalMB,
    memPct,
    coreLevel,
    shield: { ...shieldState },
  };

  // keep history capped
  coreHistory.push(sample);
  if (coreHistory.length > 600) coreHistory.shift();

  return sample;
}

// telemetry loop
async function telemetryLoop() {
  try {
    const sample = await sampleCoreTelemetry();
    io.emit("telemetry", sample);   // general telemetry (existing clients)
    io.emit("core:update", sample); // core-specific event
  } catch (err) {
    console.error("Telemetry loop error:", err);
  }
}

// start loop & server
setInterval(telemetryLoop, TELEMETRY_INTERVAL_MS);
server.listen(PORT, "0.0.0.0", () => console.log(`Telemetry Core server listening on :${PORT}`));
