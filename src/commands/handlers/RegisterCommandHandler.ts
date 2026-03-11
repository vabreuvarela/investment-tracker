import { DomainException } from '../../exceptions/DomainException';
import { generateToken } from '../../utils/jwt';
import { hashPassword } from '../../utils/password';
import { generateUUIDv7 } from '../../utils/uuid';
import { createDatabaseClient } from '../../database/client';
import { UserRepository } from '../../repositories/UserRepository';
import { RegisterCommand } from '../index';

export interface RegisterCommandResult {
  token: string;
  user: {
    id: string;
    email: string;
  };
}

export class RegisterCommandHandler {
  async handle(command: RegisterCommand): Promise<RegisterCommandResult> {
    const { email, password } = command;

    if (!email || !password) {
      throw new DomainException('Email and password are required', 400);
    }

    if (password.length < 6) {
      throw new DomainException('Password must be at least 6 characters long', 400);
    }

    const client = createDatabaseClient();
    const userRepository = new UserRepository(client);

    try {
      // Check if user already exists
      const existingUser = await userRepository.findByEmail(email);

      if (existingUser) {
        throw new DomainException('Email already in use', 409, 'EMAIL_ALREADY_EXISTS');
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Create new user
      const newUser = await userRepository.create({
        id: generateUUIDv7(),
        email,
        password: hashedPassword,
        created_at: new Date(),
        updated_at: new Date(),
      });

      // Generate token
      const token = generateToken(newUser.id, newUser.email);

      return {
        token,
        user: {
          id: newUser.id,
          email: newUser.email,
        },
      };
    } catch (error) {
      // If it's already a DomainException, re-throw it
      if (error instanceof DomainException) {
        throw error;
      }
      // Handle database errors
      throw new DomainException('Failed to register user', 500);
    }
  }
}
