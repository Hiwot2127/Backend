import bcrypt from 'bcrypt';
import { PasswordHasher } from '../../domain/services/PasswordHasher.js';

export class BcryptPasswordHasher implements PasswordHasher {
  constructor(private readonly rounds = 10) {}
  hash(plain: string) { return bcrypt.hash(plain, this.rounds); }
  compare(plain: string, hash: string) { return bcrypt.compare(plain, hash); }
}