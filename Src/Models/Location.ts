import { Schema, model } from "mongoose";
import type { ILocation } from "../interfaces/ILocation";

const locationSchema = new Schema<ILocation.Model>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      unique: true,
      index: true,
      ref: "User",
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    latitude: {
      type: Number,
      min: -90,
      max: 90,
    },
    longitude: {
      type: Number,
      min: -180,
      max: 180,
    },
  },
  { timestamps: true },
);

export default model<ILocation.Model>("Location", locationSchema);
