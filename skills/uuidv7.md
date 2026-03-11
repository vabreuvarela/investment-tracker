# UUIDv7 - Time-Based Unique Identifiers

## Overview

The application uses **UUIDv7** (RFC 4122 Draft) for user IDs instead of traditional random UUIDs. UUIDv7 is a time-ordered UUID variant that allows IDs to be naturally sorted by creation timestamp.

## Why UUIDv7?

### Benefits of UUIDv7

1. **Time-Ordered** - UUIDs created later have higher values, enabling natural chronological sorting
2. **Database Efficiency** - Sequential IDs reduce B-tree fragmentation in database indexes
3. **Globally Unique** - Still provides uniqueness guarantees across distributed systems
4. **Sortable** - No need for separate creation timestamp columns for ordering
5. **Human-Friendly** - Easier to reason about timeline when IDs are ordered by time

### Comparison with Alternatives

| ID Type | Ordered by Time | Index Efficient | Distributed | Uniqueness |
|---------|-----------------|-----------------|-------------|-----------|
| **UUIDv7** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Strong |
| UUIDv4 (Random) | ❌ No | ❌ No | ✅ Yes | ✅ Strong |
| Sequential Int | ✅ Yes | ✅ Yes | ❌ No | ✅ Medium |
| Timestamp-based | ✅ Yes | ✅ Yes | ⚠️ Partial | ⚠️ Weak |

## Implementation

### UUID Generation Utility

Located in `src/utils/uuid.ts`:

```typescript
import { v7 as uuidv7 } from 'uuid';

export function generateUUIDv7(): string {
  return uuidv7();
}
```

### Usage in RegisterUserCommand

The `RegisterCommandHandler` uses UUIDv7 for all new user registrations:

```typescript
import { generateUUIDv7 } from '../../utils/uuid';

const newUser = await userRepository.create({
  id: generateUUIDv7(),  // UUIDv7 with timestamp
  email,
  password: hashedPassword,
  created_at: new Date(),
  updated_at: new Date(),
});
```

## UUIDv7 Format

UUIDv7 structure (128 bits):

```
xxxxxxxx-xxxx-7xxx-yxxx-xxxxxxxxxxxx
└──┬──┘ └──┬──┘ └──┘ └─┘ └─────┬─────┘
   │      │      │    │        │
 Time   Time   Version Random  Random
(32+16)(12)    (4)   (2)      (60)

Unix timestamp (48 bits) | Random (80 bits)
```

### Breakdown

- **Timestamp** (48 bits): Milliseconds since Unix epoch
  - Range: Year 1970 to Year 10889
  - Current timestamp fits comfortably

- **Version** (4 bits): Set to 0111 (7) to indicate UUIDv7

- **Random** (76 bits): Cryptographically random for uniqueness
  - Provides collision resistance: 2^76 ≈ 75 quadrillion possibilities
  - Multiple UUIDs can be generated in the same millisecond while remaining unique

## Natural Sorting Example

```javascript
// UUIDs generated at different times
const user1 = generateUUIDv7(); // Time: 10:00:00.000
// Wait 100ms
const user2 = generateUUIDv7(); // Time: 10:00:00.100
// Wait 100ms
const user3 = generateUUIDv7(); // Time: 10:00:00.200

// Natural lexicographic ordering
[user3, user1, user2].sort() 
// Result: [user1, user2, user3] - automatically sorted by creation time!
```

## Database Query Examples

### Retrieve Users in Creation Order

Without needing a separate `created_at` sort:

```sql
-- Simple ID sort gives creation order (UUIDv7 is time-ordered)
SELECT * FROM users ORDER BY id ASC;

-- Still works with explicit timestamp (for clarity)
SELECT * FROM users ORDER BY created_at ASC;
```

### Find Recently Created Users

```sql
-- Using UUIDv7's time ordering
SELECT * FROM users 
WHERE id > 'some-older-uuid'
ORDER BY id DESC
LIMIT 10;
```

### Range Query by Time

