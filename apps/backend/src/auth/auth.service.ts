import { createHash, randomBytes } from 'crypto';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { MailService } from '../mail/mail.service';
import { canLogin } from '../users/access-rules';
import { UsersService } from '../users/users.service';
import {
  ForgotPasswordDto,
  LoginDto,
  RegisterDto,
  ResetPasswordDto,
} from './dto/auth.dto';

const BCRYPT_ROUNDS = 12;
const RESET_TOKEN_TTL_MS = 30 * 60 * 1000;

const sha256 = (value: string) =>
  createHash('sha256').update(value).digest('hex');

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
    private readonly mail: MailService,
    private readonly config: ConfigService,
  ) {}

  signToken(userId: string) {
    return this.jwt.signAsync({ sub: userId });
  }

  async register(dto: RegisterDto) {
    if (await this.users.findByEmail(dto.email)) {
      throw new ConflictException('An account with this email already exists');
    }
    const user = await this.users.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      passwordHash: await bcrypt.hash(dto.password, BCRYPT_ROUNDS),
      role: 'user',
      status: 'pending',
      courseIds: [],
      askAiEnabled: false,
    });
    return UsersService.toPublic(user);
  }

  async login(dto: LoginDto) {
    const user = await this.users.findByEmailWithPassword(dto.email);
    const valid =
      !!user && (await bcrypt.compare(dto.password, user.passwordHash));
    // Same message for unknown email and wrong password, so emails can't be probed.
    if (!user || !valid) {
      throw new UnauthorizedException('Invalid email or password');
    }
    // Only revealed after the password is proven correct.
    if (user.status === 'pending') {
      throw new ForbiddenException(
        'Your account is awaiting super admin approval.',
      );
    }
    if (!canLogin(user)) {
      throw new ForbiddenException('Your account has no access.');
    }
    return UsersService.toPublic(user);
  }

  async me(userId: string) {
    const user = await this.users.findById(userId);
    if (!user || !canLogin(user)) throw new UnauthorizedException();
    return UsersService.toPublic(user);
  }

  /** Always resolves the same way whether or not the email exists. */
  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.users.findByEmail(dto.email);
    if (!user || !canLogin(user)) return;

    const token = randomBytes(32).toString('hex');
    await this.users.setResetToken(
      String(user._id),
      sha256(token),
      new Date(Date.now() + RESET_TOKEN_TTL_MS),
    );
    const frontendUrl =
      this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:3000';
    await this.mail.sendPasswordReset(
      user.email,
      user.firstName,
      `${frontendUrl}/reset-password?token=${token}`,
    );
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.users.findByValidResetToken(sha256(dto.token));
    if (!user) {
      throw new BadRequestException(
        'This reset link is invalid or has expired',
      );
    }
    await this.users.updatePassword(
      String(user._id),
      await bcrypt.hash(dto.password, BCRYPT_ROUNDS),
    );
    return UsersService.toPublic(user);
  }
}
