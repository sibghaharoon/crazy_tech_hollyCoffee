import { Types } from "mongoose";
import UserRepository from "../repositories/user.repository";
import CloudinaryService from "./cloudinary.service";
import type { IUserModule } from "../interfaces/iuser";

type ProfileImage = {
  profileImage: string;
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
      ? await CloudinaryService.uploadProfileImage(image.buffer, image.mimetype)
      : {};

    try {
      const user = await UserRepository.updateById(userId, {
        ...data,
        ...uploadedImage,
      });

      if (image && existingUser.profileImage) {
        await this.cleanupImage(existingUser.profileImage);
      }

      return user;
    } catch (error) {
      if (uploadedImage.profileImage) {
        await this.cleanupImage(uploadedImage.profileImage);
      }
      throw error;
    }
  }

  private async cleanupImage(imageUrl: string) {
    try {
      await CloudinaryService.deleteImage(imageUrl);
    } catch {
      // Image cleanup failure must not hide the successful profile update.
    }
  }
}

export default new ProfileService();
