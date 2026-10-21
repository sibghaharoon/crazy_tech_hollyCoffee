import type { Types } from "mongoose";
import type { IProductModule } from "./iproduct";

export declare namespace ICartModule {
  interface CartItem {
    _id: Types.ObjectId;
    productId: Types.ObjectId;
    variant: IProductModule.VariantName;
    toppings: string[];
    quantity: number;
  }

  interface Model {
    _id: Types.ObjectId;
    userId: Types.ObjectId;
    items: CartItem[];
    processedMutationIds: string[];
    createdAt: Date;
    updatedAt: Date;
  }

  interface AddItemObj {
    productId: Types.ObjectId;
    variant: IProductModule.VariantName;
    toppings?: string[];
    quantity: number;
  }

  interface UpdateObj {
    quantity: number;
  }

  interface ItemResponse {
    itemId: Types.ObjectId;
    productId: Types.ObjectId;
    title: string | null;
    image: string | null;
    variant: IProductModule.VariantName;
    toppings: string[];
    quantity: number;
    unitPrice: IProductModule.Money | null;
    total: IProductModule.Money | null;
    isAvailable: boolean;
  }

  interface Response {
    items: ItemResponse[];
    itemCount: number;
    subtotal: IProductModule.Money | null;
    hasUnavailableItems: boolean;
  }
}
