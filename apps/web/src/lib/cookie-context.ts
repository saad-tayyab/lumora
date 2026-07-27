import { AsyncLocalStorage } from 'node:async_hooks';

export const cookieStore = new AsyncLocalStorage<string>();
