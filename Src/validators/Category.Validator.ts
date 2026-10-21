import type { ICategoryModule } from "../interfaces/ICategory";

export type CategoryValidationResult<T> =
  | { success: true; data: T }
  | { success: false; message: string; code: string };

const normalizeBody = (body: unknown): Record<string, unknown> => {
  const input = body as Record<string, unknown>;
  return {
    ...input,
    ...(input.isActive === "true" ? { isActive: true } : {}),
    ...(input.isActive === "false" ? { isActive: false } : {}),
  };
};

const validateCommonFields = (
  input: Record<string, unknown>,
): { success: true } | { success: false; message: string; code: string } => {
  if ("name" in input && (typeof input.name !== "string" || input.name.trim().length === 0)) {
    return { success: false, message: "name must be a non-empty string", code: "INVALID_CATEGORY_NAME" };
  }
  if ("description" in input && input.description !== undefined && typeof input.description !== "string") {
    return { success: false, message: "description must be a string", code: "INVALID_CATEGORY_DESCRIPTION" };
  }
  if ("isActive" in input && typeof input.isActive !== "boolean") {
    return { success: false, message: "isActive must be a boolean", code: "INVALID_CATEGORY_STATUS" };
  }
  return { success: true };
};

const parseCreate = (body: unknown): CategoryValidationResult<ICategoryModule.ICreateCategories> => {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { success: false, message: "Request body must be an object", code: "INVALID_BODY" };
  }
  const input = normalizeBody(body);
  const allowed = new Set(["name", "description", "isActive"]);
  if (Object.keys(input).some((field) => !allowed.has(field))) {
    return { success: false, message: "Invalid category fields", code: "INVALID_CATEGORY_FIELDS" };
  }
  const common = validateCommonFields(input);
  if (!common.success) return common;
  if (typeof input.name !== "string" || input.name.trim().length === 0) {
    return { success: false, message: "name is required", code: "INVALID_CATEGORY_NAME" };
  }
  return {
    success: true,
    data: {
      name: input.name.trim(),
      ...(typeof input.description === "string" ? { description: input.description.trim() } : {}),
      ...(typeof input.isActive === "boolean" ? { isActive: input.isActive } : {}),
    },
  };
};

const parseUpdate = (body: unknown): CategoryValidationResult<ICategoryModule.IUpdateCategories> => {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { success: false, message: "Request body must be an object", code: "INVALID_BODY" };
  }
  const input = normalizeBody(body);
  const allowed = new Set(["name", "description", "isActive"]);
  if (Object.keys(input).some((field) => !allowed.has(field))) {
    return { success: false, message: "Invalid category fields", code: "INVALID_CATEGORY_FIELDS" };
  }
  if (Object.keys(input).length === 0) {
    return { success: false, message: "At least one category field is required", code: "EMPTY_UPDATE" };
  }
  const common = validateCommonFields(input);
  if (!common.success) return common;
  return {
    success: true,
    data: {
      ...(typeof input.name === "string" ? { name: input.name.trim() } : {}),
      ...(typeof input.description === "string" ? { description: input.description.trim() } : {}),
      ...(typeof input.isActive === "boolean" ? { isActive: input.isActive } : {}),
    },
  };
};

export default { parseCreate, parseUpdate };
