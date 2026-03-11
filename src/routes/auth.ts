import { Router, Request, Response, NextFunction } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authenticate } from '../middleware/authenticate';

const router = Router();
const authController = new AuthController();

// Wrapper to handle async errors
function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * POST /auth/register
 * Registers a new user with email and password
 * Returns 409 if email already in use
 * Returns 201 with token and user on success
 */
router.post('/register', asyncHandler((req, res, next) => authController.register(req, res)));

/**
 * POST /auth/login
 * Authenticates user with email and password
 * Returns 422 if email/password combination is invalid
 */
router.post('/login', asyncHandler((req, res, next) => authController.login(req, res)));

/**
 * POST /auth/logout
 * Logs out the authenticated user
 * Requires valid JWT token
 */
router.post('/logout', authenticate, asyncHandler((req, res, next) => authController.logout(req, res)));

/**
 * POST /auth/refresh
 * Refreshes the JWT token
 * Requires valid JWT token
 */
router.post('/refresh', authenticate, asyncHandler((req, res, next) => authController.refresh(req, res)));

export default router;
