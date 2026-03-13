import fs from 'node:fs';
import { Transform, pipeline } from 'node:stream';

export async function csvToJson(inputPath, outputPath) {
  console.log('CSV: ', inputPath);
  console.log('JSON: ', outputPath);

  let headers = null;
  let isFirstRow = true;
  let buffer = '';

  const readStream = fs.createReadStream(inputPath);
  const writeStream = fs.createWriteStream(outputPath);

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

  pipeline(readStream, csvTransformer, writeStream, (err) => {
    if (err) {
      throw new Error('Pipeline failed');
    } else {
      console.log('Conversion has been completed successfully!');
    }
  });
}
