import type { Types } from "mongoose";
import type { ICartModule } from "../interfaces/icart";
import CartModel from "../models/cart.model";

class CartRepository {
  async findByUserId(userId: Types.ObjectId) {
    return CartModel.findOne({ userId }).lean();
  }

  async addItem(
    userId: Types.ObjectId,
    item: ICartModule.AddItemObj,
    mutationId: string,
  ) {
    const toppings = [...(item.toppings ?? [])].sort((left, right) =>
      left.localeCompare(right),
    );

    const incrementedCart = await CartModel.findOneAndUpdate(
      {
        userId,
        processedMutationIds: { $ne: mutationId },
        items: {
          $elemMatch: {
            productId: item.productId,
            variant: item.variant,
            toppings: { $all: toppings, $size: toppings.length },
          },
        },
      },
      {
        $inc: { "items.$.quantity": item.quantity },
        $push: {
          processedMutationIds: {
            $each: [mutationId],
            $slice: -100,
          },
        },
      },
      { new: true, runValidators: true },
    ).lean();

    if (incrementedCart) return incrementedCart;

    const appendedCart = await CartModel.findOneAndUpdate(
      { userId, processedMutationIds: { $ne: mutationId } },
      {
        $setOnInsert: { userId },
        $push: {
          items: {
            productId: item.productId,
            variant: item.variant,
            toppings,
            quantity: item.quantity,
          },
          processedMutationIds: {
            $each: [mutationId],
            $slice: -100,
          },
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      },
    ).lean();

    return appendedCart ?? (await this.findByUserId(userId));
  }

  async updateItemQuantity(
    userId: Types.ObjectId,
    itemId: Types.ObjectId,
    quantity: number,
  ) {
    return CartModel.findOneAndUpdate(
      { userId, "items._id": itemId },
      { $set: { "items.$.quantity": quantity } },
      { new: true, runValidators: true },
    ).lean();
  }

  async removeItem(userId: Types.ObjectId, itemId: Types.ObjectId) {
    return CartModel.findOneAndUpdate(
      { userId },
      { $pull: { items: { _id: itemId } } },
      { new: true },
    ).lean();
  }

  async clear(userId: Types.ObjectId) {
    return CartModel.findOneAndUpdate(
      { userId },
      { $set: { items: [] } },
      { new: true },
    ).lean();
  }
}

export default new CartRepository();
