import { Types } from "mongoose";
import type { IProductModule } from "../interfaces/iproduct";
import type { IUserModule } from "../interfaces/iuser";
import CategoryRepository from "../repositories/Category.Repository";
import ProductRepository from "../repositories/product.repository";
import R2Service from "./r2.service";

type ServiceError = Error & { statusCode: number };
type UploadedImage = { image?: string; imageKey?: string };
type PageOptions = { page: number; limit: number };

const serviceError = (message: string, statusCode: number): ServiceError => {
  const error = new Error(message) as ServiceError;
  error.statusCode = statusCode;
  return error;
};

class ProductService {
  async listActive(categoryId: Types.ObjectId | undefined, options: PageOptions) {
    return ProductRepository.listActive(categoryId, options);
  }

  async getActiveById(productId: string) {
    const objectId = this.parseId(productId, "product");
    return ProductRepository.findActiveById(objectId);
  }

  async listAll(role: IUserModule.Role | undefined, options: PageOptions) {
    this.assertAdmin(role);
    return ProductRepository.listAll(options);
  }

  async create(
    role: IUserModule.Role | undefined,
    data: IProductModule.CreateObj,
    image?: Express.Multer.File,
  ) {
    this.assertAdmin(role);
    if (!image) throw serviceError("Product image is required", 400);
    await this.assertActiveCategory(data.categoryId);

    const uploadedImage: UploadedImage = {};
    try {
      const uploaded = await R2Service.uploadImage(image.buffer, image.mimetype, "products");
      Object.assign(uploadedImage, { image: uploaded.url, imageKey: uploaded.key });
      return await ProductRepository.create({ ...data, ...uploadedImage });
    } catch (error) {
      await this.cleanupImage(uploadedImage.imageKey);
      throw error;
    }
  }

  async update(
    role: IUserModule.Role | undefined,
    productId: string,
    data: IProductModule.UpdateObj,
    image?: Express.Multer.File,
  ) {
    this.assertAdmin(role);
    const objectId = this.parseId(productId, "product");
    const existingProduct = await ProductRepository.findById(objectId);
    if (!existingProduct) throw serviceError("Product not found", 404);

    if (data.categoryId) await this.assertActiveCategory(data.categoryId);

    const uploadedImage: UploadedImage = {};
    try {
      if (image) {
        const uploaded = await R2Service.uploadImage(image.buffer, image.mimetype, "products");
        Object.assign(uploadedImage, { image: uploaded.url, imageKey: uploaded.key });
      }

      const product = await ProductRepository.updateById(objectId, {
        ...data,
        ...uploadedImage,
      });

      if (image && existingProduct.imageKey) {
        await this.cleanupImage(existingProduct.imageKey);
      }
      return product;
    } catch (error) {
      await this.cleanupImage(uploadedImage.image);
      throw error;
    }
  }

  private async assertActiveCategory(categoryId: Types.ObjectId) {
    const category = await CategoryRepository.findById(categoryId);
    if (!category || !category.isActive) {
      throw serviceError("Product category must be active", 400);
    }
  }

  private assertAdmin(role: IUserModule.Role | undefined) {
    if (role !== "admin") {
      throw serviceError("You do not have permission to manage products", 403);
    }
  }

  private parseId(value: string, entity: string) {
    if (!Types.ObjectId.isValid(value)) {
      throw serviceError(`Invalid ${entity} ID`, 400);
    }
    return new Types.ObjectId(value);
  }

  private async cleanupImage(imageKey?: string) {
    if (!imageKey) return;
    try {
      await R2Service.deleteImage(imageKey);
    } catch {
      // Cleanup failure must not hide the main request result.
    }
  }
}

export default new ProductService();
