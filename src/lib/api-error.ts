import { NextResponse } from 'next/server';

/**
 * Custom API Error class
 */
export class ApiError extends Error {
    constructor(
        public statusCode: number,
        public message: string,
        public code?: string
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

/**
 * Common API errors
 */
export const ApiErrors = {
    // Authentication errors
    UNAUTHORIZED: new ApiError(401, 'Unauthorized', 'UNAUTHORIZED'),
    FORBIDDEN: new ApiError(403, 'Forbidden', 'FORBIDDEN'),
    INVALID_TOKEN: new ApiError(401, 'Invalid or expired token', 'INVALID_TOKEN'),

    // Not found errors
    NOT_FOUND: (resource: string) =>
        new ApiError(404, `${resource} not found`, 'NOT_FOUND'),
    RESOURCE_NOT_FOUND: new ApiError(404, 'Resource not found', 'RESOURCE_NOT_FOUND'),

    // Validation errors
    VALIDATION_ERROR: (field: string) =>
        new ApiError(400, `Invalid ${field}`, 'VALIDATION_ERROR'),
    MISSING_REQUIRED_FIELD: (field: string) =>
        new ApiError(400, `Missing required field: ${field}`, 'MISSING_REQUIRED_FIELD'),

    // Conflict errors
    DUPLICATE_ENTRY: new ApiError(409, 'Duplicate entry', 'DUPLICATE_ENTRY'),
    CONFLICT: (message: string) =>
        new ApiError(409, message, 'CONFLICT'),

    // Business logic errors
    INVALID_STATUS: (current: string, expected: string) =>
        new ApiError(400, `Cannot perform action on ${current} status, expected ${expected}`, 'INVALID_STATUS'),
    INSUFFICIENT_BALANCE: new ApiError(400, 'Insufficient balance', 'INSUFFICIENT_BALANCE'),
    INVALID_AMOUNT: new ApiError(400, 'Invalid amount', 'INVALID_AMOUNT'),
    MINIMUM_AMOUNT: (min: number) =>
        new ApiError(400, `Minimum amount is €${min}`, 'MINIMUM_AMOUNT'),

    // Server errors
    INTERNAL_SERVER_ERROR: new ApiError(500, 'Internal server error', 'INTERNAL_SERVER_ERROR'),
    DATABASE_ERROR: new ApiError(500, 'Database error', 'DATABASE_ERROR'),
    EXTERNAL_SERVICE_ERROR: new ApiError(503, 'External service error', 'EXTERNAL_SERVICE_ERROR'),
};

/**
 * Response helpers
 */
export const ApiResponse = {
    success: (data: any, statusCode: number = 200) =>
        NextResponse.json(data, { status: statusCode }),

    error: (error: ApiError | Error, statusCode?: number) => {
        const status = error instanceof ApiError ? error.statusCode : statusCode || 500;
        const message = error instanceof ApiError
            ? error.message
            : error.message || 'Internal server error';
        const code = error instanceof ApiError ? error.code : 'UNKNOWN_ERROR';

        return NextResponse.json(
            {
                error: message,
                code,
                timestamp: new Date().toISOString(),
            },
            { status }
        );
    },

    validationError: (errors: any[]) =>
        NextResponse.json(
            {
                error: 'Validation failed',
                code: 'VALIDATION_ERROR',
                details: errors,
                timestamp: new Date().toISOString(),
            },
            { status: 400 }
        ),

    unauthorized: () => ApiResponse.error(ApiErrors.UNAUTHORIZED),
    forbidden: () => ApiResponse.error(ApiErrors.FORBIDDEN),
    notFound: (resource: string) =>
        ApiResponse.error(ApiErrors.NOT_FOUND(resource)),
};

/**
 * Wrap async route handler with error handling
 */
export function withErrorHandling(
    handler: (req: any, params?: any) => Promise<Response>
) {
    return async (req: any, params?: any) => {
        try {
            return await handler(req, params);
        } catch (error: any) {
            console.error('API Error:', error);

            if (error instanceof ApiError) {
                return ApiResponse.error(error);
            }

            // Don't expose internal errors to client
            return ApiResponse.error(
                new ApiError(500, 'Internal server error', 'INTERNAL_SERVER_ERROR')
            );
        }
    };
}
