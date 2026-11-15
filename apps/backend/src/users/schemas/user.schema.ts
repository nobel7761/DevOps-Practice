import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserRole = 'user' | 'superadmin';
export type UserStatus = 'pending' | 'approved' | 'rejected';

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

  @Prop({ enum: ['user', 'superadmin'], default: 'user' })
  role: UserRole;

  /** New sign-ups wait for super admin approval before they can log in. */
  @Prop({ enum: ['pending', 'approved', 'rejected'], default: 'pending' })
  status: UserStatus;

  /** Course ids (frontend course registry ids) the super admin granted. */
  @Prop({ type: [String], default: [] })
  courseIds: string[];

  /** Super admin switches Ask AI on per user. */
  @Prop({ default: false })
  askAiEnabled: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
