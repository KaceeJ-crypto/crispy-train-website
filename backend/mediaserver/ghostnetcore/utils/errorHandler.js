export function handleError(err, res) {
  console.error(`[GhostNetCore ERROR] ${new Date().toISOString()}:`, err);
  res.status(500).json({ error: err.message });
}
