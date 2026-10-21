import { Schema, model } from "mongoose";
import type { ICategoryModule } from "../interfaces/icategory";

const categorySchema = new Schema<ICategoryModule.ICategories>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    image: {
      type: String,
      trim: true,
    },
    banner: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true },
);

categorySchema.index({ isActive: 1 });

export default model<ICategoryModule.ICategories>("Category", categorySchema);
