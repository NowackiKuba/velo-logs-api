import cookie from '@elysiajs/cookie';
import { Elysia } from 'elysia';
import { printRoutes } from './presentation/http/plugins/print-routes';
import { createAuthMiddleware } from './presentation/http/middleware/auth.middleware';
import { authGuard } from './presentation/http/guards/auth.guard';
import { errorPlugin } from './presentation/errors';
import cors from '@elysia/cors';
import { JwtTokenService } from './infrastructure/auth/jwt-token.service';
import { BcryptPasswordHasher } from './infrastructure/auth/bcrypt-password-hasher';
import { UserRepository } from './infrastructure/db/repositories/drizzle-user.repository';
import { LoginUseCase } from './application/auth/use-cases/login.use-case';
import { RegisterUseCase } from './application/auth/use-cases/register.use-case';
import { FindUserByIdUseCase } from './application/user/use-cases/find-user-by-id.use-case';
import { db } from './infrastructure/db';

const jwtSecret = process.env.JWT_SECRET ?? 'dev-local-jwt-secret-min-32-chars-long';

const userRepo = new UserRepository(db);
// const projectRepo = new DrizzleProjectRepository(db);
// const projectMemberRepo = new DrizzleProjectMemberRepository(db);
// const endpointRepo = new DrizzleEndpointRepository(db);
// const webhookLogRepo = new DrizzleWebhookLogRepository(db);
const passwordHasher = new BcryptPasswordHasher();
const tokenService = new JwtTokenService(jwtSecret);

const loginUseCase = new LoginUseCase(userRepo, passwordHasher);
const registerUseCase = new RegisterUseCase(userRepo, passwordHasher);
const findUserByIdUseCase = new FindUserByIdUseCase(userRepo);

// const webhookQueue = new BullMQWebhookQueue();

const apiV1 = new Elysia({ prefix: '/api/v1', normalize: 'typebox' })
  .use(cookie())
  .use(printRoutes())
  .use(createAuthMiddleware(findUserByIdUseCase, tokenService))
  .use(authGuard)
  .use(errorPlugin)
  .get('/', () => 'Hello Elysia', { isPublic: true });

const app = new Elysia()
  .use(apiV1)
  // .ws('/ws/projects/:projectId', {
  //   open(ws) {
  //     ws.subscribe(projectRoom(ws.data.params.projectId));
  //   },
  // })
  .use(cors({ origin: 'http://localhost:5173' }))
  .listen(3000);

// const publishToFront = createPublishToFront((topic, data) => {
//   app.server?.publish(topic, data);
// });

// const stopWebhookEventSubscriber = startWebhookEventSubscriber(createRedisSubscriber(), publishToFront);

// if (process.env.ENABLE_EMBEDDED_WORKER === 'true') {
//   const eventPublisher = new InProcessWebhookEventPublisher(publishToFront);
//   initWebhookWorker(processWebhookJobUseCase, eventPublisher);
//   console.log('⚙️  Embedded webhook worker enabled');
// }

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
// console.log(`📮 Redis (BullMQ): ${getRedisDisplayUrl()}`);

// if (process.env.RUN_BENCHMARK === 'true') {
//   void runBenchmark({
//     baseUrl: `http://${app.server?.hostname ?? 'localhost'}:${app.server?.port ?? 3000}`,
//   });
// }

// process.on('SIGINT', () => {
//   stopWebhookEventSubscriber();
//   redis.disconnect();
// });

// process.on('SIGTERM', () => {
//   stopWebhookEventSubscriber();
//   redis.disconnect();
// });
