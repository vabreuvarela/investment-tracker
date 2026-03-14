import { Request, Response, NextFunction } from 'express';
import { DomainException } from '../exceptions/DomainException';

/**
 * Authorization middleware that ensures the user can only access their own resources.
 * Compares the userId in the request params with the authenticated userId from the token.
 */
export function authorizeUserAccess(req: Request, res: Response, next: NextFunction): void {
  // Support two possible locations for authenticated user id for backward compatibility
  const authenticatedUserId = (req as any).userId || (req as any).user?.userId;
  const targetUserId = req.params.userId;

  if (!authenticatedUserId) {
    throw new DomainException('Unauthorized', 401);
  }

  if (authenticatedUserId !== targetUserId) {
    throw new DomainException('Forbidden: You can only access your own resources', 403);
  }

  next();
}
