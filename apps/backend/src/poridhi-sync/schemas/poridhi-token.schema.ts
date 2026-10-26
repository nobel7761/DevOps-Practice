import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PoridhiTokenDocument = PoridhiToken & Document;

// Always exactly one document (key fixed to "singleton") — the most
// recently pasted poridhi.io access token.
@Schema({ timestamps: true, collection: 'poridhi_tokens' })
export class PoridhiToken {
  @Prop({ required: true, unique: true })
  key: string;

  @Prop({ required: true })
  token: string;
}

export const PoridhiTokenSchema = SchemaFactory.createForClass(PoridhiToken);
