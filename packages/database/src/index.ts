import { SQLDatabase } from 'encore.dev/storage/sqldb';
import * as schema from './schema';

export const db = new SQLDatabase('lumora', {
  migrations: './encore-migrations',
});

export { schema };

export * from './schema';
