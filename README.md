# Express API Hello World with Docker (TypeScript)

A simple Express.js API that returns a "Hello World" message, built with TypeScript and containerized with Docker using Node.js LTS.

## Project Structure

```
src/
├── app.ts          # Express app configuration
├── server.ts       # Server entry point
└── routes/
    └── index.ts    # Route definitions
dist/                      # Compiled JavaScript output
Dockerfile                 # Docker image configuration (multi-stage build)
docker-compose.yml         # Docker Compose configuration with API and PostgreSQL
.dockerignore              # Files to exclude from Docker image
Makefile                   # Project automation commands
tsconfig.json              # TypeScript configuration
package.json               # Node.js project configuration
```

## Prerequisites

- **Local Development**: Node.js 22 LTS or higher
- **Docker & Compose**: Docker Desktop or Docker Engine with Docker Compose

## Quick Start with Make

### Setup the Project

```bash
make setup
```

This installs dependencies and builds the TypeScript project.

### Start with Docker Compose

```bash
make start
```

This starts the Express API and PostgreSQL database. Access the API at `http://localhost:3000`.

### Run Database Migrations

```bash
make migrate        # Run all migrations
make migrate-down   # Rollback migrations
```

### View Logs

```bash
make logs           # View logs from all services
make logs-api       # View only API logs
make logs-db        # View only database logs
```

### Stop Services

```bash
make stop           # Stop all services
make clean          # Stop and remove containers
make clean-all      # Stop, remove containers and volumes (clean database)
```

For all available commands, run:

```bash
make help
```

## Local Development (without Docker)

### Install Dependencies

```bash
npm install
```

### Build TypeScript

```bash
npm run build
```

### Start the Compiled Server

```bash
npm start
```

### Development Mode (with ts-node)

For faster development without rebuilding:

```bash
npm run dev
# Or use make:
make dev
```

The server will run on `http://localhost:3000`

### Test the API

```bash
curl http://localhost:3000
```

Expected response:
```json
{
  "message": "Hello World"
}
```

## Docker Compose

The project includes a complete Docker Compose setup with Express API and PostgreSQL database.

### Services

- **api**: Express.js API server (port 3000)
- **postgres**: PostgreSQL database (port 5432)
  - Database: `investment_tracker`
  - User: `postgres`
  - Password: `postgres`

### Start Services

```bash
make start
```

Or manually:

```bash
docker-compose up -d
```

The API will be accessible at `http://localhost:3000`
The database will be available at `localhost:5432`

### Access PostgreSQL

```bash
docker-compose exec postgres psql -U postgres -d investment_tracker
```

### View Database Logs

```bash
make logs-db
```

### Stop Services

```bash
make stop
make clean        # Remove containers
make clean-all    # Remove containers and volumes (including database data)
```

## Environment Variables

### API

- `PORT`: The port on which the server runs (default: 3000)
- `NODE_ENV`: Environment mode (default: development)
- `DATABASE_URL`: PostgreSQL connection string (automatically set in docker-compose)

### Docker Compose

Environment variables are configured in `docker-compose.yml`:

```yaml
api:
  environment:
    - NODE_ENV=development
    - PORT=3000
    - DATABASE_URL=postgresql://postgres:postgres@postgres:5432/investment_tracker

postgres:
  environment:
    - POSTGRES_USER=postgres
    - POSTGRES_PASSWORD=postgres
    - POSTGRES_DB=investment_tracker
```

## API Endpoints

### GET /

Returns a simple "Hello World" message.

**Response:**
```json
{
  "message": "Hello World"
}
```

## Database

This project uses **Kysely** (TypeScript query builder) with **PostgreSQL 16**.

For detailed database setup, migrations, and schema information, see [skills/database.md](./skills/database.md).

### Quick Database Commands

```bash
# Run migrations
make migrate

# Rollback migrations
make migrate-down

# Access PostgreSQL
docker-compose exec postgres psql -U postgres -d investment_tracker
```

## Authentication

This project includes JWT-based authentication with registration, login, logout, and token refresh endpoints.

For complete authentication documentation, usage examples, and security considerations, see [skills/authentication.md](./skills/authentication.md).

### Quick Authentication Commands

```bash
# Register new user
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'

# Login with email and password
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'

# Refresh token
curl -X POST http://localhost:3000/auth/refresh \
  -H "Authorization: Bearer <token>"

# Logout
curl -X POST http://localhost:3000/auth/logout \
  -H "Authorization: Bearer <token>"
```

## Architecture & Design Patterns

### Command Pattern

This project implements the Command Pattern for all business logic operations. Commands encapsulate requests as objects, enabling better separation of concerns, testability, and reusability.

For detailed documentation on the command pattern implementation, see [skills/command-pattern.md](./skills/command-pattern.md).

**Benefits:**
- Thin controllers that only handle HTTP
- Business logic independent of HTTP framework
- Easy to test without making HTTP requests
- Supports multiple interfaces (API, CLI, events)
- Foundation for CQRS and Event Sourcing

## Technology Stack

- **Language**: TypeScript 5.x
- **Runtime**: Node.js 22 LTS
- **Framework**: Express.js 5.x
- **Database**: PostgreSQL 16 with Kysely ORM
- **Containerization**: Docker with multi-stage build
- **Orchestration**: Docker Compose
- **Build Automation**: Make
- **Development**: ts-node for fast iteration

## License

ISC
