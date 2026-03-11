# Repository Pattern with Abstract Database Client

## Overview

This project implements the **Repository Pattern** combined with an **Abstract Database Client** to decouple business logic from database implementation details. This allows swapping out the ORM (Kysely) without changing repository interfaces or business logic.

## Architecture

### Three-Layer Data Access

```
Commands/Handlers
    ↓
Repositories (UserRepository)
    ↓
Database Client Interface (IDatabaseClient)
    ↓
Database Client Implementation (KyselyDatabaseClient)
    ↓
Kysely ORM
    ↓
PostgreSQL
```

## Components

### 1. Database Client Interface (IDatabaseClient)

Located in `src/database/client/IDatabaseClient.ts`

Defines the contract for database operations:

```typescript
export interface IDatabaseClient {
  selectFrom<Table extends keyof Database>(table: Table): IQueryable<Database[Table]>;
  insertInto<Table extends keyof Database>(table: Table): IInsertable<Database[Table]>;
  updateTable<Table extends keyof Database>(table: Table): IUpdateable<Database[Table]>;
  destroy(): Promise<void>;
}
```

**Key Features:**
- Type-safe table selection
- Fluent interface for query building
- ORM-agnostic query operations
- Generic for any database client implementation

### 2. Kysely Database Client Implementation

Located in `src/database/client/KyselyDatabaseClient.ts`

Implements IDatabaseClient using Kysely:

```typescript
export class KyselyDatabaseClient implements IDatabaseClient {
  selectFrom<Table extends keyof Database>(table: Table): IQueryable<Database[Table]> {
    return new KyselyQueryable<Database[Table]>(this.db.selectFrom(table as any));
  }
  // ... other methods
}
```

**Adapter Classes:**
- `KyselyQueryable` - Adapts Kysely select queries
- `KyselyInsertable` - Adapts Kysely insert queries
- `KyselyUpdateable` - Adapts Kysely update queries
- `KyselyExecutable` - Adapts Kysely execute operations

### 3. Database Client Factory

Located in `src/database/client/index.ts`

Provides centralized client creation and lifecycle management:

```typescript
export function createDatabaseClient(): IDatabaseClient {
  if (!clientInstance) {
    clientInstance = new KyselyDatabaseClient();
  }
  return clientInstance;
}
```

**Benefits:**
- Singleton pattern for performance
- Easy to swap implementations
- Testing-friendly (can inject mock clients)

### 4. Repository Pattern

Located in `src/repositories/UserRepository.ts`

Encapsulates all data access logic for a specific entity:

```typescript
export class UserRepository {
  constructor(private client: IDatabaseClient) {}

  async findByEmail(email: string): Promise<User | undefined> {
    const query = this.client.selectFrom('users') as any;
    return query.selectAll().where('email', '=', email).executeTakeFirst();
  }

  async create(input: CreateUserInput): Promise<User> {
    const query = this.client.insertInto('users') as any;
    return query.values(input).returningAll().executeTakeFirstOrThrow();
  }

  // ... other methods
}
```

**Repository Methods:**
- `findByEmail(email)` - Find user by email
- `findById(id)` - Find user by ID
- `create(input)` - Create new user
- `update(id, updates)` - Update user
- `delete(id)` - Soft delete user

## Usage Flow

### In Command Handlers

```typescript
export class LoginCommandHandler {
  async handle(command: LoginCommand): Promise<LoginCommandResult> {
    const client = createDatabaseClient();
    const userRepository = new UserRepository(client);

    // Use repository instead of direct Kysely
    const user = await userRepository.findByEmail(email);

    // ... business logic
  }
}
```

### Benefits of This Approach

1. **No Direct ORM Access** - Handlers don't import Kysely
2. **Testable** - Easy to mock repositories
3. **Swappable** - Replace Kysely without changing handlers
4. **Consistent** - All data access follows same pattern

## Adding New Repositories

### Step 1: Create Repository Class

```typescript
// src/repositories/ProductRepository.ts
import { IDatabaseClient } from '../database/client/IDatabaseClient';
import { Product } from '../database/client/db';

export class ProductRepository {
  constructor(private client: IDatabaseClient) {}

  async findById(id: string): Promise<Product | undefined> {
    const query = this.client.selectFrom('products') as any;
    return query.selectAll().where('id', '=', id).executeTakeFirst();
  }

  async findAll(): Promise<Product[]> {
    const query = this.client.selectFrom('products') as any;
    return query.selectAll().execute();
  }
}
```

