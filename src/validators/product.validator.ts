import { Types } from "mongoose";
import AppConstant from "../configs/appconstant";
import type { IProductModule } from "../interfaces/iproduct";

export type ProductValidationResult<T> =
  | { success: true; data: T }
  | { success: false; message: string; code: string };

const parseJsonField = (
  value: unknown,
  field: string,
): ProductValidationResult<unknown> => {
  if (typeof value !== "string") return { success: true, data: value };
  try {
    return { success: true, data: JSON.parse(value) };
  } catch {
    return {
      success: false,
      message: `${field} must be valid JSON`,
      code: `INVALID_${field.toUpperCase()}`,
    };
  }
};

const normalizeBody = (body: unknown): Record<string, unknown> => {
  const input = body as Record<string, unknown>;
  return {
    ...input,
    ...(input.isActive === "true" ? { isActive: true } : {}),
    ...(input.isActive === "false" ? { isActive: false } : {}),
  };
};

const parseMoney = (
  value: unknown,
  field: string,
): ProductValidationResult<IProductModule.Money> => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {
      success: false,
      message: `${field} must contain amount and currency`,
      code: `INVALID_${field.toUpperCase()}`,
    };
  }

  const input = value as Record<string, unknown>;
  if (
    typeof input.amount !== "number" ||
    !Number.isInteger(input.amount) ||
    input.amount < 0
  ) {
    return {
      success: false,
      message: `${field}.amount must be a non-negative integer in minor units`,
      code: "INVALID_PRICE_AMOUNT",
    };
  }

  if (
    typeof input.currency !== "string" ||
    !/^[A-Za-z]{3}$/.test(input.currency)
  ) {
    return {
      success: false,
      message: `${field}.currency must be a 3-letter currency code`,
      code: "INVALID_CURRENCY",
    };
  }

  return {
    success: true,
    data: {
      amount: input.amount,
      currency: input.currency.toUpperCase(),
    },
  };
};

const parseVariants = (
  value: unknown,
): ProductValidationResult<IProductModule.Variant[]> => {
  if (!Array.isArray(value)) {
    return {
      success: false,
      message: "variants must be an array",
      code: "INVALID_VARIANTS",
    };
  }

  const names = new Set<string>();
  const variants: IProductModule.Variant[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      return {
        success: false,
        message: "Each variant must be an object",
        code: "INVALID_VARIANT",
      };
    }
    const input = item as Record<string, unknown>;
    if (input.name !== "holy" && input.name !== "divine") {
      return {
        success: false,
        message: "variant name must be holy or divine",
        code: "INVALID_VARIANT_NAME",
      };
    }
    if (names.has(input.name)) {
      return {
        success: false,
        message: "Variant names must be unique",
        code: "DUPLICATE_VARIANT",
      };
    }
    names.add(input.name);
    const price = parseMoney(input.price, `variant.${input.name}.price`);
    if (!price.success) return price;
    variants.push({ name: input.name, price: price.data });
  }
  return { success: true, data: variants };
};

const parseToppings = (
  value: unknown,
): ProductValidationResult<IProductModule.Topping[]> => {
  if (!Array.isArray(value)) {
    return {
      success: false,
      message: "toppings must be an array",
      code: "INVALID_TOPPINGS",
    };
  }

  const names = new Set<string>();
  const toppings: IProductModule.Topping[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      return {
        success: false,
        message: "Each topping must be an object",
        code: "INVALID_TOPPING",
      };
    }
    const input = item as Record<string, unknown>;
    if (typeof input.name !== "string" || input.name.trim().length === 0) {
      return {
        success: false,
        message: "topping name is required",
        code: "INVALID_TOPPING_NAME",
      };
    }
    const name = input.name.trim();
    const normalizedName = name.toLowerCase();
    if (names.has(normalizedName)) {
      return {
        success: false,
        message: "Topping names must be unique",
        code: "DUPLICATE_TOPPING",
      };
    }
    names.add(normalizedName);
    const price = parseMoney(input.price, `topping.${name}.price`);
    if (!price.success) return price;
    if (input.isActive !== undefined && typeof input.isActive !== "boolean") {
      return {
        success: false,
        message: "topping isActive must be boolean",
        code: "INVALID_TOPPING_STATUS",
      };
    }
    toppings.push({
      name,
      price: price.data,
      isActive: input.isActive ?? true,
    });
  }
  return { success: true, data: toppings };
};

const parseCategoryId = (
  value: unknown,
): ProductValidationResult<Types.ObjectId> => {
  if (typeof value !== "string" || !Types.ObjectId.isValid(value)) {
    return {
      success: false,
      message: "categoryId must be a valid ID",
      code: "INVALID_CATEGORY_ID",
    };
  }
  return { success: true, data: new Types.ObjectId(value) };
};

