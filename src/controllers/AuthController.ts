import { Request, Response } from 'express';
import { CommandBus } from '../commands/CommandBus';
import { RegisterCommand, LoginCommand, LogoutCommand, RefreshTokenCommand } from '../commands/index';

export class AuthController {
  private commandBus = new CommandBus();

  async register(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;
    const command = new RegisterCommand(email, password);
    const result = await this.commandBus.execute(command);
    res.status(201).json(result);
  }

  async login(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;
    const command = new LoginCommand(email, password);
    const result = await this.commandBus.execute(command);
    res.status(200).json(result);
  }

  async logout(req: Request, res: Response): Promise<void> {
    const userId = req.user?.userId;
    const command = new LogoutCommand(userId || '');
    const result = await this.commandBus.execute(command);
    res.status(200).json(result);
  }

  async refresh(req: Request, res: Response): Promise<void> {
    const userId = req.user?.userId;
    const email = req.user?.email;
    const command = new RefreshTokenCommand(userId || '', email || '');
    const result = await this.commandBus.execute(command);
    res.status(200).json(result);
  }
}
