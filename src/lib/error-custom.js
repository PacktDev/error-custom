class ErrorCustom extends Error {
  /**
   * Error Constructor
   *
   * Calls parent constructor to set the error message and
   * adds code, errorCode and manuallyThrown custom properties.
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
  constructor(message, statusCode, errorCode) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.manuallyThrown = true;
  }
}

export default ErrorCustom;
