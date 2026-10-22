import { Schema, model } from "mongoose";
import { IUserModule } from "../interfaces/iuser";

const userSchema = new Schema<IUserModule.ICreateUser>(
  {
    firebaseUid: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other", "prefer_not_to_say"],
    },
    dob: {
      type: Date,
    },
    profileImage: {
      type: String,
      trim: true,
    },
    profileImageKey: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ["buyer", "seller", "admin"],
      default: "buyer",
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true },
);

export default model<IUserModule.ICreateUser>("User", userSchema);
