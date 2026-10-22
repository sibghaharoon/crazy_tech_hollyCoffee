import { Types } from "mongoose";
import type { IProductModule } from "../interfaces/iproduct";
import type { IUserModule } from "../interfaces/iuser";
import CategoryModel from "../models/category.model";
import ProductModel from "../models/product.model";
import R2Service from "../services/r2.service";

type ServiceError = Error & { statusCode: number };
type UploadedImage = { image?: string; imageKey?: string };

const serviceError = (message: string, statusCode: number): ServiceError => {
  const error = new Error(message) as ServiceError;
  error.statusCode = statusCode;
  return error;
};

class ProductRepository {
  async listActive(
    categoryId: Types.ObjectId | undefined,
    options: IProductModule.PageOptions,
  ) {
    const activeCategories = await CategoryModel.find({ isActive: true })
      .select({ _id: 1 })
      .lean();
    const activeCategoryIds = activeCategories.map((category) => category._id);

    if (categoryId && !activeCategoryIds.some((id) => id.equals(categoryId))) {
      return { items: [], totalCount: 0 };
    }

    const filter = {
      isActive: true,
      categoryId: categoryId ? categoryId : { $in: activeCategoryIds },
    };
    const [items, totalCount] = await Promise.all([
      ProductModel.find(filter)
        .sort({ createdAt: -1, _id: -1 })
        .skip((options.page - 1) * options.limit)
        .limit(options.limit)
        .lean(),
      ProductModel.countDocuments(filter),
    ]);
    return { items, totalCount };
  }

  async findActiveById(productId: Types.ObjectId) {
    const product = await ProductModel.findOne({
      _id: productId,
      isActive: true,
    }).lean();
    if (!product) return null;

    const activeCategory = await CategoryModel.exists({
      _id: product.categoryId,
      isActive: true,
    });
    return activeCategory ? product : null;
  }

  async getActiveById(productId: string) {
    const objectId = this.parseId(productId, "product");
    return this.findActiveById(objectId);
  }

  async listAll(role: IUserModule.Role | undefined, options: IProductModule.PageOptions) {
    this.assertAdmin(role);
    const [items, totalCount] = await Promise.all([
      ProductModel.find({})
        .sort({ createdAt: -1, _id: -1 })
        .skip((options.page - 1) * options.limit)
        .limit(options.limit)
        .lean(),
      ProductModel.countDocuments({}),
    ]);
    return { items, totalCount };
  }

  async findById(productId: Types.ObjectId) {
    return ProductModel.findById(productId).lean();
  }

  async findByIds(productIds: Types.ObjectId[]) {
    if (productIds.length === 0) return [];

    return ProductModel.find({ _id: { $in: productIds } }).lean();
  }

  async findActiveByIds(productIds: Types.ObjectId[]) {
    if (productIds.length === 0) return [];

    const products = await ProductModel.find({
      _id: { $in: productIds },
      isActive: true,
    }).lean();

    if (products.length === 0) return [];

    const categoryIds = products.map((product) => product.categoryId);
    const activeCategories = await CategoryModel.find({
      _id: { $in: categoryIds },
      isActive: true,
    })
      .select({ _id: 1 })
      .lean();

    const activeCategoryIds = new Set(
      activeCategories.map((category) => category._id.toString()),
    );

    return products.filter((product) =>
      activeCategoryIds.has(product.categoryId.toString()),
    );
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
      return await this.insert({ ...data, ...uploadedImage });
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
    const existingProduct = await this.findById(objectId);
    if (!existingProduct) throw serviceError("Product not found", 404);

    if (data.categoryId) await this.assertActiveCategory(data.categoryId);

    const uploadedImage: UploadedImage = {};
    try {
      if (image) {
        const uploaded = await R2Service.uploadImage(image.buffer, image.mimetype, "products");
        Object.assign(uploadedImage, { image: uploaded.url, imageKey: uploaded.key });
      }

      const product = await this.updateById(objectId, {
        ...data,
        ...uploadedImage,
      });

      if (image && existingProduct.imageKey) {
        await this.cleanupImage(existingProduct.imageKey);
      }
      return product;
    } catch (error) {
      await this.cleanupImage(uploadedImage.imageKey);
      throw error;
    }
  }

  private async insert(data: IProductModule.CreateObj) {
    return ProductModel.create(data);
  }

  async updateById(productId: Types.ObjectId, data: IProductModule.UpdateObj) {
    return ProductModel.findByIdAndUpdate(
      productId,
      { $set: data },
      { new: true, runValidators: true },
    ).lean();
  }

  private async assertActiveCategory(categoryId: Types.ObjectId) {
    const category = await CategoryModel.findOne({ _id: categoryId, isActive: true }).lean();
    if (!category) throw serviceError("Product category must be active", 400);
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

export default new ProductRepository();
