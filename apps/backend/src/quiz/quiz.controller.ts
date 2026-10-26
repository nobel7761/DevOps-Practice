import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CurrentUserId } from '../auth/auth.decorators';
import { QuizService } from './quiz.service';
import { SubmitQuizDto } from './dto/submit-quiz.dto';

@Controller('quiz')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Get(':labId')
  getQuiz(@Param('labId') labId: string) {
    return this.quizService.getQuizForLab(labId);
  }

  @Get(':labId/attempts/latest')
  getLatestAttempt(
    @CurrentUserId() userId: string,
    @Param('labId') labId: string,
  ) {
    return this.quizService.getLatestAttempt(userId, labId);
  }

  @Post(':labId/submit')
  submitQuiz(
    @CurrentUserId() userId: string,
    @Param('labId') labId: string,
    @Body() dto: SubmitQuizDto,
  ) {
    return this.quizService.submitQuiz(userId, labId, dto);
  }
}
