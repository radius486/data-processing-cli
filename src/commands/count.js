// count --input documents/file.txt
import fs from 'node:fs';
import { Writable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { pathResolver } from '../utils/pathResolver.js';
import { getArgValue } from '../utils/getArgValue.js';

class Counter extends Writable {
  constructor(options) {
    super(options);
    this.lines = 0;
    this.words = 0;
    this.chars = 0;
    this.inWord = false;
  }

  _write(chunk, encoding, callback) {
    const content = Buffer.isBuffer(chunk) ? chunk.toString() : chunk;

    this.chars += content.length;

    for (let i = 0; i < content.length; i++) {
      const char = content[i];

      if (char === '\n') {
        this.lines++;
      }

      const isWhitespace = /\s/.test(char);

      if (!isWhitespace && !this.inWord) {
        this.words++;
        this.inWord = true;
      } else if (isWhitespace) {
        this.inWord = false;
      }
    }

    callback();
  }
}

export async function count(currentDir, args) {
  try {
    const inputPath = getArgValue('--input', args);
    const resolvedInputPath = pathResolver(currentDir, inputPath);
    const readStream = fs.createReadStream(resolvedInputPath, { encoding: 'utf8' });
    const counter = new Counter();

    await pipeline(readStream, counter);

    console.log(`Lines: ${counter.lines}`);
    console.log(`Words: ${counter.words}`);
    console.log(`Characters: ${counter.chars}`);

  } catch (err) {
    throw new Error('Pipeline error');
  }
}
