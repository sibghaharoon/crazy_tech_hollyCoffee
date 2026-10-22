import type { Types } from "mongoose";

export declare namespace IProductModule {
  type CurrencyCode = string;
  type VariantName = "holy" | "divine";

  interface Money {
    amount: number;
    currency: CurrencyCode;
  }

  interface Variant {
    name: VariantName;
    price: Money;
  }

  interface Topping {
    name: string;
    price: Money;
    isActive: boolean;
  }

  interface Model {
    _id: Types.ObjectId;
    title: string;
    description?: string;
    image: string;
    imageKey?: string;
    price: Money;
    variants: Variant[];
    toppings: Topping[];
    rating: number;
    categoryId: Types.ObjectId;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  }

  interface CreateObj {
    title: string;
    description?: string;
    image?: string;
    imageKey?: string;
    price: Money;
    variants?: Variant[];
    toppings?: Topping[];
    categoryId: Types.ObjectId;
    isActive?: boolean;
  }

  interface UpdateObj {
    title?: string;
    description?: string;
    price?: Money;
    imageKey?: string;
    variants?: Variant[];
    toppings?: Topping[];
    categoryId?: Types.ObjectId;
    isActive?: boolean;
  }

  interface PageOptions {
    page: number;
    limit: number;
  }
}
