import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Post,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { CurrentUserId } from '../auth/auth.decorators';
import { canUseAskAi } from '../users/access-rules';
import { UsersService } from '../users/users.service';
import { AskService } from './ask.service';
import { AskQuestionDto } from './dto/ask-question.dto';

@Controller('ask')
export class AskController {
  constructor(
    private readonly askService: AskService,
    private readonly users: UsersService,
  ) {}

  /** Ask AI is switched on per user by the super admin. */
  private async assertAskAiEnabled(userId: string) {
    const user = await this.users.findById(userId);
    if (!user || !canUseAskAi(user)) {
      throw new ForbiddenException('Ask AI is not enabled for your account');
    }
  }

  @Get(':contentId/history')
  async getHistory(
    @CurrentUserId() userId: string,
    @Param('contentId') contentId: string,
  ) {
    await this.assertAskAiEnabled(userId);
    return this.askService.getHistory(userId, contentId);
  }

  /** Streams the answer as Server-Sent Events so the UI can show it appearing word-by-word, ChatGPT-style. */
  @Post(':contentId')
  async ask(
    @CurrentUserId() userId: string,
    @Param('contentId') contentId: string,
    @Body() dto: AskQuestionDto,
    @Res() res: Response,
  ) {
    await this.assertAskAiEnabled(userId);
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    try {
      for await (const delta of this.askService.streamAsk(
        userId,
        contentId,
        dto,
      )) {
        res.write(`data: ${JSON.stringify({ delta })}\n\n`);
      }
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    } catch {
      res.write(
        `data: ${JSON.stringify({ error: 'দুঃখিত, এখন উত্তর দেওয়া যায়নি। আবার চেষ্টা করো।' })}\n\n`,
      );
    } finally {
      res.end();
    }
  }
}
