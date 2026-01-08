/**
 * Winston Logger Configuration
 */

import winston from 'winston';
import { env } from '../../config/env';

const { combine, timestamp, printf, colorize, errors } = winston.format;

// Custom log format
const logFormat = printf(({ level, message, timestamp, stack, ...meta }) => {
    let log = `${timestamp} [${level}]: ${message}`;

    if (Object.keys(meta).length > 0) {
        log += ` ${JSON.stringify(meta)}`;
    }

    if (stack) {
        log += `\n${stack}`;
    }

    return log;
});

// Create logger instance
export const logger = winston.createLogger({
    level: env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: combine(
        errors({ stack: true }),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        logFormat
    ),
    transports: [
        // Console output (colorized in development)
        new winston.transports.Console({
            format: combine(
                env.NODE_ENV !== 'production' ? colorize() : winston.format.simple(),
                logFormat
            ),
        }),
    ],
    // Don't exit on handled exceptions
    exitOnError: false,
});

// Production: Add file transports
if (env.NODE_ENV === 'production') {
    logger.add(
        new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error'
        })
    );
    logger.add(
        new winston.transports.File({
            filename: 'logs/combined.log'
        })
    );
}

export default logger;
