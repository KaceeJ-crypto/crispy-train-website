import blessed from "blessed";
import contrib from "blessed-contrib";
import { io } from "socket.io-client";

const SOCKET_URL = "http://127.0.0.1:5000";
const AUTH_TOKEN = process.env.GHOST_AUTH || "changeme-token";

// Terminal screen
const screen = blessed.screen();
const grid = new contrib.grid({ rows: 12, cols: 12, screen });

const logBox = grid.set(0, 0, 6, 6, contrib.log, { label: "Telemetry Logs" });
const gauge = grid.set(0, 6, 6, 6, contrib.gauge, { label: "Core Shields" });
const cpuLine = grid.set(6, 0, 6, 6, contrib.line, { label: "CPU Load" });
const memLine = grid.set(6, 6, 6, 6, contrib.line, { label: "Memory Usage" });

screen.key(["escape", "q", "C-c"], () => process.exit(0));
screen.render();

const socket = io(SOCKET_URL, { transports: ["websocket"], auth: { token: AUTH_TOKEN } });

const cpuHistory = [];
const memHistory = [];

socket.on("connect", () => logBox.log(`Socket connected: ${socket.id}`));
socket.on("disconnect", () => logBox.log(`Socket disconnected`));

socket.on("telemetry", t => {
  const cpu = t.cpu ?? 0;
  const memUsed = t.memUsedMB ?? 0;
  const memTotal = t.memTotalMB ?? 1;

  const memPct = Math.min(100, Math.max(0, (memUsed / memTotal)*100));
  const shieldLevel = t.shield?.charge ?? 0;
  const entropy = t.entropy ?? 0;

  logBox.log(`CPU: ${cpu.toFixed(2)}%, MEM: ${memUsed}/${memTotal}MB (${memPct.toFixed(1)}%), Shield: ${shieldLevel}%, Entropy: ${entropy}`);

  gauge.setData([shieldLevel]);

  cpuHistory.push(cpu); if(cpuHistory.length>50) cpuHistory.shift();
  memHistory.push(memPct); if(memHistory.length>50) memHistory.shift();

  cpuLine.setData([{ title: "CPU", x: Array(cpuHistory.length).fill(""), y: cpuHistory }]);
  memLine.setData([{ title: "Memory", x: Array(memHistory.length).fill(""), y: memHistory }]);

  screen.render();
});



