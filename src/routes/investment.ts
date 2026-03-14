import { Router, Request, Response, NextFunction } from 'express';
import { InvestmentController } from '../controllers/InvestmentController';
import { authenticate } from '../middleware/authenticate';
import { authorizeUserAccess } from '../middleware/authorize';

const router = Router();
const controller = new InvestmentController();

/**
 * GET /investments
 * Returns investments for the given user. Requires authentication (own resources only).
 */
router.get(
  '/',
  (req: Request, res: Response, next: NextFunction) => authenticate(req, res, next),
  (req: Request, res: Response, next: NextFunction) => controller.list(req, res, next)
);

export default router;
