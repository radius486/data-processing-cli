import { workerData, parentPort } from 'node:worker_threads';
import fs from 'node:fs';

const { path, start, end } = workerData;

async function processChunk() {
  const stats = {
    total: 0,
    levels: {},
    status: { '2xx': 0, '3xx': 0, '4xx': 0, '5xx': 0 },
    paths: {},
    responseTimeSum: 0
  };

  const stream = fs.createReadStream(path, { start, end: end - 1 });

  let remaining = '';

  for await (const chunk of stream) {
    const lines = (remaining + chunk.toString()).split('\n');
    remaining = lines.pop();

    for (const line of lines) {
      if (!line.trim()) continue;

      const parts = line.split(' ');

      if (parts.length < 7) continue;

      const [,, level, statusCode, respTime,, path] = parts;

      stats.total++;
      stats.levels[level] = (stats.levels[level] || 0) + 1;

      const statusGroup = `${statusCode[0]}xx`;

      if (stats.status.hasOwnProperty(statusGroup)) stats.status[statusGroup]++;

      stats.paths[path] = (stats.paths[path] || 0) + 1;
      stats.responseTimeSum += parseInt(respTime, 10) || 0;
    }
  }

  parentPort.postMessage(stats);
}

processChunk();
