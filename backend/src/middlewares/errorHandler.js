import { errorResponse } from "../utils/response.js";

/**
 * Centralized Error Handler Middleware
 * Catches all unhandled errors and formats them as a standard JSON response.
 */
export const errorHandler = (err, req, res, next) => {
  // Log the error stack for debugging on the server
  console.error("[Global Error]:", err.stack || err);

  const statusCode = err.status || 500;
  const message = err.message || "SERVER_ERROR";
  
  // Include detailed error stack in development mode for debugging
  const errors = process.env.NODE_ENV === "development" ? err.stack : null;
  
  return errorResponse(res, statusCode, message, errors);
};
