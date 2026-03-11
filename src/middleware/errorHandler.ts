import { Request, Response, NextFunction } from 'express';
import { DomainException } from '../exceptions/DomainException';

export interface ErrorResponse {
  error: {
    message: string;
    code?: string;
    statusCode: number;
  };
}

export function errorHandler(
  error: Error | DomainException,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error('Error:', error);

  if (error instanceof DomainException) {
    const response: ErrorResponse = {
      error: {
        message: error.message,
        code: error.code,
        statusCode: error.statusCode,
      },
    };
    res.status(error.statusCode).json(response);
    return;
  }

  // Generic error handler
  const response: ErrorResponse = {
    error: {
      message: error.message || 'Internal server error',
      statusCode: 500,
    },
  };
  res.status(500).json(response);
}
