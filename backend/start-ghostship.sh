#!/bin/bash

# Load .env
export $(grep -v '^#' .env | xargs)

# Set default values if not set
PORT=${TELEMETRY_PORT:-5000}
AUTH_TOKEN=${GHOST_AUTH:-changeme-token}

# Kill any process using the port
if lsof -i :$PORT >/dev/null; then
    echo "Port $PORT in use. Killing process..."
    lsof -ti :$PORT | xargs kill -9
fi

# Ensure dependencies are installed
echo "Installing dependencies..."
npm install express socket.io socket.io-client systeminformation cors helmet morgan blessed blessed-contrib dotenv

# Start telemetry server
echo "Starting telemetry server..."
node --experimental-modules telemetry-server.js &

# Wait a second to ensure server is up
sleep 1

# Start GhostShip terminal monitor
echo "Starting GhostShip terminal monitor..."
node --experimental-modules monitor-ghostship.js &
