import { IUser } from "../interfaces/IUser";
import { Types } from "mongoose";
import UserModel from "../models/User";

class UserRepository {
  async findOrCreateByFirebaseUid(firebaseUid: string, data: IUser.CreateObj) {
    return UserModel.findOneAndUpdate(
      { firebaseUid },
      { $setOnInsert: data },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    ).lean();
  }

  async updateById(userId: Types.ObjectId, data: IUser.UpdateObj) {
    return UserModel.findByIdAndUpdate(
      userId,
      { $set: data },
      { new: true, runValidators: true },
    ).lean();
  }
}

export default new UserRepository();
