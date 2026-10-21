import { IUserModule } from "../interfaces/IUser";
import { Types } from "mongoose";
import UserModel from "../models/user.model";

class UserRepository {
  async findById(userId: Types.ObjectId) {
    return UserModel.findById(userId).lean();
  }

  async findOrCreateByFirebaseUid(firebaseUid: string, data: IUserModule.ICreateUser) {
    return UserModel.findOneAndUpdate(
      { firebaseUid },
      { $setOnInsert: data },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    ).lean();
  }

  async updateById(userId: Types.ObjectId, data: IUserModule.IUpdateUser) {
    return UserModel.findByIdAndUpdate(
      userId,
      { $set: data },
      { new: true, runValidators: true },
    ).lean();
  }
}

export default new UserRepository();
