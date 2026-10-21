import { Types } from "mongoose";
import type { IUserModule } from "../interfaces/IUser";
import type { ICategoryModule } from "../interfaces/ICategory";
import CategoryRepository from "../repositories/category.repository";
import CloudinaryService from "./cloudinary.service";

type ServiceError = Error & { statusCode: number };
type UploadedImages = {
  image?: string;
  imagePublicId?: string;
  banner?: string;
  bannerPublicId?: string;
};

const serviceError = (message: string, statusCode: number): ServiceError => {
  const error = new Error(message) as ServiceError;
  error.statusCode = statusCode;
  return error;
};

class CategoryService {
  async listActive() {
    return CategoryRepository.list({ isActive: true });
  }

  async listAll(role: IUserModule.Role | undefined) {
    this.assertAdmin(role);
    return CategoryRepository.list({});
  }

  async create(
    role: IUserModule.Role | undefined,
    data: ICategoryModule.ICreateCategories,
    image?: Express.Multer.File,
    banner?: Express.Multer.File,
  ) {
    this.assertAdmin(role);
    const uploadedImages: UploadedImages = {};

    try {
      if (image) Object.assign(uploadedImages, await CloudinaryService.uploadCategoryImage(image.buffer, image.mimetype));
      if (banner) Object.assign(uploadedImages, await CloudinaryService.uploadCategoryBanner(banner.buffer, banner.mimetype));
      return await CategoryRepository.create({ ...data, ...uploadedImages });
    } catch (error) {
      await this.cleanupUploadedImages(uploadedImages);
      throw error;
    }
  }

  async update(
    role: IUserModule.Role | undefined,
    categoryId: string,
    data: ICategoryModule.IUpdateCategories,
    image?: Express.Multer.File,
    banner?: Express.Multer.File,
  ) {
    this.assertAdmin(role);
    if (!Types.ObjectId.isValid(categoryId)) throw serviceError("Invalid category ID", 400);

    const objectId = new Types.ObjectId(categoryId);
    const existingCategory = await CategoryRepository.findById(objectId);
    if (!existingCategory) throw serviceError("Category not found", 404);

    const uploadedImages: UploadedImages = {};

    try {
      if (image) Object.assign(uploadedImages, await CloudinaryService.uploadCategoryImage(image.buffer, image.mimetype));
      if (banner) Object.assign(uploadedImages, await CloudinaryService.uploadCategoryBanner(banner.buffer, banner.mimetype));
      const category = await CategoryRepository.updateById(objectId, {
        ...data,
        ...uploadedImages,
      });

      if (image && existingCategory.imagePublicId) {
        await this.cleanupImage(existingCategory.imagePublicId);
      }
      if (banner && existingCategory.bannerPublicId) {
        await this.cleanupImage(existingCategory.bannerPublicId);
      }
      return category;
    } catch (error) {
      await this.cleanupUploadedImages(uploadedImages);
      throw error;
    }
  }

  private assertAdmin(role: IUserModule.Role | undefined) {
    if (role !== "admin") {
      throw serviceError("You do not have permission to manage categories", 403);
    }
  }

  private async cleanupImage(publicId: string) {
    try {
      await CloudinaryService.deleteImage(publicId);
    } catch {
      console.error("Cloudinary cleanup failed");
    }
  }

  private async cleanupUploadedImages(images: UploadedImages) {
    if (images.imagePublicId) await this.cleanupImage(images.imagePublicId);
    if (images.bannerPublicId) await this.cleanupImage(images.bannerPublicId);
  }
}

export default new CategoryService();
