/**
 * API Route Handler Wrapper
 * Provides centralized error handling and logging for all API routes
 * Eliminates repetitive try-catch blocks and ensures consistent error responses
 */

import { NextRequest, NextResponse } from 'next/server';

export interface HandlerContext {
  req: NextRequest;
  session?: any;
  startTime: number;
}

export type ApiHandler<T = any> = (ctx: HandlerContext) => Promise<NextResponse<T>>;

/**
 * Wraps an API handler with automatic error handling, logging, and timing
 */
export function withErrorHandling<T = any>(handler: ApiHandler<T>) {
  return async (req: NextRequest) => {
    const startTime = Date.now();
    const method = req.method;
    const pathname = new URL(req.url).pathname;

    try {
      const ctx: HandlerContext = {
        req,
        startTime,
      };

      const response = await handler(ctx);
      const duration = Date.now() - startTime;

      // Log successful requests
      console.log(
        `[${method} ${pathname}] ${response.status} (${duration}ms)`
      );

      return response;
    } catch (error: any) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorCode = error?.code || 'INTERNAL_ERROR';

      // Log errors
      console.error(
        `[${method} ${pathname}] 500 (${duration}ms) - ${errorCode}: ${errorMessage}`
      );

      // Return standardized error response
      return NextResponse.json(
        {
          error: errorMessage || 'Internal server error',
          code: errorCode,
          ...(process.env.NODE_ENV === 'development' && {
            stack: error?.stack,
          }),
        },
        { status: 500 }
      );
    }
  };
}

/**
 * Helper to return standardized API responses
 */
export function apiResponse<T>(data: T, status: number = 200) {
  return NextResponse.json(data, { status });
}

/**
 * Helper to return standardized error responses
 */
export function apiError(
  message: string,
  status: number = 400,
  code?: string
) {
  return NextResponse.json(
    {
      error: message,
      ...(code && { code }),
    },
    { status }
  );
}

/**
 * Helper to return 401 Unauthorized
 */
export function apiUnauthorized(message: string = 'Unauthorized') {
  return apiError(message, 401, 'UNAUTHORIZED');
}

/**
 * Helper to return 403 Forbidden
 */
export function apiForbidden(message: string = 'Forbidden') {
  return apiError(message, 403, 'FORBIDDEN');
}

/**
 * Helper to return 404 Not Found
 */
export function apiNotFound(message: string = 'Not found') {
  return apiError(message, 404, 'NOT_FOUND');
}

/**
 * Helper to return 400 Bad Request
 */
export function apiBadRequest(message: string = 'Bad request') {
  return apiError(message, 400, 'BAD_REQUEST');
}

/**
 * Helper to return 422 Unprocessable Entity (validation error)
 */
export function apiValidationError(
  message: string,
  errors?: Record<string, string[]>
) {
  return NextResponse.json(
    {
      error: message,
      code: 'VALIDATION_ERROR',
      ...(errors && { errors }),
    },
    { status: 422 }
  );
}

/**
 * Example usage:
 *
 * export const GET = withErrorHandling(async (ctx) => {
 *   const { req } = ctx;
 *
 *   // Your logic here
 *   const data = await fetchData();
 *
 *   return apiResponse(data);
 * });
 *
 * export const POST = withErrorHandling(async (ctx) => {
 *   const { req } = ctx;
 *   const body = await req.json();
 *
 *   // Validation
 *   if (!body.name) {
 *     return apiBadRequest('Name is required');
 *   }
 *
 *   // Your logic here
 *   const result = await saveData(body);
 *
 *   return apiResponse(result, 201);
 * });
 */
