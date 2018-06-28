# error-custom

Extends the JavaScript Error object with custom properties.

Calls parent constructor to set the error message and adds code, errorCode, manuallyThrown and innerException custom properties.
Logs the final object using passed function or debug library.

## Requirements

* Nodejs >= 8.10

## Example

```
const error = new ErrorCustom(message, statusCode, errorCode, baseError, lofgFunction);
```

   * @param {string} message
Error message to set on the Error object
   * @param {number} statusCode
HTTP status code
   * @param {number} errorCode
The specific error code as defined in documentation
   * @param {Error} baseError
Optional base exception to be included as innerException property
   * @param {Function} logFunction
Optional function to log the error with. If not supplied, debug library will be used
to log to the console with the tag `error-custom`
