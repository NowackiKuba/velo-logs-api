import { Elysia, t } from 'elysia';
import { runLogBenchmark } from './benchmark';

const PORT = Number(process.env.MOCK_CLIENT_PORT ?? 4000);
const LOGS_API_URL = process.env.LOGS_API_URL ?? 'http://localhost:3000/api/v1/logs';
const LOGS_API_KEY = process.env.LOGS_API_KEY ?? 'velo_f549957f0913854f59f2e3af6d4b2290';
const AUTO_BENCHMARK = process.env.AUTO_BENCHMARK === 'true';
const AUTO_BENCHMARK_TOTAL = Number(process.env.AUTO_BENCHMARK_TOTAL ?? 150);
const AUTO_BENCHMARK_CONCURRENCY = Number(process.env.AUTO_BENCHMARK_CONCURRENCY ?? 5);

const maskApiKey = (apiKey: string) => `${apiKey.slice(0, 12)}...${apiKey.slice(-4)}`;

const BenchmarkBodySchema = t.Object({
  total: t.Optional(t.Numeric({ minimum: 1, maximum: 100_000 })),
  concurrency: t.Optional(t.Numeric({ minimum: 1, maximum: 500 })),
  service: t.Optional(t.String({ minLength: 1, maxLength: 50 })),
});

const app = new Elysia()
  .get('/', () => ({
    name: 'velo-logs-mock-client',
    port: PORT,
    target: LOGS_API_URL,
    apiKey: maskApiKey(LOGS_API_KEY),
    endpoints: {
      health: 'GET /',
      benchmark: 'POST /benchmark',
      single: 'POST /send',
    },
    defaults: {
      total: 100,
      concurrency: 10,
      service: 'benchmark-client',
    },
  }))
  .post('/send', async () => {
    const result = await runLogBenchmark({
      apiUrl: LOGS_API_URL,
      apiKey: LOGS_API_KEY,
      total: 1,
      concurrency: 1,
      service: 'benchmark-client',
    });

    return {
      ok: result.success === 1,
      result,
    };
  })
  .post(
    '/benchmark',
    async ({ body }) => {
      const total = body.total ?? 100;
      const concurrency = body.concurrency ?? 10;
      const service = body.service ?? 'benchmark-client';

      const result = await runLogBenchmark({
        apiUrl: LOGS_API_URL,
        apiKey: LOGS_API_KEY,
        total,
        concurrency,
        service,
      });

      return {
        target: LOGS_API_URL,
        service,
        ...result,
      };
    },
    {
      body: BenchmarkBodySchema,
    },
  )
  .listen(4000);

console.log(`Mock log client running at http://${app.server?.hostname}:${app.server?.port}`);
console.log(`Sending logs to ${LOGS_API_URL} with key ${maskApiKey(LOGS_API_KEY)}`);

if (AUTO_BENCHMARK) {
  void runLogBenchmark({
    apiUrl: LOGS_API_URL,
    apiKey: LOGS_API_KEY,
    total: AUTO_BENCHMARK_TOTAL,
    concurrency: AUTO_BENCHMARK_CONCURRENCY,
    service: 'benchmark-client',
  }).then((result) => {
    console.log('Auto benchmark finished:', result);
  });
}
