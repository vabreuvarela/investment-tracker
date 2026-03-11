import { RegisterCommand, LoginCommand, LogoutCommand, RefreshTokenCommand, UpdateUserCommand, DeleteUserCommand } from './index';
import { RegisterCommandHandler, RegisterCommandResult } from './handlers/RegisterCommandHandler';
import { LoginCommandHandler, LoginCommandResult } from './handlers/LoginCommandHandler';
import { LogoutCommandHandler, LogoutCommandResult } from './handlers/LogoutCommandHandler';
import { RefreshTokenCommandHandler, RefreshTokenCommandResult } from './handlers/RefreshTokenCommandHandler';
import { UpdateUserCommandHandler, UpdateUserCommandResult } from './handlers/UpdateUserCommandHandler';
import { DeleteUserCommandHandler, DeleteUserCommandResult } from './handlers/DeleteUserCommandHandler';

// Type for command result
export type CommandResult = 
  | RegisterCommandResult 
  | LoginCommandResult 
  | LogoutCommandResult 
  | RefreshTokenCommandResult
  | UpdateUserCommandResult
  | DeleteUserCommandResult;

export class CommandBus {
  private registerHandler = new RegisterCommandHandler();
  private loginHandler = new LoginCommandHandler();
  private logoutHandler = new LogoutCommandHandler();
  private refreshTokenHandler = new RefreshTokenCommandHandler();
  private updateUserHandler = new UpdateUserCommandHandler();
  private deleteUserHandler = new DeleteUserCommandHandler();

  async execute(
    command: RegisterCommand | LoginCommand | LogoutCommand | RefreshTokenCommand | UpdateUserCommand | DeleteUserCommand
  ): Promise<CommandResult> {
    if (command instanceof RegisterCommand) {
      return this.registerHandler.handle(command);
    }

    if (command instanceof LoginCommand) {
      return this.loginHandler.handle(command);
    }

    if (command instanceof LogoutCommand) {
      return this.logoutHandler.handle(command);
    }

    if (command instanceof RefreshTokenCommand) {
      return this.refreshTokenHandler.handle(command);
    }

    if (command instanceof UpdateUserCommand) {
      return this.updateUserHandler.handle(command);
    }

    if (command instanceof DeleteUserCommand) {
      return this.deleteUserHandler.handle(command);
    }

    throw new Error('Unknown command');
  }
}
