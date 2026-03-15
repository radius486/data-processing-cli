import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import os from 'node:os';
import { handleCommand } from './repl.js';

const rl = readline.createInterface({ input, output });

rl.on('SIGINT', () => {
  console.log('\nThank you for using Data Processing CLI!');
  process.exit(0);
});

const state = {
  currentDir: os.homedir()
};

const startREPL = async () => {
  console.log('Welcome to Data Processing CLI!');

  while (true) {
    console.log(`You are currently in ${state.currentDir}`);

    const userInput = await rl.question('> ');
    const [command, ...args] = userInput.trim().split(/\s+/);

    try {
      await handleCommand(command, args, state);
    } catch (err) {
      console.log('Operation failed');
    }

    process.stdout.write('\n');
  }
};

await startREPL();
