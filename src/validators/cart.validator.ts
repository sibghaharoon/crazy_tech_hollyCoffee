import { Types } from "mongoose";
import { z } from "zod";
import type { ICartModule } from "../interfaces/icart";

export type CartValidationResult<T> =
  | { success: true; data: T }
  | { success: false; message: string; code: string };

const objectIdSchema = z
  .string()
  .refine((value) => Types.ObjectId.isValid(value), "must be a valid ID")
  .transform((value) => new Types.ObjectId(value));

const toppingsSchema = z
  .array(z.string().trim().min(1, "topping name cannot be empty"))
  .default([])
  .refine(
    (toppings) =>
      new Set(toppings.map((topping) => topping.toLowerCase())).size ===
      toppings.length,
    "toppings must be unique",
  );

const addItemSchema = z
  .object({
    productId: objectIdSchema,
    variant: z.enum(["holy", "divine"]),
    toppings: toppingsSchema,
    quantity: z.number().int().positive(),
  })
  .strict();

const updateItemSchema = z
  .object({
    quantity: z.number().int().positive(),
  })
  .strict();

const itemParamsSchema = z.object({
  itemId: objectIdSchema,
});

const firstIssueMessage = (error: z.ZodError) =>
  error.issues[0]?.message ?? "Invalid cart request";

const parseAddItem = (
  body: unknown,
): CartValidationResult<ICartModule.AddItemObj> => {
  const parsed = addItemSchema.safeParse(body);
  if (!parsed.success) {
    return {
      success: false,
      message: firstIssueMessage(parsed.error),
      code: "INVALID_CART_ITEM",
    };
  }

  return { success: true, data: parsed.data };
};

const parseUpdateItem = (
  body: unknown,
): CartValidationResult<ICartModule.UpdateObj> => {
  const parsed = updateItemSchema.safeParse(body);
  if (!parsed.success) {
    return {
      success: false,
      message: firstIssueMessage(parsed.error),
      code: "INVALID_CART_UPDATE",
    };
  }

  return { success: true, data: parsed.data };
};

const parseItemParams = (
  params: unknown,
): CartValidationResult<{ itemId: Types.ObjectId }> => {
  const parsed = itemParamsSchema.safeParse(params);
  if (!parsed.success) {
    return {
      success: false,
      message: firstIssueMessage(parsed.error),
      code: "INVALID_CART_ITEM_ID",
    };
  }

  return { success: true, data: parsed.data };
};

export default { parseAddItem, parseUpdateItem, parseItemParams };
