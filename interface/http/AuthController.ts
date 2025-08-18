import { Request, Response } from 'express';
import { RegisterUser } from '../../application/auth/RegisterUser.js';
import { LoginUser } from '../../application/auth/LoginUser.js';
import { PromoteUser } from '../../application/auth/PromoteUser.js';

export class AuthController {
  constructor(private readonly registerUC: RegisterUser, private readonly loginUC: LoginUser, private readonly promoteUC: PromoteUser) {}

  register = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });
    try {
      const user = await this.registerUC.execute({ email, password });
      res.status(201).json(user);
    } catch {
      res.status(409).json({ error: 'Email already registered' });
    }
  };

  login = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });
    try {
      const result = await this.loginUC.execute({ email, password });
      res.json(result);
    } catch {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  };

  promote = async (req: Request, res: Response) => {
    try {
      const user = await this.promoteUC.execute({ targetUserId: req.params.id });
      res.json(user);
    } catch {
      res.status(404).json({ error: 'User not found' });
    }
  };
}