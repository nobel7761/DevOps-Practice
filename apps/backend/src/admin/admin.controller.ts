import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { AccessDto } from './admin.dto';
import { SuperAdminGuard } from './super-admin.guard';

@Controller('admin/users')
@UseGuards(SuperAdminGuard)
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get()
  async list(@Query('status') status?: 'pending' | 'approved' | 'rejected') {
    return { users: await this.admin.list(status) };
  }

  @Post(':id/approve')
  approve(@Param('id') id: string, @Body() dto: AccessDto) {
    return this.admin.approve(id, dto).then(() => ({ ok: true }));
  }

  @Post(':id/reject')
  reject(@Param('id') id: string) {
    return this.admin.reject(id).then(() => ({ ok: true }));
  }

  @Patch(':id/access')
  updateAccess(@Param('id') id: string, @Body() dto: AccessDto) {
    return this.admin.updateAccess(id, dto).then(() => ({ ok: true }));
  }
}
