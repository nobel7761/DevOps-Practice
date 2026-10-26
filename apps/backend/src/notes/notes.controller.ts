import { Body, Controller, Get, Param, Put, Query } from '@nestjs/common';
import { CurrentUserId } from '../auth/auth.decorators';
import { NotesService } from './notes.service';
import { SaveNoteDto } from './dto/save-note.dto';

@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Get()
  getContentIdsWithNotes(
    @CurrentUserId() userId: string,
    @Query('contentIds') contentIds: string,
  ) {
    const ids = (contentIds ?? '')
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean);
    return this.notesService.getContentIdsWithNotes(userId, ids);
  }

  @Get(':contentId')
  getNote(
    @CurrentUserId() userId: string,
    @Param('contentId') contentId: string,
  ) {
    return this.notesService.getNote(userId, contentId);
  }

  @Put(':contentId')
  saveNote(
    @CurrentUserId() userId: string,
    @Param('contentId') contentId: string,
    @Body() dto: SaveNoteDto,
  ) {
    return this.notesService.saveNote(userId, contentId, dto.content);
  }
}
