// csv-to-json --input documents/data.csv --output documents/data.json
import fs from 'node:fs';
import { Transform } from 'node:stream';
import { pathResolver } from '../utils/pathResolver.js';
import { getArgValue } from '../utils/getArgValue.js';
import { pipeline } from 'node:stream/promises';

export async function csvToJson(currentDir, args) {
  const inputPath = getArgValue('--input', args);
  const outputPath = getArgValue('--output', args);
  const resolvedInputPath = pathResolver(currentDir, inputPath);
  const resolvedOutputPath = pathResolver(currentDir, outputPath);

  let headers = null;
  let isFirstRow = true;
  let buffer = '';

  const readStream = fs.createReadStream(resolvedInputPath);
  const writeStream = fs.createWriteStream(resolvedOutputPath);

  const csvTransformer = new Transform({
    transform(chunk, encoding, callback) {
      let data = buffer + chunk.toString();
      const lines = data.split(/\r?\n/);

      buffer = lines.pop();

      for (const line of lines) {
        if (!line.trim()) continue;
        const values = line.split(',');

        if (!headers) {
          headers = values.map(h => h.trim());
          this.push('[\n');
          continue;
        }

        const obj = {};
        headers.forEach((h, i) => obj[h] = values[i]?.trim() || '');

        const jsonLine = (isFirstRow ? '' : ',\n') + '  ' + JSON.stringify(obj);
        this.push(jsonLine);
        isFirstRow = false;
      }

      callback();
    },
    flush(callback) {
      if (buffer && headers) {
        const obj = {};
        const values = buffer.split(',');
        headers.forEach((h, i) => obj[h] = values[i]?.trim() || '');
        this.push((isFirstRow ? '' : ',\n') + '  ' + JSON.stringify(obj));
      }
      this.push('\n]');
      callback();
    }
  });

  try {
    await pipeline(readStream, csvTransformer, writeStream);
    console.log('Conversion has been completed successfully!');
  } catch (err) {
    throw new Error('Pipeline error');
  }
}
