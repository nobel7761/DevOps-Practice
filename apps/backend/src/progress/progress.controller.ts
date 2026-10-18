import { Controller, Get, Param, Post } from '@nestjs/common';
import { ProgressService } from './progress.service';

@Controller('progress')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Get()
  async getCompletedKeys() {
    return { completedKeys: await this.progressService.getCompletedKeys() };
  }

  @Post('video/:contentId/complete')
  async markVideoComplete(@Param('contentId') contentId: string) {
    await this.progressService.markComplete(contentId, 'video');
    return { completed: true };
  }

  @Post('lab/:labId/complete')
  async markLabComplete(@Param('labId') labId: string) {
    await this.progressService.markComplete(labId, 'lab');
    return { completed: true };
  }
}
