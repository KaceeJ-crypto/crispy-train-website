import fs from 'fs';
import path from 'path';
import { runBotCode } from './sandbox.js';

const botFolder = path.join(process.cwd(), 'bots');

export function loadBots() {
  const botFiles = fs.readdirSync(botFolder).filter(f => f.endsWith('.js'));
  return botFiles.map(f => ({
    name: f,
    code: fs.readFileSync(path.join(botFolder, f), 'utf-8')
  }));
}

export function runAllBots(context = {}) {
  const bots = loadBots();
  bots.forEach(bot => {
    console.log(`Executing bot: ${bot.name}`);
    runBotCode(bot.code, context);
  });
}
