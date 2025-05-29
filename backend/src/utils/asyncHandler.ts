import { Request, Response, NextFunction } from 'express';

/**
 * Wraps async route handlers to automatically catch errors and pass them to Express error handling middleware
 * @param fn The async function to wrap
 * @returns A function that catches any errors and passes them to next()
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Standard error response format
 * @param res Express response object
 * @param status HTTP status code
 * @param message Error message
 * @param error Optional error object for debugging
 */
export const sendErrorResponse = (
  res: Response, 
  status: number, 
  message: string, 
  error?: any
) => {
  const response: any = { message };
  
  // Only include error details in development
  if (process.env.NODE_ENV !== 'production' && error) {
    response.error = error.message || error;
    response.stack = error.stack;
  }
  
  return res.status(status).json(response);
};

/**
 * Standard success response format
 * @param res Express response object
 * @param data Data to send in response
 * @param status Optional HTTP status code (default: 200)
 */
export const sendSuccessResponse = (
  res: Response,
  data: any,
  status: number = 200
) => {
  return res.status(status).json(data);
};