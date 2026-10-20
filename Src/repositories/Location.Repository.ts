import { Types } from "mongoose";
import type { ILocation } from "../interfaces/ILocation";
import LocationModel from "../models/Location";

class LocationRepository {
  async findByUserId(userId: Types.ObjectId) {
    return LocationModel.findOne({ userId }).lean();
  }

  async upsertByUserId(userId: Types.ObjectId, data: ILocation.UpdateObj) {
    const coordinates =
      data.latitude !== undefined && data.longitude !== undefined
        ? { latitude: data.latitude, longitude: data.longitude }
        : {};

    return LocationModel.findOneAndUpdate(
      { userId },
      {
        $set: {
          userId,
          city: data.city,
          state: data.state,
          ...coordinates,
        },
        ...(coordinates.latitude === undefined
          ? { $unset: { latitude: 1, longitude: 1 } }
          : {}),
      },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
    ).lean();
  }
}

export default new LocationRepository();
