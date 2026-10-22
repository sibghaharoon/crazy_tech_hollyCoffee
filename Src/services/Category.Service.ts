import { Types } from "mongoose";
import type { IUserModule } from "../interfaces/iuser";
import type { ICategoryModule } from "../interfaces/icategory";
import CategoryRepository from "../repositories/category.repository";
import R2Service from "./r2.service";

type ServiceError = Error & { statusCode: number };
type UploadedImages = {
  image?: string;
  imageKey?: string;
  banner?: string;
  bannerKey?: string;
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
      if (image) {
        const uploaded = await R2Service.uploadImage(image.buffer, image.mimetype, "categories");
        Object.assign(uploadedImages, { image: uploaded.url, imageKey: uploaded.key });
      }
      if (banner) {
        const uploaded = await R2Service.uploadImage(banner.buffer, banner.mimetype, "category-banners");
        Object.assign(uploadedImages, { banner: uploaded.url, bannerKey: uploaded.key });
      }
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
      if (image) {
        const uploaded = await R2Service.uploadImage(image.buffer, image.mimetype, "categories");
        Object.assign(uploadedImages, { image: uploaded.url, imageKey: uploaded.key });
      }
      if (banner) {
        const uploaded = await R2Service.uploadImage(banner.buffer, banner.mimetype, "category-banners");
        Object.assign(uploadedImages, { banner: uploaded.url, bannerKey: uploaded.key });
      }
      const category = await CategoryRepository.updateById(objectId, {
        ...data,
        ...uploadedImages,
      });

      if (image && existingCategory.imageKey) {
        await this.cleanupImage(existingCategory.imageKey);
      }
      if (banner && existingCategory.bannerKey) {
        await this.cleanupImage(existingCategory.bannerKey);
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

  private async cleanupImage(imageKey: string) {
    try {
      await R2Service.deleteImage(imageKey);
    } catch {
      // Cleanup failure must not hide the successful database update.
    }
  }

  private async cleanupUploadedImages(images: UploadedImages) {
    if (images.imageKey) await this.cleanupImage(images.imageKey);
    if (images.bannerKey) await this.cleanupImage(images.bannerKey);
  }
}

export default new CategoryService();
