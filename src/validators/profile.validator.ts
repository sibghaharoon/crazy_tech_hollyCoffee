import type { IUserModule } from "../interfaces/iuser";

export type ProfileValidationResult =
  | { success: true; data: IUserModule.IUpdateUser }
  | { success: false; message: string; code: string };

const parseProfileUpdate = (body: unknown, hasProfileImage = false): ProfileValidationResult => {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { success: false, message: "Request body must be an object", code: "INVALID_BODY" };
  }

  const input = body as Record<string, unknown>;
  const allowedFields = new Set(["name", "gender", "dob"]);
  if (Object.keys(input).some((field) => !allowedFields.has(field))) {
    return {
      success: false,
      message: "Only name, gender, dob, and profile image can be updated",
      code: "INVALID_UPDATE_FIELDS",
    };
  }

  const update: IUserModule.IUpdateUser = {};
  if ("name" in input) {
    if (typeof input.name !== "string" || input.name.trim().length === 0) {
      return { success: false, message: "name must be a non-empty string", code: "INVALID_NAME" };
    }
    update.name = input.name.trim();
  }

  if ("gender" in input) {
    const genders = new Set<IUserModule.Gender>(["male", "female", "other", "prefer_not_to_say"]);
    if (typeof input.gender !== "string" || !genders.has(input.gender as IUserModule.Gender)) {
      return { success: false, message: "gender is invalid", code: "INVALID_GENDER" };
    }
    update.gender = input.gender as IUserModule.Gender;
  }

  if ("dob" in input) {
    if (typeof input.dob !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(input.dob)) {
      return { success: false, message: "dob must use YYYY-MM-DD format", code: "INVALID_DOB" };
    }
    const dob = new Date(`${input.dob}T00:00:00.000Z`);
    if (Number.isNaN(dob.getTime()) || dob > new Date()) {
      return { success: false, message: "dob must be a valid past date", code: "INVALID_DOB" };
    }
    update.dob = dob;
  }

  if (Object.keys(update).length === 0 && !hasProfileImage) {
    return { success: false, message: "At least one profile field is required", code: "EMPTY_UPDATE" };
  }

  return { success: true, data: update };
};

export default parseProfileUpdate;
