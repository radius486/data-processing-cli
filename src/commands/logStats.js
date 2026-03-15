// log-stats --input documents/logs.txt --output documents/stats.json
import { stat, open, writeFile } from 'node:fs/promises';
import os from 'node:os';
import { Worker } from 'node:worker_threads';
import { pathResolver } from '../utils/pathResolver.js';
import { getArgValue } from '../utils/getArgValue.js';

export async function logStats(currentDir, args) {
  const inputPath = getArgValue('--input', args);
  const outputPath = getArgValue('--output', args);

  const resolvedInputPath = pathResolver(currentDir, inputPath);
  const resolvedOutputPath = pathResolver(currentDir, outputPath);

  try {
    const stats = await stat(resolvedInputPath);

    const fileSize = stats.size;
    const numCPUs = os.cpus().length;
    const chunkSize = Math.floor(fileSize / numCPUs);

    const boundaries = [0];

    const fd = await open(resolvedInputPath, 'r');

    for (let i = 1; i < numCPUs; i++) {
      let pos = i * chunkSize;
      const buffer = Buffer.alloc(1024);
      await fd.read(buffer, 0, 1024, pos);
      const nextNewLine = buffer.indexOf('\n');
      boundaries.push(pos + (nextNewLine !== -1 ? nextNewLine + 1 : 0));
    }

    boundaries.push(fileSize);

    await fd.close();

    const workerPromises = boundaries.slice(0, -1).map((start, i) => {
      return new Promise((resolve) => {
        const worker = new Worker(new URL('../workers/logWorker.js', import.meta.url), {
          workerData: { path: resolvedInputPath, start, end: boundaries[i + 1] }
        });

        worker.on('message', resolve);
      });
    });

    const results = await Promise.all(workerPromises);

    const final = {
      total: 0,
      levels: {},
      status: { '2xx': 0, '3xx': 0, '4xx': 0, '5xx': 0 },
      allPaths: {},
      responseTimeTotal: 0
    };

    results.forEach(res => {
      final.total += res.total;
      final.responseTimeTotal += res.responseTimeSum;

      Object.keys(res.levels).forEach(l => final.levels[l] = (final.levels[l] || 0) + res.levels[l]);
      Object.keys(res.status).forEach(s => final.status[s] += res.status[s]);
      Object.keys(res.paths).forEach(p => final.allPaths[p] = (final.allPaths[p] || 0) + res.paths[p]);
    });

    const topPaths = Object.entries(final.allPaths)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([path, count]) => ({ path, count }));

    const outputJSON = {
      total: final.total,
      levels: final.levels,
      status: final.status,
      topPaths,
      avgResponseTimeMs: final.total > 0 ? Number((final.responseTimeTotal / final.total).toFixed(2)) : 0
    };

    await writeFile(resolvedOutputPath, JSON.stringify(outputJSON, null, 2));

    console.log('Statistics generated successfully!');
  } catch (err) {
    console.error('Operation failed');
  }
}
