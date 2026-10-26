import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import type { Response } from 'express';
import { UsersService } from '../users/users.service';
import { IS_PUBLIC_KEY, type AuthenticatedRequest } from './auth.decorators';

export const AUTH_COOKIE = 'access_token';

/** Global guard: every route needs a valid JWT in the httpOnly cookie unless marked @Public(). */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly reflector: Reflector,
    private readonly users: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const http = context.switchToHttp();
    const request = http.getRequest<AuthenticatedRequest>();
    const token = request.cookies?.[AUTH_COOKIE] as string | undefined;
    if (!token) throw new UnauthorizedException('Please log in');

    const userId = await this.verifiedUserId(token);
    if (!userId) {
      // Drop the stale cookie, otherwise the frontend proxy keeps treating the browser as logged in.
      http.getResponse<Response>().clearCookie(AUTH_COOKIE, { path: '/' });
      throw new UnauthorizedException('Session expired, please log in again');
    }
    request.user = { userId };
    return true;
  }

  /** The token's user id, or null if the token is invalid/expired or its user no longer exists or is disabled. */
  private async verifiedUserId(token: string): Promise<string | null> {
    try {
      const { sub } = await this.jwt.verifyAsync<{ sub: string }>(token);
      const user = await this.users.findById(sub);
      return user?.isActive ? sub : null;
    } catch {
      return null;
    }
  }
}
