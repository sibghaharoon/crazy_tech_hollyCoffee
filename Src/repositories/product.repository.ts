import { Types } from "mongoose";
import type { IProductModule } from "../interfaces/iproduct";
import CategoryModel from "../models/category.model";
import ProductModel from "../models/product.model";

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

  async listAll(options: IProductModule.PageOptions) {
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

  async create(data: IProductModule.CreateObj) {
    return ProductModel.create(data);
  }

  async updateById(productId: Types.ObjectId, data: IProductModule.UpdateObj) {
    return ProductModel.findByIdAndUpdate(
      productId,
      { $set: data },
      { new: true, runValidators: true },
    ).lean();
  }
}

export default new ProductRepository();
