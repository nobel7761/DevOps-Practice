import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  SdRecallPoint,
  SdRecallPointSchema,
  SdRecallReview,
  SdRecallReviewSchema,
} from './schemas/sd-recall.schema';
import { SystemDesignRecallController } from './system-design-recall.controller';
import { SystemDesignRecallService } from './system-design-recall.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SdRecallPoint.name, schema: SdRecallPointSchema },
      { name: SdRecallReview.name, schema: SdRecallReviewSchema },
    ]),
  ],
  controllers: [SystemDesignRecallController],
  providers: [SystemDesignRecallService],
})
export class SystemDesignRecallModule {}
