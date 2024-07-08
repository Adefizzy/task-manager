import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { QueryFailedError } from 'typeorm';

interface HttpExceptionResponse {
  statusCode: number;
  error: string;
}

interface CustomHttpExceptionResponse extends HttpExceptionResponse {
  path: string;
  method: string;
  timeStamp: Date;
}

@Catch()
export class ExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(ExceptionsFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: HttpStatus;
    let errorMessage: string;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const errorResponse = exception.getResponse();
      errorMessage =
        (errorResponse as any).message ||
        (errorResponse as HttpExceptionResponse).error ||
        exception.message;
    } else if (exception instanceof QueryFailedError) {
      // Handle specific TypeORM errors
      status = HttpStatus.BAD_REQUEST;
      // Assuming PostgreSQL error code for unique violation is '23505'
      if ((exception as any).code === '23505') {
        errorMessage = 'Duplicate value violates unique constraint';
      } else {
        errorMessage = 'Database query error';
      }
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      errorMessage = 'Critical internal server error occurred!';
    }

    const errorResponse = this.getErrorResponse(status, errorMessage, request);
    const errorLog = this.getErrorLog(errorResponse, request, exception);
    this.writeLog(errorLog);
    response.status(status).json(errorResponse);
  }

  private getErrorResponse(
    status: HttpStatus,
    errorMessage: string | string[],
    request: Request,
  ): CustomHttpExceptionResponse {
    return {
      statusCode: status,
      path: request.url,
      method: request.method,
      timeStamp: new Date(),
      error: Array.isArray(errorMessage)
        ? errorMessage.join(', ')
        : errorMessage,
    };
  }

  private getErrorLog(
    errorResponse: CustomHttpExceptionResponse,
    request: Request,
    exception: any,
  ): string {
    const { statusCode, error, path, method, timeStamp } = errorResponse;
    const errorLog = `Response Code: ${statusCode} - Method: ${method} - URL: ${path}\n
      Timestamp: ${timeStamp}\n
      Error: ${error}\n
      Stack: ${exception.stack}\n\n`;
    return errorLog;
  }

  private writeLog(errorLog: string): void {
    this.logger.error(errorLog);
  }
}
