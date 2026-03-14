import { Request, Response, NextFunction } from 'express';
import { CommandBus } from '../commands/CommandBus';
import { UpdateUserCommand, DeleteUserCommand } from '../commands/index';

export class UserController {
  constructor(private commandBus: CommandBus) {}

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = String(req.params.userId);
      const { email, password } = req.body;

      const command = new UpdateUserCommand(userId, email, password);
      const result = await this.commandBus.execute(command);

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = String(req.params.userId);

      const command = new DeleteUserCommand(userId);
      const result = await this.commandBus.execute(command);

      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}
