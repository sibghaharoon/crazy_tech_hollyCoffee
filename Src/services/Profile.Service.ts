import { Types } from "mongoose";
import UserRepository from "../repositories/User.Repository";
import CloudinaryService from "./Cloudinary.Service";
import type { IUserModule } from "../interfaces/IUser";

type ProfileImage = {
  profileImage: string;
  profileImagePublicId: string;
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

      if (image && existingUser.profileImagePublicId) {
        await this.cleanupImage(existingUser.profileImagePublicId);
      }

      return user;
    } catch (error) {
      if (uploadedImage.profileImagePublicId) {
        await this.cleanupImage(uploadedImage.profileImagePublicId);
      }
      throw error;
    }
  }

  private async cleanupImage(publicId: string) {
    try {
      await CloudinaryService.deleteImage(publicId);
    } catch {
      // Image cleanup failure must not hide the successful profile update.
    }
  }
}

export default new ProfileService();
