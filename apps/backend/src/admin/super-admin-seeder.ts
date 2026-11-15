import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';

/** Creates the super admin from SUPERADMIN_EMAIL / SUPERADMIN_PASSWORD in .env on startup. */
@Injectable()
export class SuperAdminSeeder implements OnApplicationBootstrap {
  private readonly logger = new Logger(SuperAdminSeeder.name);

  constructor(
    private readonly users: UsersService,
    private readonly config: ConfigService,
  ) {}

  async onApplicationBootstrap() {
    const email = this.config.get<string>('SUPERADMIN_EMAIL')?.trim();
    const password = this.config.get<string>('SUPERADMIN_PASSWORD');
    if (!email || !password) {
      this.logger.warn(
        'SUPERADMIN_EMAIL/PASSWORD not set — no super admin seeded',
      );
      return;
    }
    const existing = await this.users.findByEmail(email);
    if (existing) {
      if (existing.role !== 'superadmin') {
        await this.users.updateAccess(String(existing._id), {
          role: 'superadmin',
          status: 'approved',
        });
      }
      return;
    }
    await this.users.create({
      firstName: 'Super',
      lastName: 'Admin',
      email: email.toLowerCase(),
      passwordHash: await bcrypt.hash(password, 12),
      role: 'superadmin',
      status: 'approved',
    });
    this.logger.log(`Super admin created: ${email}`);
  }
}
