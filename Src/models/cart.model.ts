import { model, Schema } from "mongoose";
import type { ICartModule } from "../interfaces/icart";

const cartItemSchema = new Schema<ICartModule.CartItem>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    variant: {
      type: String,
      enum: ["holy", "divine"],
      required: true,
    },
    toppings: {
      type: [String],
      default: [],
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      validate: {
        validator: Number.isInteger,
        message: "quantity must be a positive integer",
      },
    },
  },
  { _id: true },
);

const cartSchema = new Schema<ICartModule.Model>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    items: {
      type: [cartItemSchema],
      default: [],
    },
    processedMutationIds: {
      type: [String],
      default: [],
      select: false,
    },
  },
  { timestamps: true },
);

export default model<ICartModule.Model>("Cart", cartSchema);
