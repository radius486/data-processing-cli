import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import os from 'node:os';
import { handleCommand } from './repl.js';

const rl = readline.createInterface({ input, output });

const state = {
  currentDir: os.homedir()
};

const startREPL = async () => {
  console.log('Welcome to Data Processing CLI!');

  while (true) {
    console.log(`You are currently in ${state.currentDir}`);

    const userInput = await rl.question('> ');
    const [command, value] = userInput.trim().split(/\s+/);

    try {
      await handleCommand(command, value, state);
    } catch (error) {
      console.log('Operation failed');
    }

    process.stdout.write('\n');
  }
};

await startREPL();
