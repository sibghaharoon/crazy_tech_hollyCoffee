import { Types } from "mongoose";
import type { ICartModule } from "../interfaces/icart";
import type { IProductModule } from "../interfaces/iproduct";
import CartRepository from "../repositories/cart.repository";
import ProductRepository from "../repositories/product.repository";

type ServiceError = Error & { statusCode: number };

type SelectionResult =
  | {
      valid: true;
      toppings: string[];
      unitPrice: IProductModule.Money;
    }
  | {
      valid: false;
      message: string;
    };

const serviceError = (message: string, statusCode: number): ServiceError => {
  const error = new Error(message) as ServiceError;
  error.statusCode = statusCode;
  return error;
};

class CartService {
  async get(userId: Types.ObjectId): Promise<ICartModule.Response> {
    const cart = await CartRepository.findByUserId(userId);
    if (!cart) return this.emptyResponse();

    return this.toResponse(cart);
  }

  async addItem(
    userId: Types.ObjectId,
    data: ICartModule.AddItemObj,
    mutationId: string,
  ): Promise<ICartModule.Response> {
    const product = await ProductRepository.findActiveById(data.productId);
    if (!product) throw serviceError("Product is not available", 400);

    const selection = this.resolveSelection(
      product,
      data.variant,
      data.toppings ?? [],
    );
    if (!selection.valid) throw serviceError(selection.message, 400);

    const cart = await CartRepository.addItem(
      userId,
      {
        ...data,
        toppings: selection.toppings,
      },
      mutationId,
    );

    if (!cart) throw serviceError("Cart could not be updated", 500);

    return this.toResponse(cart);
  }

  async updateItem(
    userId: Types.ObjectId,
    itemId: Types.ObjectId,
    data: ICartModule.UpdateObj,
  ): Promise<ICartModule.Response> {
    const cart = await CartRepository.findByUserId(userId);
    if (!cart) throw serviceError("Cart not found", 404);

    const item = cart.items.find(
      (cartItem) => cartItem._id.toString() === itemId.toString(),
    );
    if (!item) throw serviceError("Cart item not found", 404);

    const product = await ProductRepository.findActiveById(item.productId);
    if (!product) throw serviceError("Product is no longer available", 400);

    const selection = this.resolveSelection(
      product,
      item.variant,
      item.toppings,
    );
    if (!selection.valid) throw serviceError(selection.message, 400);

    const updatedCart = await CartRepository.updateItemQuantity(
      userId,
      itemId,
      data.quantity,
    );
    if (!updatedCart) throw serviceError("Cart item not found", 404);

    return this.toResponse(updatedCart);
  }

  async removeItem(
    userId: Types.ObjectId,
    itemId: Types.ObjectId,
  ): Promise<ICartModule.Response> {
    const cart = await CartRepository.removeItem(userId, itemId);
    if (!cart) throw serviceError("Cart item not found", 404);

    return this.toResponse(cart);
  }

  async clear(userId: Types.ObjectId): Promise<ICartModule.Response> {
    const cart = await CartRepository.clear(userId);
    if (!cart) return this.emptyResponse();

    return this.toResponse(cart);
  }

