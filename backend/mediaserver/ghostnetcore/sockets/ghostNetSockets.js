export function ghostNetSocket(io, socket) {
  console.log('GhostNet client connected:', socket.id);

  // === Add a new node ===
  socket.on('add-node', (node) => {
    console.log('Adding node:', node);
    // Broadcast to all clients including sender
    io.emit('node-added', node);
  });

  // === Update node payload/data ===
  socket.on('update-node', (updatedNode) => {
    console.log('Updating node:', updatedNode.id);
    io.emit('node-updated', updatedNode); // broadcast to all clients
  });

  // === Link two nodes ===
  socket.on('link-nodes', (link) => {
    console.log('Linking nodes:', link.source, '->', link.target);
    io.emit('nodes-linked', link);
  });

  // === Optional: Remove node ===
  socket.on('remove-node', (nodeId) => {
    console.log('Removing node:', nodeId);
    io.emit('node-removed', nodeId);
  });

  // === Disconnect handler ===
  socket.on('disconnect', () => {
    console.log('GhostNet client disconnected:', socket.id);
  });
}
