# Git Commits - Investment Tracker API

## Overview
12 feature-based commits organized following Git Flow conventions. All code is ready to be pushed to GitHub.

## Commit History

```
59a0600 docs: add comprehensive documentation and skill guides
bfaf070 feat: implement uuidv7 for time-ordered user ids
37c2d56 feat: add user management endpoints with authorization
052c9a9 feat: add authentication endpoints (register, login, logout, refresh)
edb56c3 feat: implement command pattern for business logic
f99e0f6 feat: implement repository pattern for data access
e13b570 feat: add authentication and error handling middleware
2f6109c feat: implement error handling and authentication utilities
268c31e feat: add database layer with kysely and migrations
3165bda feat: implement core express api server
59b7f5e chore: add docker and containerization setup
21225ca chore: initialize project with typescript and express
```

## Commit Details

### 1. chore: initialize project with typescript and express
- Project setup with npm and TypeScript
- Configuration files: package.json, tsconfig.json, .gitignore

### 2. chore: add docker and containerization setup
- Dockerfile with multi-stage builds
- Docker Compose with PostgreSQL 16
- Makefile with development automation
- Environment configuration

### 3. feat: implement core express api server
- Express application setup
- Server entry point
- Basic routing structure

### 4. feat: add database layer with kysely and migrations
- Kysely ORM configuration
- Database client abstraction (IDatabaseClient)
- PostgreSQL migration system
- Users table schema

### 5. feat: implement error handling and authentication utilities
- DomainException for consistent errors
- JWT token utilities
- Bcrypt password hashing
- Auth types for Express

### 6. feat: add authentication and error handling middleware
- JWT validation middleware
- Error handler middleware
- Consistent response formatting

### 7. feat: implement repository pattern for data access
- UserRepository with CRUD operations
- Database-agnostic data access layer
- Soft delete support

### 8. feat: implement command pattern for business logic
- 6 command classes
- CommandBus dispatcher
- Handler implementations

### 9. feat: add authentication endpoints
- POST /auth/register
- POST /auth/login
- POST /auth/logout
- POST /auth/refresh

### 10. feat: add user management endpoints with authorization
- PUT /users/:userId (update profile)
- DELETE /users/:userId (delete account)
- Authorization middleware for resource ownership

### 11. feat: implement uuidv7 for time-ordered user ids
- UUIDv7 generation utility
- Time-ordered ID integration
- Database index efficiency improvements

### 12. docs: add comprehensive documentation and skill guides
- README.md
- 6 detailed skill guides
- API examples and best practices

## Statistics

- **Files Created**: 50+
- **Lines of Code**: ~3,000+
- **Documentation**: ~2,000+ lines
- **Total Commits**: 12

## Push to GitHub

```bash
git push -u origin main
```

## Repository

https://github.com/vabreuvarela/investment-tracker
