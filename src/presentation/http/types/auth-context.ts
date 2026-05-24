import type { CurrentUser } from './current-user';

declare module 'elysia' {
  interface Context {
    currentUser: CurrentUser | null;
    userId: string | null;
  }
}

export {};
