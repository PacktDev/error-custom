export interface IConfig {
  message: string;
  statusCode: number;
  errorCode: number;
  baseError?: Error;
  logFunction?: string | Function;
  context: any;
}
