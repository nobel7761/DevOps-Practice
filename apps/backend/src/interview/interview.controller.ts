import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { GradeAnswerDto } from './dto/grade-answer.dto';
import { InterviewService } from './interview.service';

@Controller('interview')
export class InterviewController {
  constructor(private readonly interviewService: InterviewService) {}

  @Get(':moduleId')
  getInterview(@Param('moduleId') moduleId: string) {
    return this.interviewService.getInterview(moduleId);
  }

  @Post(':moduleId/grade')
  gradeAnswer(
    @Param('moduleId') moduleId: string,
    @Body() dto: GradeAnswerDto,
  ) {
    return this.interviewService.gradeAnswer(moduleId, dto);
  }
}
