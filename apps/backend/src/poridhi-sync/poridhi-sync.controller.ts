import { Body, Controller, Get, Post } from '@nestjs/common';
import { PoridhiSyncService } from './poridhi-sync.service';
import { SaveTokenDto } from './dto/save-token.dto';

@Controller('poridhi-sync')
export class PoridhiSyncController {
  constructor(private readonly poridhiSyncService: PoridhiSyncService) {}

  @Post('token')
  saveToken(@Body() dto: SaveTokenDto) {
    return this.poridhiSyncService.saveToken(dto.token);
  }

  @Get('status')
  getStatus() {
    return this.poridhiSyncService.getStatus();
  }

  @Get('latest')
  getLatest() {
    return this.poridhiSyncService.getLatest();
  }

  @Post('fetch')
  fetchLatestContents() {
    return this.poridhiSyncService.fetchLatestContents();
  }
}
