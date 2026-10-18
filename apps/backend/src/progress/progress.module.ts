import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProgressController } from './progress.controller';
import { ProgressService } from './progress.service';
import {
  ContentProgress,
  ContentProgressSchema,
} from './schemas/content-progress.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ContentProgress.name, schema: ContentProgressSchema },
    ]),
  ],
  controllers: [ProgressController],
  providers: [ProgressService],
})
export class ProgressModule {}
