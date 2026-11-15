import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';

export interface AccessInput {
  courseIds?: string[];
  askAiEnabled?: boolean;
}

@Injectable()
export class AdminService {
  constructor(private readonly users: UsersService) {}

  private async editableUser(id: string) {
    const user = await this.users.findById(id);
    if (!user) throw new NotFoundException('User not found');
    if (user.role === 'superadmin') {
      throw new BadRequestException('Super admin accounts cannot be changed');
    }
    return user;
  }

  async list(status?: 'pending' | 'approved' | 'rejected') {
    return (await this.users.listMembers(status)).map((u) =>
      UsersService.toPublic(u),
    );
  }

  async approve(id: string, input: AccessInput) {
    await this.editableUser(id);
    return this.users.updateAccess(id, {
      status: 'approved',
      courseIds: input.courseIds ?? [],
      askAiEnabled: input.askAiEnabled ?? false,
    });
  }

  async reject(id: string) {
    await this.editableUser(id);
    return this.users.updateAccess(id, { status: 'rejected' });
  }

  async updateAccess(id: string, input: AccessInput) {
    await this.editableUser(id);
    return this.users.updateAccess(id, input);
  }
}
