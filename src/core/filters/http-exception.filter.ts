import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { MongoServerError } from 'mongodb';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    let status: number = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string = 'Internal server error';

    // Handle specific exceptions
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const responseMessage = exception.getResponse();
      message = typeof responseMessage === 'string' ? responseMessage : responseMessage['message'];
    } else if (exception instanceof MongoServerError) {
      // MongoDB-specific error handling
      switch (exception.code) {
        case 11000: // Duplicate key error
          status = HttpStatus.CONFLICT;
          message = `Duplicate key error: ${JSON.stringify(exception.keyValue)}`;
          break;
        default:
          message = `Database error: ${exception.message}`;
          break;
      }
    } else if (exception instanceof Error) {
      // Handle generic errors
      message = exception.message;
    }

    // Log the error for debugging
    this.logger.error(
      `Error occurred: ${message}`,
      exception instanceof Error ? exception.stack : '',
    );

    // Send the error response
    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
