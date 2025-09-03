#!/bin/bash
# =============================
# VideoHub Full Startup Script
# Termux / Linux compatible
# =============================

BASE_DIR="$HOME/ghost"
BACKEND_DIR="$BASE_DIR/backend/mediaserver"
FRONTEND_DIR="$BASE_DIR/frontend"

# Function to run a command in background with log
run_in_bg() {
    CMD="$1"
    LOG_FILE="$2"
    echo "[INFO] Launching: $CMD (logs -> $LOG_FILE)"
    nohup bash -c "$CMD" > "$LOG_FILE" 2>&1 &
}

echo "[INFO] Starting VideoHub system..."

# -----------------------------
# 1. Start backend
# -----------------------------
run_in_bg "cd $BACKEND_DIR && node backend.js" "$BACKEND_DIR/logs/backend.log"

# -----------------------------
# 2. Start media servers
# -----------------------------
for i in 1 2 3 4; do
    run_in_bg "cd $BACKEND_DIR && node server$i.js" "$BACKEND_DIR/logs/server$i.log"
done

# -----------------------------
# 3. Optional: Start frontend dev server
# -----------------------------
if [ -f "$FRONTEND_DIR/package.json" ]; then
    run_in_bg "cd $FRONTEND_DIR && npm start" "$FRONTEND_DIR/logs/frontend.log"
fi

echo "[INFO] All processes launched."
echo "[INFO] Backend: http://localhost:5000/videohub"
echo "[INFO] Media server previews:"
echo "       server1 -> http://localhost:8081/preview/stream.m3u8"
echo "       server2 -> http://localhost:8082/preview/stream.m3u8"
echo "       server3 -> http://localhost:8083/preview/stream.m3u8"
echo "       server4 -> http://localhost:8084/preview/stream.m3u8"
echo "[INFO] Logs can be found in $BACKEND_DIR/logs/ and $FRONTEND_DIR/logs/"
