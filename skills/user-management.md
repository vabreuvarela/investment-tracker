# User Management API

## Overview

The User Management API provides endpoints for authenticated users to manage their own profiles. Users can update their profile information and delete their own accounts. Authorization is enforced to ensure users can only access their own resources.

## Architecture

### Authorization Middleware

Located in `src/middleware/authorize.ts`

Ensures that only the authenticated user can modify their own data:

```typescript
export function authorizeUserAccess(req: Request, res: Response, next: NextFunction): void {
  const authenticatedUserId = (req as any).userId;
  const targetUserId = req.params.userId;

  if (authenticatedUserId !== targetUserId) {
    throw new DomainException('Forbidden: You can only access your own resources', 403);
  }
  
  next();
}
```

### Commands

**UpdateUserCommand** - Triggers user profile update
```typescript
export class UpdateUserCommand {
  constructor(
    public userId: string,
    public email?: string,
    public password?: string
  ) {}
}
```

**DeleteUserCommand** - Triggers user account deletion
```typescript
export class DeleteUserCommand {
  constructor(
    public userId: string
  ) {}
}
```

### Handlers

**UpdateUserCommandHandler** - Handles profile updates
- Validates user exists
- Checks email uniqueness if email is updated
- Hashes new password if provided
- Updates user record with current timestamp

**DeleteUserCommandHandler** - Handles account deletion
- Validates user exists
- Soft deletes user (marks with deleted_at timestamp)

### Controller

**UserController** - HTTP interface for user management
- `update(req, res, next)` - Updates authenticated user's profile
- `delete(req, res, next)` - Deletes authenticated user's account

## Endpoints

### Update User Profile

```http
PUT /users/:userId
Content-Type: application/json
Authorization: Bearer <token>

{
  "email": "newemail@example.com",
  "password": "newPassword123"
}
```

**Request Parameters:**
- `userId` (path) - User ID (must match authenticated user)

**Request Body:**
- `email` (optional) - New email address
- `password` (optional) - New password (minimum 6 characters)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "newemail@example.com"
    }
  }
}
```

**Error Responses:**
- `400 Bad Request` - Password too short (<6 characters)
- `401 Unauthorized` - No authentication token provided
- `403 Forbidden` - User trying to update another user's profile
- `404 Not Found` - User not found
- `409 Conflict` - Email already in use
- `422 Unprocessable Entity` - Invalid request data

### Delete User Account

```http
DELETE /users/:userId
Authorization: Bearer <token>
```

**Request Parameters:**
- `userId` (path) - User ID (must match authenticated user)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "User deleted successfully"
  }
}
```

**Error Responses:**
- `401 Unauthorized` - No authentication token provided
- `403 Forbidden` - User trying to delete another user's account
- `404 Not Found` - User not found

## Security & Authorization

### Authentication Required
Both endpoints require a valid JWT token in the `Authorization` header:
```
Authorization: Bearer <your-jwt-token>
```

### Authorization Checks
The `authorizeUserAccess` middleware ensures:
1. User is authenticated (token valid)
2. User ID in URL matches authenticated user ID
3. Returns 403 Forbidden if user attempts to access another user's data

### Middleware Stack
```
Request
  ↓
Router
  ↓
authenticate middleware (validates JWT)
  ↓
authorizeUserAccess middleware (checks user ownership)
  ↓
UserController method (handles request)
  ↓
Command Handler (executes business logic)
  ↓
Response
```

## Example Flows

### Update Own Email

```bash
# Get auth token first (from login)
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Update email
curl -X PUT http://localhost:3000/users/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email": "newemail@example.com"}'
```

### Update Own Password

```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -X PUT http://localhost:3000/users/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"password": "newPassword123"}'
```

### Update Both Email and Password

```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -X PUT http://localhost:3000/users/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newemail@example.com",
    "password": "newPassword123"
  }'
```

### Delete Own Account

```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -X DELETE http://localhost:3000/users/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer $TOKEN"
```

### Attempt to Access Another User (403 Forbidden)

```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." # User A's token

# Try to update User B's profile (not allowed)
curl -X PUT http://localhost:3000/users/550e8400-e29b-41d4-a716-446655440099 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email": "hacked@example.com"}'

# Response: 403 Forbidden
# {
#   "error": {
#     "message": "Forbidden: You can only access your own resources",
#     "code": "FORBIDDEN",
#     "statusCode": 403
#   }
# }
```

## Data Validation

### Email Update
- Must be unique across all users
- Returns 409 Conflict if email already exists

### Password Update
- Minimum 6 characters
- Automatically hashed using bcrypt (10 salt rounds)
- Never returned in responses

### Soft Deletes
- User records are marked with `deleted_at` timestamp
- Not permanently removed from database
- Can be recovered if needed

## Middleware Chain

### `authenticate` Middleware
- Validates JWT token from Authorization header
- Extracts userId and email from token
- Sets `(req as any).userId` for downstream middleware
- Throws 401 if token invalid or missing

### `authorizeUserAccess` Middleware
- Compares authenticated userId with requested userId in URL
- Ensures users can only modify their own data
- Throws 403 if users don't match
- Allows request to proceed if authorized

## File Structure

```
src/
├── controllers/
│   └── UserController.ts           # HTTP interface
├── commands/
│   ├── index.ts                    # Command definitions
│   ├── CommandBus.ts               # Command dispatcher
│   └── handlers/
│       ├── UpdateUserCommandHandler.ts
│       └── DeleteUserCommandHandler.ts
├── middleware/
│   ├── authenticate.ts             # JWT validation
│   └── authorize.ts                # Resource ownership check
├── routes/
│   └── users.ts                    # User endpoints
└── repositories/
    └── UserRepository.ts           # Data access
```

## Integration with Existing Systems

### Database Access
- Uses `UserRepository` pattern for database isolation
- Leverages `IDatabaseClient` abstraction for ORM independence

### Error Handling
- `DomainException` thrown in handlers
- `errorHandler` middleware formats and returns consistent error responses

### Authentication
- Reuses existing JWT system from auth routes
- Token validated by `authenticate` middleware

### Command Pattern
- Follows established command handler pattern
- Commands dispatched via `CommandBus`
- Business logic completely separated from HTTP layer
