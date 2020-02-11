import debug from 'debug';
import joi from 'joi';
import v4 from 'uuid/v4';
import url from 'url';
import winston from 'winston';
import Elasticsearch from 'winston-elasticsearch';
import { Client } from '@elastic/elasticsearch';

/**
 * Error with enforced error Code and status Code and autogenerated error ID uuid.
 */
class ErrorCustom extends Error {
  public errorCode: number;
  public statusCode: number;
  public manuallyThrown: boolean;
  public id: string;
  public innerException: any;

  /**
   * Error Constructor
   *
   * Calls parent constructor to set the error message and
   * adds code, errorCode, manuallyThrown and innerException custom properties.
   * Logs the final object using passed function or debug library.
   *
   * @constructor
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
   * @param {string | Function} logFunction
   * Optional function to log the error with. If not supplied, debug library will be used
   * to log to the console with the tag `error-custom`
   */
  constructor(message: string, statusCode: number, errorCode: number,
    baseError?: Error, logFunction?: string | Function) {
    // Validation
    const messageValidation = joi.validate(message, joi.string().required());
    const statusCodeValidation = joi.validate(
      statusCode,
      joi.number().integer().min(200).max(600)
        .required(),
    );
    const errorCodeValidation = joi.validate(
      errorCode,
      joi.alternatives([joi.string(), joi.number().integer()]).required(),
    );
    const errors = [];
    if (messageValidation.error) errors.push('Invalid value for message parameter');
    if (statusCodeValidation.error) errors.push('Invalid value for statusCode parameter');
    if (errorCodeValidation.error) errors.push('Invalid value for errorCode parameter');

    // If multiple error are sent, throw as one instance.
    if (errors.length > 0) {
      throw new ErrorCustom(errors.join(', '), 500, 1000200, baseError);
    }

    // Re-enable the original chain for stack traces etc
    /* istanbul ignore next */
    super(message);
    Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.manuallyThrown = true;
    this.id = v4();
    this.innerException = baseError;

    // Log to chosen location
    if (process.env.ELASTIC_LOGGING_URL) {
      ErrorCustom.sendToElastic(process.env.ELASTIC_LOGGING_URL, this);
    } else {
      switch (typeof logFunction) {
        case 'function':
          logFunction(this.id, this);
          break;
        case 'string':
          if (url.parse(logFunction).host) {
            ErrorCustom.sendToElastic(logFunction, this);
            break;
          } else {
            ErrorCustom.defaultOutput(this.id, this);
            break;
          }

        default:
          ErrorCustom.defaultOutput(this.id, this);
      }
    }
  }

  /**
   * Standard method for providing JSON.
   * It actually returns an object, but this version can be serialized properly.
   */
  public toJSON() {
    const alt = {};
    Object.getOwnPropertyNames(this).forEach((key) => {
      alt[key] = this[key];
    }, this);

    return alt;
  }

  /**
   * The default logging behaviour for ErrorCustom
   * @param id
   * @param content
   */
  private static defaultOutput(id: string, content: ErrorCustom): void {
    return debug('error-custom')(id, content);
  }

  /**
   * Send the output to Elastic
   * @param node url to the node instance
   * @param id
   * @param content
   */
  private static async sendToElastic(node: string, content: ErrorCustom): Promise<void> {
    ErrorCustom.defaultOutput(content.id, content);

    const date = new Date();

    // Index Name
    const serviceName = process.env.ELASTIC_LOGGING_SERVICE_NAME || 'error-custom';
    const indexName = process.env.ELASTIC_LOGGING_INDEX || `logs-${serviceName}-${date.toISOString().split('T').shift()}`;

    const pingTimeout = process.env.ELASTIC_PING_TIMEOUT
      ? parseInt(process.env.ELASTIC_PING_TIMEOUT, 10) || 2000
      : 2000;

    const requestTimeout = process.env.ELASTIC_REQUEST_TIMEOUT
      ? parseInt(process.env.ELASTIC_REQUEST_TIMEOUT, 10) || 2000
      : 2000;

    const flushInterval = process.env.ELASTIC_FLUSH_INTERVAL
      ? parseInt(process.env.ELASTIC_FLUSH_INTERVAL, 10) || 500
      : 500;

    // check the index exists
    const elasticClient = new Client({
      node,
      pingTimeout,
      requestTimeout,
    });
    const elasticIndexExists = await elasticClient.indices.exists({
      index: indexName,
    });
    if (elasticIndexExists.statusCode !== 200) {
      elasticClient.indices.create({
        index: indexName,
      });
    }

    // Transporter
    const esTransport = new Elasticsearch({
      level: 'error',
      index: indexName,
      client: elasticClient,
      buffering: false,
      flushInterval,
    });
    const logger = winston.createLogger({
      transports: [
        esTransport,
      ],
    });
    logger.error(content.message, content);
  }
}

export default ErrorCustom;
