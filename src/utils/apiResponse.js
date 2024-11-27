class apiResponse {
  constructor(statusCode, message = "success", data) {
    this.statusCode = statusCode;
    // we can send any data or object with help of this .data
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
  }
}

export { apiResponse };
