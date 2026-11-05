import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CurrentUserId } from '../auth/auth.decorators';
import { SubmitHermesQuizDto } from './dto/submit-hermes-quiz.dto';
import { HermesQuizService } from './hermes-quiz.service';

@Controller('hermes-quiz')
export class HermesQuizController {
  constructor(private readonly quizService: HermesQuizService) {}

  @Get(':contentId/status')
  getStatus(
    @CurrentUserId() userId: string,
    @Param('contentId') contentId: string,
  ) {
    return this.quizService.getStatus(userId, contentId);
  }

  @Post(':contentId/attempts')
  startAttempt(
    @CurrentUserId() userId: string,
    @Param('contentId') contentId: string,
  ) {
    return this.quizService.startAttempt(userId, contentId);
  }

  @Post('attempts/:attemptId/submit')
  submitAttempt(
    @CurrentUserId() userId: string,
    @Param('attemptId') attemptId: string,
    @Body() dto: SubmitHermesQuizDto,
  ) {
    return this.quizService.submitAttempt(userId, attemptId, dto.answers);
  }
}
