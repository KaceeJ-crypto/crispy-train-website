export let CONFIG = {
  youtubeKey: "",
  facebookKey: "",
  cameraFeeds: [
    "http://localhost:3001/camera1-feed",
    "http://localhost:3002/camera2-feed",
    "http://localhost:3003/camera3-feed",
    "http://localhost:3004/camera4-feed"
  ]
};

import fs from 'fs';

export function loadConfig() {
  if (fs.existsSync('config.json')) {
    Object.assign(CONFIG, JSON.parse(fs.readFileSync('config.json')));
    console.log('✅ GhostNetCore config loaded');
  }
}

export function saveConfig(newConfig) {
  Object.assign(CONFIG, newConfig);
  fs.writeFileSync('config.json', JSON.stringify(CONFIG, null, 2));
}
