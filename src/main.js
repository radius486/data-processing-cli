import path from 'path';
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import os from 'node:os';
import fs from 'node:fs/promises';

const __dirname = path.resolve();
const __homedir = os.homedir();
const rl = readline.createInterface({ input, output });

let __currentDir = __homedir;

const dataProcessingToolkit = async () => {
  async function prompt() {
    console.log('Welcome to Data Processing CLI!');
    console.log(`You are currently in ${__currentDir}`);

    const userInput = await rl.question('> ');
    const [command, value] = userInput.split(' ');

    try {
      switch (command) {
        case 'up':
          __currentDir = path.join(__currentDir, '../');
          break;
        case 'cd':
          const __newDir = value.startsWith('/') ? value : path.join(__currentDir, value);
          const stats = await fs.stat(__newDir);
          const isDirectory = stats.isDirectory();

          if (!isDirectory) {
            throw new Error('Not a directory');
          }

          __currentDir = __newDir;

          break;
        case 'ls':
          const entries = await fs.readdir(__currentDir, { withFileTypes: true });
          let maxLength = 0;

          entries.sort((a, b) => {
            maxLength = a.name.length > maxLength ? a.name.length : maxLength;

            const aType = a.isDirectory();
            const bType = b.isDirectory();

            const typeComparison = bType - aType;

            if (typeComparison !== 0) {
              return typeComparison;
            }

            return a.name.localeCompare(b.name);
          });

          for (const entry of entries) {
            const spaces = ' '.repeat(maxLength - entry.name.length);
            console.log(`${entry.name + spaces} [${entry.isDirectory() ? 'folder' : 'file'}]`);
          }

          break;
        case '.exit':
          console.log('Thank you for using Data Processing CLI!');
          process.exit(0);
          break;
        default:
          console.log('Invalid input');
          break;
      }
    } catch (error) {
      console.log('Operation failed');
    }

    process.stdout.write('\n');
    return prompt();
  }

  (async () => {
    await prompt();
    rl.close();
  })();
};

await dataProcessingToolkit();
