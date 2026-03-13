import { goUp, changeDir, listDir } from './navigation.js';
import { csvToJson } from './commands/csvToJson.js';

export async function handleCommand(command, value, state) {
  switch (command) {
    case 'up':
      state.currentDir = await goUp(state.currentDir);
      break;
    case 'cd':
      state.currentDir = await changeDir(state.currentDir, value);
      break;
    case 'ls':
      await listDir(state.currentDir);
      break;
    case 'csv-to-json':
      await csvToJson('/Users/rodiongrishaev/documents/data.csv', '/Users/rodiongrishaev/documents/data.json');
      break;
    case '.exit':
      console.log('Thank you for using Data Processing CLI!');
      process.exit(0);
    default:
      console.log('Invalid input');
  }
}
