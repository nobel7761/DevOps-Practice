import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PoridhiSyncController } from './poridhi-sync.controller';
import { PoridhiSyncService } from './poridhi-sync.service';
import {
  PoridhiToken,
  PoridhiTokenSchema,
} from './schemas/poridhi-token.schema';
import {
  SyncedCourse,
  SyncedCourseSchema,
} from './schemas/synced-course.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PoridhiToken.name, schema: PoridhiTokenSchema },
      { name: SyncedCourse.name, schema: SyncedCourseSchema },
    ]),
  ],
  controllers: [PoridhiSyncController],
  providers: [PoridhiSyncService],
})
export class PoridhiSyncModule {}
