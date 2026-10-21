import type { Types } from "mongoose";
import type { ICategoryModule } from "../interfaces/ICategory";
import CategoryModel from "../models/category.model";

class CategoryRepository {
  async list(filter: { isActive?: boolean }) {
    return CategoryModel.find(filter).lean();
  }

  async create(data: ICategoryModule.ICreateCategories) {
    return CategoryModel.create(data);
  }

  async findById(categoryId: Types.ObjectId) {
    return CategoryModel.findById(categoryId).lean();
  }

  async updateById(categoryId: Types.ObjectId, data: ICategoryModule.IUpdateCategories) {
    return CategoryModel.findByIdAndUpdate(
      categoryId,
      { $set: data },
      { new: true, runValidators: true },
    ).lean();
  }
}

export default new CategoryRepository();
