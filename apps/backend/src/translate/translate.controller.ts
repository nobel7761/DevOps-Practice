import { Body, Controller, Param, Post } from '@nestjs/common';
import { TranslateInterviewDto } from './dto/translate-interview.dto';
import { TranslateLabDto } from './dto/translate-lab.dto';
import { TranslateService } from './translate.service';

@Controller('translate')
export class TranslateController {
  constructor(private readonly translateService: TranslateService) {}

  @Post('lab/:labId')
  async translateLab(
    @Param('labId') labId: string,
    @Body() dto: TranslateLabDto,
  ) {
    const markdown = await this.translateService.translateLabMarkdown(
      labId,
      dto.markdown,
    );
    return { markdown };
  }

  @Post('interview/:moduleId')
  async translateInterview(
    @Param('moduleId') moduleId: string,
    @Body() dto: TranslateInterviewDto,
  ) {
    const questions = await this.translateService.translateInterviewQuestions(
      moduleId,
      dto.questions,
    );
    return { questions };
  }
}
