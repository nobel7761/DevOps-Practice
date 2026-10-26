import { Body, Controller, Get, Post } from '@nestjs/common';
import { RecordReviewDto, StartRecallDto } from './dto/recall.dto';
import { SystemDesignRecallService } from './system-design-recall.service';
import { CurrentUserId } from '../auth/auth.decorators';

@Controller('sd-recall')
export class SystemDesignRecallController {
  constructor(private readonly recallService: SystemDesignRecallService) {}

  @Get()
  getAll(@CurrentUserId() userId: string) {
    return this.recallService.getAll(userId);
  }

  @Post('start')
  async start(@CurrentUserId() userId: string, @Body() dto: StartRecallDto) {
    await this.recallService.startPoints(userId, dto.points);
    return { ok: true };
  }

  @Post('review')
  async review(@CurrentUserId() userId: string, @Body() dto: RecordReviewDto) {
    await this.recallService.recordReview(userId, dto.point, dto.date);
    return { ok: true };
  }
}
