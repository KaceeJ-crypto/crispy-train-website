// ---------------- IMPORTS ----------------
import express from "express";
import http from "http";
import { Server } from "socket.io";
import fs from "fs";
import fsPromises from "fs/promises";
import path from "path";
import vm from "vm";
import { exec, spawn } from "child_process";
import cors from "cors";

// ---------------- EXPRESS + SOCKET.IO ----------------
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*", methods: ["GET", "POST"] } });
app.use(cors());
app.use(express.json({ limit: "5mb" }));

// ---------------- GHOST SHIP STATE ----------------
const ghostShip = {
  vpn: { status: "disconnected", chain: [] },
  tor: { status: "disconnected", circuit: [] },
  dnscrypt: { status: "disabled", resolver: "Cloudflare" },
  firewall: { status: "inactive", rules: [], filteredTraffic: 0 },
  threats: 0,
  telemetry: { nodes: [] },
  logs: []
};

// ---------------- TELEMETRY ----------------
function pushLog(msg) {
  const timestamp = new Date().toLocaleTimeString();
  ghostShip.logs.push(`[${timestamp}] ${msg}`);
  updateTelemetry();
}

function updateTelemetry() {
  io.emit("telemetryUpdate", ghostShip);
}

// ---------------- SYSTEM COMMANDS ----------------
function runSystemCommand(cmd, successMsg, errorMsg) {
  exec(cmd, (err, stdout, stderr) => {
    if (err) pushLog(`${errorMsg}: ${stderr || err.message}`);
    else pushLog(successMsg);
    updateTelemetry();
  });
}

// ---------------- BOT SANDBOX ----------------
const botFolder = path.join(process.cwd(), "bots");
fs.mkdirSync(botFolder, { recursive: true });

function runBotCode(code, context = {}) {
  const sandbox = { ...context, console };
  const vmContext = vm.createContext(sandbox);
  try {
    return new vm.Script(code).runInContext(vmContext, { timeout: 2000 });
  } catch (err) {
    pushLog(`Bot Error: ${err.message}`);
    return null;
  }
}

function loadBots() {
  const botFiles = fs.readdirSync(botFolder).filter(f => f.endsWith(".js"));
  return botFiles.map(f => ({ name: f, code: fs.readFileSync(path.join(botFolder, f), "utf-8") }));
}

function runAllBots(context = {}) {
  const bots = loadBots();
  if (!bots.length) pushLog("No bots found.");
  bots.forEach(bot => {
    pushLog(`Executing bot: ${bot.name}`);
    runBotCode(bot.code, context);
  });
}

// ---------------- SOCKET.IO ----------------
io.on("connection", (socket) => {
  console.log("⚡ Client connected");

  socket.on("join", (roomId) => socket.join(roomId));

  // ==== COMMANDS (VPN / TOR / DNSCrypt / Nodes / Bots) ====
  socket.on("command", ({ type, payload }) => {
    pushLog(`Command received: ${type}`);

    switch (type) {
      case "CONNECT_VPN":
        runSystemCommand("openvpn --config myvpn.conf", "🔐 VPN connected", "❌ VPN failed");
        ghostShip.vpn.status = "connected";
        break;
      case "DISCONNECT_VPN":
        runSystemCommand("killall openvpn", "🔌 VPN disconnected", "⚠️ VPN disconnect failed");
        ghostShip.vpn.status = "disconnected";
        break;
      case "START_TOR":
        runSystemCommand("tor &", "🕸️ Tor started", "❌ Tor failed");
        ghostShip.tor.status = "connected";
        break;
      case "STOP_TOR":
        runSystemCommand("killall tor", "🛑 Tor stopped", "⚠️ Tor stop failed");
        ghostShip.tor.status = "disconnected";
        break;
      case "START_DNSCRYPT":
        runSystemCommand("dnscrypt-proxy", "🛡 DNSCrypt started", "❌ DNSCrypt failed");
        ghostShip.dnscrypt.status = "enabled";
        break;
      case "STOP_DNSCRYPT":
        runSystemCommand("killall dnscrypt-proxy", "🚫 DNSCrypt stopped", "⚠️ DNSCrypt stop failed");
        ghostShip.dnscrypt.status = "disabled";
        break;
      case "ADD_NODE": {
        const newNodeId = `NODE-${Math.floor(Math.random() * 9000 + 1000)}`;
        ghostShip.telemetry.nodes.push({ id: newNodeId, type: payload?.type || "generic", status: "idle" });
        pushLog(`Node added: ${newNodeId}`);
        break;
      }
      case "REMOVE_NODE": {
        if (ghostShip.telemetry.nodes.length) {
          const removed = ghostShip.telemetry.nodes.pop();
          pushLog(`Node removed: ${removed.id}`);
        }
        break;
      }
      case "RUN_BOTS":
        ghostShip.telemetry.nodes.forEach(n => { if (n.type === "bot") n.status = "running"; });
        pushLog("All bots running");
        break;
      case "DETECT_THREAT":
        ghostShip.threats += 1;
        pushLog("⚠️ Threat detected!");
        break;
      case "PURGE_LOGS":
        ghostShip.logs = [];
        pushLog("Logs cleared.");
        break;
      default:
        pushLog(`Unknown command: ${type}`);
    }

    updateTelemetry();
  });

  // ==== TOOLS (GitHub + GhostNet Modules) ====
  socket.on("runTool", ({ tool }) => {
    let cmd = "";

    switch (tool) {
      // ----- GitHub Tools -----
      case "sqlmap": cmd = "sqlmap --version"; break;
      case "sublist3r": cmd = "python3 ~/ghostnet-tools/Sublist3r/sublist3r.py -h"; break;
      case "theHarvester": cmd = "theHarvester -h"; break;
      case "sherlock": cmd = "python3 ~/ghostnet-tools/sherlock/sherlock --help"; break;
      case "nikto": cmd = "nikto -Help"; break;
      case "datasploit": cmd = "python3 ~/ghostnet-tools/datasploit/datasploit.py -h"; break;
      case "spiderfoot": cmd = "python3 ~/ghostnet-tools/spiderfoot/sf.py -h"; break;
      case "wifite2": cmd = "python3 ~/ghostnet-tools/wifite2/wifite.py -h"; break;

      // ----- GhostNet Custom Modules -----
      case "entropyEngine": cmd = "python3 ~/ghostnet/modules/EntropyEngine.py --test"; break;
      case "spoofStack": cmd = "python3 ~/ghostnet/modules/SpoofStack.py --simulate"; break;
      case "anomalyShield": cmd = "python3 ~/ghostnet/modules/AnomalyShield.py --monitor"; break;
      case "payloadController": cmd = "python3 ~/ghostnet/modules/PayloadController.py --status"; break;
      case "ghostProtocol": cmd = "python3 ~/ghostnet/modules/GhostProtocol.py --init"; break;

      default:
        socket.emit("toolOutput", `❌ Unknown tool: ${tool}`);
        return;
    }

    // Execute command
    exec(cmd, (err, stdout, stderr) => {
      if (err) socket.emit("toolOutput", `❌ Error: ${stderr || err.message}`);
      else socket.emit("toolOutput", `✅ ${tool} output:\n${stdout}`);
    });
  });
});

// ---------------- START SERVER ----------------
const PORT = process.env.PORT || 4001;
server.listen(PORT, () => console.log(`🚀 GhostNet2 backend running on http://localhost:${PORT}`));










