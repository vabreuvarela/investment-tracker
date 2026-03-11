import { DomainException } from '../../exceptions/DomainException';
import { createDatabaseClient } from '../../database/client';
import { UserRepository } from '../../repositories/UserRepository';
import { DeleteUserCommand } from '../index';

export interface DeleteUserCommandResult {
  message: string;
}

export class DeleteUserCommandHandler {
  async handle(command: DeleteUserCommand): Promise<DeleteUserCommandResult> {
    const { userId } = command;

    if (!userId) {
      throw new DomainException('Unauthorized', 401);
    }

    const client = createDatabaseClient();
    const userRepository = new UserRepository(client);

    // Verify user exists
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new DomainException('User not found', 404);
    }

    // Soft delete the user
    await userRepository.delete(userId);

    return {
      message: 'User deleted successfully',
    };
  }
}
