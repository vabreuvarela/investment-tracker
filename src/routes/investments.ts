import { Router, Request, Response, NextFunction } from 'express';
import { InvestmentController } from '../controllers/InvestmentController';
import { authenticate } from '../middleware/authenticate';
import { authorizeUserAccess } from '../middleware/authorize';

const router = Router();
const controller = new InvestmentController();

/**
 * GET /investments/:userId
 * Returns investments for the given user. Requires authentication and authorization (own resources only).
 */
router.get(
  '/:userId',
  (req: Request, res: Response, next: NextFunction) => authenticate(req, res, next),
  (req: Request, res: Response, next: NextFunction) => authorizeUserAccess(req, res, next),
  (req: Request, res: Response, next: NextFunction) => controller.list(req, res, next)
);

export default router;
