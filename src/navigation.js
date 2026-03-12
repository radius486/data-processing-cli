import path from 'path';
import fs from 'node:fs/promises';

export async function goUp(currentDir) {
  return path.join(currentDir, '..');
}

export async function changeDir(currentDir, value) {
  const newDir = value.startsWith('/') ? value : path.resolve(currentDir, value);
  const stats = await fs.stat(newDir);

  if (!stats.isDirectory()) throw new Error('Not a directory');

  return newDir;
}

export async function listDir(currentDir) {
  const entries = await fs.readdir(currentDir, { withFileTypes: true });

  entries.sort((a, b) => {
    const typeDiff = b.isDirectory() - a.isDirectory();

    return typeDiff !== 0 ? typeDiff : a.name.localeCompare(b.name);
  });

  const maxLength = Math.max(...entries.map(e => e.name.length), 0);

  for (const entry of entries) {
    const spaces = ' '.repeat(maxLength - entry.name.length);
    const type = entry.isDirectory() ? 'folder' : 'file';

    console.log(`${entry.name}${spaces} [${type}]`);
  }
}
