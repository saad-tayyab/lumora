import { drizzle } from 'drizzle-orm/node-postgres';
import { SQLDatabase } from 'encore.dev/storage/sqldb';
import { relations } from '@lumora/database/schema/relations';

const DB = new SQLDatabase('lumora', {
  migrations: {
    path: '../../packages/database/migrations',
    source: 'drizzle',
  },
});

export const db = drizzle(DB.connectionString, { relations });
