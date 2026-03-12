import path from 'path';
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import os from 'node:os';

const __dirname = path.resolve();
const __homedir = os.homedir();
const rl = readline.createInterface({ input, output });

let __currentDir = __homedir;

const dataProcessingToolkit = async () => {

  async function prompt() {

    console.log('Welcome to Data Processing CLI!');
    console.log(`You are currently in ${__currentDir}`);

    const command = await rl.question('> ');

    switch (command) {
      case 'up':
        __currentDir = path.join(__currentDir, '../');
        break;
      case 'cwd':
        console.log('Current working directory: ', __currentDir);
        break;
      case 'date':
        const date = new Date().toISOString();
        console.log('Current date: ', date);
        break;
      case '.exit':
        console.log('Thank you for using Data Processing CLI!');
        process.exit(0);
        break;
      default:
        console.log('Invalid input');
        break;
    }

    return prompt();
  }

  (async () => {
    await prompt();
    rl.close();
  })();
};

await dataProcessingToolkit();
