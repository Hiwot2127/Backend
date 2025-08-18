import { UserRepository } from '../../domain/repositories/UserRepository.js';
import { PasswordHasher } from '../../domain/services/PasswordHasher.js';

export class RegisterUser {
  constructor(private readonly users: UserRepository, private readonly hasher: PasswordHasher) {}
  async execute(input: { email: string; password: string }) {
    const email = input.email.trim().toLowerCase();
    const exists = await this.users.findByEmail(email);
    if (exists) throw new Error('Email already registered');
    const hashed = await this.hasher.hash(input.password);
    const user = await this.users.create({ email, password: hashed });
    return { id: user.id, email: user.email, role: user.role };
  }
}