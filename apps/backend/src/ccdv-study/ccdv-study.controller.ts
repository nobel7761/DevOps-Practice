import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
} from '@nestjs/common';
import { CurrentUserId } from '../auth/auth.decorators';
import { CcdvStudyService } from './ccdv-study.service';
import { SaveCardsDto, SaveMcqDto, SaveSimDto } from './dto/save-study.dto';

function assertChapterId(chapterId: string): string {
  if (!/^ch\d{2}$/.test(chapterId)) {
    throw new BadRequestException('Invalid chapter id');
  }
  return chapterId;
}

function assertSimKey(key: string): string {
  if (!/^s\d{1,3}$/.test(key)) {
    throw new BadRequestException('Invalid simulator key');
  }
  return key;
}

@Controller('ccdv-study')
export class CcdvStudyController {
  constructor(private readonly study: CcdvStudyService) {}

  @Get(':chapterId')
  get(@CurrentUserId() userId: string, @Param('chapterId') chapterId: string) {
    return this.study.get(userId, assertChapterId(chapterId));
  }

  @Put(':chapterId/mcq')
  saveMcq(
    @CurrentUserId() userId: string,
    @Param('chapterId') chapterId: string,
    @Body() dto: SaveMcqDto,
  ) {
    return this.study.saveMcq(userId, assertChapterId(chapterId), dto);
  }

  @Delete(':chapterId/mcq')
  resetMcq(
    @CurrentUserId() userId: string,
    @Param('chapterId') chapterId: string,
  ) {
    return this.study.resetMcq(userId, assertChapterId(chapterId));
  }

  @Put(':chapterId/cards')
  saveCards(
    @CurrentUserId() userId: string,
    @Param('chapterId') chapterId: string,
    @Body() dto: SaveCardsDto,
  ) {
    return this.study.saveCards(userId, assertChapterId(chapterId), dto);
  }

  @Delete(':chapterId/cards')
  resetCards(
    @CurrentUserId() userId: string,
    @Param('chapterId') chapterId: string,
  ) {
    return this.study.resetCards(userId, assertChapterId(chapterId));
  }

  @Put(':chapterId/sim/:simKey')
  saveSim(
    @CurrentUserId() userId: string,
    @Param('chapterId') chapterId: string,
    @Param('simKey') simKey: string,
    @Body() dto: SaveSimDto,
  ) {
    return this.study.saveSim(
      userId,
      assertChapterId(chapterId),
      assertSimKey(simKey),
      dto,
    );
  }

  @Delete(':chapterId/sim/:simKey')
  resetSim(
    @CurrentUserId() userId: string,
    @Param('chapterId') chapterId: string,
    @Param('simKey') simKey: string,
  ) {
    return this.study.resetSim(
      userId,
      assertChapterId(chapterId),
      assertSimKey(simKey),
    );
  }
}
