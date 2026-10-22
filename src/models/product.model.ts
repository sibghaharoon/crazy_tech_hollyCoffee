import { model, Schema } from "mongoose";
import type { IProductModule } from "../interfaces/iproduct";

const moneySchema = new Schema<IProductModule.Money>(
  {
    amount: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: "amount must be an integer in the currency minor unit",
      },
    },
    currency: {
      type: String,
      required: true,
      uppercase: true,
      minlength: 3,
      maxlength: 3,
      match: /^[A-Z]{3}$/,
    },
  },
  { _id: false },
);

const variantSchema = new Schema<IProductModule.Variant>(
  {
    name: {
      type: String,
      required: true,
      enum: ["holy", "divine"],
    },
    price: {
      type: moneySchema,
      required: true,
    },
  },
  { _id: false },
);

const toppingSchema = new Schema<IProductModule.Topping>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: moneySchema,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { _id: false },
);

const productSchema = new Schema<IProductModule.Model>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
      required: true,
      trim: true,
    },
    imageKey: {
      type: String,
      trim: true,
    },
    price: {
      type: moneySchema,
      required: true,
    },
    variants: {
      type: [variantSchema],
      default: [],
    },
    toppings: {
      type: [toppingSchema],
      default: [],
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true },
);

export default model<IProductModule.Model>("Product", productSchema);
