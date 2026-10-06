import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { SubmitQuizDto } from './dto/submit-quiz.dto';

@Controller('quiz')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Get(':labId')
  getQuiz(@Param('labId') labId: string) {
    return this.quizService.getQuizForLab(labId);
  }

  @Post(':labId/submit')
  submitQuiz(@Param('labId') labId: string, @Body() dto: SubmitQuizDto) {
    return this.quizService.submitQuiz(labId, dto);
  }
}
