import { Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { CurrentUserId } from '../auth/auth.decorators';
import { ProgressService } from './progress.service';

@Controller('progress')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Get()
  async getCompletedKeys(@CurrentUserId() userId: string) {
    return {
      completedKeys: await this.progressService.getCompletedKeys(userId),
    };
  }

  @Post('video/:contentId/complete')
  async markVideoComplete(
    @CurrentUserId() userId: string,
    @Param('contentId') contentId: string,
  ) {
    await this.progressService.markComplete(userId, contentId, 'video');
    return { completed: true };
  }

  @Post('challenge/:key/complete')
  async markChallengeComplete(
    @CurrentUserId() userId: string,
    @Param('key') key: string,
  ) {
    await this.progressService.markComplete(userId, key, 'challenge');
    return { completed: true };
  }

  @Post('linkedin/:topicId/posted')
  async markPosted(
    @CurrentUserId() userId: string,
    @Param('topicId') topicId: string,
  ) {
    await this.progressService.setCompleted(userId, topicId, 'linkedin', true);
    return { posted: true };
  }

  @Delete('linkedin/:topicId/posted')
  async unmarkPosted(
    @CurrentUserId() userId: string,
    @Param('topicId') topicId: string,
  ) {
    await this.progressService.setCompleted(userId, topicId, 'linkedin', false);
    return { posted: false };
  }

  @Get('linkedin')
  async postedTopics(@CurrentUserId() userId: string) {
    return {
      topicIds: await this.progressService.getCompletedKeysOfType(
        userId,
        'linkedin',
      ),
    };
  }

  @Post('lab/:labId/complete')
  async markLabComplete(
    @CurrentUserId() userId: string,
    @Param('labId') labId: string,
  ) {
    await this.progressService.markComplete(userId, labId, 'lab');
    return { completed: true };
  }

  @Post('interview/:moduleId/complete')
  async markInterviewComplete(
    @CurrentUserId() userId: string,
    @Param('moduleId') moduleId: string,
  ) {
    await this.progressService.markComplete(userId, moduleId, 'interview');
    return { completed: true };
  }
}
