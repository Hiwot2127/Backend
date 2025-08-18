import { PrismaClient } from '@prisma/client';
import { UserRepository } from '../../domain/repositories/UserRepository.js';
import { Role, User } from '../../domain/types/user.js';

export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaClient) {}
  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } }) as unknown as Promise<User | null>;
  }
  findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } }) as unknown as Promise<User | null>;
  }
  create(data: { email: string; password: string; role?: Role }) {
    return this.prisma.user.create({
      data: { email: data.email, password: data.password, role: data.role ?? 'USER' }
    }) as unknown as Promise<User>;
  }
  async updateRole(id: string, role: Role) {
    try {
      return (await this.prisma.user.update({ where: { id }, data: { role } })) as unknown as User;
    } catch {
      return null;
    }
  }
}