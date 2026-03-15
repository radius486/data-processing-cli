// encrypt --input documents/file.txt --output documents/file.txt.enc --password mySecret
import fs from 'node:fs';
import { appendFile } from 'node:fs/promises';
import crypto from 'node:crypto';
import { pipeline } from 'node:stream/promises';
import { pathResolver } from '../utils/pathResolver.js';
import { getArgValue } from '../utils/getArgValue.js';

export async function encryptData(currentDir, args) {
  const inputPath = getArgValue('--input', args);
  const outputPath = getArgValue('--output', args);
  const password = getArgValue('--password', args);

  const resolvedInputPath = pathResolver(currentDir, inputPath);
  const resolvedOutputPath = pathResolver(currentDir, outputPath);

  const salt = crypto.randomBytes(16);
  const iv = crypto.randomBytes(12);
  const key = crypto.scryptSync(password, salt, 32);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

  const readStream = fs.createReadStream(resolvedInputPath);
  const writeStream = fs.createWriteStream(resolvedOutputPath);

  try {
    writeStream.write(salt);
    writeStream.write(iv);

    await pipeline(readStream, cipher, writeStream);

    const authTag = cipher.getAuthTag();

    await appendFile(resolvedOutputPath, authTag);

    console.log('Encryption has been completed successfully!');
  } catch (err) {
    console.error(err);
    throw new Error('Operation failed');
  }
}
