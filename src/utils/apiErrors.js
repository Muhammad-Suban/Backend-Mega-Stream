// this utils make for api Error handling

// Error class extends from node js gives error
class apiErrors extends Error {
  constructor(
    statusCode,
    message = "Something Went Wrong",
    stack = "",
    errors = []
  ) {
    super(message); // chatgpt karo

    this.statusCode = statusCode;
    this.message = message;
    this.success = false;
    this.data = null;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
export { apiErrors };
