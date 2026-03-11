import { Request, Response, NextFunction } from 'express';
import { DomainException } from '../exceptions/DomainException';
import { verifyToken } from '../utils/jwt';
import { AuthPayload } from '../types/auth';

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new DomainException('Missing or invalid authorization header', 401, 'UNAUTHORIZED');
  }

  const token = authHeader.substring(7);

  try {
    const payload = verifyToken(token);
    req.user = {
      userId: payload.userId,
      email: payload.email,
    } as AuthPayload;
    next();
  } catch (error) {
    throw new DomainException('Invalid or expired token', 401, 'INVALID_TOKEN');
  }
}