const parseCreate = (
  body: unknown,
): ProductValidationResult<IProductModule.CreateObj> => {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return {
      success: false,
      message: "Request body must be an object",
      code: "INVALID_BODY",
    };
  }

  const input = normalizeBody(body);
  const allowed = new Set([
    "title",
    "description",
    "price",
    "variants",
    "toppings",
    "categoryId",
    "isActive",
  ]);
  if (Object.keys(input).some((field) => !allowed.has(field))) {
    return {
      success: false,
      message: "Invalid product fields",
      code: "INVALID_PRODUCT_FIELDS",
    };
  }
  if (typeof input.title !== "string" || input.title.trim().length === 0) {
    return {
      success: false,
      message: "title is required",
      code: "INVALID_PRODUCT_TITLE",
    };
  }

  const priceInput = parseJsonField(input.price, "price");
  if (!priceInput.success) return priceInput;
  const price = parseMoney(priceInput.data, "price");
  if (!price.success) return price;

  const categoryId = parseCategoryId(input.categoryId);
  if (!categoryId.success) return categoryId;

  let variants: IProductModule.Variant[] = [];
  if (input.variants !== undefined) {
    const variantsInput = parseJsonField(input.variants, "variants");
    if (!variantsInput.success) return variantsInput;
    const parsedVariants = parseVariants(variantsInput.data);
    if (!parsedVariants.success) return parsedVariants;
    variants = parsedVariants.data;
  }

  let toppings: IProductModule.Topping[] = [];
  if (input.toppings !== undefined) {
    const toppingsInput = parseJsonField(input.toppings, "toppings");
    if (!toppingsInput.success) return toppingsInput;
    const parsedToppings = parseToppings(toppingsInput.data);
    if (!parsedToppings.success) return parsedToppings;
    toppings = parsedToppings.data;
  }

  if (input.isActive !== undefined && typeof input.isActive !== "boolean") {
    return {
      success: false,
      message: "isActive must be boolean",
      code: "INVALID_PRODUCT_STATUS",
    };
  }

  return {
    success: true,
    data: {
      title: input.title.trim(),
      ...(typeof input.description === "string"
        ? { description: input.description.trim() }
        : {}),
      price: price.data,
      variants,
      toppings,
      categoryId: categoryId.data,
      ...(typeof input.isActive === "boolean"
        ? { isActive: input.isActive }
        : {}),
    },
  };
};

const parseUpdate = (
  body: unknown,
  hasImage = false,
): ProductValidationResult<IProductModule.UpdateObj> => {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return {
      success: false,
      message: "Request body must be an object",
      code: "INVALID_BODY",
    };
  }

  const input = normalizeBody(body);
  const allowed = new Set([
    "title",
    "description",
    "price",
    "variants",
    "toppings",
    "categoryId",
    "isActive",
  ]);
  if (Object.keys(input).some((field) => !allowed.has(field))) {
    return {
      success: false,
      message: "Invalid product fields",
      code: "INVALID_PRODUCT_FIELDS",
    };
  }
  if (Object.keys(input).length === 0 && !hasImage) {
    return {
      success: false,
      message: "At least one product field is required",
      code: "EMPTY_UPDATE",
    };
  }

  const update: IProductModule.UpdateObj = {};
  if ("title" in input) {
    if (typeof input.title !== "string" || input.title.trim().length === 0) {
      return {
        success: false,
        message: "title must be a non-empty string",
        code: "INVALID_PRODUCT_TITLE",
      };
    }
    update.title = input.title.trim();
  }
  if ("description" in input) {
    if (typeof input.description !== "string") {
      return {
        success: false,
        message: "description must be a string",
        code: "INVALID_PRODUCT_DESCRIPTION",
      };
    }
    update.description = input.description.trim();
  }
  if ("price" in input) {
    const priceInput = parseJsonField(input.price, "price");
    if (!priceInput.success) return priceInput;
    const price = parseMoney(priceInput.data, "price");
    if (!price.success) return price;
    update.price = price.data;
  }
  if ("variants" in input) {
    const variantsInput = parseJsonField(input.variants, "variants");
    if (!variantsInput.success) return variantsInput;
    const variants = parseVariants(variantsInput.data);
    if (!variants.success) return variants;
    update.variants = variants.data;
  }
  if ("toppings" in input) {
    const toppingsInput = parseJsonField(input.toppings, "toppings");
    if (!toppingsInput.success) return toppingsInput;
    const toppings = parseToppings(toppingsInput.data);
    if (!toppings.success) return toppings;
    update.toppings = toppings.data;
  }
  if ("categoryId" in input) {
    const categoryId = parseCategoryId(input.categoryId);
    if (!categoryId.success) return categoryId;
    update.categoryId = categoryId.data;
  }
  if ("isActive" in input) {
    if (typeof input.isActive !== "boolean") {
      return {
        success: false,
        message: "isActive must be boolean",
        code: "INVALID_PRODUCT_STATUS",
      };
    }
    update.isActive = input.isActive;
  }

  return { success: true, data: update };
};

const parseListQuery = (query: Record<string, unknown>) => {
  const page =
    query.page === undefined
      ? AppConstant.pagination.defaultPage
      : Number(query.page);
  const limit =
    query.limit === undefined
      ? AppConstant.pagination.defaultLimit
      : Number(query.limit);

  if (!Number.isInteger(page) || page < 1) {
    return {
      success: false as const,
      message: "page must be a positive integer",
      code: "INVALID_PAGE",
    };
  }
  if (
    !Number.isInteger(limit) ||
    limit < 1 ||
    limit > AppConstant.pagination.maxLimit
  ) {
    return {
      success: false as const,
      message: `limit must be between 1 and ${AppConstant.pagination.maxLimit}`,
      code: "INVALID_LIMIT",
    };
  }

  if (query.categoryId === undefined) {
    return {
      success: true as const,
      data: { page, limit, categoryId: undefined },
    };
  }

  const categoryId = parseCategoryId(query.categoryId);
  if (!categoryId.success) return categoryId;
  return {
    success: true as const,
    data: { page, limit, categoryId: categoryId.data },
  };
};

export default { parseCreate, parseUpdate, parseListQuery };
