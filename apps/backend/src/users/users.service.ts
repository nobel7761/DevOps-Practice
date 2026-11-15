import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  User,
  UserDocument,
  UserRole,
  UserStatus,
} from './schemas/user.schema';

export interface PublicUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  courseIds: string[];
  askAiEnabled: boolean;
}

export type AccessUpdate = Partial<
  Pick<User, 'status' | 'courseIds' | 'askAiEnabled' | 'role'>
>;

/**
 * Accounts created before the approval feature have no `role`/`status` in MongoDB, and queries
 * don't apply schema defaults — so legacy docs count as `pending` here, matching how they hydrate.
 */
const statusFilter = (status?: UserStatus): Record<string, unknown> => {
  if (!status) return {};
  return status === 'pending'
    ? { status: { $in: ['pending', null] } }
    : { status };
};

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  static toPublic(user: UserDocument): PublicUser {
    return {
      id: String(user._id),
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role ?? 'user',
      status: user.status,
      courseIds: user.courseIds ?? [],
      askAiEnabled: !!user.askAiEnabled,
    };
  }

  findById(id: string) {
    return this.userModel.findById(id).exec();
  }

  findByEmail(email: string) {
    return this.userModel.findOne({ email: email.toLowerCase().trim() }).exec();
  }

  findByEmailWithPassword(email: string) {
    return this.userModel
      .findOne({ email: email.toLowerCase().trim() })
      .select('+passwordHash')
      .exec();
  }

  create(
    data: Pick<User, 'firstName' | 'lastName' | 'email' | 'passwordHash'> &
      Partial<Pick<User, 'role' | 'status' | 'courseIds' | 'askAiEnabled'>>,
  ) {
    return this.userModel.create(data);
  }

  /** Non-superadmin accounts, newest first; optionally only one status. */
  listMembers(status?: UserStatus) {
    return this.userModel
      .find({ role: { $ne: 'superadmin' }, ...statusFilter(status) })
      .sort({ createdAt: -1 })
      .exec();
  }

  listByStatus(status: UserStatus) {
    return this.listMembers(status);
  }

  updateAccess(userId: string, update: AccessUpdate) {
    return this.userModel
      .findByIdAndUpdate(userId, update, { new: true })
      .exec();
  }

  async setResetToken(userId: string, tokenHash: string, expires: Date) {
    await this.userModel
      .updateOne(
        { _id: userId },
        { resetPasswordTokenHash: tokenHash, resetPasswordExpires: expires },
      )
      .exec();
  }

  findByValidResetToken(tokenHash: string) {
    return this.userModel
      .findOne({
        resetPasswordTokenHash: tokenHash,
        resetPasswordExpires: { $gt: new Date() },
      })
      .exec();
  }

  /** Sets the new password and burns the reset token so the link can't be reused. */
  async updatePassword(userId: string, passwordHash: string) {
    await this.userModel
      .updateOne(
        { _id: userId },
        {
          passwordHash,
          $unset: { resetPasswordTokenHash: 1, resetPasswordExpires: 1 },
        },
      )
      .exec();
  }
}
