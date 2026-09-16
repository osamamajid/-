import dotenv from 'dotenv';

dotenv.config();

const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  throw new Error(
    'JWT_SECRET environment variable is required. Please set it in your .env file.'
  );
}

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    'DATABASE_URL environment variable is required. Please set it in your .env file.'
  );
}

export const ENV = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: databaseUrl,
  JWT_SECRET: jwtSecret,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
  ALLOWED_ORIGINS: (
    process.env.ALLOWED_ORIGINS ||
    'http://localhost:5173,http://localhost:5174,http://localhost:5175,http://127.0.0.1:5173,http://127.0.0.1:5174,http://127.0.0.1:5175'
  )
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
};