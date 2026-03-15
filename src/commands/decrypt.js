// decrypt --input documents/file.txt.enc --output documents/file.txt.dec --password mySecret
import fs from 'node:fs';
import { stat, open } from 'node:fs/promises';
import crypto from 'node:crypto';
import { pipeline } from 'node:stream/promises';
import { pathResolver } from '../utils/pathResolver.js';
import { getArgValue } from '../utils/getArgValue.js';

export async function decryptData(currentDir, args) {
  const inputPath = getArgValue('--input', args);
  const outputPath = getArgValue('--output', args);
  const password = getArgValue('--password', args);

  const resolvedInputPath = pathResolver(currentDir, inputPath);
  const resolvedOutputPath = pathResolver(currentDir, outputPath);

  try {
    const stats = await stat(resolvedInputPath);
    const fileSize = stats.size;

    const handle = await open(resolvedInputPath, 'r');

    const salt = Buffer.alloc(16);
    const iv = Buffer.alloc(12);
    const authTag = Buffer.allocUnsafe(16);

    await handle.read(salt, 0, 16, 0);
    await handle.read(iv, 0, 12, 16);
    await handle.read(authTag, 0, 16, fileSize - 16);
    await handle.close();

    const key = crypto.scryptSync(password, salt, 32);
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);

    decipher.setAuthTag(authTag);

    const readStream = fs.createReadStream(resolvedInputPath, {
      start: 28,
      end: fileSize - 17
    });

    const writeStream = fs.createWriteStream(resolvedOutputPath);

    await pipeline(readStream, decipher, writeStream);

    console.log('Decryption has been completed successfully!');
  } catch (err) {
    throw new Error('Operation failed');
  }
}
