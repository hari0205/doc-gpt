import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllHttpExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllHttpExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    this.logger.error(
      `Request ${request.method} ${request.url} failed`,
      exception instanceof Error ? exception.stack : exception,
    );

    const status =
      exception instanceof HttpException ? exception.getStatus() : 500;
    this.logger.debug(status, 'Status of exception: ');

    const message =
      exception instanceof HttpException
        ? exception.message
        : 'Internal server error';

    this.logger.debug(message, 'Message of exception: ');

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: message,
    });
  }
}
