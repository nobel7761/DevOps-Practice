import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CcdvStudyController } from './ccdv-study.controller';
import { CcdvStudyService } from './ccdv-study.service';
import { CcdvStudy, CcdvStudySchema } from './schemas/ccdv-study.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CcdvStudy.name, schema: CcdvStudySchema },
    ]),
  ],
  controllers: [CcdvStudyController],
  providers: [CcdvStudyService],
})
export class CcdvStudyModule {}
