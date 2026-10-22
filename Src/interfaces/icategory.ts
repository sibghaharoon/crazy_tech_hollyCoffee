import type { Types } from "mongoose";

export declare namespace ICategoryModule {
  interface ICategories {
    _id: Types.ObjectId;
    name: string;
    image: string;
    imageKey?: string;
    banner?: string;
    bannerKey?: string;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  }

  interface ICreateCategories {
    name: string;
    image?: string;
    imageKey?: string;
    banner?: string;
    bannerKey?: string;
    isActive?: boolean;
  }

  interface IUpdateCategories {
    name?: string;
    image?: string;
    imageKey?: string;
    isActive?: boolean;
    banner?: string;
    bannerKey?: string;
  }
}
