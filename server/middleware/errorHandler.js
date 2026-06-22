export function errorHandler(err, req, res, next) {
  console.error("❌ App Error Intercepted:", err);

  const statusCode = err.status || err.statusCode || 500;
  let errorMessage = err.message || "An unexpected system error occurred.";

  // Handle Mongoose Duplicate Key Error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    errorMessage = `This ${field} is already registered. Please use a unique ${field}.`;
    return res.status(400).json({
      success: false,
      error: errorMessage,
    });
  }

  // Handle Mongoose Validation Errors
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((val) => val.message);
    return res.status(400).json({
      success: false,
      error: `Validation Error: ${messages.join(", ")}`,
    });
  }

  res.status(statusCode).json({
    success: false,
    error: errorMessage,
  });
}
