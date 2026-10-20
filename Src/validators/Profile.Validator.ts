import type { IUser } from "../interfaces/IUser";

export type ProfileValidationResult =
  | { success: true; data: IUser.UpdateObj }
  | { success: false; message: string; code: string };

const isHttpUrl = (value: string): boolean => {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

const parseProfileUpdate = (body: unknown): ProfileValidationResult => {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { success: false, message: "Request body must be an object", code: "INVALID_BODY" };
  }

  const input = body as Record<string, unknown>;
  const allowedFields = new Set(["name", "photoUrl"]);
  if (Object.keys(input).some((field) => !allowedFields.has(field))) {
    return {
      success: false,
      message: "Only name and photoUrl can be updated",
      code: "INVALID_UPDATE_FIELDS",
    };
  }

  const update: IUser.UpdateObj = {};
  if ("name" in input) {
    if (typeof input.name !== "string" || input.name.trim().length === 0) {
      return { success: false, message: "name must be a non-empty string", code: "INVALID_NAME" };
    }
    update.name = input.name.trim();
  }

  if ("photoUrl" in input) {
    if (typeof input.photoUrl !== "string" || !isHttpUrl(input.photoUrl.trim())) {
      return { success: false, message: "photoUrl must be a valid HTTP(S) URL", code: "INVALID_PHOTO_URL" };
    }
    update.photoUrl = input.photoUrl.trim();
  }

  if (Object.keys(update).length === 0) {
    return { success: false, message: "At least one profile field is required", code: "EMPTY_UPDATE" };
  }

  return { success: true, data: update };
};

export default parseProfileUpdate;
