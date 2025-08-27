import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import io from "socket.io-client";
import "./videohub.css";

const BACKEND_URL = "http://localhost:5000";
const socket = io(BACKEND_URL);
const SERVERS = ["server1", "server2", "server3", "server4"];

export default function VideoHub() {
  // ---------------- States ----------------
  const [configs, setConfigs] = useState({});
  const [zoomLevels, setZoomLevels] = useState({});
  const [stabilizeFlags, setStabilizeFlags] = useState({});
  const [previews, setPreviews] = useState({});
  const [logs, setLogs] = useState([]);
  const [recording, setRecording] = useState({});
  const [recordedChunks, setRecordedChunks] = useState({});
  const [metadata, setMetadata] = useState({ title: "", description: "", tags: "" });
  const [bgmFile, setBgmFile] = useState(null);
  const [streamKeys, setStreamKeys] = useState({ twitch: "", youtube: "", facebook: "" });

  // ---------------- Refs ----------------
  const videoRefs = useRef(new Map());
  const mediaRecorders = useRef({});
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  // Feed UI state
  const [feedState, setFeedState] = useState(
    Object.fromEntries(SERVERS.map(s => [s, { muted: false, selected: false }]))
  );

  // ---------------- Socket.IO ----------------
  useEffect(() => {
    socket.on("configUpdate", ({ serverName, ...data }) => {
      setConfigs(prev => ({ ...prev, [serverName]: data }));
    });

    socket.on("updatePreview", ({ serverName, previewUrl }) => {
      setPreviews(prev => ({ ...prev, [serverName]: previewUrl }));
    });

    socket.on("mediaStatus", data => {
      setLogs(prev => [...prev, data.message]);
    });

    return () => {
      socket.off("configUpdate");
      socket.off("updatePreview");
      socket.off("mediaStatus");
    };
  }, []);

  // ---------------- Handlers ----------------
  const handleInputChange = (server, field, value) => {
    setConfigs(prev => ({
      ...prev,
      [server]: { ...prev[server], [field]: value },
    }));
  };

  const saveConfig = async (server) => {
    const cfg = configs[server];
    if (!cfg?.feedUrl) return setLogs(prev => [...prev, `Feed URL required for ${server}.`]);
    try {
      await axios.post(`${BACKEND_URL}/set-config`, {
        serverName: server,
        feedUrl: cfg.feedUrl,
      });
      setLogs(prev => [...prev, `Config saved for ${server}.`]);
    } catch (error) {
      setLogs(prev => [...prev, `Error saving config for ${server}: ${error.message}`]);
    }
  };

  const startStream = async (server) => {
    try {
      const cfg = configs[server] || {};
      await axios.post(`${BACKEND_URL}/start-stream`, {
        serverName: server,
        twitchKey: cfg.twitchKey || streamKeys.twitch,
        youtubeKey: cfg.youtubeKey || streamKeys.youtube,
        facebookKey: cfg.facebookKey || streamKeys.facebook,
      });
      setLogs(prev => [...prev, `Streaming started for ${server}.`]);
    } catch (error) {
      setLogs(prev => [...prev, `Error starting stream for ${server}: ${error.message}`]);
    }
  };

  const startRecordingServer = async (server) => {
    try {
      await axios.post(`${BACKEND_URL}/start-recording`, {
        serverName: server,
        outputFormat: "mp4",
      });
      setLogs(prev => [...prev, `Server recording started for ${server}.`]);
    } catch (error) {
      setLogs(prev => [...prev, `Error starting server recording for ${server}: ${error.message}`]);
    }
  };

  const takeSnapshotServer = async (server) => {
    try {
      await axios.post(`${BACKEND_URL}/snapshot`, { serverName: server });
      setLogs(prev => [...prev, `Snapshot taken for ${server}.`]);
    } catch (error) {
      setLogs(prev => [...prev, `Error taking snapshot for ${server}: ${error.message}`]);
    }
  };

  const handleZoomChange = async (server, value) => {
    setZoomLevels(prev => ({ ...prev, [server]: value }));
    try {
      await axios.post(`${BACKEND_URL}/set-zoom`, { serverName: server, zoom: value });
    } catch (error) {
      setLogs(prev => [...prev, `Error setting zoom for ${server}: ${error.message}`]);
    }
  };

  const toggleStabilize = async (server) => {
    const newVal = !stabilizeFlags[server];
    setStabilizeFlags(prev => ({ ...prev, [server]: newVal }));
    try {
      await axios.post(`${BACKEND_URL}/set-stabilize`, { serverName: server, stabilize: newVal });
    } catch (error) {
      setLogs(prev => [...prev, `Error toggling stabilization for ${server}: ${error.message}`]);
    }
  };

  const uploadMusic = async (server, file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await axios.post(`${BACKEND_URL}/upload-music`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await axios.post(`${BACKEND_URL}/set-music`, { serverName: server, musicPath: res.data.path });
      setLogs(prev => [...prev, `Music uploaded for ${server}.`]);
    } catch (error) {
      setLogs(prev => [...prev, `Error uploading music for ${server}: ${error.message}`]);
    }
  };

  const handleMetadataChange = (field, value) => {
    setMetadata(prev => ({ ...prev, [field]: value }));
  };

  const handleBgmUpload = e => {
    const file = e.target.files[0];
    if (file) setBgmFile(URL.createObjectURL(file));
  };

  // ---------------- Canvas Drawing ----------------
  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const cols = Math.ceil(Math.sqrt(SERVERS.length));
    const rows = Math.ceil(SERVERS.length / cols);
    const cellW = canvas.width / cols;
    const cellH = canvas.height / rows;

    SERVERS.forEach((server, idx) => {
      const video = videoRefs.current.get(server);
      if (!video || video.readyState < 2) return;

      const x = (idx % cols) * cellW;
      const y = Math.floor(idx / cols) * cellH;
      ctx.drawImage(video, x, y, cellW, cellH);

      const isSelected = feedState[server]?.selected;
      ctx.strokeStyle = isSelected ? "lime" : "gray";
      ctx.lineWidth = 3;
      ctx.strokeRect(x + 2, y + 2, cellW - 4, cellH - 4);

      ctx.fillStyle = "white";
      ctx.font = "18px Arial";
      ctx.fillText(server.toUpperCase(), x + 10, y + 25);

      if (recording[server] && Math.floor(Date.now() / 500) % 2 === 0) {
        ctx.fillStyle = "red";
        ctx.fillText("● REC", x + 10, y + 50);
      }
    });

    animationRef.current = requestAnimationFrame(drawCanvas);
  };

  useEffect(() => {
    drawCanvas();
    return () => cancelAnimationFrame(animationRef.current);
  }, [configs, feedState, recording]);

  // ---------------- Local Recording ----------------
  const startRecordingFeed = (server) => {
    const video = videoRefs.current.get(server);
    if (!video) return;
    try {
      const stream = video.captureStream(30);

      // Add BGM if uploaded
      if (bgmFile) {
        const audio = new Audio(bgmFile);
        const audioCtx = new AudioContext();
        const source = audioCtx.createMediaElementSource(audio);
        const dest = audioCtx.createMediaStreamDestination();
        source.connect(dest);
        audio.play();
        dest.stream.getAudioTracks().forEach(track => stream.addTrack(track));
      }

      const recorder = new MediaRecorder(stream, { mimeType: "video/webm" });
      const chunks = [];
      recorder.ondataavailable = e => chunks.push(e.data);
      recorder.onstop = () => setRecordedChunks(prev => ({ ...prev, [server]: chunks }));
      recorder.start();

      mediaRecorders.current[server] = recorder;
      setRecording(prev => ({ ...prev, [server]: true }));
      setLogs(prev => [...prev, `Local recording started for ${server}.`]);
    } catch (error) {
      setLogs(prev => [...prev, `Error starting local recording for ${server}: ${error.message}`]);
    }
  };

  const stopRecordingFeed = (server) => {
    const recorder = mediaRecorders.current[server];
    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
      setRecording(prev => ({ ...prev, [server]: false }));
      setLogs(prev => [...prev, `Local recording stopped for ${server}.`]);
    }
  };

  const exportFeed = (server, format = "webm") => {
    const chunks = recordedChunks[server];
    if (!chunks || chunks.length === 0) {
      setLogs(prev => [...prev, `No recorded data for ${server}.`]);
      return;
    }
    const blob = new Blob(chunks, { type: `video/${format}` });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${metadata.title || "feed"}-${server}.${format}`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const snapshotFeed = (server) => {
    const video = videoRefs.current.get(server);
    if (!video) return;
    try {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = `${metadata.title || "snapshot"}-${server}.png`;
      link.click();
      setLogs(prev => [...prev, `Snapshot taken locally for ${server}.`]);
    } catch (error) {
      setLogs(prev => [...prev, `Error taking local snapshot for ${server}: ${error.message}`]);
    }
  };

  // ---------------- UI Rendering ----------------
  return (
    <div className="videohub-container">
      <div className="dashboard-panel">
        <h3>Global Stream Keys</h3>
        {["twitch", "youtube", "facebook"].map((key) => (
          <div key={key}>
            <label>{key.charAt(0).toUpperCase() + key.slice(1)} Key:</label>
            <input
              placeholder={`${key} Stream Key`}
              value={streamKeys[key]}
              onChange={(e) =>
                setStreamKeys((prev) => ({ ...prev, [key]: e.target.value }))
              }
            />
          </div>
        ))}
        <h3>Metadata for Recordings</h3>
        <label>Title:</label>
        <input placeholder="Video Title" value={metadata.title} onChange={e => handleMetadataChange("title", e.target.value)} />
        <label>Description:</label>
        <textarea placeholder="Video Description" value={metadata.description} onChange={e => handleMetadataChange("description", e.target.value)} />
        <label>Tags:</label>
        <input placeholder="Tags (comma-separated)" value={metadata.tags} onChange={e => handleMetadataChange("tags", e.target.value)} />
        <label>BGM File:</label>
        <input type="file" accept="audio/*" onChange={handleBgmUpload} />
      </div>

      <div className="servers-grid">
        {SERVERS.map((server) => (
          <div key={server} className="server-panel">
            <h2>{server.toUpperCase()}</h2>
            <input
              placeholder="Feed URL"
              value={configs[server]?.feedUrl || ""}
              onChange={(e) => handleInputChange(server, "feedUrl", e.target.value)}
            />
            <button onClick={() => saveConfig(server)}>Save Config</button>
            <div className="controls">
              <div>
                <label>Zoom:</label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={zoomLevels[server] || 1}
                  onChange={(e) => handleZoomChange(server, parseFloat(e.target.value))}
                />
                <span>{zoomLevels[server] || 1}x</span>
              </div>
              <div>
                <label>Stabilization:</label>
                <input
                  type="checkbox"
                  checked={stabilizeFlags[server] || false}
                  onChange={() => toggleStabilize(server)}
                />
              </div>
            </div>
            <div className="buttons">
              <button onClick={() => startStream(server)}>Start Stream</button>
              <button onClick={() => startRecordingServer(server)}>Record (Server)</button>
              <button onClick={() => takeSnapshotServer(server)}>Snapshot (Server)</button>
              <input type="file" accept="audio/*" onChange={(e) => uploadMusic(server, e.target.files[0])} />
            </div>
            <div className="preview">
              {previews[server] ? (
                <img src={previews[server]} alt={`${server} preview`} />
              ) : (
                <p>No preview yet</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <canvas ref={canvasRef} className="feed-canvas" width="1280" height="720" />

      <div className="recording-controls">
        {SERVERS.map((server) => (
          <div key={server} className="feed-controls">
            <h4>{server.toUpperCase()}</h4>
            <video
              ref={(el) => videoRefs.current.set(server, el)}
              src={configs[server]?.feedUrl || ""}
              controls
              muted={feedState[server]?.muted || false}
              width={200}
            />
            <div className="local-actions">
              <button onClick={() =>
                  setFeedState(prev => ({ ...prev, [server]: { ...prev[server], muted: !prev[server].muted } }))}>
                {feedState[server]?.muted ? "Unmute" : "Mute"}
              </button>
              <button onClick={() =>
                  setFeedState(prev => ({ ...prev, [server]: { ...prev[server], selected: !prev[server].selected } }))}>
                {feedState[server]?.selected ? "Deselect" : "Select"}
              </button>
              <button onClick={() => startRecordingFeed(server)}>Start Rec (Local)</button>
              <button onClick={() => stopRecordingFeed(server)}>Stop Rec (Local)</button>
              <button onClick={() => exportFeed(server)}>Export (Local)</button>
              <button onClick={() => snapshotFeed(server)}>Snapshot (Local)</button>
            </div>
          </div>
        ))}
      </div>

      <div className="log-panel">
        <h3>Logs</h3>
        <div className="logs">{logs.map((l, i) => <p key={i}>{l}</p>)}</div>
      </div>
    </div>
  );
}



