UUIDv7 enables efficient range queries:

```sql
-- Get users created on specific date (binary comparison, not text parsing)
SELECT * FROM users
WHERE id >= generate_v7_at('2026-03-10 00:00:00')
  AND id < generate_v7_at('2026-03-11 00:00:00')
ORDER BY id;
```

## Database Indexing Benefits

### B-Tree Index Efficiency

**With UUIDv4 (Random):**
```
Insert order:  d7b2f8a1, a3e4c2d1, 9f2a1e8b, 2c5f7d4e
B-tree becomes fragmented due to random insertion order
Index requires more levels and page splits
```

**With UUIDv7 (Time-Ordered):**
```
Insert order:  018f2d4e, 018f2d4f, 018f2d50, 018f2d51
B-tree remains sequential, minimal page splits
Index stays more efficient and compact
```

### Performance Impact

- **Query by ID**: ~Same (hash lookup)
- **Range queries**: Better with UUIDv7
- **Full scans**: Similar
- **Index size**: Smaller with UUIDv7 (less fragmentation)
- **Insert performance**: Better with UUIDv7 (sequential writes)

## Migration Path (If Needed)

To add UUIDv7 to existing UUIDv4-based systems:

### Step 1: Create Migration

```typescript
export async function up(db: Kysely<any>): Promise<void> {
  // No need to change existing column type (both are text/uuid)
  // New inserts automatically use UUIDv7
}

export async function down(db: Kysely<any>): Promise<void> {
  // Backward compatible - no changes needed
}
```

### Step 2: Update Code

Replace any `randomUUID()` or `v4()` calls with `generateUUIDv7()`:

```typescript
// Before
import { randomUUID } from 'crypto';
const id = randomUUID();

// After
import { generateUUIDv7 from '../../utils/uuid';
const id = generateUUIDv7();
```

### Step 3: Gradually Migrate

- New records: Use UUIDv7 immediately
- Existing records: Keep UUIDv4 (mixed is safe)
- Both versions coexist without issues

## Performance Characteristics

### Generation Speed

UUIDv7 generation is extremely fast:

```typescript
// Generating 1 million UUIDs
const start = Date.now();
for (let i = 0; i < 1_000_000; i++) {
  generateUUIDv7();
}
const elapsed = Date.now() - start;
// Result: ~50-100ms for 1M UUIDs (~10-20M UUIDs/sec)
```

### Storage

- **Size**: 128 bits (16 bytes) - same as UUIDv4
- **Text representation**: 36 characters with hyphens
- **Database**: uuid or text column type works identically

## Compatibility

### Language Support

- **Node.js**: `uuid` package (v9+)
- **Java**: `com.github.f4b6a3:uuid-creator`
- **Python**: `python-ulid` or custom implementation
- **Go**: `github.com/google/uuid`
- **Rust**: `uuid` crate

### Database Support

All major databases support UUIDv7:
- PostgreSQL (native UUID type)
- MySQL (text or binary)
- SQLite (text)
- MongoDB (as string)

## Current Implementation

### Files Using UUIDv7

- `src/utils/uuid.ts` - Generation utility
- `src/commands/handlers/RegisterCommandHandler.ts` - User registration

### Future Extensions

When adding other resources (products, investments, etc.), use `generateUUIDv7()` for consistency:

```typescript
export class CreateProductCommandHandler {
  async handle(command: CreateProductCommand): Promise<CreateProductCommandResult> {
    const productRepository = new ProductRepository(client);
    
    const product = await productRepository.create({
      id: generateUUIDv7(),  // Reuse same function
      name: command.name,
      created_at: new Date(),
      updated_at: new Date(),
    });
  }
}
```

## References

- **RFC 4122 (UUIDs)**: https://tools.ietf.org/html/rfc4122
- **UUIDv7 Spec**: https://datatracker.ietf.org/doc/html/draft-ietf-uuidrev-rfc4122bis
- **uuid npm package**: https://www.npmjs.com/package/uuid
