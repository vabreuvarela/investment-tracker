import { Kysely } from 'kysely';
import { Pool } from 'pg';
import { PostgresDialect } from 'kysely';
import { Database } from '../client/db';

function createKyselyInstance(): Kysely<Database> {
  const dialect = new PostgresDialect({
    pool: new Pool({
      connectionString:
        process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/investment_tracker',
    }),
  });

  return new Kysely<Database>({
    dialect,
  });
}

interface MigrationModule {
  up(db: Kysely<any>): Promise<void>;
  down(db: Kysely<any>): Promise<void>;
}

const migrations = {
  '001_create_users_table': () => import('./001_create_users_table'),
};

export async function runMigrations(): Promise<void> {
  const db = createKyselyInstance();

  try {
    console.log('Running migrations...');

    for (const [name, importFn] of Object.entries(migrations)) {
      console.log(`Running migration: ${name}`);
      const migration = (await importFn()) as MigrationModule;
      await migration.up(db);
      console.log(`✓ ${name}`);
    }

    console.log('✓ All migrations completed!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await db.destroy();
  }
}

export async function rollbackMigrations(): Promise<void> {
  const db = createKyselyInstance();

  try {
    console.log('Rolling back migrations...');

    const migrationNames = Object.keys(migrations).reverse();
    for (const name of migrationNames) {
      console.log(`Rolling back migration: ${name}`);
      const migration = (await migrations[name as keyof typeof migrations]()) as MigrationModule;
      await migration.down(db);
      console.log(`✓ ${name}`);
    }

    console.log('✓ All migrations rolled back!');
  } catch (error) {
    console.error('Rollback failed:', error);
    process.exit(1);
  } finally {
    await db.destroy();
  }
}

// Handle command-line arguments
async function main() {
  const command = process.argv[2];

  if (command === 'down' || command === 'rollback') {
    await rollbackMigrations();
  } else {
    await runMigrations();
  }
}

// Run if executed directly
if (require.main === module) {
  main().catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
}
