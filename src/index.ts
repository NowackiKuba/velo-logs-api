import cookie from '@elysiajs/cookie';
import { Elysia } from 'elysia';
import '@/presentation/http/types/auth-context';
import { printRoutes } from './presentation/http/plugins/print-routes';
import { createAuthStack } from './presentation/http/middleware/auth.middleware';
import { errorPlugin } from './presentation/errors';
import cors from '@elysia/cors';
import { JwtTokenService } from './infrastructure/auth/jwt-token.service';
import { BcryptPasswordHasher } from './infrastructure/auth/bcrypt-password-hasher';
import { UserRepository } from './infrastructure/db/repositories/drizzle-user.repository';
import { LoginUseCase } from './application/auth/use-cases/login.use-case';
import { RegisterUseCase } from './application/auth/use-cases/register.use-case';
import { FindUserByIdUseCase } from './application/user/use-cases/find-user-by-id.use-case';
import { CreateApiKeyUseCase } from './application/api-keys/use-cases/create-api-key.use-case';
import { ListProjectApiKeysUseCase } from './application/api-keys/use-cases/list-project-api-keys.use-case';
import { db } from './infrastructure/db';
import { AesSecretCipher } from './infrastructure/crypto/aes-secret-cipher';
import { DrizzleApiKeyRepository } from './infrastructure/db/repositories/drizzle-api-key.repository';
import { DrizzleProjectRepository } from './infrastructure/db/repositories/drizzle-project.repository';
import { createApiKeysController } from './presentation/http/controllers/api-keys.controller';
import { createUsersController } from './presentation/http/controllers/users.controller';
import { createAuthController } from './presentation/http/controllers/auth.controller';
import { CreateProjectUseCase } from './application/projects/use-cases/create-project.use-case';
import { DrizzleProjectMemberRepository } from './infrastructure/db/repositories/drizzle-project-member.repository';
import { UpdateProjectUseCase } from './application/projects/use-cases/update-project.use-case';
import { DeleteProjectUseCase } from './application/projects/use-cases/delete-project.use-case';
import { FindProjectByIdUseCase } from './application/projects/use-cases/find-project-by-id.use-case';
import { ListProjectsByUserIdUseCase } from './application/projects/use-cases/list-projects-by-user-id.use-case';
import { createProjectsController } from './presentation/http/controllers/projects.controller';

const jwtSecret = process.env.JWT_SECRET ?? 'dev-local-jwt-secret-min-32-chars-long';
const encryptionSecret = process.env.ENCRYPTION_SECRET ?? jwtSecret;

const userRepo = new UserRepository(db);
const projectRepo = new DrizzleProjectRepository(db);
const projectMemberRepo = new DrizzleProjectMemberRepository(db);
const apiKeyRepo = new DrizzleApiKeyRepository(db);
// const projectMemberRepo = new DrizzleProjectMemberRepository(db);
// const endpointRepo = new DrizzleEndpointRepository(db);
// const webhookLogRepo = new DrizzleWebhookLogRepository(db);
const passwordHasher = new BcryptPasswordHasher();
const tokenService = new JwtTokenService(jwtSecret);
const secretCipher = new AesSecretCipher(encryptionSecret);

const loginUseCase = new LoginUseCase(userRepo, passwordHasher);
const registerUseCase = new RegisterUseCase(userRepo, passwordHasher);
const findUserByIdUseCase = new FindUserByIdUseCase(userRepo);
const createApiKeyUseCase = new CreateApiKeyUseCase(apiKeyRepo, projectRepo, secretCipher);
const listProjectApiKeysUseCase = new ListProjectApiKeysUseCase(apiKeyRepo, projectMemberRepo);

const createProjectUseCase = new CreateProjectUseCase(projectRepo, projectMemberRepo, userRepo);
const findProjectByIdUseCase = new FindProjectByIdUseCase(projectRepo);
const listProjectsByUserIdUseCase = new ListProjectsByUserIdUseCase(projectRepo);
const updateProjectUseCase = new UpdateProjectUseCase(projectRepo);
const deleteProjectUseCase = new DeleteProjectUseCase(projectRepo);

const { authMiddleware, authStack } = createAuthStack(findUserByIdUseCase, tokenService);

// const webhookQueue = new BullMQWebhookQueue();

const apiV1 = new Elysia({ prefix: '/api/v1', normalize: 'typebox' })
  .use(cookie())
  .use(printRoutes())
  .use(createAuthController(loginUseCase, registerUseCase, tokenService))
  .use(authStack)
  .use(errorPlugin)
  .use(createUsersController(authMiddleware))
  .use(
    createProjectsController(
      createProjectUseCase,
      findProjectByIdUseCase,
      listProjectsByUserIdUseCase,
      updateProjectUseCase,
      deleteProjectUseCase,
      authMiddleware,
    ),
  )
  .use(createApiKeysController(createApiKeyUseCase, listProjectApiKeysUseCase, authMiddleware))
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
