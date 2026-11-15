import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { SuperAdminGuard } from './super-admin.guard';
import { SuperAdminSeeder } from './super-admin-seeder';

@Module({
  imports: [UsersModule],
  controllers: [AdminController],
  providers: [AdminService, SuperAdminGuard, SuperAdminSeeder],
})
export class AdminModule {}
