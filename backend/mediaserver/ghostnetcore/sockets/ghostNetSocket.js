export function ghostNetSocket(io, socket) {
  console.log('GhostNet socket connected:', socket.id);

  socket.on('add-node', (nodeData) => {
    // broadcast new node to all clients
    io.emit('node-added', nodeData);
  });

  socket.on('update-node', (nodeData) => {
    io.emit('node-updated', nodeData);
  });

  socket.on('link-nodes', (linkData) => {
    io.emit('nodes-linked', linkData);
  });
}
