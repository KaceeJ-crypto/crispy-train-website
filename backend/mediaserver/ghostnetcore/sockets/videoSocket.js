// ghostnetcore/sockets/videoSocket.js
export function videoSocket(io, socket) {
  console.log('Video client connected:', socket.id);

  // === Start a video stream ===
  socket.on('start-stream', ({ serverName, streamKey, feedUrl }) => {
    console.log(`[${serverName}] Starting stream to Twitch: ${feedUrl}`);
    // Broadcast to other clients that this stream started
    io.emit('stream-started', { serverName, feedUrl });
  });

  // === Stop a video stream ===
  socket.on('stop-stream', ({ serverName }) => {
    console.log(`[${serverName}] Stopping stream`);
    io.emit('stream-stopped', { serverName });
  });

  // === Update stream configuration ===
  socket.on('update-stream', ({ serverName, config }) => {
    console.log(`[${serverName}] Updating stream config`, config);
    io.emit('stream-updated', { serverName, config });
  });

  // === Video preview update ===
  socket.on('update-preview', ({ serverName, previewUrl }) => {
    console.log(`[${serverName}] Updated preview: ${previewUrl}`);
    io.emit('preview-updated', { serverName, previewUrl });
  });

  // === Disconnect handler ===
  socket.on('disconnect', () => {
    console.log('Video client disconnected:', socket.id);
  });
}
