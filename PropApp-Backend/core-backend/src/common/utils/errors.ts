/**
 * Custom Error Classes
 * Maps to PRD Appendix B error codes
 */

export class AppError extends Error {
    public readonly code: string;
    public readonly statusCode: number;
    public readonly isOperational: boolean;
    public readonly details?: { field: string; message: string }[];

    constructor(
        message: string,
        code: string,
        statusCode: number = 400,
        details?: { field: string; message: string }[]
    ) {
        super(message);
        this.code = code;
        this.statusCode = statusCode;
        this.isOperational = true;
        this.details = details;

        Error.captureStackTrace(this, this.constructor);
    }
}

// ============================================
// AUTH ERRORS
// ============================================

export class InvalidCredentialsError extends AppError {
    constructor(message: string = 'Invalid credentials') {
        super(message, 'AUTH_001', 401);
    }
}

export class TokenExpiredError extends AppError {
    constructor(message: string = 'Token has expired') {
        super(message, 'AUTH_002', 401);
    }
}

export class InsufficientPermissionsError extends AppError {
    constructor(message: string = 'Insufficient permissions') {
        super(message, 'AUTH_003', 403);
    }
}

export class TwoFactorRequiredError extends AppError {
    constructor(message: string = 'Two-factor authentication required') {
        super(message, 'AUTH_004', 400);
    }
}

// ============================================
// USER ERRORS
// ============================================

export class UserNotFoundError extends AppError {
    constructor(message: string = 'User not found') {
        super(message, 'USER_001', 404);
    }
}

export class NotFoundError extends AppError {
    constructor(message: string = 'Resource not found') {
        super(message, 'NOT_FOUND', 404);
    }
}

export class EmailExistsError extends AppError {
    constructor(message: string = 'Email already exists') {
        super(message, 'USER_002', 409);
    }
}

// ============================================
// PROPERTY ERRORS
// ============================================

export class PropertyNotFoundError extends AppError {
    constructor(message: string = 'Property not found') {
        super(message, 'PROP_001', 404);
    }
}

export class NotPropertyOwnerError extends AppError {
    constructor(message: string = 'You are not the owner of this property') {
        super(message, 'PROP_002', 403);
    }
}

// ============================================
// TRANSACTION ERRORS
// ============================================

export class InvalidPaymentAmountError extends AppError {
    constructor(message: string = 'Invalid payment amount') {
        super(message, 'TXN_001', 400);
    }
}

export class PaymentFailedError extends AppError {
    constructor(message: string = 'Payment failed') {
        super(message, 'TXN_002', 402);
    }
}

// ============================================
// ESCROW ERRORS
// ============================================

export class InvalidEscrowStateError extends AppError {
    constructor(message: string = 'Escrow is not in a valid state for this operation') {
        super(message, 'ESC_001', 400);
    }
}

// ============================================
// VERIFICATION ERRORS
// ============================================

export class InvalidDocumentError extends AppError {
    constructor(message: string = 'Invalid document') {
        super(message, 'VER_001', 400);
    }
}

// ============================================
// VALIDATION ERRORS
// ============================================

export class ValidationError extends AppError {
    constructor(
        message: string = 'Validation failed',
        details: { field: string; message: string }[]
    ) {
        super(message, 'VALIDATION_ERROR', 400, details);
    }
}

// ============================================
// SERVICE ERRORS
// ============================================

export class AIServiceError extends AppError {
    constructor(message: string = 'AI service unavailable') {
        super(message, 'AI_001', 500);
    }
}

export class BlockchainError extends AppError {
    constructor(message: string = 'Blockchain transaction failed') {
        super(message, 'BC_001', 500);
    }
}

export class ExternalServiceError extends AppError {
    constructor(service: string, message: string = 'External service error') {
        super(`${service}: ${message}`, 'EXTERNAL_SERVICE_ERROR', 502);
    }
}
