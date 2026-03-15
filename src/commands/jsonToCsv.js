// json-to-csv --input documents/data.json --output documents/data.csv
import fs from 'node:fs';
import { Transform } from 'node:stream';
import { pathResolver } from '../utils/pathResolver.js';
import { getArgValue } from '../utils/getArgValue.js';
import { pipeline } from 'node:stream/promises';

export async function jsonToCsv(currentDir, args) {
  const inputPath = getArgValue('--input', args);
  const outputPath = getArgValue('--output', args);
  const resolvedInputPath = pathResolver(currentDir, inputPath);
  const resolvedOutputPath = pathResolver(currentDir, outputPath);

  let headers = '';
  let buffer = '';

  const readStream = fs.createReadStream(resolvedInputPath);
  const writeStream = fs.createWriteStream(resolvedOutputPath);

  const jsonTransformer = new Transform({
    transform(chunk, encoding, callback) {
      buffer += chunk.toString();
      callback();
    },
    flush(callback) {
      const data = JSON.parse(buffer);

      if (data.length) {
        headers = Object.keys(data[0]).join(',');
        this.push(`${headers}\n`);

        for (const line of data) {
          this.push(`${Object.values(line).join(',')}\n`);
        }
      }

      callback();
    }
  });

  try {
    await pipeline(readStream, jsonTransformer, writeStream);
    console.log('Conversion has been completed successfully!');
  } catch (err) {
    throw new Error('Pipeline error');
  }
}
