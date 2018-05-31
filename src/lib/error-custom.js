class ErrorCustom extends Error {
  /**
   * Calls parent constructor to set the error message and statusCode to 400
   *
   * @param {string} message
   * Error message to set on the Error object
   *
   * @param {number} statusCode
   * HTTP status code
   *
   * @param {number} errorCode
   * The specific error code as defined in documentation
   *
   * @return {void}
   */
  constructor(message, statusCode = 400, errorCode) {
    super(message);
    this.code = statusCode;
    this.errorCode = errorCode;
    this.manuallyThrown = true;
  }
}

export default ErrorCustom;
