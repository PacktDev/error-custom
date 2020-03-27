# error-custom

Extends the JavaScript Error object with custom properties.

Calls parent constructor to set the error message and adds code, errorCode, manuallyThrown and innerException custom properties.
Logs the final object using passed function, Elastic URL or `Debug` library with the tag `error-custom`.

## Requirements

* Nodejs >= 8.10

## Example

```
const error = new ErrorCustom(message, statusCode, errorCode, baseError, logFunction);
```

   * {string | IConfig} `message`
Error message to set on the Error object, or a config object for all parameters
   * {number} `statusCode`
HTTP status code, optional as it can be passed as part of the config
   * {number} `errorCode`
The specific error code as defined in documentation, optional as it can be passed as part of the config
   * {Error} `baseError`
Optional base exception to be included as innerException property
   * {Function|string} `logFunction`
Optional function to log the error with. If not supplied, debug library will be used
to log to the console with the tag `error-custom`. If a string is provided that is a
URL, it will be used to send to that URL with ElasticSearch client in Winston format.
   * {object} `context`
Optional context information to provide with the error

## IConfig definition
An `Iconfig` object can be apssed instead of individual parameters as below, where the definition are the same as the constructor.
```
export interface IConfig {
    message: string;
    statusCode: number;
    errorCode: number;
    baseError?: Error;
    logFunction?: string | Function;
    context: any;
}
```

## toJSON
The object includes a `toJSON()` override to make all parameters iterable. Note that this returns an object, not a JSON string.

## Environment Variables
Functionality can be modified with various environment variables:

* `ELASTIC_LOGGING_URL`: A url to Elastic that will send errors there as well as using `Debug` to log locally to stdout.
* `ELASTIC_PING_TIMEOUT`: An integer specifying ping timeout in milliseconds (defaults to 2000).
* `ELASTIC_REQUEST_TIMEOUT`: An integer specifying request timeout in milliseconds (defaults to 2000).
* `ELASTIC_FLUSH_INTERVAL`: An integer specifying flush interval in milliseconds (defaults to 500).
