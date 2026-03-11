import { Pool } from 'pg';
import { Kysely, PostgresDialect } from 'kysely';

export interface UsersTable {
  id: string;
  email: string;
  password: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export interface Database {
  users: UsersTable;
}

export function createDb(): Kysely<Database> {
  const dialect = new PostgresDialect({
    pool: new Pool({
      connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/investment_tracker',
    }),
  });

  return new Kysely<Database>({
    dialect,
  });
}
