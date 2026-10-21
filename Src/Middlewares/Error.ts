import type { ErrorRequestHandler } from "express";

const errorMiddleware: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error?.name === "MulterError") {
    return res.status(400).json({
      success: false,
      message: "Invalid image upload",
      code: "INVALID_IMAGE_UPLOAD",
    });
  }

  const statusCode =
    typeof error === "object" && error !== null && "statusCode" in error &&
    typeof error.statusCode === "number"
      ? error.statusCode
      : 500;

  res.status(statusCode >= 400 && statusCode < 600 ? statusCode : 500).json({
    success: false,
    message: statusCode >= 500 ? "Internal server error" : "Request failed",
    code: statusCode >= 500 ? "INTERNAL_ERROR" : "REQUEST_FAILED",
  });
};

export default errorMiddleware;