  private async toResponse(
    cart: ICartModule.Model,
  ): Promise<ICartModule.Response> {
    if (cart.items.length === 0) return this.emptyResponse();

    const productIds = cart.items.map((item) => item.productId);
    const [products, activeProducts] = await Promise.all([
      ProductRepository.findByIds(productIds),
      ProductRepository.findActiveByIds(productIds),
    ]);

    const productsById = new Map(
      products.map((product) => [product._id.toString(), product]),
    );
    const activeProductsById = new Map(
      activeProducts.map((product) => [product._id.toString(), product]),
    );

    let itemCount = 0;
    let subtotal: IProductModule.Money | null = null;
    let hasUnavailableItems = false;

    const items = cart.items.map((item) => {
      itemCount += item.quantity;

      const product = productsById.get(item.productId.toString());
      const activeProduct = activeProductsById.get(item.productId.toString());
      const selection = activeProduct
        ? this.resolveSelection(activeProduct, item.variant, item.toppings)
        : { valid: false as const, message: "Product is unavailable" };

      if (!product || !activeProduct || !selection.valid) {
        hasUnavailableItems = true;
        return {
          itemId: item._id,
          productId: item.productId,
          title: product?.title ?? null,
          image: product?.image ?? null,
          variant: item.variant,
          toppings: item.toppings,
          quantity: item.quantity,
          unitPrice: null,
          total: null,
          isAvailable: false,
        };
      }

      const total = this.multiplyMoney(selection.unitPrice, item.quantity);
      if (!total) {
        hasUnavailableItems = true;
        return {
          itemId: item._id,
          productId: item.productId,
          title: product.title,
          image: product.image,
          variant: item.variant,
          toppings: item.toppings,
          quantity: item.quantity,
          unitPrice: null,
          total: null,
          isAvailable: false,
        };
      }

      if (!subtotal) {
        subtotal = total;
      } else if (subtotal.currency !== total.currency) {
        throw serviceError("Cart contains different currencies", 400);
      } else {
        const amount = subtotal.amount + total.amount;
        if (!Number.isSafeInteger(amount)) {
          throw serviceError("Cart total is too large", 400);
        }
        subtotal = { amount, currency: subtotal.currency };
      }

      return {
        itemId: item._id,
        productId: item.productId,
        title: product.title,
        image: product.image,
        variant: item.variant,
        toppings: item.toppings,
        quantity: item.quantity,
        unitPrice: selection.unitPrice,
        total,
        isAvailable: true,
      };
    });

    return { items, itemCount, subtotal, hasUnavailableItems };
  }

  private resolveSelection(
    product: IProductModule.Model,
    variantName: IProductModule.VariantName,
    toppingNames: string[],
  ): SelectionResult {
    const variant = product.variants.find((item) => item.name === variantName);
    if (!variant) {
      return {
        valid: false,
        message: "Selected variant is not available",
      };
    }

    const requestedToppings = toppingNames.map((name) => name.trim());
    const requestedKeys = requestedToppings.map((name) => name.toLowerCase());
    if (new Set(requestedKeys).size !== requestedKeys.length) {
      return { valid: false, message: "Toppings must be unique" };
    }

    const selectedToppings: IProductModule.Topping[] = [];
    for (const requestedKey of requestedKeys) {
      const topping = product.toppings.find(
        (item) => item.name.toLowerCase() === requestedKey,
      );
      if (!topping) {
        return {
          valid: false,
          message: "Selected topping is not available",
        };
      }
      if (!topping.isActive) {
        return {
          valid: false,
          message: "Selected topping is currently unavailable",
        };
      }
      if (topping.price.currency !== variant.price.currency) {
        return {
          valid: false,
          message: "Variant and topping currencies must match",
        };
      }
      selectedToppings.push(topping);
    }

    const toppingsAmount = selectedToppings.reduce(
      (total, topping) => total + topping.price.amount,
      0,
    );
    const amount = variant.price.amount + toppingsAmount;
    if (!Number.isSafeInteger(amount)) {
      return { valid: false, message: "Selected price is too large" };
    }

    return {
      valid: true,
      toppings: selectedToppings
        .map((topping) => topping.name)
        .sort((left, right) => left.localeCompare(right)),
      unitPrice: {
        amount,
        currency: variant.price.currency,
      },
    };
  }

  private multiplyMoney(
    money: IProductModule.Money,
    quantity: number,
  ): IProductModule.Money | null {
    const amount = money.amount * quantity;
    if (!Number.isSafeInteger(amount)) return null;

    return { amount, currency: money.currency };
  }

  private emptyResponse(): ICartModule.Response {
    return {
      items: [],
      itemCount: 0,
      subtotal: null,
      hasUnavailableItems: false,
    };
  }
}

export default new CartService();
