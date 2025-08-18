import { UserRepository } from '../../domain/repositories/UserRepository.js';
import { PasswordHasher } from '../../domain/services/PasswordHasher.js';
import { TokenService } from '../../domain/services/TokenService.js';

export class LoginUser {
  constructor(private readonly users: UserRepository, private readonly hasher: PasswordHasher, private readonly tokens: TokenService) {}
  async execute(input: { email: string; password: string }) {
    const user = await this.users.findByEmail(input.email.trim().toLowerCase());
    if (!user) throw new Error('Invalid credentials');
    const ok = await this.hasher.compare(input.password, user.password);
    if (!ok) throw new Error('Invalid credentials');
    const token = this.tokens.sign({ userId: user.id, role: user.role }, '1h');
    return { token, role: user.role };
  }
}