import { Types } from "mongoose";

export declare namespace IProductModule {
  export interface IProduct {
    title: string;
    description: string;
    image: string;
    variant: IVariant[];
    rating: number;
    price: number;
    isWishlist: boolean;
    topping: ITopping[];
    categoryId: Types.ObjectId;
  }
  export interface ITopping {
    name: string;
    price: number;
  }
  export interface IVariant{
    name:"Holy"|"Divine",
    price:number,
  }
  export interface ICreateProduct {
    title: string;
    description?: string;
    image: string;
    variant?: "holy" | "divine";
    rating?: number;
    price: number;
  }
  export interface IUpdateProduct {
    title?: string;
    description?: string;
    image?: string;
    price?: number;
    variant?: "holy" | "divine";
  }
}
