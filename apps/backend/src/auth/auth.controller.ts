import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import type { CookieOptions, Response } from 'express';
import { CurrentUserId, Public } from './auth.decorators';
import { AuthService } from './auth.service';
import {
  ForgotPasswordDto,
  LoginDto,
  RegisterDto,
  ResetPasswordDto,
} from './dto/auth.dto';
import { AUTH_COOKIE } from './jwt-auth.guard';

const SESSION_MS = 7 * 24 * 60 * 60 * 1000;

@Controller('auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly config: ConfigService,
  ) {}

  private get cookieOptions(): CookieOptions {
    return {
      httpOnly: true,
      sameSite: 'lax',
      secure: this.config.get<string>('NODE_ENV') === 'production',
      path: '/',
    };
  }

  private async startSession(res: Response, userId: string) {
    res.cookie(AUTH_COOKIE, await this.auth.signToken(userId), {
      ...this.cookieOptions,
      maxAge: SESSION_MS,
    });
  }

  @Public()
  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.auth.register(dto);
    await this.startSession(res, user.id);
    return { user };
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('login')
  @HttpCode(200)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.auth.login(dto);
    await this.startSession(res, user.id);
    return { user };
  }

  @Public()
  @Post('logout')
  @HttpCode(200)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(AUTH_COOKIE, this.cookieOptions);
    return { ok: true };
  }

  @Get('me')
  async me(@CurrentUserId() userId: string) {
    return { user: await this.auth.me(userId) };
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('forgot-password')
  @HttpCode(200)
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    await this.auth.forgotPassword(dto);
    return {
      message:
        'If an account exists for this email, a password reset link has been sent.',
    };
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('reset-password')
  @HttpCode(200)
  async resetPassword(
    @Body() dto: ResetPasswordDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.auth.resetPassword(dto);
    await this.startSession(res, user.id);
    return { user };
  }
}
