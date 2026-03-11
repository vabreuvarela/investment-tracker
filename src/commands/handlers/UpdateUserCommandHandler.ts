import { DomainException } from '../../exceptions/DomainException';
import { hashPassword } from '../../utils/password';
import { createDatabaseClient } from '../../database/client';
import { UserRepository } from '../../repositories/UserRepository';
import { UpdateUserCommand } from '../index';
import { User } from '../../repositories/UserRepository';

export interface UpdateUserCommandResult {
  user: {
    id: string;
    email: string;
  };
}

export class UpdateUserCommandHandler {
  async handle(command: UpdateUserCommand): Promise<UpdateUserCommandResult> {
    const { userId, email, password } = command;

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

    // Prepare updates
    const updates: Partial<Omit<User, 'id'>> = {
      updated_at: new Date(),
    };

    // Validate and hash new password if provided
    if (password) {
      if (password.length < 6) {
        throw new DomainException('Password must be at least 6 characters long', 400);
      }
      updates.password = await hashPassword(password);
    }

    // Check for email uniqueness if email is being updated
    if (email && email !== user.email) {
      const existingUser = await userRepository.findByEmail(email);
      if (existingUser) {
        throw new DomainException('Email already in use', 409);
      }
      updates.email = email;
    }

    // Update user
    const updatedUser = await userRepository.update(userId, updates);

    return {
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
      },
    };
  }
}
