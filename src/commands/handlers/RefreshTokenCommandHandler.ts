import { DomainException } from '../../exceptions/DomainException';
import { generateToken } from '../../utils/jwt';
import { RefreshTokenCommand } from '../index';

export interface RefreshTokenCommandResult {
  token: string;
  user: {
    id: string;
    email: string;
  };
}

export class RefreshTokenCommandHandler {
  async handle(command: RefreshTokenCommand): Promise<RefreshTokenCommandResult> {
    const { userId, email } = command;

    if (!userId) {
      throw new DomainException('Unauthorized', 401);
    }

    // Generate a new token for the authenticated user
    const token = generateToken(userId, email);

    return {
      token,
      user: {
        id: userId,
        email,
      },
    };
  }
}
