export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export type BenchmarkOptions = {
  apiUrl: string;
  apiKey: string;
  total: number;
  concurrency: number;
  service: string;
};

export type BenchmarkResult = {
  total: number;
  success: number;
  failed: number;
  durationMs: number;
  requestsPerSecond: number;
  latencyMs: {
    min: number;
    max: number;
    avg: number;
    p50: number;
    p95: number;
    p99: number;
  };
  errors: string[];
};

const LOG_LEVELS: LogLevel[] = ['debug', 'info', 'warn', 'error', 'fatal'];

const percentile = (sorted: number[], p: number): number => {
  if (sorted.length === 0) return 0;
  const index = Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1);
  return sorted[index] ?? 0;
};

const buildLogPayload = (index: number, service: string) => {
  const level = LOG_LEVELS[index % LOG_LEVELS.length] ?? 'info';

  return {
    service,
    level,
    message: `Benchmark log #${index + 1} at ${new Date().toISOString()}`,
    meta: {
      benchmark: true,
      index,
      level,
      timestamp: Date.now(),
    },
  };
};

const sendLog = async (apiUrl: string, apiKey: string, index: number, service: string): Promise<{ ok: boolean; latencyMs: number; error?: string }> => {
  const startedAt = performance.now();

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': apiKey,
      },
      body: JSON.stringify(buildLogPayload(index, service)),
    });

    const latencyMs = performance.now() - startedAt;

    if (!response.ok) {
      const body = await response.text();
      return {
        ok: false,
        latencyMs,
        error: `${response.status} ${response.statusText}: ${body.slice(0, 200)}`,
      };
    }

    return { ok: true, latencyMs };
  } catch (error) {
    return {
      ok: false,
      latencyMs: performance.now() - startedAt,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

export const runLogBenchmark = async (options: BenchmarkOptions): Promise<BenchmarkResult> => {
  const { apiUrl, apiKey, total, concurrency, service } = options;
  const startedAt = performance.now();

  let nextIndex = 0;
  let success = 0;
  let failed = 0;
  const latencies: number[] = [];
  const errors: string[] = [];

  const worker = async () => {
    while (true) {
      const index = nextIndex;
      nextIndex += 1;

      if (index >= total) {
        return;
      }

      const result = await sendLog(apiUrl, apiKey, index, service);

      latencies.push(result.latencyMs);

      if (result.ok) {
        success += 1;
      } else {
        failed += 1;
        if (result.error && errors.length < 5) {
          errors.push(result.error);
        }
      }
    }
  };

  const workers = Array.from({ length: Math.min(concurrency, total) }, () => worker());
  await Promise.all(workers);

  const durationMs = performance.now() - startedAt;
  const sortedLatencies = [...latencies].sort((a, b) => a - b);
  const latencySum = sortedLatencies.reduce((sum, value) => sum + value, 0);

  return {
    total,
    success,
    failed,
    durationMs: Math.round(durationMs),
    requestsPerSecond: durationMs > 0 ? Number(((success / durationMs) * 1000).toFixed(2)) : 0,
    latencyMs: {
      min: Math.round(sortedLatencies[0] ?? 0),
      max: Math.round(sortedLatencies[sortedLatencies.length - 1] ?? 0),
      avg: sortedLatencies.length > 0 ? Math.round(latencySum / sortedLatencies.length) : 0,
      p50: Math.round(percentile(sortedLatencies, 50)),
      p95: Math.round(percentile(sortedLatencies, 95)),
      p99: Math.round(percentile(sortedLatencies, 99)),
    },
    errors,
  };
};
