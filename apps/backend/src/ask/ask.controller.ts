import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AskService } from './ask.service';
import { AskQuestionDto } from './dto/ask-question.dto';

@Controller('ask')
export class AskController {
  constructor(private readonly askService: AskService) {}

  @Get(':contentId/history')
  getHistory(@Param('contentId') contentId: string) {
    return this.askService.getHistory(contentId);
  }

  @Post(':contentId')
  ask(@Param('contentId') contentId: string, @Body() dto: AskQuestionDto) {
    return this.askService.ask(contentId, dto);
  }
}
