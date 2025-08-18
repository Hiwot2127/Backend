import { UserRepository } from '../../domain/repositories/UserRepository.js';

export class PromoteUser {
  constructor(private readonly users: UserRepository) {}
  async execute(input: { targetUserId: string }) {
    const updated = await this.users.updateRole(input.targetUserId, 'ADMIN');
    if (!updated) throw new Error('User not found');
    return { id: updated.id, email: updated.email, role: updated.role };
  }
}