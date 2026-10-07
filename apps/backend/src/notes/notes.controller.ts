import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { NotesService } from './notes.service';
import { SaveNoteDto } from './dto/save-note.dto';

@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Get(':contentId')
  getNote(@Param('contentId') contentId: string) {
    return this.notesService.getNote(contentId);
  }

  @Put(':contentId')
  saveNote(@Param('contentId') contentId: string, @Body() dto: SaveNoteDto) {
    return this.notesService.saveNote(contentId, dto.content);
  }
}
