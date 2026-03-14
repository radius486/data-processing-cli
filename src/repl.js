import { goUp, changeDir, listDir } from './navigation.js';
import { csvToJson } from './commands/csvToJson.js';
import { jsonToCsv } from './commands/jsonToCsv.js';
import { count } from './commands/count.js';

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
    case '.exit':
      console.log('Thank you for using Data Processing CLI!');
      process.exit(0);
    default:
      console.log('Invalid input');
  }
}
