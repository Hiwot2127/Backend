import { Role, User } from '../types/user.js';

export interface UserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  create(data: { email: string; password: string; role?: Role }): Promise<User>;
  updateRole(id: string, role: Role): Promise<User | null>;
}