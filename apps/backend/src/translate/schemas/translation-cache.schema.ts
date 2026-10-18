import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TranslationCacheDocument = HydratedDocument<TranslationCache>;

@Schema({ timestamps: true, collection: 'translation_cache' })
export class TranslationCache {
  @Prop({ required: true, unique: true, index: true })
  key: string;

  @Prop({ required: true })
  payload: string;
}

export const TranslationCacheSchema =
  SchemaFactory.createForClass(TranslationCache);
