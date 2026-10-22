import { IUserModule } from "../interfaces/iuser";
import { Types } from "mongoose";
import UserModel from "../models/user.model";
import R2Service from "../services/r2.service";

type ProfileImage = {
  profileImage: string;
  profileImageKey: string;
};

class UserRepository {
  async findById(userId: Types.ObjectId) {
    return UserModel.findById(userId).lean();
  }

  async findOrCreateByFirebaseUid(firebaseUid: string, data: IUserModule.ICreateUser) {
    return UserModel.findOneAndUpdate(
      { firebaseUid },
      { $setOnInsert: data },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    ).lean();
  }

  async updateById(userId: Types.ObjectId, data: IUserModule.IUpdateUser) {
    return UserModel.findByIdAndUpdate(
      userId,
      { $set: data },
      { new: true, runValidators: true },
    ).lean();
  }

  async updateProfile(
    userId: Types.ObjectId,
    data: IUserModule.IUpdateUser,
    image?: Express.Multer.File,
  ) {
    const existingUser = await this.findById(userId);
    if (!existingUser) return null;

    const uploadedImage: Partial<ProfileImage> = image
      ? await this.uploadProfileImage(image)
      : {};

    try {
      const user = await this.updateById(userId, {
        ...data,
        ...uploadedImage,
      });

      if (image && existingUser.profileImageKey) {
        await this.cleanupImage(existingUser.profileImageKey);
      }

      return user;
    } catch (error) {
      if (uploadedImage.profileImageKey) {
        await this.cleanupImage(uploadedImage.profileImageKey);
      }
      throw error;
    }
  }

  private async uploadProfileImage(image: Express.Multer.File): Promise<ProfileImage> {
    const uploaded = await R2Service.uploadImage(image.buffer, image.mimetype, "profiles");
    return { profileImage: uploaded.url, profileImageKey: uploaded.key };
  }

  private async cleanupImage(imageKey: string) {
    try {
      await R2Service.deleteImage(imageKey);
    } catch {
      // Cleanup failure must not hide the successful database update.
    }
  }
}

export default new UserRepository();
