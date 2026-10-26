import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CurrentUserId } from '../auth/auth.decorators';
import { AskService } from './ask.service';
import { AskQuestionDto } from './dto/ask-question.dto';

@Controller('ask')
export class AskController {
  constructor(private readonly askService: AskService) {}

  @Get(':contentId/history')
  getHistory(
    @CurrentUserId() userId: string,
    @Param('contentId') contentId: string,
  ) {
    return this.askService.getHistory(userId, contentId);
  }

  @Post(':contentId')
  ask(
    @CurrentUserId() userId: string,
    @Param('contentId') contentId: string,
    @Body() dto: AskQuestionDto,
  ) {
    return this.askService.ask(userId, contentId, dto);
  }
}
