#!/bin/bash
# GhostShip startup script
# Starts telemetry server + terminal monitor

# Load environment variables
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

# Set defaults if not defined
TELEMETRY_PORT=${TELEMETRY_PORT:-5000}
GHOST_AUTH=${GHOST_AUTH:-changeme-token}
TELEMETRY_INTERVAL_MS=${TELEMETRY_INTERVAL_MS:-2000}
TELEMETRY_URL=${TELEMETRY_URL:-http://127.0.0.1:$TELEMETRY_PORT}

# Kill any previous Node processes on the telemetry port
PID=$(lsof -ti tcp:$TELEMETRY_PORT)
if [ -n "$PID" ]; then
  echo "Killing previous process on port $TELEMETRY_PORT (PID $PID)"
  kill -9 $PID
fi

echo "Starting GhostShip Telemetry Server..."
node telemetry-server.js &
TELEMETRY_PID=$!
sleep 2

echo "Starting GhostShip Terminal Monitor..."
node monitor-ghostship.js &
MONITOR_PID=$!

echo "GhostShip stack running:"
echo "Telemetry Server PID: $TELEMETRY_PID on port $TELEMETRY_PORT"
echo "Terminal Monitor PID: $MONITOR_PID"

# Wait for background processes to exit (optional)
wait $TELEMETRY_PID $MONITOR_PID
