import { Request, Response, NextFunction } from 'express';
import { InvestmentRepository } from '../repositories/InvestmentRepository';

export class InvestmentController {
  private repo: InvestmentRepository;

  constructor(repo?: InvestmentRepository) {
    this.repo = repo || new InvestmentRepository();
  }

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = String(req.params.userId);
      const investments = await this.repo.findByUserId(userId);

      res.json(investments);
    } catch (error) {
      next(error);
    }
  }
}
