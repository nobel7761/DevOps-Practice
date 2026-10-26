import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, trim: true })
  firstName: string;

  @Prop({ required: true, trim: true })
  lastName: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  /** bcrypt hash — never selected unless a query asks for it explicitly. */
  @Prop({ required: true, select: false })
  passwordHash: string;

  /** SHA-256 of the emailed reset token; the raw token only ever lives in the email link. */
  @Prop({ select: false })
  resetPasswordTokenHash?: string;

  @Prop({ select: false })
  resetPasswordExpires?: Date;

  @Prop({ default: true })
  isActive: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
