import express, { Router, Request, Response } from 'express';

const router: Router = express.Router();

router.get('/', (req: Request, res: Response): void => {
  res.json({ message: 'Hello World' });
});

export default router;
