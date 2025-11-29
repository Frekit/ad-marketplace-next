/**
 * Validation utilities for API requests
 */

export interface ValidationError {
    field: string;
    message: string;
}

export class ValidationResult {
    errors: ValidationError[] = [];

    addError(field: string, message: string) {
        this.errors.push({ field, message });
    }

    isValid(): boolean {
        return this.errors.length === 0;
    }

    toJSON() {
        return {
            valid: this.isValid(),
            errors: this.errors,
        };
    }
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate URL format
 */
export function validateUrl(url: string): boolean {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

/**
 * Validate amount (currency)
 */
export function validateAmount(
    amount: number,
    options: { min?: number; max?: number } = {}
): boolean {
    const { min = 0, max = Number.MAX_SAFE_INTEGER } = options;
    return typeof amount === 'number' && amount >= min && amount <= max;
}

/**
 * Validate rating (1-5)
 */
export function validateRating(rating: number): boolean {
    return Number.isInteger(rating) && rating >= 1 && rating <= 5;
}

/**
 * Validate string length
 */
export function validateStringLength(
    str: string,
    options: { min?: number; max?: number } = {}
): boolean {
    const { min = 0, max = Number.MAX_SAFE_INTEGER } = options;
    return typeof str === 'string' && str.length >= min && str.length <= max;
}

/**
 * Validate required fields
 */
export function validateRequired(
    value: any,
    fieldName: string = 'Field'
): ValidationResult {
    const result = new ValidationResult();
    if (value === null || value === undefined || value === '') {
        result.addError(fieldName, `${fieldName} is required`);
    }
    return result;
}

/**
 * Validate object has required fields
 */
export function validateRequiredFields(
    obj: Record<string, any>,
    requiredFields: string[]
): ValidationResult {
    const result = new ValidationResult();
    for (const field of requiredFields) {
        const value = obj[field];
        if (value === null || value === undefined || value === '') {
            result.addError(field, `${field} is required`);
        }
    }
    return result;
}

/**
 * Sanitize HTML/script content
 */
export function sanitizeString(str: string): string {
    if (typeof str !== 'string') return '';
    return str
        .replace(/[<>]/g, '')
        .trim()
        .substring(0, 10000); // Limit length
}

/**
 * Validate project data
 */
export function validateProjectData(data: any): ValidationResult {
    const result = new ValidationResult();

    const requiredFields = validateRequiredFields(data, ['title', 'description', 'allocated_budget']);
    result.errors.push(...requiredFields.errors);

    if (data.title && !validateStringLength(data.title, { min: 5, max: 200 })) {
        result.addError('title', 'Title must be between 5 and 200 characters');
    }

    if (data.allocated_budget && !validateAmount(data.allocated_budget, { min: 10 })) {
        result.addError('allocated_budget', 'Budget must be at least €10');
    }

    return result;
}

/**
 * Validate contract data
 */
export function validateContractData(data: any): ValidationResult {
    const result = new ValidationResult();

    const requiredFields = validateRequiredFields(data, ['freelancer_id', 'project_id', 'total_amount']);
    result.errors.push(...requiredFields.errors);

    if (data.total_amount && !validateAmount(data.total_amount, { min: 10 })) {
        result.addError('total_amount', 'Total amount must be at least €10');
    }

    if (data.milestones && !Array.isArray(data.milestones)) {
        result.addError('milestones', 'Milestones must be an array');
    }

    return result;
}

/**
 * Validate invoice data
 */
export function validateInvoiceData(data: any): ValidationResult {
    const result = new ValidationResult();

    const requiredFields = validateRequiredFields(data, ['freelancer_id', 'total_amount']);
    result.errors.push(...requiredFields.errors);

    if (data.total_amount && !validateAmount(data.total_amount, { min: 5 })) {
        result.addError('total_amount', 'Total amount must be at least €5');
    }

    return result;
}

/**
 * Validate review data
 */
export function validateReviewData(data: any): ValidationResult {
    const result = new ValidationResult();

    const requiredFields = validateRequiredFields(data, ['freelancer_id', 'rating']);
    result.errors.push(...requiredFields.errors);

    if (data.rating && !validateRating(data.rating)) {
        result.addError('rating', 'Rating must be between 1 and 5');
    }

    if (data.review_text && !validateStringLength(data.review_text, { max: 1000 })) {
        result.addError('review_text', 'Review must be at most 1000 characters');
    }

    return result;
}
