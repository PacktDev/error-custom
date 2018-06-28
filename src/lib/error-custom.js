import debug from 'debug';
import Joi from 'joi';

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
   * @param {Error} baseError
   * Optional base exception to be included as innerException property
   *
   * @param {Function} logFunction
   * Optional funciton to log the error as. If not supplied, debug will be used
   * to log to the console.
   */
  constructor(message, statusCode, errorCode, baseError, logFunction) {
    const messageValidation = Joi.validate(message, Joi.string().required());
    const statusCodeValidation = Joi.validate(
      statusCode,
      Joi.number().integer().min(200).max(600)
        .required(),
    );
    const errorCodeValidation = Joi.validate(
      errorCode,
      Joi.alternatives([Joi.string(), Joi.number().integer()]).required(),
    );
    const errors = [];
    if (messageValidation.error) errors.push('Invalid value for message parameter');
    if (statusCodeValidation.error) errors.push('Invalid value for statusCode parameter');
    if (errorCodeValidation.error) errors.push('Invalid value for errorCode parameter');

    if (errors.length > 0) {
      throw new ErrorCustom(errors.join(', '), 500, 1000200, baseError);
    }

    super(message);
    this.logger = debug('error-custom');
    this.logger.enabled = true;
    this.innerException = baseError;
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.manuallyThrown = true;

    if (logFunction) {
      logFunction(this);
    } else {
      this.logger(this);
    }
  }
}

export default ErrorCustom;
