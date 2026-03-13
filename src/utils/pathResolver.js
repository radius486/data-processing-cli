import path from 'path';

export function pathResolver(currentDir, value) {
  return value.startsWith('/') ? value : path.resolve(currentDir, value);
}
