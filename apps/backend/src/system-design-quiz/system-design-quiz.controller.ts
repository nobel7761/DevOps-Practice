import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { SubmitSdQuizDto } from './dto/submit-sd-quiz.dto';
import { SystemDesignQuizService } from './system-design-quiz.service';
import { CurrentUserId } from '../auth/auth.decorators';

@Controller('sd-quiz')
export class SystemDesignQuizController {
  constructor(private readonly quizService: SystemDesignQuizService) {}

  @Get(':topicId/status')
  getStatus(
    @CurrentUserId() userId: string,
    @Param('topicId') topicId: string,
  ) {
    return this.quizService.getStatus(userId, topicId);
  }

  @Post(':topicId/attempts')
  startAttempt(
    @CurrentUserId() userId: string,
    @Param('topicId') topicId: string,
  ) {
    return this.quizService.startAttempt(userId, topicId);
  }

  @Post('attempts/:attemptId/submit')
  submitAttempt(
    @CurrentUserId() userId: string,
    @Param('attemptId') attemptId: string,
    @Body() dto: SubmitSdQuizDto,
  ) {
    return this.quizService.submitAttempt(userId, attemptId, dto.answers);
  }
}
