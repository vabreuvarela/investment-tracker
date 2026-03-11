import { DomainException } from '../../exceptions/DomainException';
import { generateToken } from '../../utils/jwt';
import { comparePasswords } from '../../utils/password';
import { createDatabaseClient } from '../../database/client';
import { UserRepository } from '../../repositories/UserRepository';
import { LoginCommand } from '../index';

export interface LoginCommandResult {
  token: string;
  user: {
    id: string;
    email: string;
  };
}

export class LoginCommandHandler {
  async handle(command: LoginCommand): Promise<LoginCommandResult> {
    const { email, password } = command;

    if (!email || !password) {
      throw new DomainException('Email and password are required', 400);
    }

    const client = createDatabaseClient();
    const userRepository = new UserRepository(client);

    const user = await userRepository.findByEmail(email);

    if (!user) {
      throw new DomainException('Invalid email or password', 422);
    }

    const passwordMatch = await comparePasswords(password, user.password);

    if (!passwordMatch) {
      throw new DomainException('Invalid email or password', 422);
    }

    const token = generateToken(user.id, user.email);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
      },
    };
  }
}
