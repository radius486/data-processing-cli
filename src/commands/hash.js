// hash --input documents/file.txt --algorithm md5 --save
import fs from 'node:fs';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';
import { pathResolver } from '../utils/pathResolver.js';
import { getArgValue } from '../utils/getArgValue.js';
import { createHash } from 'node:crypto';
import { writeFile } from 'node:fs/promises';

export async function calculateHash(currentDir, args) {
  try {
    const inputPath = getArgValue('--input', args);
    const algorithm = getArgValue('--algorithm', args) ?? 'sha256';
    const save = args.includes('--save');

    const resolvedInputPath = pathResolver(currentDir, inputPath);
    const readStream = fs.createReadStream(resolvedInputPath, { encoding: 'utf8' });

    const hash = createHash(algorithm);

    await pipeline(
      readStream,
      hash,
    );

    const calculatedHash = hash.digest('hex');
    const hashString = `${algorithm}: ${calculatedHash}`
    console.log(hashString);

    if (save) {
      const fileDirectoryArr = resolvedInputPath.split('/');
      fileDirectoryArr.pop();
      const fileDirectoryPath = fileDirectoryArr.join('/');

      await writeFile(path.join(fileDirectoryPath, 'hash.txt'), hashString, 'utf8');
    }
  } catch (err) {
    throw new Error('Pipeline error');
  }
}
