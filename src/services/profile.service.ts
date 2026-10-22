import { Types } from "mongoose";
import UserRepository from "../repositories/user.repository";
import R2Service from "./r2.service";
import type { IUserModule } from "../interfaces/iuser";

type ProfileImage = {
  profileImage: string;
  profileImageKey: string;
};

class ProfileService {
  async update(
    userId: Types.ObjectId,
    data: IUserModule.IUpdateUser,
    image?: Express.Multer.File,
  ) {
    const existingUser = await UserRepository.findById(userId);
    if (!existingUser) return null;

    const uploadedImage: Partial<ProfileImage> = image
      ? await this.uploadProfileImage(image)
      : {};

    try {
      const user = await UserRepository.updateById(userId, {
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
      // Image cleanup failure must not hide the successful profile update.
    }
  }
}

export default new ProfileService();
