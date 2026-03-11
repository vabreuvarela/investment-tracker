# Command Pattern Architecture

## Overview

This project uses the **Command Pattern**, a behavioral design pattern that encapsulates a request as an object, allowing you to parameterize clients with different requests, queue requests, and support undoable operations.

## Architecture

### Structure

```
src/
├── commands/
│   ├── index.ts                        # Command classes
│   ├── CommandBus.ts                   # Command dispatcher
│   └── handlers/
│       ├── RegisterCommandHandler.ts
│       ├── LoginCommandHandler.ts
│       ├── LogoutCommandHandler.ts
│       └── RefreshTokenCommandHandler.ts
├── controllers/
│   └── AuthController.ts               # Thin controllers using commands
```

### Flow

```
HTTP Request
    ↓
AuthController (thin layer)
    ↓
Create Command object
    ↓
CommandBus.execute(command)
    ↓
CommandHandler (business logic)
    ↓
Return Result
    ↓
HTTP Response
```

## Commands

### RegisterCommand

```typescript
export class RegisterCommand {
  constructor(
    public email: string,
    public password: string
  ) {}
}
```

**Handler**: RegisterCommandHandler
**Business Logic**: 
- Validates email and password
- Checks for duplicate email (409)
- Hashes password
- Creates new user in database
- Generates JWT token
- Returns user and token

### LoginCommand

```typescript
export class LoginCommand {
  constructor(
    public email: string,
    public password: string
  ) {}
}
```

**Handler**: LoginCommandHandler
**Business Logic**:
- Validates email and password
- Finds user by email
- Compares passwords (422 if invalid)
- Generates JWT token
- Returns user and token

### LogoutCommand

```typescript
export class LogoutCommand {
  constructor(
    public userId: string
  ) {}
}
```

**Handler**: LogoutCommandHandler
**Business Logic**:
- Validates user ID
- Returns success message
- (Token invalidation happens via expiration)

### RefreshTokenCommand

```typescript
export class RefreshTokenCommand {
  constructor(
    public userId: string,
    public email: string
  ) {}
}
```

**Handler**: RefreshTokenCommandHandler
**Business Logic**:
- Validates user ID
- Generates new JWT token
- Returns new token with user info

## Command Handlers

Each command has a corresponding handler that executes the business logic:

```typescript
export class RegisterCommandHandler {
  async handle(command: RegisterCommand): Promise<RegisterCommandResult> {
    // Business logic here
    return result;
  }
}
```

### Handler Interface

All handlers follow this pattern:
- Accept a command object
- Return a result object
- Throw DomainException on errors
- Handle cleanup (e.g., database connections)

## CommandBus

The CommandBus dispatches commands to the appropriate handler:

```typescript
export class CommandBus {
  async execute(command: RegisterCommand | LoginCommand | LogoutCommand | RefreshTokenCommand) {
    if (command instanceof RegisterCommand) {
      return this.registerHandler.handle(command);
    }
    // ... other commands
  }
}
```

## Benefits

### 1. Separation of Concerns
- Controllers are thin and only handle HTTP
- Handlers contain all business logic
- Easy to test business logic independently

### 2. Reusability
- Commands can be executed from multiple places (API, CLI, events)
- Same logic everywhere

### 3. Testability
- Easy to unit test commands without HTTP
- Mock dependencies easily
- No need for HTTP client setup

### 4. Scalability
- Easy to add new commands
- Easy to add cross-cutting concerns (logging, caching)
- Supports CQRS pattern for future evolution

### 5. Auditability
- All actions are commands
- Easy to log all commands executed
- Command history for debugging

## Example: Testing Without HTTP

```typescript
import { RegisterCommand } from './commands';
import { RegisterCommandHandler } from './commands/handlers/RegisterCommandHandler';

const handler = new RegisterCommandHandler();
const command = new RegisterCommand('user@example.com', 'password123');

try {
  const result = await handler.handle(command);
  console.log('Registration successful:', result);
} catch (error) {
  console.error('Registration failed:', error.message);
}
```

## Example: Using in Controllers

```typescript
export class AuthController {
  private commandBus = new CommandBus();

  async register(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;
    const command = new RegisterCommand(email, password);
    const result = await this.commandBus.execute(command);
    res.status(201).json(result);
  }
}
```

## Adding New Commands

To add a new command:

1. **Create Command Class** in `src/commands/index.ts`:
   ```typescript
   export class UpdateUserCommand {
     constructor(public userId: string, public email: string) {}
   }
   ```

2. **Create Command Handler** in `src/commands/handlers/UpdateUserCommandHandler.ts`:
   ```typescript
   export class UpdateUserCommandHandler {
     async handle(command: UpdateUserCommand): Promise<UpdateUserCommandResult> {
       // Business logic
     }
   }
   ```

3. **Register Handler** in `CommandBus.ts`:
   ```typescript
   private updateUserHandler = new UpdateUserCommandHandler();

   async execute(command) {
     if (command instanceof UpdateUserCommand) {
       return this.updateUserHandler.handle(command);
     }
   }
   ```

4. **Use in Controller**:
   ```typescript
   async updateUser(req: Request, res: Response): Promise<void> {
     const command = new UpdateUserCommand(userId, email);
     const result = await this.commandBus.execute(command);
     res.json(result);
   }
   ```

## Advanced Patterns

### Command Logging

```typescript
async execute(command: any) {
  console.log(`Executing command: ${command.constructor.name}`);
  const startTime = Date.now();
  try {
    const result = await this.dispatchCommand(command);
    console.log(`Command completed in ${Date.now() - startTime}ms`);
    return result;
  } catch (error) {
    console.error(`Command failed: ${error.message}`);
    throw error;
  }
}
```

### Command Validation

```typescript
async execute(command: any) {
  if (!this.isValidCommand(command)) {
    throw new Error('Invalid command');
  }
  return this.dispatchCommand(command);
}
```

### Async Command Queue

```typescript
export class AsyncCommandBus {
  private queue: any[] = [];

  async enqueue(command: any) {
    this.queue.push(command);
    await this.processQueue();
  }

  private async processQueue() {
    while (this.queue.length > 0) {
      const command = this.queue.shift();
      await this.execute(command);
    }
  }
}
```

## Comparison with Previous Architecture

### Before (Fat Controller)
```
Controller → All business logic → Database
```

### After (Command Pattern)
```
Controller → Command → CommandBus → Handler → Database
```

**Advantages of new architecture:**
- Business logic independent of HTTP
- Easier to test
- Easier to reuse
- Cleaner separation of concerns
- Follows SOLID principles

## Future Evolution

This architecture supports evolving to:
- **CQRS**: Separate commands from queries
- **Event Sourcing**: Store command history as events
- **Distributed Commands**: Send commands over message queues
- **Command Handlers as Services**: Each handler could be a microservice

## Dependencies

- None for the command pattern itself
- Uses existing: Kysely, bcrypt, jsonwebtoken, Express
