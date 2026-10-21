import { Schema, Types } from "mongoose";
import { IProductModule } from "../interfaces/IProduct";
const variantSchema= new Schema<IProductModule.IVariant>({
    name:{
        type:String,
        required:true,
    },
    price:{
        type:Number,
        required:true,
    }
})
const productSchema = new Schema<IProductModule.IProduct>({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  variant: {
    type: String,
    enum: ["Holy", "Divine"],
  },
  isWishlist: {
    type: Boolean,
    required: true,
  },
  categoryId:{
    type:Types.ObjectId,
    ref:"Category",
  },
  rating:{
    type:"Number",
    required:true,
  }
});
