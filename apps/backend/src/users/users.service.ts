import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

export interface PublicUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  static toPublic(user: UserDocument): PublicUser {
    return {
      id: String(user._id),
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
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
    data: Pick<User, 'firstName' | 'lastName' | 'email' | 'passwordHash'>,
  ) {
    return this.userModel.create(data);
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
