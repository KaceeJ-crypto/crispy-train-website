// backend/monitor-core.js
const blessed = require("neo-blessed");
const contrib = require("blessed-contrib");
const io = require("socket.io-client");

const SOCKET = process.env.GHOST_TELEMETRY_URL || "http://0.0.0.0:5000";
const AUTH = process.env.GHOST_AUTH || "GhostShip86";

const socket = io(SOCKET, {
  transports: ["websocket"],
  auth: { token: AUTH },
  reconnection: true,
});

const screen = blessed.screen({ smartCSR: true, title: "GhostShip Core Monitor" });
const grid = new contrib.grid({ rows: 12, cols: 12, screen: screen });

const cpuLine = grid.set(0, 0, 6, 8, contrib.line, {
  label: "CPU Load % (last samples)",
  showLegend: false,
  maxY: 100,
  style: { line: "yellow", text: "white", baseline: "black" },
});
const tempGauge = grid.set(0, 8, 3, 4, contrib.gauge, { label: "CPU Temp (°C)" });
const coreGauge = grid.set(3, 8, 3, 4, contrib.gauge, { label: "Core Level" });
const memDonut = grid.set(6, 8, 3, 4, contrib.donut, { label: "Memory Used" });
const log = grid.set(6, 0, 6, 8, contrib.log, { label: "Telemetry Logs" });

screen.key(["escape", "q", "C-c"], function () {
  process.exit(0);
});

// maintain arrays for plotting
let cpuSeries = [];
let times = [];

function pushSample(samp) {
  const t = new Date(samp.timestamp).toLocaleTimeString();
  times.push(t);
  cpuSeries.push(Number(samp.cpuLoad));
  if (times.length > 40) times.shift() && cpuSeries.shift();

  const series = [{ title: "cpu", x: times.slice(), y: cpuSeries.slice() }];

  cpuLine.setData(series);

  tempGauge.setData([samp.cpuTemp ? Math.max(0, Math.round(samp.cpuTemp)) : 0]);
  coreGauge.setData([samp.coreLevel]);
  const memPercent = samp.memPct || 0;
  memDonut.setData([{ percent: memPercent, label: "used", color: "green" }]);

  log.log(`[${t}] CPU ${samp.cpuLoad}% | Temp ${samp.cpuTemp ?? "n/a"}°C | CoreLevel ${samp.coreLevel}`);
  screen.render();
}

socket.on("connect", () => {
  log.log("Connected to backend socket.");
});

socket.on("disconnect", () => {
  log.log("Disconnected from backend.");
});

socket.on("core:update", (data) => {
  pushSample(data);
});

console.log("Core monitor started. Press q or ESC to quit.");
