import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AskConversationDocument = HydratedDocument<AskConversation>;

export interface AskMessage {
  role: 'user' | 'assistant';
  content: string;
}

@Schema({ _id: false })
class AskMessageSchema implements AskMessage {
  @Prop({ required: true, enum: ['user', 'assistant'] })
  role: 'user' | 'assistant';

  @Prop({ required: true })
  content: string;
}

@Schema({ timestamps: true, collection: 'ask_conversations' })
export class AskConversation {
  @Prop({ required: true, unique: true, index: true })
  contentId: string;

  @Prop({ type: [AskMessageSchema], required: true, default: [] })
  messages: AskMessage[];
}

export const AskConversationSchema =
  SchemaFactory.createForClass(AskConversation);
