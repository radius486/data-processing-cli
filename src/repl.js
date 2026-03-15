import { goUp, changeDir, listDir } from './navigation.js';
import { csvToJson } from './commands/csvToJson.js';
import { jsonToCsv } from './commands/jsonToCsv.js';
import { count } from './commands/count.js';
import { calculateHash } from './commands/hash.js';
import { compareHash } from './commands/hashCompare.js';
import { encryptData } from './commands/encrypt.js';
import { decryptData } from './commands/decrypt.js';
import { logStats } from './commands/logStats.js';

export async function handleCommand(command, args, state) {
  switch (command) {
    case 'up':
      state.currentDir = await goUp(state.currentDir);
      break;
    case 'cd':
      state.currentDir = await changeDir(state.currentDir, args);
      break;
    case 'ls':
      await listDir(state.currentDir);
      break;
    case 'csv-to-json':
      await csvToJson(state.currentDir, args);
      break;
    case 'json-to-csv':
      await jsonToCsv(state.currentDir, args);
      break;
    case 'count':
      await count(state.currentDir, args);
      break;
    case 'hash':
      await calculateHash(state.currentDir, args);
      break;
    case 'hash-compare':
      await compareHash(state.currentDir, args);
      break;
    case 'encrypt':
      await encryptData(state.currentDir, args);
      break;
    case 'decrypt':
      await decryptData(state.currentDir, args);
      break;
    case 'log-stats':
      await logStats(state.currentDir, args);
      break;
    case '.exit':
      console.log('Thank you for using Data Processing CLI!');
      process.exit(0);
    default:
      console.log('Invalid input');
  }
}