### Step 2: Use in Command Handler

```typescript
export class GetProductCommandHandler {
  async handle(command: GetProductCommand): Promise<GetProductCommandResult> {
    const client = createDatabaseClient();
    const productRepository = new ProductRepository(client);

    const product = await productRepository.findById(command.productId);
    // ... business logic
  }
}
```

## Swapping Database Implementations

### Current: Kysely

Uses PostgreSQL with Kysely ORM via `KyselyDatabaseClient`

### Future: Different ORM (e.g., Prisma)

1. Create new client implementation:

```typescript
// src/database/client/PrismaDatabaseClient.ts
export class PrismaDatabaseClient implements IDatabaseClient {
  // Implement using Prisma instead of Kysely
  // Same interface, different implementation
}
```

2. Update factory:

```typescript
export function createDatabaseClient(): IDatabaseClient {
  if (!clientInstance) {
    // Just change this line
    clientInstance = new PrismaDatabaseClient(); // was KyselyDatabaseClient
  }
  return clientInstance;
}
```

3. **Repositories and handlers don't change!**

## Query Building with Abstract Client

### Select Query

```typescript
const query = this.client.selectFrom('users') as any;
const users = await query
  .selectAll()
  .where('email', '=', 'user@example.com')
  .executeTakeFirst();
```

### Insert Query

```typescript
const query = this.client.insertInto('users') as any;
const newUser = await query
  .values({ email, password, created_at, updated_at })
  .returningAll()
  .executeTakeFirstOrThrow();
```

### Update Query

```typescript
const query = this.client.updateTable('users') as any;
const updated = await query
  .set({ email: newEmail })
  .where('id', '=', userId)
  .executeTakeFirstOrThrow();
```

## Type Safety

The abstract client maintains type safety through generics:

```typescript
// Database table types
export interface Database {
  users: UsersTable;
  products: ProductsTable;
}

// Type-safe repository
export class UserRepository {
  async findByEmail(email: string): Promise<User | undefined> {
    // Type-safe: 'users' table exists and has correct schema
    const query = this.client.selectFrom('users');
  }
}
```

## Testing with Mock Clients

### Create Mock Database Client

```typescript
class MockDatabaseClient implements IDatabaseClient {
  async selectFrom() {
    return {
      selectAll: () => ({
        where: () => ({
          executeTakeFirst: async () => ({
            id: '123',
            email: 'test@example.com',
          }),
        }),
      }),
    };
  }
  // ... implement other methods
}
```

### Test Handler

```typescript
it('should find user by email', async () => {
  const mockClient = new MockDatabaseClient();
  const userRepository = new UserRepository(mockClient);

  const user = await userRepository.findByEmail('test@example.com');
  expect(user.email).toBe('test@example.com');
});
```

## File Structure

```
src/
├── database/
│   ├── client/
│   │   ├── IDatabaseClient.ts       # Interface (contract)
│   │   ├── KyselyDatabaseClient.ts  # Kysely implementation
│   │   ├── db.ts                    # Type definitions
│   │   └── index.ts                 # Factory function
│   └── migrations/
│       ├── migrate.ts               # Direct Kysely for migrations
│       └── 001_create_users_table.ts
├── repositories/
│   └── UserRepository.ts            # Data access layer
└── commands/
    └── handlers/
        └── RegisterCommandHandler.ts # Uses repositories, not ORM
```

## Key Principles

1. **Dependency Inversion** - Code depends on abstractions (IDatabaseClient), not concrete implementations
2. **Single Responsibility** - Repositories handle data access, handlers handle business logic
3. **Open/Closed** - Open for extension (new client implementations), closed for modification
4. **Substitution** - Any implementation of IDatabaseClient works without changes

## Future Evolution

This architecture supports:
- **Query Objects** - Encapsulate complex queries as objects
- **Unit of Work** - Batch multiple operations
- **Specifications** - Reusable query specifications
- **CQRS** - Separate read and write models
- **Event Sourcing** - Store events instead of current state

## Comparison

### Before Repository Pattern
```
Handler → Kysely queries directly
Problem: Tight coupling to Kysely
```

### After Repository Pattern with Abstract Client
```
Handler → Repository → IDatabaseClient → KyselyDatabaseClient → Kysely
Benefits: Decoupled, testable, swappable, maintainable
```
