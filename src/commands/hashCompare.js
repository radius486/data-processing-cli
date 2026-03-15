// hash-compare --input documents/file.txt --hash documents/file.txt.sha256
// hash-compare --input documents/file.txt --hash documents/file.txt.md5 --algorithm md5
import fs from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { pathResolver } from '../utils/pathResolver.js';
import { getArgValue } from '../utils/getArgValue.js';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';

export async function compareHash(currentDir, args) {
  try {
    const inputPath = getArgValue('--input', args);
    const hashPath = getArgValue('--hash', args);
    const algorithm = getArgValue('--algorithm', args) ?? 'sha256';

    const resolvedInputPath = pathResolver(currentDir, inputPath);
    const resolvedHashPath = pathResolver(currentDir, hashPath);
    const readStream = fs.createReadStream(resolvedInputPath, { encoding: 'utf8' });

    const hash = createHash(algorithm);

    await pipeline(
      readStream,
      hash,
    );

    const calculatedHash = hash.digest('hex');
    const expectedHashContent = await readFile(resolvedHashPath);
    const expectedHash = expectedHashContent.toString();

    console.log(calculatedHash === expectedHash ? 'OK' : 'MISMATCH');
  } catch (err) {
    throw new Error('Pipeline error');
  }
}
