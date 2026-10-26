import {
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
} from '@nestjs/common';
import type { Request } from 'express';

export const IS_PUBLIC_KEY = 'isPublic';

/** Opts a route out of the global JwtAuthGuard. */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

export interface AuthUser {
  userId: string;
}

export type AuthenticatedRequest = Request & { user: AuthUser };

/** The logged-in user's id, set on the request by JwtAuthGuard. */
export const CurrentUserId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string =>
    ctx.switchToHttp().getRequest<AuthenticatedRequest>().user.userId,
);
