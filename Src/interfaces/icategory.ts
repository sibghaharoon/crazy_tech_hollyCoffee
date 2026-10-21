import type { Types } from "mongoose";

export declare namespace ICategoryModule {
  interface ICategories {
    _id: Types.ObjectId;
    name: string;
    image: string;
    banner?: string;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  }

  interface ICreateCategories {
    name: string;
    image?: string;
    banner?: string;
    isActive?: boolean;
  }

  interface IUpdateCategories {
    name?: string;
    image?: string;
    isActive?: boolean;
    banner?: string;
  }
}
