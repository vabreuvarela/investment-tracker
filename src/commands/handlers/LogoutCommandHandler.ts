import { DomainException } from '../../exceptions/DomainException';
import { LogoutCommand } from '../index';

export interface LogoutCommandResult {
  message: string;
}

export class LogoutCommandHandler {
  async handle(command: LogoutCommand): Promise<LogoutCommandResult> {
    const { userId } = command;

    if (!userId) {
      throw new DomainException('Unauthorized', 401);
    }

    // In a real application, you would blacklist the token in Redis or a database
    // For now, we'll just return a success response
    // The token becomes invalid after expiration (15 minutes)

    return {
      message: 'Logged out successfully',
    };
  }
}
