# Authentication Skill Guide

## Overview

This project implements JWT-based authentication with TypeScript, Express, and PostgreSQL. The authentication system includes registration, login, logout, and token refresh capabilities.

## Architecture

### Components

1. **DomainException** - Custom exception class for domain-level errors
2. **Error Handler Middleware** - Catches and formats all errors consistently
3. **Authentication Middleware** - Validates JWT tokens on protected routes
4. **JWT Utils** - Token generation and verification
5. **Password Utils** - Password hashing and comparison
6. **Auth Controller** - Handles register, login, logout, and refresh endpoints
7. **Auth Routes** - Defines authentication endpoints

## File Structure

```
src/
├── controllers/
│   └── AuthController.ts          # Register, login, logout, refresh logic
├── middleware/
│   ├── authenticate.ts            # JWT validation middleware
│   └── errorHandler.ts            # Error handling middleware
├── exceptions/
│   └── DomainException.ts         # Custom exception class
├── utils/
│   ├── jwt.ts                     # Token generation & verification
│   └── password.ts                # Password hashing & comparison
├── types/
│   └── auth.ts                    # Authentication interfaces
└── routes/
    └── auth.ts                    # Authentication endpoints
```

## Features

### JWT Token Management

- **Short-lived tokens**: 15 minutes expiration
- **Token generation**: Creates signed JWT with userId and email
- **Token verification**: Validates token signature and expiration
- **Token refresh**: Generates new token for authenticated users

### Password Security

- **Bcrypt hashing**: Passwords are hashed with 10 salt rounds
- **Constant-time comparison**: Prevents timing attacks
- **Never stores plaintext**: All stored passwords are hashed
- **Password validation**: Minimum 6 characters on registration

### Error Handling

- **Consistent format**: All errors return the same JSON structure
- **Status codes**: Appropriate HTTP status codes (401, 422, etc.)
- **Error codes**: Machine-readable error codes for clients
- **Async error handling**: Wrapper catches async controller errors

## API Endpoints

### POST /auth/register

Registers a new user with email and password.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Success Response (201):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com"
  }
}
```

**Error Response (409) - Email Already Exists:**
```json
{
  "error": {
    "message": "Email already in use",
    "code": "EMAIL_ALREADY_EXISTS",
    "statusCode": 409
  }
}
```

**Error Response (400) - Validation Error:**
```json
{
  "error": {
    "message": "Password must be at least 6 characters long",
    "statusCode": 400
  }
}
```

### POST /auth/login

Authenticates user with email and password.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com"
  }
}
```

**Error Response (422):**
```json
{
  "error": {
    "message": "Invalid email or password",
    "statusCode": 422
  }
}
```

**Error Response (400):**
```json
{
  "error": {
    "message": "Email and password are required",
    "statusCode": 400
  }
}
```

### POST /auth/logout

Logs out the authenticated user. Requires valid JWT token.

**Request Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

**Error Response (401):**
```json
{
  "error": {
    "message": "Missing or invalid authorization header",
    "code": "UNAUTHORIZED",
    "statusCode": 401
  }
}
```

### POST /auth/refresh

Refreshes the JWT token. Requires valid JWT token.

**Request Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com"
  }
}
```

**Error Response (401):**
```json
{
  "error": {
    "message": "Invalid or expired token",
    "code": "INVALID_TOKEN",
    "statusCode": 401
  }
}
```

## Configuration

Set the following environment variables in `.env`:

```env
# JWT Configuration
JWT_SECRET=your-secret-key-change-in-production

# Token Expiration
# Currently hardcoded to 15 minutes in src/utils/jwt.ts
```

## Usage Examples

### Using the Authentication System

```typescript
// Hash a password when registering a user
import { hashPassword } from './utils/password';

const hashedPassword = await hashPassword('user-password');
```

```typescript
// Generate a token after login
import { generateToken } from './utils/jwt';

const token = generateToken(userId, userEmail);
```

```typescript
// Verify token in middleware
import { verifyToken } from './utils/jwt';

try {
  const payload = verifyToken(token);
  console.log(payload.userId); // Access user ID
} catch (error) {
  console.error('Token is invalid or expired');
}
```

### Protecting Routes

```typescript
// Use the authenticate middleware on protected routes
router.post('/protected-route', authenticate, (req, res) => {
  console.log(req.user.userId); // User is now available
  res.json({ message: 'This is a protected route' });
});
```

### Throwing Domain Exceptions

```typescript
// Throw domain exceptions in controllers for consistent error handling
throw new DomainException(
  'User not found',
  404,
  'USER_NOT_FOUND'
);
```

## Token Lifecycle

1. **Creation**: Token created with 15-minute expiration
2. **Transmission**: Token sent in Authorization header: `Bearer <token>`
3. **Validation**: Token validated by authenticate middleware
4. **Expiration**: After 15 minutes, token becomes invalid
5. **Refresh**: User calls `/auth/refresh` to get new token

## Security Considerations

1. **HTTPS**: Always use HTTPS in production to protect tokens in transit
2. **Secret Key**: Change `JWT_SECRET` in production (use strong, random value)
3. **Token Storage**: Store tokens securely on client (prefer httpOnly cookies)
4. **CORS**: Configure CORS appropriately for your frontend domain
5. **Rate Limiting**: Add rate limiting to `/auth/login` to prevent brute force attacks
6. **Token Blacklisting**: Implement token blacklisting for logout (use Redis or database)

## Error Handling Flow

1. **Async Controller** calls action that might throw an exception
2. **asyncHandler wrapper** catches the promise and passes to next() middleware
3. **Express error middleware** (errorHandler) receives the error
4. **Error is formatted** and sent to client in consistent JSON format
5. **DomainException** is handled specially with custom status codes
6. **Generic errors** return 500 status code

## Testing

### Test Registration

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "password123"
  }'
```

### Test Registration with Duplicate Email

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "password123"
  }'
```

Expected 409 error.

### Test Login with Valid Credentials

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "password123"
  }'
```

### Test Login with Invalid Password

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "wrongpassword"
  }'
```

Expected 422 error.

### Test Token Refresh

```bash
curl -X POST http://localhost:3000/auth/refresh \
  -H "Authorization: Bearer <token>"
```

### Test Logout

```bash
curl -X POST http://localhost:3000/auth/logout \
  -H "Authorization: Bearer <token>"
```

## Future Enhancements

1. **Token Blacklisting**: Implement Redis-based token blacklist for logout
2. **Refresh Tokens**: Add separate long-lived refresh tokens
3. **OAuth**: Implement OAuth for third-party authentication
4. **MFA**: Add multi-factor authentication
5. **Social Login**: Support Google, GitHub, etc.
6. **Rate Limiting**: Add rate limiting middleware
7. **Audit Logging**: Log authentication events for security

## Dependencies

- `jsonwebtoken` - JWT token generation and verification
- `bcrypt` - Password hashing and verification
- `@types/jsonwebtoken` - TypeScript types for jsonwebtoken
- `@types/bcrypt` - TypeScript types for bcrypt
