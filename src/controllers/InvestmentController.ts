import { Request, Response, NextFunction } from 'express';
import { InvestmentsRepository } from '../repositories/InvestmentsRepository';

export class InvestmentController {
  private repo: InvestmentsRepository;

  constructor(repo?: InvestmentsRepository) {
    this.repo = repo || new InvestmentsRepository();
  }

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = String(req.params.userId);
      const investments = await this.repo.findByUserId(userId);

      res.json({
        success: true,
        data: investments,
      });
    } catch (error) {
      next(error);
    }
  }
}
