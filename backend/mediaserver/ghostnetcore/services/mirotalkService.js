import { spawn } from 'child_process';

let mirotalkProcess = null;

export function startMiroTalk() {
  if (mirotalkProcess) return;

  mirotalkProcess = spawn('node', ['/path/to/mirotalk/server.js']); // update path

  mirotalkProcess.stdout.on('data', data => console.log('MiroTalk:', data.toString()));
  mirotalkProcess.stderr.on('data', data => console.error('MiroTalk Error:', data.toString()));

  mirotalkProcess.on('close', () => {
    console.log('MiroTalk stopped');
    mirotalkProcess = null;
  });
}

export function stopMiroTalk() {
  if (mirotalkProcess) mirotalkProcess.kill('SIGINT');
}
