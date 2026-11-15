import { Body, Controller, Get, Post } from '@nestjs/common';
import { CurrentUserId } from '../auth/auth.decorators';
import { CcdvExamAttemptsService } from './ccdv-exam-attempts.service';
import { SaveAttemptDto } from './dto/save-attempt.dto';

@Controller('ccdv-exam-attempts')
export class CcdvExamAttemptsController {
  constructor(private readonly attempts: CcdvExamAttemptsService) {}

  @Get()
  list(@CurrentUserId() userId: string) {
    return this.attempts.list(userId);
  }

  @Post()
  async save(@CurrentUserId() userId: string, @Body() dto: SaveAttemptDto) {
    await this.attempts.save(userId, dto);
    return { saved: true };
  }
}
