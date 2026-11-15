import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import type { AuthenticatedRequest } from '../auth/auth.decorators';

/** Runs after the global JwtAuthGuard: only super admins pass. */
@Injectable()
export class SuperAdminGuard implements CanActivate {
  constructor(private readonly users: UsersService) {}

  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = await this.users.findById(req.user.userId);
    if (user?.role !== 'superadmin') {
      throw new ForbiddenException('Super admin only');
    }
    return true;
  }
}
