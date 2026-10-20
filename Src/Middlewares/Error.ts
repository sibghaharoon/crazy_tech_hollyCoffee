import type { ErrorRequestHandler } from "express";

const errorMiddleware: ErrorRequestHandler = (error, _req, res, _next) => {
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
