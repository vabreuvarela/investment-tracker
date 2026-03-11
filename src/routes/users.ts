import { Router, Request, Response, NextFunction } from 'express';
import { UserController } from '../controllers/UserController';
import { CommandBus } from '../commands/CommandBus';
import { authenticate } from '../middleware/authenticate';
import { authorizeUserAccess } from '../middleware/authorize';

const router = Router();
const commandBus = new CommandBus();
const userController = new UserController(commandBus);

/**
 * PUT /users/:userId
 * Update authenticated user's profile
 * Requires authentication and authorization (can only update own profile)
 */
router.put(
  '/:userId',
  (req: Request, res: Response, next: NextFunction) => authenticate(req, res, next),
  (req: Request, res: Response, next: NextFunction) => authorizeUserAccess(req, res, next),
  (req: Request, res: Response, next: NextFunction) => userController.update(req, res, next)
);

/**
 * DELETE /users/:userId
 * Delete authenticated user's account
 * Requires authentication and authorization (can only delete own account)
 */
router.delete(
  '/:userId',
  (req: Request, res: Response, next: NextFunction) => authenticate(req, res, next),
  (req: Request, res: Response, next: NextFunction) => authorizeUserAccess(req, res, next),
  (req: Request, res: Response, next: NextFunction) => userController.delete(req, res, next)
);

export default router;
