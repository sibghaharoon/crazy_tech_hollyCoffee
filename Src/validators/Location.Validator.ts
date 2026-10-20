import type { ILocation } from "../interfaces/ILocation";

export type LocationValidationResult =
  | { success: true; data: ILocation.UpdateObj }
  | { success: false; message: string; code: string };

const parseLocationUpdate = (body: unknown): LocationValidationResult => {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { success: false, message: "Request body must be an object", code: "INVALID_BODY" };
  }

  const input = body as Record<string, unknown>;
  const allowedFields = new Set(["source", "city", "state", "latitude", "longitude"]);
  if (Object.keys(input).some((field) => !allowedFields.has(field))) {
    return { success: false, message: "Invalid location fields", code: "INVALID_LOCATION_FIELDS" };
  }

  if (input.source !== "gps" && input.source !== "manual") {
    return { success: false, message: "source must be gps or manual", code: "INVALID_LOCATION_SOURCE" };
  }

  if (typeof input.city !== "string" || input.city.trim().length === 0) {
    return { success: false, message: "city is required", code: "INVALID_CITY" };
  }

  if (typeof input.state !== "string" || input.state.trim().length === 0) {
    return { success: false, message: "state is required", code: "INVALID_STATE" };
  }

  const city = input.city.trim();
  const state = input.state.trim();

  if (input.source === "manual") {
    if ("latitude" in input || "longitude" in input) {
      return { success: false, message: "Manual location cannot include GPS coordinates", code: "INVALID_MANUAL_LOCATION" };
    }
    return { success: true, data: { city, state } };
  }

  if (
    typeof input.latitude !== "number" ||
    !Number.isFinite(input.latitude) ||
    input.latitude < -90 ||
    input.latitude > 90
  ) {
    return { success: false, message: "latitude must be between -90 and 90", code: "INVALID_LATITUDE" };
  }

  if (
    typeof input.longitude !== "number" ||
    !Number.isFinite(input.longitude) ||
    input.longitude < -180 ||
    input.longitude > 180
  ) {
    return { success: false, message: "longitude must be between -180 and 180", code: "INVALID_LONGITUDE" };
  }

  return {
    success: true,
    data: { city, state, latitude: input.latitude, longitude: input.longitude },
  };
};

export default parseLocationUpdate;
