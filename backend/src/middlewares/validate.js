import { errorResponse } from "../utils/response.js";

export const validate = (schema) => (req, res, next) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (err) {
    // Send a formatted error with zod issues if any
    return res.status(400).json({
      success: false,
      message: "VALIDATION_ERROR",
      errors: err.errors.map(e => ({ path: e.path.join('.'), message: e.message }))
    });
  }
};
