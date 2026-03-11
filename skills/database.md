# Database Setup Guide

## Overview

This project uses **Kysely** as a query builder and **PostgreSQL** as the database. Migrations are TypeScript-based and can be run with npm scripts or Make commands.

## Installation

Kysely and PostgreSQL driver (pg) are already installed as dependencies.

## Database Migrations

### Creating Migrations

Each migration file is located in `src/database/migrations/` and exports two functions:

```typescript
export async function up(db: Kysely<any>): Promise<void> {
  // Upgrade logic
}

export async function down(db: Kysely<any>): Promise<void> {
  // Downgrade logic
}
```

### Running Migrations

**Using npm:**
```bash
npm run migrate       # Run all pending migrations
npm run migrate:down  # Rollback all migrations
```

**Using Make:**
```bash
make migrate       # Run all pending migrations
make migrate-down  # Rollback all migrations
```

## Current Schema

### Users Table

The `users` table is created with the following columns:

| Column | Type | Properties |
|--------|------|-----------|
| `id` | UUID | Primary Key, Auto-generated |
| `email` | VARCHAR | Not Null, Unique |
| `password` | VARCHAR | Not Null |
| `created_at` | TIMESTAMP | Not Null, Default: CURRENT_TIMESTAMP |
| `updated_at` | TIMESTAMP | Not Null, Default: CURRENT_TIMESTAMP, Auto-updated on row changes |
| `deleted_at` | TIMESTAMP | Nullable (for soft deletes) |

### Special Features

1. **Auto-generated UUID**: The `id` column uses PostgreSQL's `gen_random_uuid()` function
2. **Created At**: Automatically set to the current timestamp when a row is inserted
3. **Updated At**: Automatically updated to the current timestamp whenever the row is modified via a PostgreSQL trigger

## Configuration

Environment variables:

- `DATABASE_URL`: PostgreSQL connection string (default: `postgresql://postgres:postgres@localhost:5432/investment_tracker`)
- `NODE_ENV`: Environment mode (default: `development`)

Create a `.env` file in the project root with your configuration (see `.env.example`).

## Docker Compose Setup

When using docker-compose, the PostgreSQL database is automatically set up with:

- **Username**: postgres
- **Password**: postgres
- **Database**: investment_tracker
- **Port**: 5432

After starting services with `make start`, run migrations:

```bash
make migrate
```

## Database Access

### Access PostgreSQL from Docker

```bash
# Using docker-compose
docker-compose exec postgres psql -U postgres -d investment_tracker

# Or with Make
docker-compose exec postgres psql -U postgres -d investment_tracker
```

### Connection String

For local development:
```
postgresql://postgres:postgres@localhost:5432/investment_tracker
```

For Docker services:
```
postgresql://postgres:postgres@postgres:5432/investment_tracker
```

## Kyrestly Documentation

For more information about Kysely, visit: https://kysely.dev/

### Common Operations

```typescript
import { createDb } from './src/database/db';

const db = createDb();

// Insert
await db.insertInto('users')
  .values({
    email: 'user@example.com',
    password: 'hashed_password',
  })
  .execute();

// Select
const users = await db.selectFrom('users').selectAll().execute();

// Update
await db.updateTable('users')
  .set({ password: 'new_password' })
  .where('id', '=', userId)
  .execute();

// Delete (soft delete - set deleted_at)
await db.updateTable('users')
  .set({ deleted_at: new Date() })
  .where('id', '=', userId)
  .execute();

// Close connection
await db.destroy();
```

## Troubleshooting

### Migration Fails

1. Check that PostgreSQL is running and accessible
2. Verify `DATABASE_URL` environment variable is set correctly
3. Check migration files for syntax errors
4. Review the error message for specific issues

### Connection Timeout

If you get connection timeouts:
1. Ensure PostgreSQL service is running
2. Verify the database exists
3. Check firewall/network settings
4. Confirm connection string is correct

### UUID Extension Missing

If you get an error about UUID functions:

```sql
-- Run in PostgreSQL to enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

The latest PostgreSQL versions (including 16) have UUID support built-in with `gen_random_uuid()`.
